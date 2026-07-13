import React, {useState, useEffect} from 'react';
import { eventBus } from '../PieceOn';
import { Piece } from './Piece';
import { waitForCondition } from '../../HandyComponents/HandyComponents';
import { boardSize } from '../../Contexts/LogContext';
import "../piece.css"

import whitePawn from '../../Assets/whitePieces/pawn.png';
import blackPawn from '../../Assets/blackPieces/pawn.png';

// graphics to promote
import whiteQueen from '../../Assets/whitePieces/queen.png';
import whiteRook from '../../Assets/whitePieces/rook.png';
import whiteBishop from '../../Assets/whitePieces/bishop.png';
import whiteKnight from '../../Assets/whitePieces/knight.png';

import blackQueen from '../../Assets/blackPieces/queen.png';
import blackRook from '../../Assets/blackPieces/rook.png';
import blackBishop from '../../Assets/blackPieces/bishop.png';
import blackKnight from '../../Assets/blackPieces/knight.png';

export class Pawn extends Piece {
    type = 'Pawn';

    constructor(props){
        super(props); // dlaczego jest podwójny call?
        this.graphic = props.isWhite ? whitePawn : blackPawn;
        this.direction = props.isPlayer ? -1 : 1;
        this.state = {
            promotes: 'Pawn',
            shift: 0,
        }
    }

    async possibleMoves() {
        const allPossibleMoves = [
            [-1, this.direction],
            [ 1, this.direction],
            [ 0, this.direction],
            [ 0, 2*this.direction],
        ];
        const movesAllowed = await Promise.all(
            allPossibleMoves.map(async ([x, y]) => ({
                move: [x, y],
                valid: await this.canMove(x, y, true),
            }))
        );
        return movesAllowed.filter(({valid}) => valid).map(val => [val.move[0] + this.x, val.move[1] + this.y]);
    }

    attack() { // squares pawn can attack
        return [-1, 1].map(x => [this.x + x, this.y + this.direction]);
    }

    async canMove(moveX, moveY, justChecking = false, chosenPiece = undefined, premove = false) {
        const {playerPieces, moveHistory} = this.gameContext;
        const enemyPieces = playerPieces.current[this.isPlayer ? 'enemyPieces' : 'allyPieces'];

        const forward1 = moveY === this.direction && !moveX && (premove || enemyPieces.every(p => p.current.x !== this.x || p.current.y !== this.y + moveY));
        const forward2 = moveY === 2 * this.direction && !moveX && this.y % (boardSize - 3) === 1 && (premove || enemyPieces.every(p => p.current.x !== this.x || p.current.y !== this.y + moveY));
        const diagonal = Math.abs(moveX) * moveY === this.direction && (premove || enemyPieces.some(p => p.current.x === this.x + moveX && p.current.y === this.y + moveY));
        const validateResult = premove || this.validateMove(moveX, moveY);
        const isValid = (forward1 || forward2 || diagonal) && validateResult;
        if(isValid && (this.y + moveY === boardSize - 1 || this.y + moveY === 0) && !justChecking ){ // promotion
            if(!chosenPiece) {
                this.setState({promotes: 'promotes', shift: moveX});
    
                await waitForCondition(() => this.state.promotes !== 'promotes', 20); // waiting state to change
                await waitForCondition(() => this.state.promotes === 'promotes', 50); // waiting for user to choose the piece
    
                if(this.state.promotes === 'Pawn') // no new piece chosen
                    return false; // invalid move, no piece chosen
            }

            if( !premove ) { // changes piece type
                eventBus.emit(`setStates-${this.props.i}-${this.props.j}`, {
                    type: chosenPiece ?? this.state.promotes,
                    isWhite: this.props.isWhite,
                    i: this.x + moveX,
                    j: this.y + moveY,
                }); // in case of premove piece changes too fast
            }
        }
        
        const lastMove = moveHistory.current.at(-1)?.Pawn;
        const secondLastMove = moveHistory.current.at(-2)?.Pawn?.finalSquares;
    
        if(
            Math.abs(moveX) * moveY === this.direction && // diagonal move
            secondLastMove?.x === this.x && secondLastMove?.y === this.y && // previous ally move was with this pawn
            (premove || (lastMove?.finalSquares?.x === this.x + moveX && lastMove?.finalSquares?.y === this.y)) && // previous enemy move was to allow enpassant
            (premove || lastMove?.move?.y === -2*this.direction) && 
            !this.isAtCheck(moveX, moveY)
        ) {
            if(!justChecking && !premove) {
                document.querySelector(`#square-${this.x + moveX}-${this.y}`).replaceChildren();
                playerPieces.current[this.isPlayer ? 'enemyPieces' : 'allyPieces'] = enemyPieces.filter(p => p.current.x !== this.x + moveX || p.current.y !== this.y);
            }

            return true; // pawn takes enPassant allowed
        }

        return isValid;
    }

    getPosition(){
        return `Pionek-${this.x}-${this.y}`;
    }

    render(){
        const {Background} = this;
        
        return (
            <>
                {this.state.promotes === 'promotes' ?
                    <>
                        <Background/>
                        <div
                            className='to-choose-container'
                            style={{transform: `translate(${this.state.shift*100}%,${this.isPlayer ? '12.5%' : '-12.5%'})`}}
                        >
                            <img
                                className='piece-to-choose'
                                alt='queen-to-choose'
                                onClick={() => this.setState({promotes: 'Queen'})}
                                src={this.props.isWhite ? whiteQueen : blackQueen}
                            />
                            <img
                                className='piece-to-choose'
                                alt='rook-to-choose'
                                onClick={() => this.setState({promotes: 'Rook'})}
                                src={this.props.isWhite ? whiteRook : blackRook}
                            />
                            <img
                                className='piece-to-choose'
                                alt='bishop-to-choose'
                                onClick={() => this.setState({promotes: 'Bishop'})}
                                src={this.props.isWhite ? whiteBishop : blackBishop}
                            />
                            <img
                                className='piece-to-choose'
                                alt='knight-to-choose'
                                onClick={() => this.setState({promotes: 'Knight'})}
                                src={this.props.isWhite ? whiteKnight : blackKnight}
                            />
                        </div>
                    </> :
                    <img 
                        className={`piece ${this.state.backgroundStyle}`}
                        ref={this.props.pointer}
                        src={this.graphic}
                        alt={`${this.props.isWhite ? 'white' : 'black'} pawn`}
                    />
                }
            </>
        );
    }

    Background = () => {
        const [width, setWidth] = useState(window.innerWidth);
        const [height, setHeight] = useState(window.innerHeight);

        useEffect(() => {
            const handleResize = () => {
                setWidth(window.innerWidth);
                setHeight(window.innerHeight);
            };
            handleResize();
            window.addEventListener('resize', handleResize);
        
            return () => {
                window.removeEventListener('resize', handleResize);
            };
        }, []);
        
        return <div
                className='background'
                style={{
                    position: 'fixed',
                    width: `${width}px`,
                    height: `${height}px`,
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -45%)',
                }}
                onClick={() => {
                    this.setState({promotes: 'Pawn'});
                }}
            />
    }
}
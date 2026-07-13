import React from 'react';
import { Piece } from './Piece';
import { boardSize } from '../../Contexts/LogContext';
import "../piece.css"

import blackBishop from '../../Assets/blackPieces/bishop.png';
import whiteBishop from '../../Assets/whitePieces/bishop.png'

export class Bishop extends Piece {
    type = 'Bishop';

    constructor(props){
        super(props);
        this.graphic = props.isWhite ? whiteBishop : blackBishop;
        this.possibleMoves = () => this.attack(true);
    }

    attack(checkCheck = false) {
        const {playerPieces: {current}} = this.gameContext;
        const pieces = [...current.allyPieces, ...current.enemyPieces];

        let moves = [];
        let directionContinue = {upLeft: true, upRight: true, downRight: true, downLeft: true};

        for(let i=1; i<boardSize; i++) {
            const leftPos = this.x - i;
            const upPos = this.y + i;
            const downPos = this.y - i;
            const rightPos = this.x + i;
            const isInsideLeft = leftPos >= 0;
            const isInsideRight = rightPos < boardSize;
            const isInsideUp = upPos < boardSize;
            const isInsideDown = downPos >= 0;

            if(directionContinue.upLeft && isInsideLeft && isInsideUp && (!checkCheck || this.validateMove(-i, i))) {
                directionContinue.upLeft = !pieces.some(p => p.current.x === leftPos && p.current.y === upPos);
                moves.push([leftPos, upPos]);
            }
            if(directionContinue.upRight && isInsideRight && isInsideUp && (!checkCheck || this.validateMove(i, i))) {
                directionContinue.upRight = !pieces.some(p => p.current.x === rightPos && p.current.y === upPos);
                moves.push([rightPos, upPos]);
            }
            if(directionContinue.downRight && isInsideRight && isInsideDown && (!checkCheck || this.validateMove(i, -i))) {
                directionContinue.downRight = !pieces.some(p => p.current.x === rightPos && p.current.y === downPos);
                moves.push([rightPos, downPos]);
            }
            if(directionContinue.downLeft && isInsideLeft && isInsideDown && (!checkCheck || this.validateMove(-i, -i))) {
                directionContinue.downLeft = !pieces.some(p => p.current.x === leftPos && p.current.y === downPos);
                moves.push([leftPos, downPos]);
            }
        }

        return moves;
    }

    canMove(moveX, moveY, premove = false) {
        return Math.abs(moveX) === Math.abs(moveY) && (premove || this.validateMove(moveX, moveY));
    }

    getPosition(){
        return `Goniec-${this.x}-${this.y}`;
    }

    render(){
        return (
            <img 
                className={`piece ${this.state.backgroundStyle}`}
                ref={this.props.pointer}
                src={this.graphic}
                alt={`${this.props.isWhite ? 'white' : 'black'} bishop`}
            />
        );
    }
}
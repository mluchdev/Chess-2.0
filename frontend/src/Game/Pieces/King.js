import React from 'react';
import { Piece } from './Piece';
import { boardSize } from '../../Contexts/LogContext';
import "../piece.css";

import blackKing from '../../Assets/blackPieces/king.png';
import whiteKing from '../../Assets/whitePieces/king.png';

export class King extends Piece {
    type = 'King';

    constructor(props){
        super(props);
        this.graphic = props.isWhite ? whiteKing : blackKing;
        this.possibleMoves = () => this.attack(true);
    }

    updateCheck(checkValue) { // Needed for animation to work properly.
        this.props.pointer.current.classList.remove('check-style');
        if(checkValue) {
            this.props.pointer.current.classList.add('check-style');
        }
    }

    attack(checkCheck = false) { // roszady nie pokazuje
        return [-1, 0, 1].flatMap(i => [-1, 0, 1].filter(j => (i !== 0 || j !== 0) && (!checkCheck || this.validateMove(i, j)) ).map(j => [i + this.x, j + this.y]));
    }

    canMove(moveX, moveY, premove = false) {
        const {playerPieces, gameEvents: {check}, moveHistory} = this.gameContext;
        const enemyPieces = playerPieces.current[this.isPlayer ? 'enemyPieces' : 'allyPieces'];

        if( // można to zrobić w jednym ifie.
            moveX === -2 &&
            !moveHistory.current.some(p => p?.King && (this.isPlayer ? p.King?.finalSquares?.y - p.King?.move?.y === boardSize - 1 : p.King?.finalSquares?.y === p.King?.move?.y) ) &&
            !moveHistory.current.filter(p => p.Rook).some(piece => (this.isPlayer ? (piece.Rook?.finalSquares?.y - piece.Rook?.move?.y  === boardSize - 1) : (piece.Rook?.finalSquares?.y === piece.Rook?.move?.y)) && piece.Rook?.finalSquares?.x === piece.Rook?.move?.x) &&
            (premove || !enemyPieces.some(p => p.current.attack().some(([x, y]) => x === this.x - 1 && y === this.y) )) && 
            (premove || !enemyPieces.some(p => p.current.attack().some(([x, y]) => x === this.x - 2 && y === this.y) )) &&
            (premove || this.validateMove(moveX, moveY)) &&
            !check
        ) {
            playerPieces.current[this.isPlayer ? 'allyPieces' : 'enemyPieces']
                .find(p => p.current.x === 0 && (this.isPlayer ? p.current.y === boardSize - 1 : p.current.y === 0))
                .current.x += 3;

            const rookContainer = document.querySelector(`#piece-${0}-${this.isPlayer ? boardSize - 1 : 0}`);
            document.querySelector(`#square-${3}-${this.isPlayer ? boardSize - 1 : 0}`).replaceChildren(rookContainer);
            document.querySelector(`#square-${0}-${this.isPlayer ? boardSize - 1 : 0}`).replaceChildren();
            return true;
        } else if(
            moveX === 2 && // to do ogólnienia w chess960 nie zadziała
            !moveHistory.current.some(p => (p.King ?? false) && (this.isPlayer ? p.King?.finalSquares?.y - p.King?.move?.y === boardSize - 1 : p.King?.finalSquares?.y === p.King?.move?.y) ) &&
            !moveHistory.current.filter(p => p.Rook).some(piece => this.isPlayer ? (piece.Rook?.finalSquares?.y - piece.Rook?.move?.y  === boardSize - 1) : (piece.Rook?.finalSquares?.y === piece.Rook?.move?.y) && piece.Rook?.finalSquares?.x === piece.Rook?.move?.x) &&
            (premove || !enemyPieces.some(p => p.current.attack().some(([x, y]) => x === this.x + 1 && y === this.y) )) && 
            (premove || !enemyPieces.some(p => p.current.attack().some(([x, y]) => x === this.x + 2 && y === this.y) )) &&
            (premove || this.validateMove(moveX, moveY)) &&
            !check
        ) {
            playerPieces.current[this.isPlayer ? 'allyPieces' : 'enemyPieces']
                .find(p => p.current.x === boardSize - 1 && (this.isPlayer ? p.current.y === boardSize - 1 : p.current.y === 0))
                .current.x -= 2;

            const rookContainer = document.querySelector(`#piece-${boardSize - 1}-${this.isPlayer ? boardSize - 1 : 0}`);
            document.querySelector(`#square-${boardSize - 3}-${this.isPlayer ? boardSize - 1 : 0}`).replaceChildren(rookContainer);
            document.querySelector(`#square-${boardSize - 1}-${this.isPlayer ? boardSize - 1 : 0}`).replaceChildren();
            return true;
        }
        return (Math.abs(moveX) < 2 && Math.abs(moveY) < 2) && (premove || this.validateMove(moveX, moveY));
    }

    getPosition(){
        return `King-${this.x}-${this.y}`;
    }

    render(){
        return (
            <img 
                className={`piece ${this.state.backgroundStyle}`}
                ref={this.props.pointer}
                src={this.graphic}
                alt={`${this.props.isWhite ? 'white' : 'black'} king`}
            />
        );
    }
}
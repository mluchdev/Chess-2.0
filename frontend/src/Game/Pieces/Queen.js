import React from 'react';
import { Piece } from './Piece';
import "../piece.css"

// importing attack functions from bishop and the rook
import { Bishop } from './Bishop';
import { Rook } from './Rook';

import blackQueen from '../../Assets/blackPieces/queen.png';
import whiteQueen from '../../Assets/whitePieces/queen.png'

export class Queen extends Piece {
    type = 'Queen';

    constructor(props){
        super(props);
        this.diagonalAttack = Bishop.prototype.attack.bind(this); // binding bishop attack function
        this.straightAttack = Rook.prototype.attack.bind(this); // binding rook attack function
        this.possibleMoves = () => ([...this.diagonalAttack(true), ...this.straightAttack(true)]);
        this.graphic = props.isWhite ? whiteQueen : blackQueen;
    }

    attack() {
        return [...this.diagonalAttack(), ...this.straightAttack()];
    }

    canMove(moveX, moveY, premove = false) {
        return (moveX * moveY === 0 || Math.abs(moveX) === Math.abs(moveY)) && (premove || this.validateMove(moveX, moveY));
    }

    getPosition(){
        return `Hetman-${this.x}-${this.y}`;
    }

    render(){
        return (
            <img 
                className={`piece ${this.state.backgroundStyle}`}
                ref={this.props.pointer}
                src={this.graphic}
                alt={`${this.props.isWhite ? 'white' : 'black'} queen`}
            />
        );
    }
}
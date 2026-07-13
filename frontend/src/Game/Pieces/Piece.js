import { Component, } from "react";
import "../piece.css";
import { boardSize } from "../../Contexts/LogContext";

export class Piece extends Component {
    state = {
        clicked: false
    }

    constructor(props) {
        super(props);
        this.gameContext = props.gameContext
        this.x = props.i;
        this.y = props.j;
        this.isPlayer = props.isPlayer;
        this.pieceId = props.pieceId;
    }

    isAtCheck(moveX, moveY) {
        const {playerPieces} = this.gameContext;

        // temporary change of figure placement
        [this.x, this.y] = [this.x + moveX, this.y + moveY];
        
        const alliedKing = playerPieces.current[this.isPlayer ? 'allyPieces' : 'enemyPieces'].find(p => p.current.type === 'King').current;
        
        const toRet = playerPieces.current[this.isPlayer ? 'enemyPieces' : 'allyPieces'].some(p => 
            p.current.attack().some(([x, y]) => alliedKing.x === x && alliedKing.y === y) &&
            (this.x !== p.current.x || this.y !== p.current.y) // kiedy figura jest bita pod szachem
        );
        
        // back to previous position
        [this.x, this.y] = [this.x - moveX, this.y - moveY];
        return toRet;
    }

    validateMove(moveX, moveY, isNotKnight = true) {
        const { playerPieces } = this.gameContext;
        const [ newX, newY ] = [this.x + moveX, this.y + moveY];
        const [ dx, dy ] = [Math.sign(moveX), Math.sign(moveY)];

        if (newX < 0 || newY < 0 || newX >= boardSize || newY >= boardSize) return false;
        if (playerPieces.current[this.isPlayer ? 'allyPieces' : 'enemyPieces']
            .some(p => p.current.x === newX && p.current.y === newY)) return false;

        if (isNotKnight) {
            let [ x, y ] = [ this.x + dx, this.y + dy ];
            const allPieces = [...playerPieces.current.allyPieces, ...playerPieces.current.enemyPieces];
            while (x !== newX || y !== newY) {
                if (allPieces.some(p => p.current?.x === x && p.current?.y === y)) return false;
                x += dx;
                y += dy;
            }
        }

        return !this.isAtCheck(moveX, moveY);
    }

    clicked() {
        this.setState({
            backgroundStyle: this.isPlayer ? 'clicked-ally' : 'clicked-enemy',
        });
    }

    unclicked() {
        this.setState({backgroundStyle: ''});
    }

    render() {
        return <> {this.props.children} </>
    }   
}
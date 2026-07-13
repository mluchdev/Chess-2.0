import React from 'react';
import { moveFunctions } from '../Game/utils/ChessLogicCC';
import { setTiles } from '../Game/Tile';

export const GameContext = React.createContext();

export const gameStates = {}

//! all premoves being cancelled idk why

export const GameContextProvider = ({children}) => {
    const playerPieces = React.useRef({
        allyPieces: [], // refy do figur sojusznika
        enemyPieces: [], // refy do figur przeciwnika
    });

    const moveHistory = React.useRef([]); // {figura: {finalSquares, move}}

    const [gameEvents, setGameEvents] = React.useState({
        isWhiteToMove: true,
        check: false,
        checkmate: false,
        stalemate: false,
        endOfTime: false,
    });

    const [wsConnection, setWsConnection] = React.useState({
        // potem się przyda do zasygnalizowania, słabego połączenia
        ping: 0,
    });

    React.useEffect(() => {
        gameStates.set = setGameEvents;
        gameStates.values = gameEvents;
    }, [gameEvents, setGameEvents])

    // odtad leci czesc od premove'a
    const premoveHistory = React.useRef([]); // {finalSquares, move, promotes}
    const piecesTaken = React.useRef([]); // lista figur które zostały przykryte - potrzebna tylko dla playera

    const toggleSquareColor = (isPlayer, lastPremove, option) => {
        if(isPlayer) {
            setTiles[`${lastPremove.finalSquares.x}-${lastPremove.finalSquares.y}`]('', option);
            // setTiles[`${lastPremove.finalSquares.x - lastPremove.move.x}-${lastPremove.finalSquares.y - lastPremove.move.y}`]('', option);
            // option above is ugly imo
        }
    }

    const applyPremove = async (isPlayer) => {
        if(premoveHistory.current.length === 0)
            return;

        if(isPlayer) {
            unpremoveAllPieces();
        }

        const lastPremove = premoveHistory.current.shift();
        
        if(moveHistory.current.length + 1 === piecesTaken.current[0]?.moveNum) {
            const firstRemovedPiece = piecesTaken.current.shift();
            graphicallyRevive(firstRemovedPiece);
        }

        if(!premoveHistory.current.some(moveObject => moveObject.finalSquares?.x === lastPremove.finalSquares?.x && moveObject.finalSquares?.y === lastPremove.finalSquares?.y))
            toggleSquareColor(isPlayer, lastPremove, 'default');

        const chosenFunction = moveFunctions.functions[lastPremove.pieceId];

        if(chosenFunction && await chosenFunction(lastPremove.move.x, (isPlayer ? 1 : -1) * lastPremove.move.y, lastPremove?.promotes)) {
            console.log('Move legal: ', lastPremove);
            delete lastPremove.type;
        } else if(isPlayer) {
            console.error(`[PREMOVE REJECTED] Player premove illegal: pieceId=${lastPremove.pieceId} at (${lastPremove.finalSquares?.x},${lastPremove.finalSquares?.y}) move=(${lastPremove.move.x},${lastPremove.move.y}) - chosenFunction=${!!chosenFunction} moveResult=${chosenFunction ? 'false (move check failed)' : 'undefined (no moveFunction)'}`);
            resetAllPremoves();
        } else {
            console.error(`[PREMOVE REJECTED] Opponent premove illegal: pieceId=${lastPremove.pieceId} at (${lastPremove.finalSquares?.x},${lastPremove.finalSquares?.y}) move=(${lastPremove.move.x},${lastPremove.move.y}) - chosenFunction=${!!chosenFunction}`);
            premoveHistory.current = [];
        }

    }

    // moveFunction is being cut somewhere there.
    const addPremove = (moveObject, isPlayer) => {
        premoveHistory.current.push({...moveObject, isPlayer});

        if(isPlayer) {
            const {x: newX, y: newY} = moveObject.finalSquares;
            const [oldX, oldY] = [newX - moveObject.move.x, newY - moveObject.move.y];
            const newSquare = document.getElementById(`square-${newX}-${newY}`);

            if(newSquare.childElementCount){
                const pieceToBeRemoved = newSquare.firstChild;
                const moveNumber = moveHistory.current.length + premoveHistory.current.length * 2; // pojdzie do zmiany dla conditional premoves
                piecesTaken.current.push({
                    moveNum: moveNumber,
                    object: pieceToBeRemoved,
                    squareId: `square-${newX}-${newY}`
                });
                pieceToBeRemoved.remove();
            }

            moveFromTo(oldX, oldY, newX, newY, playerPieces, moveObject.pieceId);
        }

        toggleSquareColor(isPlayer, moveObject, 'premove');
    }

    const resetAllPremoves = (fromTile = false) => {
        if(fromTile) {
            premoveHistory.current.forEach(premove => {
                setTiles[`${premove.finalSquares.x}-${premove.finalSquares.y}`]('', 'default');
            });
        }
        unpremoveAllPieces();
        console.log('[RESET PREMOVES] Reviving all taken pieces:', piecesTaken.current.length);
        piecesTaken.current.forEach(graphicallyRevive);

        piecesTaken.current = [];
        premoveHistory.current = [];
    }

    const unpremoveAllPieces = () => {
        premoveHistory.current?.forEach((premove) => {
            if(!premove?.finalSquares || !premove?.move) return;
            const currentX = premove.finalSquares.x;
            const currentY = premove.finalSquares.y;
            const oldX = currentX - premove.move.x;
            const oldY = currentY - premove.move.y;
            moveFromTo(currentX, currentY, oldX, oldY, playerPieces, premove.pieceId);
        });
    }

    const premoveAllPieces = () => {
        premoveHistory.current?.forEach(premove => {
            if(!premove?.finalSquares || !premove?.move) return;
            const newX = premove.finalSquares.x;
            const newY = premove.finalSquares.y;
            const oldX = newX - premove.move.x;
            const oldY = newY - premove.move.y;
            moveFromTo(oldX, oldY, newX, newY, playerPieces, premove.pieceId);
        });
    }

    const values = {
        playerPieces,
        gameEvents,
        setGameEvents,
        moveHistory,
        wsConnection,
        setWsConnection,
        addPremove,
        applyPremove,
        resetAllPremoves,
        unpremoveAllPieces,
        premoveAllPieces,
        premoveHistory
    }

    return <GameContext.Provider value={values}>
        {children}
    </GameContext.Provider>
}

export const useGameContext = () => React.useContext(GameContext);

const graphicallyRevive = (premoveObject) => {
  console.log('[REVIVE] Attempting to revive at squareId:', premoveObject.squareId, 'object:', premoveObject.object);
  const square = document.getElementById(premoveObject.squareId);
  if(!square) {
    console.error('[REVIVE ERROR] Square not found:', premoveObject.squareId);
    return;
  }
  if(!premoveObject.object) {
    console.error('[REVIVE ERROR] Object is null/undefined');
    return;
  }
  square.appendChild(premoveObject.object);
  console.log('[REVIVE] Successfully revived piece');
}

export const moveFromTo = (fromX, fromY, toX, toY, playerPieces, pieceId) => {
    const newSquare = document.getElementById(`square-${toX}-${toY}`);
    const oldSquare = document.querySelector(`#square-${fromX}-${fromY}`);

    const pieceToBeMoved = oldSquare.firstChild;
    if(!pieceToBeMoved) {
        return;
    }
    oldSquare.replaceChildren();
    newSquare.appendChild(pieceToBeMoved);

    const pieceClassRef = playerPieces.current.allyPieces.find(piece => piece.current.pieceId === pieceId);
    if(!pieceClassRef) {
        return;
    }
    pieceClassRef.current.x = toX;
    pieceClassRef.current.y = toY;
}
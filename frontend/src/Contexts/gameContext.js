import React from 'react';
import { moveFunctions } from '../Game/utils/ChessLogicCC';
import { boardSize } from './LogContext';
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
            return

        console.log(`[PREMOVE] applyPremove called. isPlayer=${isPlayer}, queue length=${premoveHistory.current.length}`, premoveHistory.current.map(p => `(${p.finalSquares.x},${p.finalSquares.y})`));

        if(isPlayer) { // cofamy figure ktora sie bedzie ruszac
            console.log('[PREMOVE] unpremoveAllPieces — moving pieces back to real positions');
            unpremoveAllPieces();
        }

        const lastPremove = premoveHistory.current.shift(); // ! on nie znajdzie figury ruszonej kilka razy
        const oldY = isPlayer ? lastPremove.finalSquares.y - lastPremove.move.y : boardSize - 1 - lastPremove.finalSquares.y + lastPremove.move.y;
        const oldX = lastPremove.finalSquares.x - lastPremove.move.x

        console.log(`[PREMOVE] Trying to apply: (${oldX},${oldY}) -> (${lastPremove.finalSquares.x},${lastPremove.finalSquares.y}), move=(${lastPremove.move.x},${lastPremove.move.y})`);

        const chosenFunction = moveFunctions.functions[lastPremove.pieceId];
        if(!chosenFunction) {
            console.error(`[PREMOVE] No moveFunction for pieceId=${lastPremove.pieceId}`);
        }

        if(!premoveHistory.current.some(moveObject => moveObject.finalSquares.x === lastPremove.finalSquares.x && moveObject.finalSquares.y === lastPremove.finalSquares.y))
            toggleSquareColor(isPlayer, lastPremove, 'default');

        // Jak premove usunal graficznie figure to ja przywracamy
        if(moveHistory.current.length + 1 === piecesTaken.current[0]?.moveNum) {
            console.log(`[PREMOVE] Reviving piece captured during premove at square=${piecesTaken.current[0].squareId}`);
            const firstRemovedPiece = piecesTaken.current.shift();
            graphicallyRevive(firstRemovedPiece);
        }

        // chosenFunction output is wrong here.
        if(chosenFunction && await chosenFunction(lastPremove.move.x, (isPlayer ? 1 : -1) * lastPremove.move.y, lastPremove?.promotes) ) { // da sie wykonać premove
            console.log(`[PREMOVE] Premove executed successfully. Remaining queue: ${premoveHistory.current.length}`);
            delete lastPremove.type; // ? Po co jest ten delete
        } else if(isPlayer){ // premove impossible for the player
            const moveValidity = await chosenFunction(lastPremove.move.x, (isPlayer ? 1 : -1) * lastPremove.move.y, lastPremove?.promotes)
            console.warn(`[PREMOVE] Premove was illegal — resetting all premoves. chosenFunction=${!!chosenFunction}. moveValidity=${moveValidity}`);
            resetAllPremoves();
        } else { // premove impossible for the opponent
            console.warn('[PREMOVE] Opponent premove was illegal — clearing queue');
            premoveHistory.current = [];
        }

        if(isPlayer) {
            console.log(`[PREMOVE] premoveAllPieces — re-applying ${premoveHistory.current.length} remaining premove(s)`);
            premoveAllPieces();
        }
    }

    // moveFunction is being cut somewhere there.
    const addPremove = (moveObject, isPlayer) => {
        premoveHistory.current.push(moveObject);

        if(isPlayer) {
            const {x: newX, y: newY} = moveObject.finalSquares;
            const [oldX, oldY] = [newX - moveObject.move.x, newY - moveObject.move.y];
            const newSquare = document.getElementById(`square-${newX}-${newY}`);

            if(newSquare.childElementCount){
                const pieceToBeRemoved = newSquare.firstChild;
                const moveNumber = moveHistory.current.length + premoveHistory.current.length * 2; // pojdzie do zmiany dla conditional premoves
                console.log(`[PREMOVE] addPremove: piece found at target (${newX},${newY}), removing. Will revive at moveNum=${moveNumber}`);
                piecesTaken.current.push({
                    moveNum: moveNumber,
                    object: pieceToBeRemoved,
                    squareId: `square-${newX}-${newY}`
                });
                pieceToBeRemoved.remove();
            }

            console.log(`[PREMOVE] addPremove: (${oldX},${oldY}) -> (${newX},${newY})`);
            moveFromTo(oldX, oldY, newX, newY, playerPieces, moveObject.pieceId);
        }

        toggleSquareColor(isPlayer, moveObject, 'premove');
    }

    const resetAllPremoves = (fromTile = false) => {
        console.log(`[PREMOVE] resetAllPremoves. fromTile=${fromTile}, queue length=${premoveHistory.current.length}`);
        if(fromTile) {
            premoveHistory.current.forEach(premove => {
                setTiles[`${premove.finalSquares.x}-${premove.finalSquares.y}`]('', 'default');
            });
        }
        unpremoveAllPieces();
        piecesTaken.current.forEach(graphicallyRevive);

        piecesTaken.current = [];
        premoveHistory.current = [];
    }

    const unpremoveAllPieces = () => { // this is wrong bugged.
        console.log(`[PREMOVE] unpremoveAllPieces — undoing ${premoveHistory.current.length} premove(s) in reverse`);
        premoveHistory.current.reduceRight((_, premove) => {
            const currentX = premove.finalSquares.x;
            const currentY = premove.finalSquares.y;
            const oldX = currentX - premove.move.x;
            const oldY = currentY - premove.move.y;
            console.log(`[PREMOVE]   unpremove: (${currentX},${currentY}) -> (${oldX},${oldY})`);
            moveFromTo(currentX, currentY, oldX, oldY, playerPieces, premove.pieceId);
        }, null);
    }

    const premoveAllPieces = () => {
        console.log(`[PREMOVE] premoveAllPieces — applying ${premoveHistory.current.length} premove(s)`);
        premoveHistory.current.forEach(premove => {
            const newX = premove.finalSquares.x;
            const newY = premove.finalSquares.y;
            const oldX = newX - premove.move.x;
            const oldY = newY - premove.move.y;
            console.log(`[PREMOVE]   premove: (${oldX},${oldY}) -> (${newX},${newY})`);
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
        premoveHistory
    }

    return <GameContext.Provider value={values}>
        {children}
    </GameContext.Provider>
}

export const useGameContext = () => React.useContext(GameContext);

const graphicallyRevive = (premoveObject) => {
  console.log(`[PREMOVE] graphicallyRevive: restoring piece to ${premoveObject.squareId}`);
  document.getElementById(premoveObject.squareId).appendChild( premoveObject.object ); // graficzne przywrócenie figury
}

export const moveFromTo = (fromX, fromY, toX, toY, playerPieces, pieceId) => {
    const newSquare = document.getElementById(`square-${toX}-${toY}`);
    const oldSquare = document.querySelector(`#square-${fromX}-${fromY}`);

    const pieceToBeMoved = oldSquare.firstChild;
    if(!pieceToBeMoved) {
        console.error(`[PREMOVE] moveFromTo(${fromX},${fromY} -> ${toX},${toY}): source square is EMPTY — no piece to move!`);
        return;
    }
    oldSquare.replaceChildren();
    newSquare.appendChild(pieceToBeMoved);

    const pieceClassRef = playerPieces.current.allyPieces.find(piece => piece.current.pieceId === pieceId);
    if(!pieceClassRef) {
        console.error(`[PREMOVE] moveFromTo: no piece with pieceId=${pieceId}`);
        return;
    }
    pieceClassRef.current.x = toX;
    pieceClassRef.current.y = toY;
}
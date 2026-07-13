import { useEffect, forwardRef, useState } from 'react';
import { boardSize, useLogContext } from '../Contexts/LogContext';
import { useGameContext } from '../Contexts/gameContext';
import { beginPositions } from './rules/beginningPositions';

import { Knight } from './Pieces/Knight';
import { Bishop } from './Pieces/Bishop';
import { Queen } from './Pieces/Queen';
import { King } from './Pieces/King';
import { Rook } from './Pieces/Rook';
import { Pawn } from './Pieces/Pawn';

const PieceComponents = {
  Pawn,
  Knight,
  Bishop,
  Rook,
  Queen,
  King,
};

export const eventBus = {
  listeners: new Map(),
  emit(id, newProps) {
    setTimeout(() => {
      if (this.listeners.has(id)) {
        this.listeners.get(id)(newProps);
      }
    }, 0);
  },
  subscribe(id, setProps) {
    this.listeners.set(id, setProps);
    return () => this.listeners.delete(id);
  }
};

// da sie to zrobić jakoś ładnie i szybko?
export const PieceOn = forwardRef(({i, j, pieceId, pointer}, ref) => {
  const gameContext = useGameContext();
  const {logState} = useLogContext();
  const [piece, setPiece] = useState({
    isWhite: beginPositions['variant a'][logState.isUserWhite ? boardSize - j - 1 : j][i].isWhite,
    type: beginPositions['variant a'][logState.isUserWhite ? boardSize - j - 1 : j][i].type,
    i: i,
    j: j,
  });

  useEffect(() => {
    return eventBus.subscribe(`setStates-${i}-${j}`, setPiece);
  }, [i, j]);

  useEffect(() => { // przypisanie wszystkich bierek
    const arrayKey = j > boardSize/2 ? 'allyPieces' : 'enemyPieces';
    
    if (!gameContext.playerPieces.current[arrayKey].includes(pointer)) {
      gameContext.playerPieces.current[arrayKey].push(pointer);
      
      return () => {
        gameContext.playerPieces.current[arrayKey] = gameContext.playerPieces.current[arrayKey]
          .filter(ref => ref !== pointer); // it's for react strict purposes only.
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [j, pointer]);

  const PieceComponent = PieceComponents[piece.type];
  return <PieceComponent
    {...piece}
    pieceId={pieceId}
    isPlayer={pointer?.current?.isPlayer ?? j > boardSize/2}
    pointer={ref}
    ref={pointer}
    gameContext={gameContext} // Sometimes child doesn't have the context idk why
  />
});
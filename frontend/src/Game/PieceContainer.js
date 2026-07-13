import { useState, useRef, useEffect } from 'react';
import { ChessLogicCC } from './utils/ChessLogicCC';
import { PieceOn } from './PieceOn';
import { setTiles } from './Tile';
import { moveFunctions } from './utils/ChessLogicCC';
import { useMoveMarkersContext } from '../Contexts/moveMarkersContext';
import Moveable from 'react-moveable';
import './piece.css';

const PieceContainer = ({i, j, tileSize, connection}) => {
  const [isReady, setIsReady] = useState(false);
  const pieceClass = useRef(null);
  const imageRef = useRef(null);
  const ownRef = useRef(null);
  const {setMarkers, makeMove, moveFunction} = ChessLogicCC(pieceClass, ownRef, connection);
  const {setMarkerPositions} = useMoveMarkersContext();

  useEffect(() => {
    if(imageRef.current)
      setIsReady(true);
  }, []);

  useEffect(() => {
    moveFunctions.functions[`piece-${i}-${j}`] = moveFunction;
  }, [i, j]);

  return (
    <div
      id={`piece-${i}-${j}`}
      className="moveable-container"
      onContextMenu={e => setTiles[`${pieceClass.current.x}-${pieceClass.current.y}`](e)}
      ref={ownRef}
    >
      {isReady &&
        <Moveable
          draggable={true}
          origin={false}
          target={imageRef}
          onDrag={e => {
            const prev = e.target.style.transform.split(' ');
            e.target.style.transform = prev[0] + " " + prev[1] + " " + e.transform;
          }}
          onDragStart={e => {
            const elementRect = e.target.getBoundingClientRect();
            const [xCent, yCent] = [elementRect.left + elementRect.right, elementRect.top + elementRect.bottom].map(el => el/2);
            e.target.style.transform = `translate(${e.clientX - xCent}px,${e.clientY - yCent}px)`
            e.target.style.zIndex = '1000';
            pieceClass.current.clicked();
            setMarkerPositions([]);
          }}
          onDragEnd={ async e => {
            pieceClass.current.unclicked();
            e.target.style.zIndex = 'auto';

            // onDragStart shift
            const [dxStart, dyStart,] = e.target.style.transform.match(/-?\d+\.?\d*/g).map(str => parseFloat(str));

            // No transform piece in the center of the square
            imageRef.current.style.transform = '';

            if(!e?.lastEvent?.left)
              return; // it's not a drag move, just a click

            // piece shift - calculating move
            const [moveX, moveY] = [e.lastEvent.left + dxStart, e.lastEvent.top + dyStart].map(value => Math.round(value/tileSize));

            // Validate that target square is within board
            const targetX = pieceClass.current.x + moveX;
            const targetY = pieceClass.current.y + moveY;
            if(targetX < 0 || targetX >= 8 || targetY < 0 || targetY >= 8)
              return; // piece dragged outside board

            makeMove(moveX, moveY);
          }}
          onClick={setMarkers}
          hideDefaultLines={true}
        />
      }
      <PieceOn
        i={i}
        j={j}
        pieceId={`piece-${i}-${j}`}
        ref={imageRef}
        pointer={pieceClass}
      />
    </div>
  )
}

export default PieceContainer;
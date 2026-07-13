/**
 * Integration test for premove coordinate tracking.
 * Uses the REAL moveFromTo from gameContext.js and real jsdom DOM.
 * No mocks of the actual logic — only the piece DOM elements and squares
 * are constructed manually (as they would be by Tile/PieceContainer in the app).
 *
 * To run:
 *   cd frontend && npx react-scripts test premoveSimulation --watchAll=false --verbose
 */

import { moveFromTo } from '../../Contexts/gameContext';

// ---------------------------------------------------------------------------
// Helpers to replicate the board DOM structure the real app creates
// ---------------------------------------------------------------------------

const setupBoard = () => {
    for (let x = 0; x < 8; x++)
        for (let y = 0; y < 8; y++) {
            const sq = document.createElement('div');
            sq.id = `square-${x}-${y}`;
            document.body.appendChild(sq);
        }
};

const placePieceOnSquare = (x, y) => {
    const el = document.createElement('div');
    document.getElementById(`square-${x}-${y}`).appendChild(el);
    return el;
};

// Same shape as pieceClass.current in the real app
const makePieceRef = (pieceId, x, y) => ({ current: { pieceId, x, y } });

// Same shape as playerPieces ref in the real app
const makePlayerPieces = (refs) => ({ current: { allyPieces: refs, enemyPieces: [] } });

// ---------------------------------------------------------------------------
// Simulate addPremove / unpremoveAllPieces / premoveAllPieces
// using the REAL moveFromTo so any coordinate-tracking bug shows up.
// ---------------------------------------------------------------------------

const addPremove = (history, ref, toX, toY, playerPieces) => {
    const { x: fromX, y: fromY } = ref.current;
    history.push({
        pieceId: ref.current.pieceId,
        finalSquares: { x: toX, y: toY },
        move: { x: toX - fromX, y: toY - fromY },
    });
    moveFromTo(fromX, fromY, toX, toY, playerPieces, ref.current.pieceId);
};

const unpremoveAllPieces = (history, playerPieces) => {
    [...history].reverse().forEach(pm => {
        moveFromTo(
            pm.finalSquares.x, pm.finalSquares.y,
            pm.finalSquares.x - pm.move.x, pm.finalSquares.y - pm.move.y,
            playerPieces, pm.pieceId
        );
    });
};

const premoveAllPieces = (history, playerPieces) => {
    history.forEach(pm => {
        moveFromTo(
            pm.finalSquares.x - pm.move.x, pm.finalSquares.y - pm.move.y,
            pm.finalSquares.x, pm.finalSquares.y,
            playerPieces, pm.pieceId
        );
    });
};

// Execute the first queued premove (as applyPremove(true) does).
// Returns false if the piece couldn't be found.
const applyFirstPremove = (history, playerPieces) => {
    unpremoveAllPieces(history, playerPieces);

    const first = history.shift();

    // Look up by pieceId (new code path, matches applyPremove after our fix)
    const ref = playerPieces.current.allyPieces.find(p => p.current.pieceId === first.pieceId);
    if (!ref) { console.error(`applyFirstPremove: pieceId ${first.pieceId} not found`); return false; }

    // Move piece's logical position (what moveFunction does to pieceClass.current.x/y)
    ref.current.x = first.finalSquares.x;
    ref.current.y = first.finalSquares.y;

    // Move DOM element (what moveFunction does graphically)
    const oldEl = document.getElementById(`square-${first.finalSquares.x - first.move.x}-${first.finalSquares.y - first.move.y}`)?.firstChild;
    const newSq = document.getElementById(`square-${first.finalSquares.x}-${first.finalSquares.y}`);
    if (oldEl) newSq.replaceChildren(oldEl);

    premoveAllPieces(history, playerPieces);
    return true;
};

// ---------------------------------------------------------------------------
// Assertions
// ---------------------------------------------------------------------------

const assertPositions = (playerPieces, expected) => {
    const wrong = [];
    playerPieces.current.allyPieces.forEach(ref => {
        const exp = expected[ref.current.pieceId];
        if (exp && (ref.current.x !== exp.x || ref.current.y !== exp.y)) {
            wrong.push({
                id:       ref.current.pieceId,
                actual:   `(${ref.current.x},${ref.current.y})`,
                expected: `(${exp.x},${exp.y})`,
            });
        }
    });
    if (wrong.length) console.table(wrong);
    expect(wrong).toHaveLength(0);
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
    document.body.innerHTML = '';
    setupBoard();
});

// Coordinates (black player, j = rank - 1):
//   e7=(4,6)  e5=(4,4)  g8=(6,7)  g6=(6,5)  c4=(2,3)
describe('premove coordinate tracking — real moveFromTo', () => {

    test('single knight premove — no collision', () => {
        const knight = makePieceRef('piece-6-7', 6, 7);
        placePieceOnSquare(6, 7);
        const pp = makePlayerPieces([knight]);
        const history = [];

        addPremove(history, knight, 4, 6, pp); // knight g8 → e7

        applyFirstPremove(history, pp);

        // After opponent's move: knight should be at e7=(4,6)
        assertPositions(pp, { 'piece-6-7': { x: 4, y: 6 } });
    });

    test('pawn e7→e5, then knight chain g8→e7→g6→e5→c4 (knight passes through pawn square)', () => {
        const pawn   = makePieceRef('piece-4-6', 4, 6);
        const knight = makePieceRef('piece-6-7', 6, 7);
        placePieceOnSquare(4, 6);
        placePieceOnSquare(6, 7);
        const pp = makePlayerPieces([pawn, knight]);
        const history = [];

        addPremove(history, pawn,   4, 4, pp); // pawn   e7 → e5
        addPremove(history, knight, 4, 6, pp); // knight g8 → e7
        addPremove(history, knight, 6, 5, pp); // knight e7 → g6
        addPremove(history, knight, 4, 4, pp); // knight g6 → e5  ← collides with pawn
        addPremove(history, knight, 2, 3, pp); // knight e5 → c4

        applyFirstPremove(history, pp); // white plays e4 → pawn premove executes

        // After 1 opponent move:
        //   pawn: real position e5=(4,4)
        //   knight: visually at c4=(2,3)  (remaining 4 premoves re-applied)
        assertPositions(pp, {
            'piece-4-6': { x: 4, y: 4 },
            'piece-6-7': { x: 2, y: 3 },
        });
    });

    // -----------------------------------------------------------------------
    // Custom scenario — edit freely
    // -----------------------------------------------------------------------
    test('custom scenario', () => {
        // Define your pieces (pieceId must match 'piece-${i}-${j}' from Game.js)
        const pieces = [
            makePieceRef('piece-4-6', 4, 6), // pawn  e7
            makePieceRef('piece-6-7', 6, 7), // knight g8
        ];
        pieces.forEach(ref => placePieceOnSquare(ref.current.x, ref.current.y));
        const pp = makePlayerPieces(pieces);
        const history = [];

        // Your premove sequence: addPremove(history, pieceRef, toX, toY, pp)
        addPremove(history, pieces[1], 4, 6, pp); // knight g8 → e7
        addPremove(history, pieces[1], 6, 5, pp); // knight e7 → g6

        applyFirstPremove(history, pp);

        // Expected positions after 1 opponent move
        assertPositions(pp, {
            'piece-4-6': { x: 4, y: 6 }, // pawn unmoved
            'piece-6-7': { x: 6, y: 5 }, // knight visually at g6
        });
    });
});

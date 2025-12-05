import React from 'react';
import type { Player } from '../types';

interface GameBoardProps {
  players: Player[];
  currentPlayerIndex: number;
  validMoves: number[];
  onPieceClick: (playerIndex: number, pieceIndex: number) => void;
}

// Board layout positions - mapping relative positions to x,y coordinates on the board
// The board is a cross-shaped track with home areas in the corners

const BOARD_SIZE = 40;

// Color configurations for each player
const COLORS = {
  red: { bg: 'bg-red-500', border: 'border-red-600', home: 'bg-red-100', text: 'text-red-800' },
  blue: { bg: 'bg-blue-500', border: 'border-blue-600', home: 'bg-blue-100', text: 'text-blue-800' },
  green: { bg: 'bg-green-500', border: 'border-green-600', home: 'bg-green-100', text: 'text-green-800' },
  yellow: { bg: 'bg-yellow-400', border: 'border-yellow-500', home: 'bg-yellow-100', text: 'text-yellow-800' },
};

// Starting positions for each color
const START_POSITIONS: Record<string, number> = {
  red: 0,
  blue: 10,
  green: 20,
  yellow: 30,
};

// Calculate absolute board position from relative player position
const getAbsolutePosition = (relativePos: number, color: string): number => {
  if (relativePos < 0 || relativePos >= BOARD_SIZE) return relativePos;
  return (relativePos + START_POSITIONS[color]) % BOARD_SIZE;
};

// Board positions as x,y coordinates (simplified grid representation)
// The board is represented as a 15x15 grid
const TRACK_POSITIONS: Record<number, { x: number; y: number }> = {};

// Fill in track positions (going around the board clockwise from red's start)
// Top row (positions 0-5 for red start area)
for (let i = 0; i <= 5; i++) {
  TRACK_POSITIONS[i] = { x: 6 + i, y: 0 };
}
// Right column down (positions 6-9)
for (let i = 0; i < 4; i++) {
  TRACK_POSITIONS[6 + i] = { x: 12, y: 1 + i };
}
// Blue's start (positions 10-14)
for (let i = 0; i < 5; i++) {
  TRACK_POSITIONS[10 + i] = { x: 12 + (i > 0 ? 0 : 0), y: 6 + (i > 0 ? i - 1 : 0) };
}
// Bottom side going right then down (positions 15-19)
for (let i = 0; i < 4; i++) {
  TRACK_POSITIONS[15 + i] = { x: 13 + i > 14 ? 14 : 12, y: 6 + i };
}
// Green's area (positions 20-24)
// Yellow's area (positions 30-34)

// Simplified: create a circular track
const createCircularTrack = () => {
  const positions: Record<number, { x: number; y: number }> = {};
  const centerX = 7;
  const centerY = 7;
  const radius = 6;
  
  for (let i = 0; i < 40; i++) {
    const angle = (i / 40) * 2 * Math.PI - Math.PI / 2;
    positions[i] = {
      x: Math.round(centerX + radius * Math.cos(angle)),
      y: Math.round(centerY + radius * Math.sin(angle)),
    };
  }
  return positions;
};

const POSITIONS = createCircularTrack();

// Finish track positions for each color (inside the board)
const FINISH_POSITIONS: Record<string, { x: number; y: number }[]> = {
  red: [{ x: 7, y: 1 }, { x: 7, y: 2 }, { x: 7, y: 3 }, { x: 7, y: 4 }],
  blue: [{ x: 13, y: 7 }, { x: 12, y: 7 }, { x: 11, y: 7 }, { x: 10, y: 7 }],
  green: [{ x: 7, y: 13 }, { x: 7, y: 12 }, { x: 7, y: 11 }, { x: 7, y: 10 }],
  yellow: [{ x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }],
};

// Home positions for each color
const HOME_POSITIONS: Record<string, { x: number; y: number }[]> = {
  red: [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 2 }],
  blue: [{ x: 12, y: 1 }, { x: 13, y: 1 }, { x: 12, y: 2 }, { x: 13, y: 2 }],
  green: [{ x: 12, y: 12 }, { x: 13, y: 12 }, { x: 12, y: 13 }, { x: 13, y: 13 }],
  yellow: [{ x: 1, y: 12 }, { x: 2, y: 12 }, { x: 1, y: 13 }, { x: 2, y: 13 }],
};

const GameBoard: React.FC<GameBoardProps> = ({
  players,
  currentPlayerIndex,
  validMoves,
  onPieceClick,
}) => {
  // Create a 15x15 grid for the board
  const gridSize = 15;
  const cellSize = 40;

  const renderCell = (x: number, y: number) => {
    const cellKey = `${x}-${y}`;
    let cellClass = 'w-10 h-10 border border-gray-300 bg-white/50 rounded-sm';
    let content = null;

    // Check if this cell is a track position
    const trackIndex = Object.entries(POSITIONS).find(
      ([, pos]) => pos.x === x && pos.y === y
    );

    if (trackIndex) {
      cellClass = 'w-10 h-10 border border-gray-400 bg-white rounded-sm shadow-inner';
    }

    // Check for home areas
    for (const [color, positions] of Object.entries(HOME_POSITIONS)) {
      const homeIndex = positions.findIndex((pos) => pos.x === x && pos.y === y);
      if (homeIndex !== -1) {
        cellClass = `w-10 h-10 border-2 ${COLORS[color as keyof typeof COLORS].border} ${COLORS[color as keyof typeof COLORS].home} rounded-full shadow-md`;
      }
    }

    // Check for finish areas
    for (const [color, positions] of Object.entries(FINISH_POSITIONS)) {
      const finishIndex = positions.findIndex((pos) => pos.x === x && pos.y === y);
      if (finishIndex !== -1) {
        cellClass = `w-10 h-10 border-2 ${COLORS[color as keyof typeof COLORS].border} ${COLORS[color as keyof typeof COLORS].home} rounded-sm shadow-inner`;
      }
    }

    // Render pieces
    players.forEach((player, playerIdx) => {
      player.pieces.forEach((piecePos, pieceIdx) => {
        let pieceX: number | undefined;
        let pieceY: number | undefined;

        if (piecePos === -1) {
          // Piece is at home
          const homePos = HOME_POSITIONS[player.color][pieceIdx];
          pieceX = homePos?.x;
          pieceY = homePos?.y;
        } else if (piecePos >= 40) {
          // Piece is in finish area
          const finishIndex = piecePos - 40;
          const finishPos = FINISH_POSITIONS[player.color][finishIndex];
          pieceX = finishPos?.x;
          pieceY = finishPos?.y;
        } else {
          // Piece is on the track
          const absPos = getAbsolutePosition(piecePos, player.color);
          const trackPos = POSITIONS[absPos];
          pieceX = trackPos?.x;
          pieceY = trackPos?.y;
        }

        if (pieceX === x && pieceY === y) {
          const isCurrentPlayer = playerIdx === currentPlayerIndex;
          const isValidMove = validMoves.includes(pieceIdx);
          const colorConfig = COLORS[player.color];

          content = (
            <button
              className={`
                w-8 h-8 rounded-full ${colorConfig.bg} border-2 ${colorConfig.border}
                flex items-center justify-center text-white font-bold text-sm
                shadow-lg transform transition-all duration-200
                ${isValidMove ? 'animate-bounce ring-4 ring-white cursor-pointer hover:scale-110' : ''}
                ${isCurrentPlayer && !isValidMove ? 'ring-2 ring-white/50' : ''}
              `}
              onClick={() => isValidMove && onPieceClick(playerIdx, pieceIdx)}
              disabled={!isValidMove}
            >
              {pieceIdx + 1}
            </button>
          );
        }
      });
    });

    return (
      <div key={cellKey} className={cellClass + ' flex items-center justify-center'}>
        {content}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-amber-100 to-orange-100 p-6 rounded-3xl shadow-2xl border-4 border-amber-400">
      <div
        className="grid gap-0.5"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
        }}
      >
        {Array.from({ length: gridSize }).map((_, y) =>
          Array.from({ length: gridSize }).map((_, x) => renderCell(x, y))
        )}
      </div>
    </div>
  );
};

export default GameBoard;

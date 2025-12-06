import React from 'react';
import type { Player } from '../types';

interface GameBoardProps {
  players: Player[];
  currentPlayerIndex: number;
  validMoves: number[];
  onPieceClick: (playerIndex: number, pieceIndex: number) => void;
}

const BOARD_SIZE = 40;

// Starting positions for each color (where pieces enter the track)
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

// Create the track positions for a standard Ludo board
const createLudoTrack = (): Record<number, { x: number; y: number }> => {
  const positions: Record<number, { x: number; y: number }> = {};
  let idx = 0;
  
  // Red's start - going down column 6 then left (positions 0-12)
  for (let y = 0; y < 6; y++) positions[idx++] = { x: 6, y };
  for (let x = 5; x >= 0; x--) positions[idx++] = { x, y: 6 };
  
  // Yellow's corner (position 13)
  positions[idx++] = { x: 0, y: 7 };
  
  // Going right then down (positions 14-25)
  for (let x = 0; x < 6; x++) positions[idx++] = { x, y: 8 };
  for (let y = 9; y < 15; y++) positions[idx++] = { x: 6, y };
  
  // Green's corner (position 26)
  positions[idx++] = { x: 7, y: 14 };
  
  // Going up then right (positions 27-38)
  for (let y = 14; y > 8; y--) positions[idx++] = { x: 8, y };
  for (let x = 9; x < 15; x++) positions[idx++] = { x, y: 8 };
  
  // Blue's corner (position 39)
  positions[idx++] = { x: 14, y: 7 };
  
  return positions;
};

const POSITIONS = createLudoTrack();

// Finish track positions (colored paths leading to center)
const FINISH_POSITIONS: Record<string, { x: number; y: number }[]> = {
  red: [{ x: 7, y: 1 }, { x: 7, y: 2 }, { x: 7, y: 3 }, { x: 7, y: 4 }, { x: 7, y: 5 }, { x: 7, y: 6 }],
  yellow: [{ x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }],
  green: [{ x: 7, y: 13 }, { x: 7, y: 12 }, { x: 7, y: 11 }, { x: 7, y: 10 }, { x: 7, y: 9 }, { x: 7, y: 8 }],
  blue: [{ x: 13, y: 7 }, { x: 12, y: 7 }, { x: 11, y: 7 }, { x: 10, y: 7 }, { x: 9, y: 7 }, { x: 8, y: 7 }],
};

// Home base positions (4 pieces in each corner)
const HOME_POSITIONS: Record<string, { x: number; y: number }[]> = {
  red: [{ x: 1, y: 1 }, { x: 4, y: 1 }, { x: 1, y: 4 }, { x: 4, y: 4 }],
  blue: [{ x: 10, y: 1 }, { x: 13, y: 1 }, { x: 10, y: 4 }, { x: 13, y: 4 }],
  green: [{ x: 10, y: 10 }, { x: 13, y: 10 }, { x: 10, y: 13 }, { x: 13, y: 13 }],
  yellow: [{ x: 1, y: 10 }, { x: 4, y: 10 }, { x: 1, y: 13 }, { x: 4, y: 13 }],
};

const GameBoard: React.FC<GameBoardProps> = ({
  players,
  currentPlayerIndex,
  validMoves,
  onPieceClick,
}) => {
  // Find piece at position
  const getPieceAt = (x: number, y: number): { player: Player; playerIdx: number; pieceIdx: number; isValidMove: boolean } | null => {
    for (let playerIdx = 0; playerIdx < players.length; playerIdx++) {
      const player = players[playerIdx];
      for (let pieceIdx = 0; pieceIdx < player.pieces.length; pieceIdx++) {
        const piecePos = player.pieces[pieceIdx];
        let pieceX: number | undefined;
        let pieceY: number | undefined;

        if (piecePos === -1) {
          const homePos = HOME_POSITIONS[player.color]?.[pieceIdx];
          pieceX = homePos?.x;
          pieceY = homePos?.y;
        } else if (piecePos >= 40) {
          const finishIndex = piecePos - 40;
          const finishPos = FINISH_POSITIONS[player.color]?.[finishIndex];
          pieceX = finishPos?.x;
          pieceY = finishPos?.y;
        } else {
          const absPos = getAbsolutePosition(piecePos, player.color);
          const trackPos = POSITIONS[absPos];
          pieceX = trackPos?.x;
          pieceY = trackPos?.y;
        }

        if (pieceX === x && pieceY === y) {
          const isValidMove = playerIdx === currentPlayerIndex && validMoves.includes(pieceIdx);
          return { player, playerIdx, pieceIdx, isValidMove };
        }
      }
    }
    return null;
  };

  // Render piece
  const renderPiece = (pieceInfo: { player: Player; playerIdx: number; pieceIdx: number; isValidMove: boolean }) => {
    const { player, playerIdx, pieceIdx, isValidMove } = pieceInfo;
    const pieceColors: Record<string, string> = {
      red: 'bg-red-600',
      blue: 'bg-blue-600',
      green: 'bg-green-600',
      yellow: 'bg-yellow-500',
    };
    
    return (
      <button
        className={`
          w-5 h-5 rounded-full ${pieceColors[player.color]} border-2 border-white
          flex items-center justify-center shadow-lg transform transition-all duration-200 z-10
          ${isValidMove ? 'animate-bounce ring-2 ring-yellow-300 cursor-pointer hover:scale-125' : ''}
        `}
        onClick={() => isValidMove && onPieceClick(playerIdx, pieceIdx)}
        disabled={!isValidMove}
      >
      </button>
    );
  };

  // Check if a position is part of the home base boundary
  const isHomeBoundary = (x: number, y: number, color: string): boolean => {
    if (color === 'red') {
      if (y === 0 && x >= 0 && x <= 5) return true;
      if (y === 5 && x >= 0 && x <= 5) return true;
      if (x === 0 && y >= 0 && y <= 5) return true;
      if (x === 5 && y >= 0 && y <= 5) return true;
    } else if (color === 'blue') {
      if (y === 0 && x >= 9 && x <= 14) return true;
      if (y === 5 && x >= 9 && x <= 14) return true;
      if (x === 9 && y >= 0 && y <= 5) return true;
      if (x === 14 && y >= 0 && y <= 5) return true;
    } else if (color === 'green') {
      if (y === 9 && x >= 9 && x <= 14) return true;
      if (y === 14 && x >= 9 && x <= 14) return true;
      if (x === 9 && y >= 9 && y <= 14) return true;
      if (x === 14 && y >= 9 && y <= 14) return true;
    } else if (color === 'yellow') {
      if (y === 9 && x >= 0 && x <= 5) return true;
      if (y === 14 && x >= 0 && x <= 5) return true;
      if (x === 0 && y >= 9 && y <= 14) return true;
      if (x === 5 && y >= 9 && y <= 14) return true;
    }
    return false;
  };

  return (
    <div className="bg-amber-500 p-2 rounded-lg shadow-2xl border-4 border-gray-900">
      <div className="grid grid-cols-[repeat(15,28px)] grid-rows-[repeat(15,28px)] gap-0">
        {Array.from({ length: 15 }).map((_, y) =>
          Array.from({ length: 15 }).map((_, x) => {
            const cellKey = `${x}-${y}`;
            const pieceInfo = getPieceAt(x, y);
            
            // Determine cell type and color
            const isRedHome = x >= 0 && x <= 5 && y >= 0 && y <= 5;
            const isBlueHome = x >= 9 && x <= 14 && y >= 0 && y <= 5;
            const isGreenHome = x >= 9 && x <= 14 && y >= 9 && y <= 14;
            const isYellowHome = x >= 0 && x <= 5 && y >= 9 && y <= 14;
            
            const isHorizontalTrack = (y === 6 || y === 7 || y === 8);
            const isVerticalTrack = (x === 6 || x === 7 || x === 8);
            const isTrack = (isHorizontalTrack || isVerticalTrack) && !((isRedHome || isBlueHome || isGreenHome || isYellowHome) && !(isHorizontalTrack && isVerticalTrack));
            
            const isCenter = x === 7 && y === 7;
            
            // Check if it's a home circle position
            const isRedHomeCircle = HOME_POSITIONS.red.some(p => p.x === x && p.y === y);
            const isBlueHomeCircle = HOME_POSITIONS.blue.some(p => p.x === x && p.y === y);
            const isGreenHomeCircle = HOME_POSITIONS.green.some(p => p.x === x && p.y === y);
            const isYellowHomeCircle = HOME_POSITIONS.yellow.some(p => p.x === x && p.y === y);
            
            // Check if it's a finish path
            const isRedFinish = FINISH_POSITIONS.red.some(p => p.x === x && p.y === y);
            const isBlueFinish = FINISH_POSITIONS.blue.some(p => p.x === x && p.y === y);
            const isGreenFinish = FINISH_POSITIONS.green.some(p => p.x === x && p.y === y);
            const isYellowFinish = FINISH_POSITIONS.yellow.some(p => p.x === x && p.y === y);
            
            // Starting cells (safe spots)
            const isRedStart = x === 6 && y === 1;
            const isBlueStart = x === 13 && y === 8;
            const isGreenStart = x === 8 && y === 13;
            const isYellowStart = x === 1 && y === 6;

            let cellContent = null;
            let cellClass = 'w-7 h-7 flex items-center justify-center';

            // Center triangular home - with colored triangles
            if (isCenter) {
              return (
                <div key={cellKey} className="w-7 h-7 flex items-center justify-center bg-white relative overflow-hidden">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <polygon points="50,0 100,50 50,50" fill="#ef4444" />
                    <polygon points="100,50 50,100 50,50" fill="#22c55e" />
                    <polygon points="50,100 0,50 50,50" fill="#3b82f6" />
                    <polygon points="0,50 50,0 50,50" fill="#eab308" />
                  </svg>
                </div>
              );
            }
            
            // Home areas (colored backgrounds with star-burst shape)
            if (isRedHome && !isTrack) {
              const isBoundary = isHomeBoundary(x, y, 'red');
              if (isRedHomeCircle) {
                cellClass = 'w-7 h-7 flex items-center justify-center bg-red-600';
                cellContent = pieceInfo ? renderPiece(pieceInfo) : <div className="w-5 h-5 rounded-full bg-white border border-gray-800 shadow-inner"></div>;
              } else {
                cellClass = `w-7 h-7 flex items-center justify-center bg-red-600 ${isBoundary ? 'border border-gray-900' : ''}`;
              }
            }
            else if (isBlueHome && !isTrack) {
              const isBoundary = isHomeBoundary(x, y, 'blue');
              if (isBlueHomeCircle) {
                cellClass = 'w-7 h-7 flex items-center justify-center bg-blue-600';
                cellContent = pieceInfo ? renderPiece(pieceInfo) : <div className="w-5 h-5 rounded-full bg-white border border-gray-800 shadow-inner"></div>;
              } else {
                cellClass = `w-7 h-7 flex items-center justify-center bg-blue-600 ${isBoundary ? 'border border-gray-900' : ''}`;
              }
            }
            else if (isGreenHome && !isTrack) {
              const isBoundary = isHomeBoundary(x, y, 'green');
              if (isGreenHomeCircle) {
                cellClass = 'w-7 h-7 flex items-center justify-center bg-green-600';
                cellContent = pieceInfo ? renderPiece(pieceInfo) : <div className="w-5 h-5 rounded-full bg-white border border-gray-800 shadow-inner"></div>;
              } else {
                cellClass = `w-7 h-7 flex items-center justify-center bg-green-600 ${isBoundary ? 'border border-gray-900' : ''}`;
              }
            }
            else if (isYellowHome && !isTrack) {
              const isBoundary = isHomeBoundary(x, y, 'yellow');
              if (isYellowHomeCircle) {
                cellClass = 'w-7 h-7 flex items-center justify-center bg-yellow-400';
                cellContent = pieceInfo ? renderPiece(pieceInfo) : <div className="w-5 h-5 rounded-full bg-white border border-gray-800 shadow-inner"></div>;
              } else {
                cellClass = `w-7 h-7 flex items-center justify-center bg-yellow-400 ${isBoundary ? 'border border-gray-900' : ''}`;
              }
            }
            // Track cells
            else if (isTrack) {
              // Finish paths
              if (isRedFinish) {
                cellClass = 'w-7 h-7 flex items-center justify-center bg-red-400 border border-gray-400';
              } else if (isBlueFinish) {
                cellClass = 'w-7 h-7 flex items-center justify-center bg-blue-400 border border-gray-400';
              } else if (isGreenFinish) {
                cellClass = 'w-7 h-7 flex items-center justify-center bg-green-400 border border-gray-400';
              } else if (isYellowFinish) {
                cellClass = 'w-7 h-7 flex items-center justify-center bg-yellow-300 border border-gray-400';
              }
              // Starting cells (colored safe spots)
              else if (isRedStart) {
                cellClass = 'w-7 h-7 flex items-center justify-center bg-red-300 border border-gray-400';
              } else if (isBlueStart) {
                cellClass = 'w-7 h-7 flex items-center justify-center bg-blue-300 border border-gray-400';
              } else if (isGreenStart) {
                cellClass = 'w-7 h-7 flex items-center justify-center bg-green-300 border border-gray-400';
              } else if (isYellowStart) {
                cellClass = 'w-7 h-7 flex items-center justify-center bg-yellow-200 border border-gray-400';
              }
              // Regular track
              else {
                cellClass = 'w-7 h-7 flex items-center justify-center bg-white border border-gray-400';
              }
              
              // Render piece on track
              if (pieceInfo) {
                cellContent = renderPiece(pieceInfo);
              }
            }
            // Yellow background for empty areas
            else {
              cellClass = 'w-7 h-7 flex items-center justify-center bg-amber-500';
            }

            return (
              <div key={cellKey} className={cellClass}>
                {cellContent}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GameBoard;

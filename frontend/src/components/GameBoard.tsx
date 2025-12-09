import React from 'react';
import type { Player } from '../types';

interface GameBoardProps {
  players: Player[];
  currentPlayerIndex: number;
  validMoves: number[];
  onPieceClick: (playerIndex: number, pieceIndex: number) => void;
}

const BOARD_SIZE = 40;
const CELL_SIZE = 28;

// Starting positions for each color (where pieces enter the track)
const START_POSITIONS: Record<string, number> = {
  red: 0,
  blue: 10,
  green: 20,
  yellow: 30,
};

// Color definitions
const COLORS = {
  red: { fill: '#dc2626', light: '#dc2626' },
  blue: { fill: '#2563eb', light: '#2563eb' },
  green: { fill: '#16a34a', light: '#16a34a' },
  yellow: { fill: '#eab308', light: '#eab308' },
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

// Finish track positions (colored paths leading to center - 5 cells before center triangle)
const FINISH_POSITIONS: Record<string, { x: number; y: number }[]> = {
  red: [{ x: 7, y: 1 }, { x: 7, y: 2 }, { x: 7, y: 3 }, { x: 7, y: 4 }, { x: 7, y: 5 }],
  yellow: [{ x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }],
  green: [{ x: 7, y: 13 }, { x: 7, y: 12 }, { x: 7, y: 11 }, { x: 7, y: 10 }, { x: 7, y: 9 }],
  blue: [{ x: 13, y: 7 }, { x: 12, y: 7 }, { x: 11, y: 7 }, { x: 10, y: 7 }, { x: 9, y: 7 }],
};

// Center position for finished pieces (position 45)
const CENTER_POSITION = { x: 7, y: 7 };

// Home base piece positions (centered 2x2 grid in each corner's white circle)
const HOME_POSITIONS: Record<string, { x: number; y: number }[]> = {
  red: [{ x: 1.5, y: 1.5 }, { x: 3.5, y: 1.5 }, { x: 1.5, y: 3.5 }, { x: 3.5, y: 3.5 }],
  blue: [{ x: 10.5, y: 1.5 }, { x: 12.5, y: 1.5 }, { x: 10.5, y: 3.5 }, { x: 12.5, y: 3.5 }],
  green: [{ x: 10.5, y: 10.5 }, { x: 12.5, y: 10.5 }, { x: 10.5, y: 12.5 }, { x: 12.5, y: 12.5 }],
  yellow: [{ x: 1.5, y: 10.5 }, { x: 3.5, y: 10.5 }, { x: 1.5, y: 12.5 }, { x: 3.5, y: 12.5 }],
};

// SVG path for wavy scalloped home base shape
const createScallopedPath = (): string => {
  // 8-point star-burst with smooth scalloped edges
  // Size is 168x168 (6 cells * 28px)
  const size = 168;
  const center = size / 2;
  const outerRadius = size / 2 - 4;
  const innerRadius = size / 2 - 24;
  const points = 8;

  let path = '';

  for (let i = 0; i < points; i++) {
    const angle1 = (i * 2 * Math.PI) / points - Math.PI / 2;
    const angle2 = ((i + 0.5) * 2 * Math.PI) / points - Math.PI / 2;
    const angle3 = ((i + 1) * 2 * Math.PI) / points - Math.PI / 2;

    const x1 = center + outerRadius * Math.cos(angle1);
    const y1 = center + outerRadius * Math.sin(angle1);
    const xMid = center + innerRadius * Math.cos(angle2);
    const yMid = center + innerRadius * Math.sin(angle2);
    const x2 = center + outerRadius * Math.cos(angle3);
    const y2 = center + outerRadius * Math.sin(angle3);

    if (i === 0) {
      path += `M ${x1} ${y1} `;
    }

    // Quadratic bezier curve for scalloped edge
    path += `Q ${xMid} ${yMid} ${x2} ${y2} `;
  }

  path += 'Z';
  return path;
};

const SCALLOPED_PATH = createScallopedPath();

// Home base SVG component
const HomeBase: React.FC<{ color: 'red' | 'blue' | 'green' | 'yellow'; style: React.CSSProperties }> = ({ color, style }) => {
  const colorFill = COLORS[color].fill;
  const size = 168;
  const center = size / 2;
  const innerCircleRadius = 52;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ position: 'absolute', ...style, pointerEvents: 'none' }}
    >
      {/* Scalloped outer shape */}
      <path
        d={SCALLOPED_PATH}
        fill={colorFill}
        stroke="#1a1a1a"
        strokeWidth="3"
      />
      {/* White inner circle */}
      <circle
        cx={center}
        cy={center}
        r={innerCircleRadius}
        fill={colorFill}
        stroke="#1a1a1a"
        strokeWidth="2"
      />
      {/* Inner white area for pieces */}
      <circle
        cx={center}
        cy={center}
        r={innerCircleRadius - 8}
        fill="white"
      />
      {/* 4 piece spots */}
      {[
        { cx: center - 22, cy: center - 22 },
        { cx: center + 22, cy: center - 22 },
        { cx: center - 22, cy: center + 22 },
        { cx: center + 22, cy: center + 22 },
      ].map((pos, idx) => (
        <circle
          key={idx}
          cx={pos.cx}
          cy={pos.cy}
          r={14}
          fill={colorFill}
        />
      ))}
    </svg>
  );
};

// Center triangle component
const CenterTriangles: React.FC = () => {
  const size = CELL_SIZE * 3;
  const center = size / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ position: 'absolute', left: 6 * CELL_SIZE, top: 6 * CELL_SIZE, pointerEvents: 'none' }}
    >
      {/* Red triangle (top) */}
      <polygon points={`${center},0 ${size},${center} ${center},${center}`} fill="#dc2626" stroke="#1a1a1a" strokeWidth="1" />
      {/* Blue triangle (right) */}
      <polygon points={`${size},${center} ${center},${size} ${center},${center}`} fill="#2563eb" stroke="#1a1a1a" strokeWidth="1" />
      {/* Green triangle (bottom) */}
      <polygon points={`${center},${size} 0,${center} ${center},${center}`} fill="#16a34a" stroke="#1a1a1a" strokeWidth="1" />
      {/* Yellow triangle (left) */}
      <polygon points={`0,${center} ${center},0 ${center},${center}`} fill="#eab308" stroke="#1a1a1a" strokeWidth="1" />
    </svg>
  );
};

const GameBoard: React.FC<GameBoardProps> = ({
  players,
  currentPlayerIndex,
  validMoves,
  onPieceClick,
}) => {
  // Find piece at position (for home positions, use approximate matching)
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
        } else if (piecePos === 45) {
          // Piece is in center (finished)
          pieceX = CENTER_POSITION.x;
          pieceY = CENTER_POSITION.y;
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

        if (pieceX !== undefined && pieceY !== undefined && Math.abs(pieceX - x) < 0.1 && Math.abs(pieceY - y) < 0.1) {
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
          flex items-center justify-center shadow-lg transform transition-all duration-200 z-20
          ${isValidMove ? 'animate-bounce ring-2 ring-yellow-300 cursor-pointer hover:scale-125' : ''}
        `}
        onClick={() => isValidMove && onPieceClick(playerIdx, pieceIdx)}
        disabled={!isValidMove}
      />
    );
  };

  // Render home piece overlay
  const renderHomePieces = () => {
    const homePieces: React.ReactNode[] = [];

    for (let playerIdx = 0; playerIdx < players.length; playerIdx++) {
      const player = players[playerIdx];
      for (let pieceIdx = 0; pieceIdx < player.pieces.length; pieceIdx++) {
        if (player.pieces[pieceIdx] === -1) {
          const homePos = HOME_POSITIONS[player.color]?.[pieceIdx];
          if (homePos) {
            const isValidMove = playerIdx === currentPlayerIndex && validMoves.includes(pieceIdx);
            homePieces.push(
              <button
                key={`home-${player.id}-${pieceIdx}`}
                className={`
                  absolute w-6 h-6 rounded-full border-2 border-white
                  flex items-center justify-center shadow-lg transform transition-all duration-200 z-20
                  ${isValidMove ? 'animate-bounce ring-2 ring-yellow-300 cursor-pointer hover:scale-125' : ''}
                `}
                style={{
                  left: homePos.x * CELL_SIZE + CELL_SIZE / 2 - 12,
                  top: homePos.y * CELL_SIZE + CELL_SIZE / 2 - 12,
                  backgroundColor: COLORS[player.color].fill,
                }}
                onClick={() => isValidMove && onPieceClick(playerIdx, pieceIdx)}
                disabled={!isValidMove}
              />
            );
          }
        }
      }
    }

    return homePieces;
  };

  // Check if cell is in home area (to hide from grid)
  const isInHomeArea = (x: number, y: number): boolean => {
    const isRedHome = x >= 0 && x <= 5 && y >= 0 && y <= 5;
    const isBlueHome = x >= 9 && x <= 14 && y >= 0 && y <= 5;
    const isGreenHome = x >= 9 && x <= 14 && y >= 9 && y <= 14;
    const isYellowHome = x >= 0 && x <= 5 && y >= 9 && y <= 14;
    return isRedHome || isBlueHome || isGreenHome || isYellowHome;
  };

  // Check if cell is center area
  const isInCenterArea = (x: number, y: number): boolean => {
    return x >= 6 && x <= 8 && y >= 6 && y <= 8;
  };

  return (
    <div className="bg-white p-3 rounded-lg shadow-2xl border-4 border-gray-900">
      <div
        className="relative"
        style={{
          width: 15 * CELL_SIZE,
          height: 15 * CELL_SIZE,
          backgroundColor: '#eab308' // Golden yellow background
        }}
      >
        {/* Home base SVG overlays */}
        <HomeBase color="red" style={{ left: 0, top: 0 }} />
        <HomeBase color="blue" style={{ right: 0, top: 0 }} />
        <HomeBase color="yellow" style={{ left: 0, bottom: 0 }} />
        <HomeBase color="green" style={{ right: 0, bottom: 0 }} />

        {/* Center triangles */}
        <CenterTriangles />

        {/* Grid cells for track */}
        <div className="absolute inset-0 grid grid-cols-[repeat(15,28px)] grid-rows-[repeat(15,28px)]">
          {Array.from({ length: 15 }).map((_, y) =>
            Array.from({ length: 15 }).map((_, x) => {
              const cellKey = `${x}-${y}`;

              // Skip home areas and center - they're rendered as overlays
              if (isInHomeArea(x, y)) {
                return <div key={cellKey} className="w-7 h-7" />;
              }

              if (isInCenterArea(x, y)) {
                return <div key={cellKey} className="w-7 h-7" />;
              }

              const isHorizontalTrack = (y === 6 || y === 7 || y === 8);
              const isVerticalTrack = (x === 6 || x === 7 || x === 8);
              const isTrack = isHorizontalTrack || isVerticalTrack;

              // Check if it's a finish path
              const isRedFinish = FINISH_POSITIONS.red.some(p => p.x === x && p.y === y);
              const isBlueFinish = FINISH_POSITIONS.blue.some(p => p.x === x && p.y === y);
              const isGreenFinish = FINISH_POSITIONS.green.some(p => p.x === x && p.y === y);
              const isYellowFinish = FINISH_POSITIONS.yellow.some(p => p.x === x && p.y === y);

              const pieceInfo = getPieceAt(x, y);

              if (!isTrack) {
                // Yellow background for non-track areas
                return <div key={cellKey} className="w-7 h-7 bg-yellow-500" />;
              }

              // Finish paths with colored circles
              if (isRedFinish) {
                return (
                  <div key={cellKey} className="w-7 h-7 flex items-center justify-center bg-white border border-gray-400">
                    {pieceInfo ? renderPiece(pieceInfo) : (
                      <div className="w-5 h-5 rounded-full bg-red-600 border border-gray-800" />
                    )}
                  </div>
                );
              }
              if (isBlueFinish) {
                return (
                  <div key={cellKey} className="w-7 h-7 flex items-center justify-center bg-white border border-gray-400">
                    {pieceInfo ? renderPiece(pieceInfo) : (
                      <div className="w-5 h-5 rounded-full bg-blue-600 border border-gray-800" />
                    )}
                  </div>
                );
              }
              if (isGreenFinish) {
                return (
                  <div key={cellKey} className="w-7 h-7 flex items-center justify-center bg-white border border-gray-400">
                    {pieceInfo ? renderPiece(pieceInfo) : (
                      <div className="w-5 h-5 rounded-full bg-green-600 border border-gray-800" />
                    )}
                  </div>
                );
              }
              if (isYellowFinish) {
                return (
                  <div key={cellKey} className="w-7 h-7 flex items-center justify-center bg-white border border-gray-400">
                    {pieceInfo ? renderPiece(pieceInfo) : (
                      <div className="w-5 h-5 rounded-full bg-yellow-500 border border-gray-800" />
                    )}
                  </div>
                );
              }
              
              // Regular track cell
              return (
                <div key={cellKey} className="w-7 h-7 flex items-center justify-center bg-white border border-gray-400">
                  {pieceInfo && renderPiece(pieceInfo)}
                </div>
              );
            })
          )}
        </div>

        {/* Home pieces overlay */}
        {renderHomePieces()}
      </div>
    </div>
  );
};

export default GameBoard;

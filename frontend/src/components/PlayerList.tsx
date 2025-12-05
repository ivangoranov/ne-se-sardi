import React from 'react';
import type { Player } from '../types';

interface PlayerListProps {
  players: Player[];
  currentPlayerIndex: number;
  currentPlayerId: string | null;
}

const COLORS = {
  red: { bg: 'bg-red-500', text: 'text-red-800', light: 'bg-red-100', border: 'border-red-400' },
  blue: { bg: 'bg-blue-500', text: 'text-blue-800', light: 'bg-blue-100', border: 'border-blue-400' },
  green: { bg: 'bg-green-500', text: 'text-green-800', light: 'bg-green-100', border: 'border-green-400' },
  yellow: { bg: 'bg-yellow-400', text: 'text-yellow-800', light: 'bg-yellow-100', border: 'border-yellow-400' },
};

const PlayerList: React.FC<PlayerListProps> = ({ players, currentPlayerIndex, currentPlayerId }) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 w-64">
      <h3 className="text-xl font-bold text-purple-800 mb-4 text-center">👥 Играчи</h3>
      <div className="space-y-3">
        {players.map((player, index) => {
          const colorConfig = COLORS[player.color];
          const isCurrentTurn = index === currentPlayerIndex;
          const isYou = player.id === currentPlayerId;
          const piecesHome = player.pieces.filter(p => p === -1).length;
          const piecesFinished = player.pieces.filter(p => p >= 40).length;

          return (
            <div
              key={player.id}
              className={`
                p-3 rounded-xl border-2 transition-all duration-300
                ${colorConfig.light} ${colorConfig.border}
                ${isCurrentTurn ? 'ring-4 ring-purple-400 scale-105 shadow-lg' : ''}
              `}
            >
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full ${colorConfig.bg} shadow-md flex items-center justify-center`}>
                  <span className="text-white text-sm">🎮</span>
                </div>
                <div className="flex-1">
                  <div className={`font-bold ${colorConfig.text} flex items-center gap-1`}>
                    {player.name}
                    {isYou && <span className="text-xs">(Ти)</span>}
                  </div>
                  <div className="text-xs text-gray-600">
                    🏠 {piecesHome} | ✅ {piecesFinished}
                  </div>
                </div>
                {isCurrentTurn && (
                  <div className="animate-bounce text-2xl">👉</div>
                )}
              </div>
              {!player.is_connected && (
                <div className="text-xs text-red-500 mt-1">⚠️ Изключен</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlayerList;

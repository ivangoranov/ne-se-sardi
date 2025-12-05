import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import type { Player } from '../types';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  const handleCreateGame = async () => {
    if (!playerName.trim()) {
      setError('Моля, въведи името си!');
      return;
    }
    setIsCreating(true);
    setError('');
    try {
      const game = await api.createGame(playerName.trim());
      localStorage.setItem('playerId', game.players[0].id);
      localStorage.setItem('playerName', playerName.trim());
      navigate(`/lobby/${game.code}`);
    } catch {
      setError('Грешка при създаване на играта. Опитай пак!');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGame = async () => {
    if (!playerName.trim()) {
      setError('Моля, въведи името си!');
      return;
    }
    if (!gameCode.trim()) {
      setError('Моля, въведи код на играта!');
      return;
    }
    setIsJoining(true);
    setError('');
    try {
      const game = await api.joinGame(gameCode.trim().toUpperCase(), playerName.trim());
      const player = game.players.find((p: Player) => p.name === playerName.trim());
      if (player) {
        localStorage.setItem('playerId', player.id);
        localStorage.setItem('playerName', playerName.trim());
      }
      navigate(`/lobby/${game.code}`);
    } catch (e: unknown) {
      const errorMessage = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(errorMessage || 'Грешка при присъединяване. Провери кода!');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
            🎲 Не се сърди! 🎲
          </h1>
          <p className="text-lg text-gray-600">Човече, играй с приятели!</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4 text-center animate-shake">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              👤 Твоето име
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Въведи име..."
              className="w-full px-4 py-3 text-lg border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
              maxLength={20}
            />
          </div>

          <div className="space-y-4">
            <button
              onClick={handleCreateGame}
              disabled={isCreating}
              className="w-full py-4 text-xl font-bold text-white bg-gradient-to-r from-green-400 to-green-600 rounded-xl shadow-lg hover:scale-105 transform transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? '⏳ Създавам...' : '🎮 Създай нова игра'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">или</span>
              </div>
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                🔑 Код на играта
              </label>
              <input
                type="text"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                placeholder="ABCD12"
                className="w-full px-4 py-3 text-lg text-center font-mono tracking-widest border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors uppercase"
                maxLength={6}
              />
            </div>

            <button
              onClick={handleJoinGame}
              disabled={isJoining}
              className="w-full py-4 text-xl font-bold text-white bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl shadow-lg hover:scale-105 transform transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isJoining ? '⏳ Присъединявам...' : '🚀 Присъедини се'}
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>🎯 До 4 играча | 🎲 Хвърли 6 за да тръгнеш | ⚔️ Бий противниците!</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

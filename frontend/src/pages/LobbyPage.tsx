import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import type { Game } from '../types';

const COLORS = {
  red: { bg: 'bg-red-500', text: 'text-red-800', light: 'bg-red-100' },
  blue: { bg: 'bg-blue-500', text: 'text-blue-800', light: 'bg-blue-100' },
  green: { bg: 'bg-green-500', text: 'text-green-800', light: 'bg-green-100' },
  yellow: { bg: 'bg-yellow-400', text: 'text-yellow-800', light: 'bg-yellow-100' },
};

const LobbyPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [error, setError] = useState('');
  const [isStarting, setIsStarting] = useState(false);

  const playerId = localStorage.getItem('playerId');
  const isHost = game?.players[0]?.id === playerId;

  useEffect(() => {
    if (!code) return;

    const fetchGame = async () => {
      try {
        const gameData = await api.getGameByCode(code);
        setGame(gameData);

        if (gameData.status === 'in_progress') {
          navigate(`/game/${code}`);
        }
      } catch {
        setError('Играта не е намерена');
      }
    };

    fetchGame();
    const interval = setInterval(fetchGame, 2000);
    return () => clearInterval(interval);
  }, [code, navigate]);

  const handleStartGame = async () => {
    if (!game) return;
    setIsStarting(true);
    try {
      await api.startGame(game.id);
      navigate(`/game/${code}`);
    } catch (e: unknown) {
      const errorMessage = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(errorMessage || 'Грешка при стартиране');
    } finally {
      setIsStarting(false);
    }
  };

  const copyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/95 rounded-3xl shadow-2xl p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">❌ {error}</h1>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-purple-500 text-white rounded-xl font-bold"
          >
            🏠 Обратно в началото
          </button>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl animate-pulse">⏳ Зареждане...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-lg">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-purple-800 mb-2">🎮 Чакалня</h1>
          <p className="text-gray-600">Изчакай другите играчи да се присъединят</p>
        </div>

        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-4 mb-6">
          <p className="text-sm text-gray-600 text-center mb-2">Код на играта:</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl font-mono font-bold tracking-widest text-purple-800">
              {code}
            </span>
            <button
              onClick={copyCode}
              className="p-2 bg-white rounded-lg shadow hover:scale-110 transition-transform"
              title="Копирай кода"
            >
              📋
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            Сподели този код с приятелите си!
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3 text-center">
            👥 Играчи ({game.players.length}/4)
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {game.players.map((player, index) => {
              const colorConfig = COLORS[player.color];
              const isYou = player.id === playerId;

              return (
                <div
                  key={player.id}
                  className={`p-4 rounded-xl ${colorConfig.light} border-2 border-${player.color}-300 transform hover:scale-105 transition-transform`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-full ${colorConfig.bg} shadow-md flex items-center justify-center`}>
                      <span className="text-white text-lg">
                        {index === 0 ? '👑' : '🎮'}
                      </span>
                    </div>
                    <div>
                      <div className={`font-bold ${colorConfig.text}`}>
                        {player.name}
                        {isYou && <span className="text-xs ml-1">(Ти)</span>}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {player.color === 'red' ? 'Червен' :
                         player.color === 'blue' ? 'Син' :
                         player.color === 'green' ? 'Зелен' : 'Жълт'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {Array.from({ length: 4 - game.players.length }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="p-4 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center"
              >
                <span className="text-gray-400 text-lg">👤 Чакаме...</span>
              </div>
            ))}
          </div>
        </div>

        {isHost ? (
          <button
            onClick={handleStartGame}
            disabled={game.players.length < 2 || isStarting}
            className={`w-full py-4 text-xl font-bold rounded-xl shadow-lg transform transition-all duration-200 ${
              game.players.length >= 2 && !isStarting
                ? 'bg-gradient-to-r from-green-400 to-green-600 text-white hover:scale-105 cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isStarting ? '⏳ Стартирам...' : 
             game.players.length < 2 ? '⏳ Чакаме още играчи...' : 
             '🚀 Започни играта!'}
          </button>
        ) : (
          <div className="text-center p-4 bg-purple-50 rounded-xl">
            <span className="text-purple-800 font-medium">
              ⏳ Изчакай домакина да започне играта...
            </span>
          </div>
        )}

        <button
          onClick={() => navigate('/')}
          className="w-full mt-4 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
        >
          ← Обратно в началото
        </button>
      </div>
    </div>
  );
};

export default LobbyPage;

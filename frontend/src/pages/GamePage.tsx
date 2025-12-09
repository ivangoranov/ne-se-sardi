import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import type { Game, DiceRollResponse, ValidMove } from '../types';
import GameBoard from '../components/GameBoard';
import Dice from '../components/Dice';
import PlayerList from '../components/PlayerList';

const GamePage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [validMoves, setValidMoves] = useState<ValidMove[]>([]);
  const [hasRolled, setHasRolled] = useState(false);
  const [message, setMessage] = useState('');
  const [showWinner, setShowWinner] = useState(false);

  const playerId = localStorage.getItem('playerId');

  const fetchGame = useCallback(async () => {
    if (!code) return;
    try {
      const gameData = await api.getGameByCode(code);
      setGame(gameData);

      if (gameData.status === 'finished' && gameData.winner_id) {
        setShowWinner(true);
      }
    } catch {
      navigate('/');
    }
  }, [code, navigate]);

  useEffect(() => {
    void (async () => {
      await fetchGame();
    })();
    const interval = setInterval(fetchGame, 2000);
    return () => clearInterval(interval);
  }, [fetchGame]);

  const currentPlayer = game?.players[game.current_player_index];
  const isMyTurn = currentPlayer?.id === playerId;

  const handleRollDice = async () => {
    if (!game || !playerId || !isMyTurn || hasRolled) return;

    setIsRolling(true);
    setMessage('');

    try {
      const result: DiceRollResponse = await api.rollDice(game.id, playerId);
      
      setTimeout(() => {
        setDiceValue(result.value);
        setIsRolling(false);
        setHasRolled(true);
        setValidMoves(result.valid_moves);

        if (!result.can_move) {
          setMessage('Няма възможен ход! 😢');
          setTimeout(async () => {
            await api.skipTurn(game.id, playerId);
            setHasRolled(false);
            setDiceValue(null);
            setValidMoves([]);
            fetchGame();
          }, 1500);
        } else {
          setMessage(`Избери пионка за местене! (${result.valid_moves.length} възможни хода)`);
        }
      }, 1000);
    } catch {
      setIsRolling(false);
      setMessage('Грешка при хвърляне на зара');
    }
  };

  const handlePieceClick = async (_: number, pieceIndex: number) => {
    if (!game || !playerId || !diceValue || !isMyTurn || !hasRolled) return;

    const move = validMoves.find(m => m.piece_index === pieceIndex);
    if (!move) return;

    try {
      const result = await api.makeMove(game.id, playerId, pieceIndex, diceValue);

      if (result.success) {
        if (result.captured) {
          setMessage('⚔️ Уби противникова пионка!');
        } else {
          setMessage('✅ Ход успешен!');
        }

        if (result.winner_id) {
          setShowWinner(true);
        } else if (diceValue === 6) {
          // Информативно съобщение за шестица; реалният ред идва от бекенда
          setMessage('🎉 Хвърли 6! Играй пак, ако още е твой ред.');
        }

        // Винаги чистим локалното състояние за хода и дърпаме ново game състояние
        setHasRolled(false);
        setDiceValue(null);
        setValidMoves([]);
        fetchGame();
      }
    } catch {
      setMessage('Грешка при местене');
    }
  };

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl animate-pulse">⏳ Зареждане на играта...</div>
      </div>
    );
  }

  const winner = game.players.find(p => p.id === game.winner_id);

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center gap-4">
      {/* Winner Modal */}
      {showWinner && winner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 text-center shadow-2xl animate-bounce-in max-w-md mx-4">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold text-purple-800 mb-2">Победител!</h2>
            <p className="text-2xl text-gray-700 mb-6">
              <span className="font-bold" style={{ color: winner.color }}>
                {winner.name}
              </span>
              {' '}спечели играта!
            </p>
            <div className="text-5xl mb-6">🎉🥳🎊</div>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl font-bold rounded-xl shadow-lg hover:scale-105 transition-transform"
            >
              🏠 Нова игра
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl px-6 py-3 mb-2">
        <h1 className="text-2xl font-bold text-purple-800">🎲 Не се сърди човече!</h1>
        <p className="text-center text-gray-600 text-sm">Код: {code}</p>
      </div>

      {/* Main game area */}
      <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start">
        {/* Player list */}
        <PlayerList
          players={game.players}
          currentPlayerIndex={game.current_player_index}
          currentPlayerId={playerId}
        />

        {/* Game board */}
        <GameBoard
          players={game.players}
          currentPlayerIndex={game.current_player_index}
          validMoves={validMoves.map(m => m.piece_index)}
          onPieceClick={handlePieceClick}
        />

        {/* Dice and controls */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 flex flex-col items-center gap-4">
          <div className="text-center mb-2">
            <h3 className="text-lg font-bold text-purple-800">
              {isMyTurn ? '🎯 Твой ред!' : `⏳ Ред на ${currentPlayer?.name || '...'}`}
            </h3>
          </div>

          <Dice
            value={diceValue}
            isRolling={isRolling}
            canRoll={isMyTurn && !hasRolled && !isRolling}
            onRoll={handleRollDice}
          />

          {message && (
            <div className="mt-4 p-3 bg-purple-100 rounded-xl text-purple-800 text-center font-medium animate-pulse">
              {message}
            </div>
          )}

          <div className="mt-4 text-center text-sm text-gray-500">
            <p>🎲 Хвърли 6 за да извадиш пионка</p>
            <p>⚔️ Стъпи на противник за да го върнеш</p>
            <p>🏁 Вкарай всички пионки в целта!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;

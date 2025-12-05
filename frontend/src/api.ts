import axios from 'axios';
import type { Game, DiceRollResponse, MoveResponse } from './types';

const API_BASE = '/api';

export const api = {
  // Create a new game
  createGame: async (playerName: string): Promise<Game> => {
    const response = await axios.post(`${API_BASE}/games`, { player_name: playerName });
    return response.data;
  },

  // Join an existing game
  joinGame: async (code: string, playerName: string): Promise<Game> => {
    const response = await axios.post(`${API_BASE}/games/join`, { code, player_name: playerName });
    return response.data;
  },

  // Get game by ID
  getGame: async (gameId: string): Promise<Game> => {
    const response = await axios.get(`${API_BASE}/games/${gameId}`);
    return response.data;
  },

  // Get game by code
  getGameByCode: async (code: string): Promise<Game> => {
    const response = await axios.get(`${API_BASE}/games/code/${code}`);
    return response.data;
  },

  // Start the game
  startGame: async (gameId: string): Promise<Game> => {
    const response = await axios.post(`${API_BASE}/games/${gameId}/start`);
    return response.data;
  },

  // Roll the dice
  rollDice: async (gameId: string, playerId: string): Promise<DiceRollResponse> => {
    const response = await axios.post(`${API_BASE}/games/roll-dice`, {
      game_id: gameId,
      player_id: playerId,
    });
    return response.data;
  },

  // Make a move
  makeMove: async (
    gameId: string,
    playerId: string,
    pieceIndex: number,
    diceValue: number
  ): Promise<MoveResponse> => {
    const response = await axios.post(`${API_BASE}/games/move`, {
      game_id: gameId,
      player_id: playerId,
      piece_index: pieceIndex,
      dice_value: diceValue,
    });
    return response.data;
  },

  // Skip turn
  skipTurn: async (gameId: string, playerId: string): Promise<void> => {
    await axios.post(`${API_BASE}/games/${gameId}/skip-turn?player_id=${playerId}`);
  },
};

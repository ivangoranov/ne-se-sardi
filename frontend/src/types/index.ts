export interface Player {
  id: string;
  name: string;
  color: 'red' | 'blue' | 'green' | 'yellow';
  pieces: number[];
  order: number;
  is_connected: boolean;
}

export interface Game {
  id: string;
  code: string;
  status: 'waiting' | 'in_progress' | 'finished';
  current_player_index: number;
  winner_id: string | null;
  players: Player[];
  created_at: string;
}

export interface DiceRollResponse {
  value: number;
  can_move: boolean;
  valid_moves: ValidMove[];
}

export interface ValidMove {
  piece_index: number;
  from_position: number;
  to_position: number;
}

export interface MoveResponse {
  success: boolean;
  new_position: number;
  captured: boolean;
  captured_player_id: string | null;
  winner_id: string | null;
  message: string;
}

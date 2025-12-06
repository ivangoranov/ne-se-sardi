import random
from typing import List, Optional, Tuple
from .models import PlayerColor


# Board configuration
# Each player starts from their respective starting position
# The board has 40 positions (0-39) in a circular track
# Each player has 5 finish positions (40-44) plus the center (45)

BOARD_SIZE = 40
FINISH_TRACK_SIZE = 6  # 5 colored cells + center

# Starting positions for each color on the main board
START_POSITIONS = {
    PlayerColor.RED: 0,
    PlayerColor.BLUE: 10,
    PlayerColor.GREEN: 20,
    PlayerColor.YELLOW: 30,
}

# The position where each color enters their finish track
FINISH_ENTRY = {
    PlayerColor.RED: 39,
    PlayerColor.BLUE: 9,
    PlayerColor.GREEN: 19,
    PlayerColor.YELLOW: 29,
}


def roll_dice() -> int:
    """Roll a single die and return value between 1-6"""
    return random.randint(1, 6)


def get_absolute_position(piece_position: int, player_color: PlayerColor) -> int:
    """Convert player-relative position to absolute board position"""
    if piece_position < 0:  # At home
        return -1
    if piece_position >= BOARD_SIZE:  # In finish area
        return piece_position  # Finish positions are player-specific
    
    start = START_POSITIONS[player_color]
    return (piece_position + start) % BOARD_SIZE


def get_relative_position(absolute_position: int, player_color: PlayerColor) -> int:
    """Convert absolute board position to player-relative position"""
    if absolute_position < 0:
        return -1
    if absolute_position >= BOARD_SIZE:
        return absolute_position
    
    start = START_POSITIONS[player_color]
    return (absolute_position - start) % BOARD_SIZE


def can_move_piece(
    piece_position: int,
    dice_value: int,
    player_color: PlayerColor,
    all_pieces: List[int],
    opponent_pieces: Optional[dict] = None  # {color: pieces_list} for checking blocked stacks
) -> Tuple[bool, int]:
    """Check if a piece can move with given dice value. Returns (can_move, new_position)."""
    # Piece is at home
    if piece_position == -1:
        if dice_value == 6:
            # Can move to start position; allow stacking with own pieces on start
            new_pos = 0
            return True, new_pos
        return False, -1

    # Piece is on the board or in finish area
    new_position = piece_position + dice_value

    # Check if entering or in finish area
    if piece_position < BOARD_SIZE and new_position >= BOARD_SIZE:
        # Entering finish area
        finish_pos = new_position
        if finish_pos > BOARD_SIZE + FINISH_TRACK_SIZE - 1:
            # Overshooting the finish - can't move
            return False, -1
        # Still forbid stacking in finish area
        if finish_pos in all_pieces:
            return False, -1
        return True, finish_pos

    # Already in finish area
    if piece_position >= BOARD_SIZE:
        if new_position > BOARD_SIZE + FINISH_TRACK_SIZE - 1:
            return False, -1
        # Still forbid stacking in finish area
        if new_position in all_pieces:
            return False, -1
        return True, new_position

    # Normal move on the main board: allow stacking with own pieces
    new_position = new_position % BOARD_SIZE

    # Check if opponent has 2+ pieces stacked at target (blocked)
    if opponent_pieces:
        target_abs_pos = get_absolute_position(new_position, player_color)
        for opp_color, opp_pieces in opponent_pieces.items():
            if opp_color == player_color:
                continue
            # Count opponent pieces at target absolute position
            count = 0
            for opp_piece_pos in opp_pieces:
                if opp_piece_pos < 0 or opp_piece_pos >= BOARD_SIZE:
                    continue
                opp_abs_pos = get_absolute_position(opp_piece_pos, opp_color)
                if opp_abs_pos == target_abs_pos:
                    count += 1
            if count >= 2:
                # Cannot land on stack of 2+ opponent pieces
                return False, -1

    return True, new_position


def check_capture(
    new_position: int,
    moving_player_color: PlayerColor,
    all_players_pieces: dict,  # {player_id: (color, pieces)}
) -> Optional[Tuple[str, int]]:
    """
    Check if moving to new_position captures an opponent's piece.
    new_position is in player-relative coordinates (0-39 for board positions).
    Returns (captured_player_id, captured_piece_index) or None.

    RULE: If opponent has 2+ pieces stacked on same square, they cannot be captured.
    """
    # Can't capture in finish area
    if new_position >= BOARD_SIZE:
        return None
    
    # Convert moving player's new position to absolute board position
    moving_abs_pos = get_absolute_position(new_position, moving_player_color)
    
    for player_id, (color, pieces) in all_players_pieces.items():
        if color == moving_player_color:
            continue
        
        # First, count how many pieces this opponent has at each absolute position
        pieces_at_position: dict[int, List[int]] = {}
        for idx, piece_pos in enumerate(pieces):
            if piece_pos < 0 or piece_pos >= BOARD_SIZE:
                continue
            abs_pos = get_absolute_position(piece_pos, color)
            if abs_pos not in pieces_at_position:
                pieces_at_position[abs_pos] = []
            pieces_at_position[abs_pos].append(idx)

        # Check if there's a capturable piece at the target position
        if moving_abs_pos in pieces_at_position:
            piece_indices = pieces_at_position[moving_abs_pos]
            # If 2+ pieces are stacked, they CANNOT be captured
            if len(piece_indices) >= 2:
                return None
            # Single piece can be captured
            return (player_id, piece_indices[0])

    return None


def check_winner(pieces: List[int]) -> bool:
    """Check if all pieces are in the finish area"""
    return all(p >= BOARD_SIZE for p in pieces)


def get_valid_moves(
    pieces: List[int],
    dice_value: int,
    player_color: PlayerColor,
    opponent_pieces: Optional[dict] = None  # {color: pieces_list}
) -> List[dict]:
    """Get all valid moves for a player given a dice roll"""
    valid_moves = []
    
    for idx, piece_pos in enumerate(pieces):
        can_move, new_pos = can_move_piece(piece_pos, dice_value, player_color, pieces, opponent_pieces)
        if can_move:
            valid_moves.append({
                "piece_index": idx,
                "from_position": piece_pos,
                "to_position": new_pos
            })
    
    return valid_moves

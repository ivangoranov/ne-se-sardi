from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from enum import Enum


class GameStatus(str, Enum):
    WAITING = "waiting"
    IN_PROGRESS = "in_progress"
    FINISHED = "finished"


class PlayerColor(str, Enum):
    RED = "red"
    BLUE = "blue"
    GREEN = "green"
    YELLOW = "yellow"


class PlayerCreate(BaseModel):
    name: str


class PlayerResponse(BaseModel):
    id: UUID
    name: str
    color: PlayerColor
    pieces: List[int]
    order: int
    is_connected: bool

    class Config:
        from_attributes = True


class GameCreate(BaseModel):
    player_name: str


class GameJoin(BaseModel):
    code: str
    player_name: str


class GameResponse(BaseModel):
    id: UUID
    code: str
    status: GameStatus
    current_player_index: int
    winner_id: Optional[UUID] = None
    players: List[PlayerResponse]
    created_at: datetime

    class Config:
        from_attributes = True


class DiceRoll(BaseModel):
    game_id: UUID
    player_id: UUID


class DiceRollResponse(BaseModel):
    value: int
    can_move: bool
    valid_moves: List[dict]


class MoveRequest(BaseModel):
    game_id: UUID
    player_id: UUID
    piece_index: int
    dice_value: int


class MoveResponse(BaseModel):
    success: bool
    new_position: int
    captured: bool
    captured_player_id: Optional[UUID] = None
    winner_id: Optional[UUID] = None
    message: str


class SkipTurnRequest(BaseModel):
    player_id: UUID


class WebSocketMessage(BaseModel):
    type: str
    data: dict

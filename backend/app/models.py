import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON, Boolean, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from .database import Base


class GameStatus(str, enum.Enum):
    WAITING = "waiting"
    IN_PROGRESS = "in_progress"
    FINISHED = "finished"


class PlayerColor(str, enum.Enum):
    RED = "red"
    BLUE = "blue"
    GREEN = "green"
    YELLOW = "yellow"


class Game(Base):
    __tablename__ = "games"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(6), unique=True, nullable=False)
    status = Column(Enum(GameStatus), default=GameStatus.WAITING)
    current_player_index = Column(Integer, default=0)
    winner_id = Column(UUID(as_uuid=True), ForeignKey("players.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    players = relationship("Player", back_populates="game", foreign_keys="Player.game_id")
    winner = relationship("Player", foreign_keys=[winner_id])


class Player(Base):
    __tablename__ = "players"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    game_id = Column(UUID(as_uuid=True), ForeignKey("games.id"), nullable=False)
    name = Column(String(50), nullable=False)
    color = Column(Enum(PlayerColor), nullable=False)
    # Positions of 4 pieces: -1 = home, 0-39 = on board, 40-43 = in finish area
    pieces = Column(JSON, default=[-1, -1, -1, -1])
    order = Column(Integer, nullable=False)
    is_connected = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    game = relationship("Game", back_populates="players", foreign_keys=[game_id])


class Move(Base):
    __tablename__ = "moves"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    game_id = Column(UUID(as_uuid=True), ForeignKey("games.id"), nullable=False)
    player_id = Column(UUID(as_uuid=True), ForeignKey("players.id"), nullable=False)
    dice_value = Column(Integer, nullable=False)
    piece_index = Column(Integer, nullable=False)
    from_position = Column(Integer, nullable=False)
    to_position = Column(Integer, nullable=False)
    captured_player_id = Column(UUID(as_uuid=True), ForeignKey("players.id"), nullable=True)
    captured_piece_index = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    game = relationship("Game")
    player = relationship("Player", foreign_keys=[player_id])

import os
import random
import string
from typing import Dict, List
from uuid import UUID
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import get_db, engine, Base
from .models import Game, Player, Move, GameStatus, PlayerColor
from .schemas import (
    GameCreate, GameJoin, GameResponse,
    # PlayerResponse is kept for future API extensions (e.g., player details endpoint)
    PlayerResponse,
    DiceRoll, DiceRollResponse, MoveRequest, MoveResponse, SkipTurnRequest
)
from . import game_logic


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Warning: Could not create tables: {e}")
    yield


app = FastAPI(
    title="Не се сърди човече",
    description="Multiplayer Ludo Game API",
    lifespan=lifespan
)

# CORS middleware - configurable via environment variable
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket connections manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, game_code: str):
        await websocket.accept()
        if game_code not in self.active_connections:
            self.active_connections[game_code] = []
        self.active_connections[game_code].append(websocket)

    def disconnect(self, websocket: WebSocket, game_code: str):
        if game_code in self.active_connections:
            if websocket in self.active_connections[game_code]:
                self.active_connections[game_code].remove(websocket)

    async def broadcast(self, game_code: str, message: dict):
        if game_code in self.active_connections:
            for connection in self.active_connections[game_code]:
                try:
                    await connection.send_json(message)
                except Exception:
                    # Silently ignore send failures - connection may have closed
                    # The disconnect handler will clean up stale connections
                    pass


manager = ConnectionManager()


def generate_game_code() -> str:
    """Generate a unique 6-character game code"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


def get_available_color(existing_players: List[Player]) -> PlayerColor:
    """Get the next available color for a new player"""
    used_colors = {p.color for p in existing_players}
    color_order = [PlayerColor.RED, PlayerColor.BLUE, PlayerColor.GREEN, PlayerColor.YELLOW]
    for color in color_order:
        if color not in used_colors:
            return color
    raise HTTPException(status_code=400, detail="Game is full")


@app.get("/")
def root():
    return {"message": "Не се сърди човече - API", "version": "1.0.0"}


@app.post("/api/games", response_model=GameResponse)
def create_game(game_data: GameCreate, db: Session = Depends(get_db)):
    """Create a new game and add the first player"""
    code = generate_game_code()
    
    # Ensure unique code
    while db.query(Game).filter(Game.code == code).first():
        code = generate_game_code()
    
    game = Game(code=code, status=GameStatus.WAITING)
    db.add(game)
    db.flush()
    
    player = Player(
        game_id=game.id,
        name=game_data.player_name,
        color=PlayerColor.RED,
        pieces=[-1, -1, -1, -1],
        order=0
    )
    db.add(player)
    db.commit()
    db.refresh(game)
    
    return game


@app.post("/api/games/join", response_model=GameResponse)
def join_game(join_data: GameJoin, db: Session = Depends(get_db)):
    """Join an existing game"""
    game = db.query(Game).filter(Game.code == join_data.code.upper()).first()
    
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    if game.status != GameStatus.WAITING:
        raise HTTPException(status_code=400, detail="Game has already started")
    
    if len(game.players) >= 4:
        raise HTTPException(status_code=400, detail="Game is full")
    
    color = get_available_color(game.players)
    
    player = Player(
        game_id=game.id,
        name=join_data.player_name,
        color=color,
        pieces=[-1, -1, -1, -1],
        order=len(game.players)
    )
    db.add(player)
    db.commit()
    db.refresh(game)
    
    return game


@app.get("/api/games/{game_id}", response_model=GameResponse)
def get_game(game_id: UUID, db: Session = Depends(get_db)):
    """Get game details"""
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game


@app.get("/api/games/code/{code}", response_model=GameResponse)
def get_game_by_code(code: str, db: Session = Depends(get_db)):
    """Get game details by code"""
    game = db.query(Game).filter(Game.code == code.upper()).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game


@app.post("/api/games/{game_id}/start", response_model=GameResponse)
def start_game(game_id: UUID, db: Session = Depends(get_db)):
    """Start the game"""
    game = db.query(Game).filter(Game.id == game_id).first()
    
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    if len(game.players) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 players to start")
    
    if game.status != GameStatus.WAITING:
        raise HTTPException(status_code=400, detail="Game has already started")
    
    game.status = GameStatus.IN_PROGRESS
    db.commit()
    db.refresh(game)
    
    return game


@app.post("/api/games/roll-dice", response_model=DiceRollResponse)
def roll_dice(roll_data: DiceRoll, db: Session = Depends(get_db)):
    """Roll the dice for a player's turn"""
    game = db.query(Game).filter(Game.id == roll_data.game_id).first()
    
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    if game.status != GameStatus.IN_PROGRESS:
        raise HTTPException(status_code=400, detail="Game is not in progress")
    
    current_player = game.players[game.current_player_index]
    
    if current_player.id != roll_data.player_id:
        raise HTTPException(status_code=400, detail="Not your turn")
    
    dice_value = game_logic.roll_dice()
    valid_moves = game_logic.get_valid_moves(
        current_player.pieces,
        dice_value,
        current_player.color
    )
    
    return DiceRollResponse(
        value=dice_value,
        can_move=len(valid_moves) > 0,
        valid_moves=valid_moves
    )


@app.post("/api/games/move", response_model=MoveResponse)
def make_move(move_data: MoveRequest, db: Session = Depends(get_db)):
    """Make a move"""
    game = db.query(Game).filter(Game.id == move_data.game_id).first()
    
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    if game.status != GameStatus.IN_PROGRESS:
        raise HTTPException(status_code=400, detail="Game is not in progress")
    
    current_player = game.players[game.current_player_index]
    
    if current_player.id != move_data.player_id:
        raise HTTPException(status_code=400, detail="Not your turn")
    
    piece_idx = move_data.piece_index
    if piece_idx < 0 or piece_idx > 3:
        raise HTTPException(status_code=400, detail="Invalid piece index")
    
    pieces = list(current_player.pieces)
    can_move, new_pos = game_logic.can_move_piece(
        pieces[piece_idx],
        move_data.dice_value,
        current_player.color,
        pieces
    )
    
    if not can_move:
        raise HTTPException(status_code=400, detail="Invalid move")
    
    # Check for capture
    all_players = {
        str(p.id): (p.color, list(p.pieces))
        for p in game.players
        if p.id != current_player.id
    }
    
    capture = game_logic.check_capture(new_pos, current_player.color, all_players)
    captured_player_id = None
    
    if capture:
        captured_player_id_str, captured_piece_idx = capture
        captured_player = db.query(Player).filter(Player.id == UUID(captured_player_id_str)).first()
        if captured_player:
            cap_pieces = list(captured_player.pieces)
            cap_pieces[captured_piece_idx] = -1  # Send back home
            captured_player.pieces = cap_pieces
            captured_player_id = captured_player.id
    
    # Update piece position
    old_pos = pieces[piece_idx]
    pieces[piece_idx] = new_pos
    current_player.pieces = pieces
    
    # Record the move
    move = Move(
        game_id=game.id,
        player_id=current_player.id,
        dice_value=move_data.dice_value,
        piece_index=piece_idx,
        from_position=old_pos,
        to_position=new_pos,
        captured_player_id=captured_player_id,
        captured_piece_index=capture[1] if capture else None
    )
    db.add(move)
    
    # Check for winner
    winner_id = None
    if game_logic.check_winner(pieces):
        game.status = GameStatus.FINISHED
        game.winner_id = current_player.id
        winner_id = current_player.id
        message = f"{current_player.name} wins!"
    else:
        # Next player's turn (unless rolled 6)
        if move_data.dice_value != 6:
            game.current_player_index = (game.current_player_index + 1) % len(game.players)
        message = "Move successful"
    
    db.commit()
    
    return MoveResponse(
        success=True,
        new_position=new_pos,
        captured=capture is not None,
        captured_player_id=captured_player_id,
        winner_id=winner_id,
        message=message
    )


@app.post("/api/games/{game_id}/skip-turn")
def skip_turn(game_id: UUID, skip_data: SkipTurnRequest, db: Session = Depends(get_db)):
    """Skip turn when no valid moves available"""
    game = db.query(Game).filter(Game.id == game_id).first()
    
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    current_player = game.players[game.current_player_index]
    
    if current_player.id != skip_data.player_id:
        raise HTTPException(status_code=400, detail="Not your turn")
    
    game.current_player_index = (game.current_player_index + 1) % len(game.players)
    db.commit()
    
    return {"message": "Turn skipped"}


# WebSocket endpoint for real-time updates
@app.websocket("/ws/{game_code}")
async def websocket_endpoint(websocket: WebSocket, game_code: str):
    await manager.connect(websocket, game_code)
    try:
        while True:
            data = await websocket.receive_json()
            # Broadcast game state updates to all players
            await manager.broadcast(game_code, data)
    except WebSocketDisconnect:
        manager.disconnect(websocket, game_code)

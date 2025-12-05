# 🎲 Не се сърди човече! (Ludo Multiplayer Game)

A multiplayer web-based implementation of the classic Bulgarian board game "Не се сърди човече" (Don't Get Angry, Man!) also known as Ludo/Parcheesi.

## 📸 Screenshots

### Home Page
Create a new game or join an existing one with a game code.

![Home Page](https://github.com/user-attachments/assets/6e1bcfb1-f1cf-431f-b255-9a8dd0c70f3f)

### Game Lobby
Wait for other players to join. Share the game code with friends!

![Lobby - Waiting for Players](https://github.com/user-attachments/assets/3d1ffc3a-ab09-4e00-baef-94b5045a0163)

![Lobby - Ready to Start](https://github.com/user-attachments/assets/fc2ba8fe-f6de-4032-baa0-cf53da399d5e)

### Game Board
Play the game with colorful pieces, animated dice, and turn indicators.

![Game Board](https://github.com/user-attachments/assets/e9b749bb-eef5-4439-8eda-aa73632341cc)

![Game After Rolling](https://github.com/user-attachments/assets/d9ab4413-98f3-4748-806b-24a3ecd7ca11)

## 🎮 Features

- **Multiplayer gameplay** - Up to 4 players can join a game
- **Real-time updates** - WebSocket support for live game state synchronization
- **Child-friendly design** - Colorful, fun UI with Bulgarian language support
- **Easy game sharing** - Share game codes with friends to join
- **Complete game rules**:
  - Roll 6 to move a piece out of home
  - Capture opponent pieces by landing on them
  - First player to get all 4 pieces to the finish wins
  - Roll 6 again to get an extra turn

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Tailwind CSS for styling
- Vite for fast development
- React Router for navigation
- Axios for API communication

### Backend
- FastAPI (Python)
- PostgreSQL database
- SQLAlchemy ORM
- WebSocket support for real-time updates

### DevOps
- Docker & Docker Compose for containerization
- Easy local development and deployment

## 🚀 Getting Started

### Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ (for local frontend development)
- Python 3.11+ (for local backend development)

### Quick Start with Docker

1. Clone the repository:
```bash
git clone https://github.com/ivangoranov/ne-se-sardi.git
cd ne-se-sardi
```

2. Start all services:
```bash
docker-compose up --build
```

3. Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Local Development

#### Backend
```bash
cd backend
poetry install
poetry run uvicorn app.main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📖 User Guide

### Step 1: Create or Join a Game

When you open the app, you'll see the home screen:

1. **Enter your name** in the "Твоето име" (Your Name) field
2. Choose one of the options:
   - **Create a new game**: Click the green "🎮 Създай нова игра" button
   - **Join an existing game**: Enter the 6-character game code and click "🚀 Присъедини се"

### Step 2: Wait in the Lobby

After creating or joining a game:

1. You'll see the **game code** (e.g., "DQICTM") - share this with friends!
2. Click the 📋 button to copy the code to clipboard
3. Wait for other players to join (minimum 2 players required)
4. The host (first player, shown with 👑) can start the game when ready
5. Click "🚀 Започни играта!" to start

### Step 3: Play the Game

The game board shows:

| Element | Description |
|---------|-------------|
| 🎮 Player List | Shows all players, their colors, pieces at home (🏠), and finished pieces (✅) |
| 👉 Turn Indicator | Points to the current player |
| 🎲 Dice Area | Roll the dice and see valid moves |
| Game Board | Colored home areas, track, and finish zones |

#### How to Play Your Turn:

1. **Wait for your turn** - The 👉 indicator shows whose turn it is
2. **Roll the dice** - Click "🎲 Хвърли зара!" (Roll the dice!)
3. **Move a piece**:
   - If you rolled **6**: You can move a piece from home to the board OR move an existing piece
   - Any other number: Move an existing piece on the board
   - Pieces that can move will **bounce** to show they're valid moves
4. **Click on a bouncing piece** to move it
5. **If no moves available**: The game automatically skips your turn

#### Special Rules:

| Rule | Description |
|------|-------------|
| 🎲 Roll 6 to start | You must roll a 6 to move a piece from home onto the board |
| 🎲 Roll 6 = Extra turn | Rolling a 6 gives you another turn |
| ⚔️ Capture | Land on an opponent's piece to send it back home |
| 🏁 Finish | Move all 4 pieces into your colored finish zone to win |

### Step 4: Win the Game!

The first player to move all 4 pieces into their finish zone wins! 🏆

A celebration screen will appear showing the winner's name.

## 🎯 Game Rules Summary

1. **Starting**: Each player has 4 pieces in their home area (colored corners)
2. **Rolling 6**: Required to move a piece from home to the starting position
3. **Movement**: Pieces move clockwise around the board based on dice roll
4. **Capturing**: Landing on an opponent's piece sends it back to their home
5. **Extra turns**: Rolling 6 gives you another turn
6. **Winning**: First player to get all 4 pieces to the finish area wins!

## 🎨 Color Guide

| Color | Bulgarian | Position |
|-------|-----------|----------|
| 🔴 Red | Червен | Top-left |
| 🔵 Blue | Син | Top-right |
| 🟢 Green | Зелен | Bottom-right |
| 🟡 Yellow | Жълт | Bottom-left |

## 📁 Project Structure

```
ne-se-sardi/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI application
│   │   ├── models.py        # Database models
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── database.py      # Database configuration
│   │   └── game_logic.py    # Game logic implementation
│   ├── Dockerfile
│   └── pyproject.toml
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── types/           # TypeScript types
│   │   └── api.ts           # API client
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://nesesardi:nesesardi123@db:5432/nesesardi` |
| `CORS_ORIGINS` | Comma-separated list of allowed origins | `http://localhost:5173,http://localhost:3000` |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.
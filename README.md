# 🎲 Не се сърди човече! (Ludo Multiplayer Game)

A multiplayer web-based implementation of the classic Bulgarian board game "Не се сърди човече" (Don't Get Angry, Man!) also known as Ludo/Parcheesi.

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

## 📖 How to Play

1. **Create a game**: Enter your name and click "Създай нова игра" (Create new game)
2. **Share the code**: Share the 6-character game code with friends
3. **Wait for players**: Up to 4 players can join using the game code
4. **Start the game**: The host clicks "Започни играта" (Start game)
5. **Play**:
   - Roll the dice on your turn
   - Roll 6 to move a piece from home to the board
   - Move your pieces around the board
   - Land on opponents to send them back home
   - Get all 4 pieces to your finish area to win!

## 🎯 Game Rules

- Each player has 4 pieces starting in their home area
- Roll 6 to move a piece out of home onto the start position
- Move pieces clockwise around the board
- Landing on an opponent's piece sends it back home
- Rolling 6 gives you another turn
- First to get all pieces to the finish area wins!

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

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.
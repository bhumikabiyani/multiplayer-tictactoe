# Multiplayer Tic-Tac-Toe Game

A real-time multiplayer tic-tac-toe game built with React frontend and Nakama backend server, featuring automatic matchmaking, bot opponents, and cross-platform support.

## 🚀 Setup and Installation Instructions

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** (comes with Node.js)
- **Docker** (for containerized database)
- **Git** (for version control)

### Quick Start (5 Minutes)

1. **Clone and Install Dependencies**
```bash
git clone <repository-url>
cd multiplayer-tictactoe
npm run install-all
```

2. **Start the Database and Server**
```bash
# Start PostgreSQL database and Nakama server
cd backend
docker compose -f docker-compose-simple.yml up -d
```

3. **Launch the Application**
```bash
# Start both frontend and backend
npm run dev
```

4. **Access the Game**
- **Frontend**: http://localhost:3000
- **Admin Console**: http://localhost:7351 (admin/password)

### Manual Installation

#### Backend Setup
```bash
# Install Nakama binary (macOS/Linux)
curl -L https://github.com/heroiclabs/nakama/releases/latest/download/nakama-3.18.0-darwin-amd64.tar.gz | tar xz
mkdir -p ~/bin
mv nakama ~/bin/
export PATH="$HOME/bin:$PATH"

# Verify installation
nakama --version
```

#### Database Configuration
**Default credentials (pre-configured):**
- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `nakama`
- **Username**: `postgres`
- **Password**: `localdb`

#### Frontend Environment
Create `.env` file in frontend directory:
```env
REACT_APP_NAKAMA_HOST=localhost
REACT_APP_NAKAMA_PORT=7350
REACT_APP_NAKAMA_KEY=defaultkey
```

### Multi-Device Testing Setup

1. **Find Your IP Address**
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig | findstr "IPv4"
```

2. **Update Frontend Configuration**
```typescript
// In frontend/src/contexts/GameContext.tsx
const nakamaClient = new Client("defaultkey", "YOUR_IP_ADDRESS", "7350", false);
```

3. **Rebuild and Test**
```bash
cd frontend && npm run build
# Access from mobile: http://YOUR_IP_ADDRESS:3000
```

## 🏗️ Architecture and Design Decisions

### System Architecture

```
┌─────────────────┐    WebSocket     ┌─────────────────┐
│   React Client  │ ◄──────────────► │  Nakama Server  │
│   (Frontend)    │                  │   (Backend)     │
└─────────────────┘                  └─────────────────┘
                                              │
                                              ▼
                                     ┌─────────────────┐
                                     │   PostgreSQL    │
                                     │   (Database)    │
                                     └─────────────────┘
```

### Technology Stack

**Frontend:**
- **React** with TypeScript for type safety
- **React Context** for global game state management
- **WebSocket** for real-time communication
- **CSS Modules** for component styling

**Backend:**
- **Nakama** (Go-based) for game server functionality
- **Lua** for custom game logic and matchmaking
- **PostgreSQL** for persistent data storage
- **Docker** for containerized deployment

**Real-time Communication:**
- **WebSocket** connections for low-latency gameplay
- **JSON** message format for game state synchronization
- **Automatic reconnection** handling

### Key Design Decisions

1. **Stateless Frontend**: Game state managed entirely on server
2. **Event-Driven Architecture**: All game actions trigger server events
3. **Automatic Matchmaking**: Server handles player pairing
4. **Bot Integration**: Local bot for single-player testing
5. **Cross-Platform**: Web-based for universal device support

### Project Structure

```
multiplayer-tictactoe/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # UI components (Board, Game, etc.)
│   │   ├── contexts/        # Game state management
│   │   ├── utils/           # Bot logic & utilities
│   │   └── App.tsx          # Main application component
│   ├── public/              # Static assets
│   └── package.json
├── backend/                 # Nakama server
│   ├── modules/
│   │   └── tic_tac_toe.lua # Game server logic
│   ├── nakama-config.yml   # Server configuration
│   ├── docker-compose-simple.yml # Database setup
│   └── server.js           # Node.js wrapper (if needed)
├── database/               # Database setup
│   ├── docker-compose.yml # PostgreSQL container
│   └── init.sql           # Database initialization
├── vercel.json            # Vercel deployment config
└── package.json           # Root orchestration
```

## 🚀 Deployment Process Documentation

### Production Deployment Strategy

**Hybrid Deployment (Current Setup):**
- **Frontend**: Vercel (static hosting)
- **Backend**: Render.com (free plan with limitations)

### Frontend Deployment (Vercel)

1. **Prepare Repository**
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

2. **Deploy to Vercel**
   - Connect GitHub repository to Vercel
   - Set root directory to `frontend`
   - Configure build settings:
     - **Build Command**: `npm run build`
     - **Output Directory**: `build`
     - **Install Command**: `npm install`

3. **Environment Variables** (in Vercel dashboard):
```env
REACT_APP_NAKAMA_HOST=your-render-app.onrender.com
REACT_APP_NAKAMA_PORT=7350
REACT_APP_NAKAMA_KEY=defaultkey
REACT_APP_NAKAMA_USE_SSL=true
```

### Backend Deployment (Render - Current Setup)

**This project uses Render.com with the free plan for backend hosting.**

1. **Render Setup**
   - Connect your GitHub repository to Render
   - Create a new Web Service
   - Set root directory to `backend`
   - Render automatically detects Node.js and builds the project

2. **Render Configuration**
```yaml
# render.yaml (already configured)
services:
  - type: web
    name: tic-tac-toe-backend
    env: node
    buildCommand: npm install
    startCommand: node server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: tic-tac-toe-db
          property: connectionString

databases:
  - name: tic-tac-toe-db
    databaseName: nakama
    user: postgres
```

3. **Environment Variables** (Set in Render Dashboard)
```env
NODE_ENV=production
PORT=10000
NAKAMA_HOST=0.0.0.0
NAKAMA_PORT=7350
DATABASE_URL=postgresql://user:pass@host:5432/nakama
```

4. **Free Plan Limitations**
   - **Sleep after 15 minutes** of inactivity
   - **750 hours/month** of runtime
   - **Cold start delays** (10-30 seconds)
   - **Shared resources** with other applications
   - **No persistent storage** (database resets monthly)

5. **Render Deployment Process**
```bash
# Automatic deployment on git push
git add .
git commit -m "Deploy to Render"
git push origin main
# Render automatically builds and deploys
```


## ⚙️ API/Server Configuration Details

### Nakama Server Configuration

**Default Ports:**
- **HTTP API**: `7350` (WebSocket connections)
- **gRPC API**: `7349` (Server-to-server)
- **Console**: `7351` (Admin interface)

**Core Configuration** (`backend/nakama-config.yml`):
```yaml
name: tic-tac-toe-server
data_dir: "./data/"

logger:
  stdout: true
  level: "DEBUG"  # Change to "INFO" for production

session:
  encryption_key: "defaultencryptionkey"
  refresh_encryption_key: "defaultrefreshencryptionkey"

socket:
  server_key: "defaultkey"
  port: 7350
  address: "0.0.0.0"

console:
  port: 7351
  username: "admin"
  password: "password"  # Change for production

database:
  address: ["postgres://postgres:localdb@localhost:5432/nakama?sslmode=disable"]

matchmaker:
  max_tickets: 1000
  interval_sec: 5      # Fast matching (5 seconds)
  max_intervals: 10

runtime:
  http_key: "defaulthttpkey"
```

### Game Logic API (Lua Module)

**Match Lifecycle:**
```lua
-- Match initialization
function M.match_init(context, setupstate)
    local gamestate = {
        board = {0, 0, 0, 0, 0, 0, 0, 0, 0},
        currentPlayer = 1,
        gameOver = false,
        winner = nil
    }
    return gamestate
end

-- Handle player moves
function M.match_loop(context, dispatcher, tick, state, messages)
    for _, message in ipairs(messages) do
        local decoded = json.decode(message.data)
        if decoded.type == "move" then
            -- Validate and process move
            -- Update game state
            -- Broadcast to all players
        end
    end
    return state
end
```

### API Endpoints

**Health Check:**
```
GET http://localhost:7350/v2/healthcheck
```

**WebSocket Connection:**
```javascript
const client = new Client("defaultkey", "localhost", "7350", false);
const session = await client.authenticateDevice("device-id");
const socket = client.createSocket(false, false);
await socket.connect(session);
```

**Game Messages:**
```javascript
// Join matchmaking
socket.send({
    match_data_send: {
        match_id: matchId,
        op_code: 1,
        data: JSON.stringify({ type: "join" })
    }
});

// Send move
socket.send({
    match_data_send: {
        match_id: matchId,
        op_code: 1,
        data: JSON.stringify({ 
            type: "move", 
            position: 4,
            player: 1 
        })
    }
});
```

### Database Schema

**Core Tables:**
- `users` - Player accounts and authentication
- `user_device` - Device-based authentication
- `matches` - Game match records
- `match_state` - Current game states

**Custom Tables** (if needed):
```sql
CREATE TABLE game_stats (
    user_id UUID PRIMARY KEY,
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    games_lost INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🧪 How to Test the Multiplayer Functionality

### Local Testing Setup

1. **Single Machine Testing**
```bash
# Start the server
npm run dev

# Open two browser tabs/windows
# Navigate to http://localhost:3000 in both
# Click "Connect & Play" in both tabs
# Test multiplayer functionality
```

2. **Bot Testing** (Single Player)
```bash
# In the game interface:
# 1. Click "Connect & Play"
# 2. Select "Play vs Bot" if no human opponent found
# 3. Test game logic against AI opponent
```

### Multi-Device Testing

1. **Network Setup**
```bash
# Find your local IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# Update GameContext.tsx with your IP
const nakamaClient = new Client("defaultkey", "192.168.1.100", "7350", false);

# Rebuild frontend
cd frontend && npm run build
```

2. **Device Testing**
   - Connect all devices to same WiFi network
   - Access `http://YOUR_IP:3000` from each device
   - Test cross-device multiplayer functionality

### Automated Testing

**Unit Tests:**
```bash
cd frontend
npm test
```

**Integration Tests:**
```bash
# Test server connectivity
curl -I http://localhost:7350/v2/healthcheck

# Test WebSocket connection
# Use browser dev tools Network tab to monitor WebSocket messages
```

### Testing Checklist

**Basic Functionality:**
- [ ] Server starts without errors
- [ ] Frontend connects to backend
- [ ] Players can join matchmaking
- [ ] Game board renders correctly
- [ ] Moves are synchronized between players
- [ ] Win/draw conditions work
- [ ] Bot opponent functions properly

**Multiplayer Features:**
- [ ] Two players can connect simultaneously
- [ ] Turn-based gameplay works correctly
- [ ] Real-time move synchronization
- [ ] Player disconnection handling
- [ ] Reconnection functionality
- [ ] Cross-device compatibility

**Performance Testing:**
- [ ] Server handles multiple concurrent games
- [ ] Low latency for move synchronization
- [ ] Stable WebSocket connections
- [ ] Memory usage within acceptable limits

### Troubleshooting Common Issues

**Connection Problems:**
```bash
# Check server status
lsof -i :7350

# Test API endpoint
curl http://localhost:7350/v2/healthcheck

# Check WebSocket in browser dev tools
```

**Game State Issues:**
```bash
# Check server logs
cd backend && nakama --config nakama-config.yml

# Look for error messages in console
# Verify game state synchronization
```

**Performance Issues:**
```bash
# Monitor server resources
htop
df -h
free -m

# Check database connections
sudo -u postgres psql -c "\l"
```

## 🎯 Features

- ✅ **Real-time multiplayer gameplay** with WebSocket connections
- ✅ **Automatic matchmaking** system
- ✅ **Bot opponent** for single-player testing
- ✅ **Game state synchronization** across all clients
- ✅ **Player turn management** with validation
- ✅ **Win/draw detection** and game completion
- ✅ **Cross-platform compatibility** (web-based)
- ✅ **Responsive mobile UI** design
- ✅ **Connection status monitoring**
- ✅ **Automatic reconnection** handling

## 🔧 Default Configuration

**⚠️ IMPORTANT: These settings are pre-configured and should work out of the box:**

### Database (PostgreSQL)
- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `nakama`
- **Username**: `postgres`
- **Password**: `localdb`

### Nakama Server
- **HTTP API**: http://localhost:7350
- **Console**: http://localhost:7351 (admin/password)
- **gRPC**: localhost:7349

### React Frontend
- **Development**: http://localhost:3000
- **Android Emulator**: Automatically uses `10.0.2.2`
- **iOS Simulator**: Uses `localhost`
- **Physical Device**: Update IP in `GameContext.tsx`

## 🔍 Troubleshooting

### Server Issues
```bash
# Check if server is running
curl -I http://localhost:7350/

# View server logs
cd backend && docker compose -f docker-compose-simple.yml logs nakama

# Restart server
docker compose -f docker-compose-simple.yml restart
```

### Connection Issues
- **Android Emulator**: App automatically uses `10.0.2.2`
- **Physical Device**: Update IP in `GameContext.tsx` to your computer's IP
- **iOS**: Should work with `localhost`

### Database Issues
```bash
# Check database status
cd backend && docker compose -f docker-compose-simple.yml ps

# Reset database
docker compose -f docker-compose-simple.yml down -v
docker compose -f docker-compose-simple.yml up -d
```

## 📚 Additional Documentation

- **[SETUP.md](SETUP.md)** - Comprehensive setup instructions and development guide



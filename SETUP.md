# Tic Tac Toe Multiplayer Game Setup Guide

This guide will help you set up and run the complete multiplayer tic-tac-toe game with Nakama backend and React Native frontend.

## 🔧 Default Configuration

**Database Settings (DO NOT CHANGE unless you know what you're doing):**
- **Host**: `localhost` (or `postgres` in Docker)
- **Port**: `5432`
- **Database**: `nakama`
- **Username**: `postgres`
- **Password**: `localdb`

**Nakama Server Ports:**
- **HTTP API**: `7350`
- **gRPC API**: `7349` 
- **Console**: `7351`

**React Native Network:**
- **Android Emulator**: Uses `10.0.2.2` to connect to host
- **iOS Simulator**: Uses `localhost`

## 🎮 Overview
This is a real-time multiplayer tic-tac-toe game built with React Native (frontend) and Nakama (backend game server).

## 📋 Prerequisites

### Required Software
- **Node.js** (v16 or higher)
- **npm** (comes with Node.js)
- **PostgreSQL** (v13 or higher)
- **Nakama Server** (v3.18.0+)

### Optional
- **Docker** (for containerized database)
- **Git** (for version control)

## 🚀 Quick Setup (5 Minutes)

### 1. Clone and Install Dependencies
```bash
# Clone the repository
git clone <repository-url>
cd LILA

# Install all dependencies (frontend + backend)
npm run install-all
```

### 2. Database Setup

**IMPORTANT**: The database configuration uses these default credentials:
- **Username**: `postgres`
- **Password**: `localdb`
- **Database**: `nakama`
- **Port**: `5432`

#### Option A: Use Docker PostgreSQL (Recommended)
```bash
# The docker-compose files automatically set up PostgreSQL with the correct credentials
cd nakama-server
docker compose -f docker-compose-simple.yml up -d
```

#### Option B: Local PostgreSQL
If you want to use a local PostgreSQL installation:
```bash
# Create database and user with the expected credentials
psql -U postgres -c "CREATE DATABASE nakama;"
psql -U postgres -c "ALTER USER postgres PASSWORD 'localdb';"
# OR create a new user:
psql -U postgres -c "CREATE USER postgres WITH PASSWORD 'localdb';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE nakama TO postgres;"
```

### 3. Start the Game
```bash
# Start both frontend and backend simultaneously
npm run dev
```

### 4. Access the Game
- **Frontend**: http://localhost:3000
- **Admin Console**: http://localhost:7351 (admin/password)

## 🔧 Detailed Setup

### Backend Configuration

#### Nakama Server Installation
```bash
# Download Nakama binary (macOS/Linux)
curl -L https://github.com/heroiclabs/nakama/releases/latest/download/nakama-3.18.0-darwin-amd64.tar.gz | tar xz
mkdir -p ~/bin
mv nakama ~/bin/
export PATH="$HOME/bin:$PATH"

# Verify installation
nakama --version
```

#### Configuration Files
- **`backend/nakama-config.yml`**: Main server configuration
- **`backend/modules/tic_tac_toe.lua`**: Game logic implementation

#### Key Configuration Settings
```yaml
# Database connection
#changelocaldb to your postgres username
database:
  address: ["postgres://localdb@localhost:5432/nakama?sslmode=disable"]

# Network ports
socket:
  port: 7350  # WebSocket for game communication
console:
  port: 7351  # Admin interface

# Matchmaking settings
matchmaker:
  max_tickets: 1000
  interval_sec: 5      # Fast matching (5 seconds)
  max_intervals: 10
```

### Frontend Configuration

#### Environment Variables
Create `.env` file in frontend directory:
```env
REACT_APP_NAKAMA_HOST=localhost
REACT_APP_NAKAMA_PORT=7350
REACT_APP_NAKAMA_KEY=defaultkey
```

#### Network Configuration
Update `frontend/src/contexts/GameContext.tsx` for your network:
```typescript
// Change this IP to your machine's IP for multi-device testing
const nakamaClient = new Client("defaultkey", "192.168.31.127", "7350", false);
```

## 🌐 Multi-Device Setup

### For Testing on Multiple Devices (Phone + Laptop)

1. **Find Your IP Address**
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig | findstr "IPv4"
```

2. **Update Frontend Configuration**
```typescript
// In GameContext.tsx, replace localhost with your IP
const nakamaClient = new Client("defaultkey", "YOUR_IP_ADDRESS", "7350", false);
```

3. **Rebuild Frontend**
```bash
cd frontend
npm run build
```

4. **Access from Mobile**
- Connect mobile to same WiFi network
- Open: `http://YOUR_IP_ADDRESS:3000`

## 🐛 Troubleshooting

### Common Issues

#### 1. "Connection Refused" Error
```bash
# Check if Nakama is running
lsof -i :7350

# Restart Nakama
cd backend
npm run dev
```

#### 2. Database Connection Failed
```bash
# Check PostgreSQL status
pg_ctl status

# Check database exists
psql -U postgres -l | grep nakama

# Reset database
psql -U postgres -c "DROP DATABASE IF EXISTS nakama;"
psql -U postgres -c "CREATE DATABASE nakama;"
```

#### 3. "state.board.map is not a function"
- This indicates corrupted game state
- Refresh browser pages
- Restart Nakama server

#### 4. Matchmaking Not Working
```bash
# Check server logs for errors
cd backend
npm run dev  # Watch for DEBUG logs

# Verify both players are connecting
# Look for "New WebSocket session connected" messages
```

#### 5. Port Already in Use
```bash
# Kill existing processes
pkill -f nakama
pkill -f "node.*3000"

# Or use different ports in configuration
```

### Debug Mode

#### Enable Detailed Logging
```bash
# Backend debug logs
cd backend
~/bin/nakama --config nakama-config.yml --logger.level DEBUG

# Frontend debug (browser console)
# Open DevTools (F12) and check Console tab
```

#### Health Checks
```bash
# Check all services
lsof -i :3000 -i :7349 -i :7350 -i :7351 -i :5432

# Test database connection
psql -U bhumikabiyani -d nakama -c "SELECT 1;"

# Test Nakama API
curl http://localhost:7350/v2/healthcheck
```

## 📁 Project Structure

```
LILA/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── contexts/        # Game state management
│   │   └── utils/           # Bot logic & utilities
│   └── package.json
├── backend/                 # Nakama server
│   ├── modules/
│   │   └── tic_tac_toe.lua # Game server logic
│   ├── nakama-config.yml   # Server configuration
│   └── package.json
├── database/               # Database setup
│   ├── docker-compose.yml # PostgreSQL container
│   └── init.sql           # Database initialization
└── package.json           # Root orchestration
```

## 🔄 Development Workflow

### Starting Development
```bash
# Terminal 1: Start database (if using Docker)
cd database && docker compose up

# Terminal 2: Start everything
npm run dev
```

### Making Changes

#### Frontend Changes
```bash
cd frontend
npm start  # Auto-reload on changes
```

#### Backend Changes
```bash
cd backend
npm run dev  # Restart required for Lua changes
```

### Testing

#### Local Testing
1. Open two browser tabs
2. Click "Connect & Play" in both
3. Test multiplayer functionality

#### Multi-Device Testing
1. Connect devices to same WiFi
2. Update IP in GameContext.tsx
3. Rebuild frontend
4. Test on different devices

## 🚀 Production Deployment

### Environment Setup
```bash
# Set production environment variables
export NODE_ENV=production
export NAKAMA_HOST=your-server-ip
export DATABASE_URL=postgres://user:pass@host:5432/nakama
```

### Security Considerations
- Change default passwords in `nakama-config.yml`
- Use environment variables for sensitive data
- Enable SSL/TLS for production
- Configure firewall rules

### Performance Optimization
- Use production build: `npm run build`
- Enable gzip compression
- Configure CDN for static assets
- Monitor server resources

## 📊 Monitoring

### Server Metrics
- **Admin Console**: http://localhost:7351
- **Health Check**: http://localhost:7350/v2/healthcheck
- **Metrics**: Available via Nakama admin interface

### Game Analytics
- Player connections
- Match duration
- Win/loss statistics
- Server performance metrics

## 🆘 Support

### Getting Help
1. Check this setup guide
2. Review troubleshooting section
3. Check server logs for errors
4. Verify network connectivity
5. Test with single-player bot mode first

### Useful Commands
```bash
# View all processes
ps aux | grep -E "(nakama|node)"

# Check network connections
netstat -an | grep -E "(3000|7350|7351|5432)"

# View logs
tail -f backend/data/nakama.log  # If logging to file

# Reset everything
pkill -f nakama && pkill -f node && npm run dev
```

---

**🎮 Happy Gaming!** Your multiplayer tic-tac-toe game should now be running smoothly.
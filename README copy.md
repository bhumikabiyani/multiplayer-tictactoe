# Multiplayer Tic-Tac-Toe Game

A real-time multiplayer tic-tac-toe game built with React Native and Nakama.

## 🚀 Quick Start

### 1. Start the Nakama Server
```bash
cd nakama-server
docker compose -f docker-compose-simple.yml up -d
```

### 2. Run the React Native App
```bash
cd react-native-client
npm install
npm run android  # or npm run ios
```

## 📁 Project Structure

```
├── nakama-server/           # Backend game server
│   ├── main.go             # Game logic (tic-tac-toe match handler)
│   ├── docker-compose-simple.yml  # Working server configuration
│   └── config.yml          # Nakama configuration
├── react-native-client/    # Frontend mobile app
│   ├── src/
│   │   ├── screens/        # App screens (Home, Game, Lobby)
│   │   ├── components/     # UI components (Board, Cell, etc.)
│   │   └── services/       # Nakama client integration
│   └── package.json
└── SETUP.md                # Detailed setup instructions
```

## 🔧 Default Configuration

**⚠️ IMPORTANT: These settings are pre-configured and should work out of the box:**

### Database (PostgreSQL)
- **Host**: `localhost` (Docker handles this automatically)
- **Port**: `5432`
- **Database**: `nakama`
- **Username**: `postgres`
- **Password**: `localdb`

### Nakama Server
- **HTTP API**: http://localhost:7350
- **Console**: http://localhost:7351 (admin/password)
- **gRPC**: localhost:7349

### React Native Network
- **Android Emulator**: Automatically uses `10.0.2.2`
- **iOS Simulator**: Uses `localhost`
- **Physical Device**: Update IP in `src/services/NakamaService.ts`

## 🎮 How to Play

1. **Start Server**: Run the Docker command above
2. **Launch App**: Install on device/emulator
3. **Create Game**: Tap "Create Game" in the app
4. **Test Connection**: Use "Test Connection" button if having issues
5. **Multiplayer**: Need 2 devices/emulators for full multiplayer test

## 🔍 Troubleshooting

### "Create Game" Fails
1. Check if server is running: `curl -I http://localhost:7350/`
2. Use "Test Connection" button in the app
3. Check React Native logs: `npx react-native log-android`

### Network Issues
- **Android Emulator**: App automatically uses `10.0.2.2`
- **Physical Device**: Update IP in `NakamaService.ts` to your computer's IP
- **iOS**: Should work with `localhost`

### Server Issues
```bash
# Check server status
cd nakama-server
docker compose -f docker-compose-simple.yml ps

# View server logs
docker compose -f docker-compose-simple.yml logs nakama

# Restart server
docker compose -f docker-compose-simple.yml restart
```

## 📖 Detailed Setup

See [SETUP.md](SETUP.md) for comprehensive setup instructions, development guide, and advanced configuration options.

## 🎯 Features

- ✅ Real-time multiplayer gameplay
- ✅ Automatic matchmaking
- ✅ Game state synchronization
- ✅ Player turn management
- ✅ Win/draw detection
- ✅ Clean mobile UI
- ✅ Cross-platform (iOS/Android)

## 🛠️ Tech Stack

- **Frontend**: React Native, TypeScript, React Navigation
- **Backend**: Nakama (Go), PostgreSQL
- **Real-time**: WebSocket connections
- **Deployment**: Docker containers
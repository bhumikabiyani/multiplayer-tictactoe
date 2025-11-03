# 🚀 LILA Deployment Guide

## Overview

LILA uses a **hybrid deployment strategy**:
- **Frontend**: Deployed on Vercel (static hosting)
- **Backend**: Requires separate server hosting (VPS, cloud instance, etc.)

## 🌐 Frontend Deployment (Vercel)

### Step 1: Prepare Repository

1. **Push to GitHub**
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

2. **Ensure Clean Structure**
```
LILA/
├── frontend/          # React app (will be deployed)
├── backend/           # Nakama server (separate hosting needed)
├── vercel.json        # Vercel configuration
└── README.md
```

### Step 2: Deploy to Vercel

#### Option A: Vercel Dashboard (Recommended)

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up/Login** with GitHub account
3. **Click "New Project"**
4. **Import your GitHub repository**
5. **Configure Project**:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

6. **Environment Variables** (Add in Vercel dashboard):
```
REACT_APP_NAKAMA_HOST=your-backend-server.com
REACT_APP_NAKAMA_PORT=7350
REACT_APP_NAKAMA_KEY=defaultkey
REACT_APP_NAKAMA_USE_SSL=true
```

7. **Click "Deploy"**

#### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: lila-tic-tac-toe
# - Directory: frontend
# - Override settings? No

# Set environment variables
vercel env add REACT_APP_NAKAMA_HOST
# Enter your backend server URL

vercel env add REACT_APP_NAKAMA_PORT
# Enter: 7350

vercel env add REACT_APP_NAKAMA_KEY
# Enter: defaultkey

vercel env add REACT_APP_NAKAMA_USE_SSL
# Enter: true

# Deploy to production
vercel --prod
```

### Step 3: Configure Custom Domain (Optional)

1. **In Vercel Dashboard**:
   - Go to Project Settings
   - Click "Domains"
   - Add your custom domain
   - Follow DNS configuration instructions

## 🖥️ Backend Deployment Options

Since Vercel doesn't support Nakama/Lua servers, you need separate hosting:

### Option 1: DigitalOcean Droplet (Recommended)

#### Create Droplet
1. **Go to [DigitalOcean](https://digitalocean.com)**
2. **Create Droplet**:
   - **Image**: Ubuntu 22.04 LTS
   - **Size**: Basic ($6/month minimum)
   - **Region**: Choose closest to your users
   - **Authentication**: SSH Key (recommended)

#### Setup Server
```bash
# SSH into your droplet
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PostgreSQL
apt install postgresql postgresql-contrib -y

# Install Docker (optional, for easier database management)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Clone your repository
git clone https://github.com/yourusername/LILA.git
cd LILA

# Setup database
sudo -u postgres createdb nakama
sudo -u postgres createuser nakama_user
sudo -u postgres psql -c "ALTER USER nakama_user WITH PASSWORD 'your_secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE nakama TO nakama_user;"

# Install Nakama
wget https://github.com/heroiclabs/nakama/releases/download/v3.18.0/nakama-3.18.0-linux-amd64.tar.gz
tar -xzf nakama-3.18.0-linux-amd64.tar.gz
sudo mv nakama /usr/local/bin/

# Install backend dependencies
cd backend
npm install

# Update configuration
nano nakama-config.yml
# Update database connection string with your password

# Start Nakama (test)
nakama --config nakama-config.yml

# Setup as service (production)
sudo nano /etc/systemd/system/nakama.service
```

#### Nakama Service Configuration
```ini
[Unit]
Description=Nakama Game Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/LILA/backend
ExecStart=/usr/local/bin/nakama --config nakama-config.yml
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl enable nakama
sudo systemctl start nakama
sudo systemctl status nakama

# Configure firewall
ufw allow 22    # SSH
ufw allow 7350  # Nakama WebSocket
ufw allow 7351  # Nakama Console
ufw enable
```

### Option 2: Railway (Easier but Limited)

1. **Go to [railway.app](https://railway.app)**
2. **Connect GitHub repository**
3. **Deploy backend folder**
4. **Add PostgreSQL service**
5. **Configure environment variables**

### Option 3: Heroku (With Limitations)

```bash
# Install Heroku CLI
# Create Procfile in backend/
echo "web: nakama --config nakama-config.yml" > backend/Procfile

# Deploy
heroku create your-app-name
heroku addons:create heroku-postgresql:hobby-dev
git subtree push --prefix backend heroku main
```

## 🔧 Production Configuration

### Frontend Environment Variables (Vercel)
```env
REACT_APP_NAKAMA_HOST=your-backend-server.com
REACT_APP_NAKAMA_PORT=7350
REACT_APP_NAKAMA_KEY=your-production-key
REACT_APP_NAKAMA_USE_SSL=true
REACT_APP_ENV=production
```

### Backend Configuration Updates

Update `backend/nakama-config.yml` for production:

```yaml
name: lila-production
data_dir: "./data/"

logger:
  stdout: true
  level: "INFO"  # Change from DEBUG
  file: "/var/log/nakama.log"

session:
  encryption_key: "your-32-char-encryption-key-here"
  refresh_encryption_key: "your-32-char-refresh-key-here"

socket:
  server_key: "your-socket-server-key-here"
  port: 7350
  address: "0.0.0.0"  # Allow external connections

console:
  port: 7351
  address: "0.0.0.0"
  username: "admin"
  password: "your-secure-admin-password"
  signing_key: "your-console-signing-key"

database:
  address: ["postgres://nakama_user:your_secure_password@localhost:5432/nakama?sslmode=require"]

runtime:
  http_key: "your-runtime-http-key"
```

### Security Checklist

- [ ] **Change all default passwords**
- [ ] **Use strong encryption keys**
- [ ] **Enable SSL/TLS**
- [ ] **Configure firewall rules**
- [ ] **Regular security updates**
- [ ] **Monitor server logs**
- [ ] **Backup database regularly**

## 🔄 CI/CD Pipeline (Optional)

### GitHub Actions for Auto-Deploy

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [ main ]
    paths: [ 'frontend/**' ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: cd frontend && npm install
        
      - name: Build
        run: cd frontend && npm run build
        
      - name: Deploy to Vercel
        uses: vercel/action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: frontend
```

## 📊 Monitoring & Analytics

### Vercel Analytics
1. **Enable in Vercel Dashboard**
2. **Add to your React app**:
```bash
npm install @vercel/analytics
```

```typescript
// In frontend/src/index.tsx
import { Analytics } from '@vercel/analytics/react';

// Add to your app
<Analytics />
```

### Backend Monitoring
```bash
# Server monitoring
htop
df -h
free -m

# Nakama logs
tail -f /var/log/nakama.log

# Service status
systemctl status nakama
```

## 🚀 Complete Deployment Checklist

### Pre-Deployment
- [ ] **Code tested locally**
- [ ] **Environment variables configured**
- [ ] **Database setup complete**
- [ ] **Security keys generated**
- [ ] **Domain name ready (optional)**

### Frontend (Vercel)
- [ ] **Repository pushed to GitHub**
- [ ] **Vercel project created**
- [ ] **Environment variables set**
- [ ] **Custom domain configured (optional)**
- [ ] **SSL certificate active**

### Backend (VPS/Cloud)
- [ ] **Server provisioned**
- [ ] **Nakama installed**
- [ ] **Database configured**
- [ ] **Firewall rules set**
- [ ] **Service running**
- [ ] **Monitoring setup**

### Testing
- [ ] **Frontend loads correctly**
- [ ] **Backend API accessible**
- [ ] **Multiplayer matching works**
- [ ] **Bot mode functional**
- [ ] **Cross-device testing**
- [ ] **Performance acceptable**

## 🆘 Troubleshooting Deployment

### Common Issues

#### Frontend Issues
```bash
# Build fails
cd frontend && npm run build
# Check for TypeScript errors

# Environment variables not working
# Ensure they start with REACT_APP_
# Check Vercel dashboard settings
```

#### Backend Issues
```bash
# Nakama won't start
sudo systemctl status nakama
sudo journalctl -u nakama -f

# Database connection fails
sudo -u postgres psql -c "\l"  # List databases
sudo -u postgres psql -c "\du" # List users

# Port not accessible
sudo ufw status
sudo netstat -tlnp | grep 7350
```

#### Connection Issues
```bash
# Test backend from frontend
curl http://your-server:7350/v2/healthcheck

# Check WebSocket connection
# Use browser dev tools Network tab
```

## 💰 Cost Estimation

### Vercel (Frontend)
- **Hobby Plan**: Free
  - 100GB bandwidth
  - Unlimited personal projects
  - Custom domains

- **Pro Plan**: $20/month
  - 1TB bandwidth
  - Team collaboration
  - Analytics

### Backend Hosting
- **DigitalOcean**: $6-12/month
  - 1-2GB RAM
  - 25-50GB SSD
  - 1-2TB transfer

- **Railway**: $5-10/month
  - Managed PostgreSQL
  - Auto-scaling
  - Easy deployment

### Total Monthly Cost
- **Minimal**: $0-6/month (Vercel Free + Small VPS)
- **Recommended**: $20-30/month (Vercel Pro + Medium VPS)

---

**🎮 Your multiplayer tic-tac-toe game is now ready for the world!**

*Need help? Check the troubleshooting section or review server logs for specific error messages.*
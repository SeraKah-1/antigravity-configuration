#!/bin/bash
# token-monitor-dashboard.sh — Launch the real-time token monitor web dashboard
# Usage: ./token-monitor-dashboard.sh [port]

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DASHBOARD_DIR="$SCRIPT_DIR/dashboard"
PORT=${1:-3000}

echo -e "${BOLD}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║          🛰️  ANTIGRAVITY DASHBOARD LAUNCHER                 ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# 1. Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo -e "${RED}✗ Error:${NC} Node.js is not installed. Please install Node.js (v18+) to run the dashboard."
  exit 1
fi

# 2. Check if npm dependencies are installed
if [ ! -d "$DASHBOARD_DIR/node_modules" ]; then
  echo -e "${YELLOW}→${NC} node_modules not found. Installing dependencies..."
  npm --prefix "$DASHBOARD_DIR" install
  echo -e "${GREEN}✓${NC} Dependencies installed."
fi

# 3. Check if port is already in use
if command -v lsof &> /dev/null; then
  if lsof -Pi :"$PORT" -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠ Warning:${NC} Port $PORT is already in use."
    # Try next port
    PORT=$((PORT + 1))
    echo -e "${YELLOW}→${NC} Trying alternative port: $PORT"
  fi
fi

echo -e "${GREEN}✓ Ready to start server...${NC}"
echo -e "${CYAN}🌍 Dashboard URL:${NC} ${BOLD}http://localhost:$PORT${NC}"
echo -e "${CYAN}⚙ Press${NC} ${RED}Ctrl+C${NC} ${CYAN}to stop the dashboard server.${NC}"
echo ""

# 4. Start the server
PORT=$PORT npm --prefix "$DASHBOARD_DIR" start

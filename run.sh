#!/bin/bash

# Define colors for output
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Barangay Profiling System...${NC}"

# Function to stop background processes when script is exited
cleanup() {
    echo -e "\n${GREEN}Stopping all processes...${NC}"
    kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
    exit
}
trap cleanup SIGINT SIGTERM

# Check if backend/.env exists
if [ ! -f "backend/.env" ]; then
    echo "Configuring backend environment..."
    cp .envcopy backend/.env
fi

# Navigate to backend and run
echo "Starting backend..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi
npm run start:dev &
BACKEND_PID=$!
cd ..

# Run frontend static server
echo "Starting frontend..."
npx serve -s frontend -l 5500 &
FRONTEND_PID=$!

# Wait briefly for servers to spin up
sleep 2

echo -e "${GREEN}--------------------------------------------------${NC}"
echo -e "${GREEN}Backend API running at:${NC} http://localhost:3000"
echo -e "${GREEN}Frontend site running at:${NC} http://localhost:5500"
echo -e "${GREEN}Press Ctrl+C to terminate both servers.${NC}"
echo -e "${GREEN}--------------------------------------------------${NC}"

# Automatically open the browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:5500/residents.html
fi

# Wait for background jobs to keep script alive
wait

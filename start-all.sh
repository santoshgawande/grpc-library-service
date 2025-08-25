#!/bin/bash

# Directories for logs and PID files
RUNDIR=".run"
LOGDIR=".logs"
mkdir -p "$RUNDIR" "$LOGDIR"

# Check if a PostgreSQL server is already running on the host
if ss -ltn | grep -q ':5432 '; then
    RED='\033[0;31m'
    NC='\033[0m' # No Color
    echo -e "${RED}WARNING: A PostgreSQL server is already running on port 5432 on your host.${NC}"
    echo -e "${RED}Stopping PostgreSQL may affect other applications on your system!${NC}"
    echo "This may conflict with the Docker container for this project."
    read -p "Do you want to stop the local PostgreSQL service now? [y/N]: " stop_pg
    if [[ "$stop_pg" =~ ^[Yy]$ ]]; then
        sudo systemctl stop postgresql
        echo -e "${RED}Local PostgreSQL service stopped.${NC}"
    else
        echo -e "${RED}Please stop your local PostgreSQL server manually (sudo systemctl stop postgresql) and then rerun this script.${NC}"
        echo "Exiting."
        exit 1
    fi
fi

# Start Docker if not running (Linux only)
if ! pgrep -x "dockerd" > /dev/null; then
    echo "Starting Docker daemon..."
    sudo systemctl start docker
fi

# Start or create the PostgreSQL container
if ! docker ps -a --format '{{.Names}}' | grep -q '^libdb$'; then
    echo "Creating new PostgreSQL container..."
    docker run --name libdb -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=library -p 5432:5432 -d postgres:16
else
    echo "Starting existing PostgreSQL container..."
    docker start libdb
fi

# Apply schema (wait a bit for DB to be ready)
echo "Waiting for PostgreSQL to be ready..."
sleep 3
docker exec -i libdb psql -U postgres -d library < db/schema.sql

# Start backend (Python gRPC server) with venv activation
cd backend/app
source ../venv/bin/activate
nohup python3 server.py > ../../$LOGDIR/backend.log 2>&1 &
echo $! > ../../$RUNDIR/backend.pid
cd ../..

# Start gateway (Node.js)
cd gateway
nohup node index.js > ../$LOGDIR/gateway.log 2>&1 &
echo $! > ../$RUNDIR/gateway.pid
cd ..

# Start frontend (Vite/React)
cd frontend
nohup npm run dev > ../$LOGDIR/frontend.log 2>&1 &
echo $! > ../$RUNDIR/frontend.pid
cd ..


CYAN='\033[0;36m'
NC='\033[0m'
echo -e "All grpc-library-service project services have been started in background."
echo -e "Open your browser and go to: ${CYAN}http://localhost:5173${NC}"
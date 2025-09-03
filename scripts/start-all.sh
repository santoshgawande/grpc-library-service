#!/bin/bash
# Directories for logs and PID files
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
RUNDIR="$SCRIPT_DIR/.run"
LOGDIR="$SCRIPT_DIR/.logs"
mkdir -p "$RUNDIR" "$LOGDIR"

# Check if port 5432 is in use and show user what is using it
PORT_INFO=$(sudo lsof -i :5432 | grep LISTEN)
if [ -n "$PORT_INFO" ]; then
    RED='\033[0;31m'
    NC='\033[0m' # No Color
    echo -e "${RED}Port 5432 is in use:${NC}"
    echo "$PORT_INFO"
    if echo "$PORT_INFO" | grep -q 'docker'; then
        echo "PostgreSQL is running in a Docker container."
        # Find all running containers using port 5432
        CONTAINERS=$(docker ps --format '{{.ID}} {{.Names}}' --filter "publish=5432")
        if [ -z "$CONTAINERS" ]; then
            echo "No running Docker containers found using port 5432."
        else
            echo "The following Docker containers are using port 5432:"
            echo "$CONTAINERS"
            read -p "Enter the container name or ID to stop (or leave blank to skip): " container_to_stop
            if [ -n "$container_to_stop" ]; then
                docker stop "$container_to_stop"
                echo "Docker container '$container_to_stop' stopped."
            fi
        fi
    elif echo "$PORT_INFO" | grep -q 'postgres'; then
        echo "PostgreSQL is running on the host."
        read -p "Do you want to stop the host PostgreSQL service? [y/N]: " stop_pg
        if [[ "$stop_pg" =~ ^[Yy]$ ]]; then
            sudo systemctl stop postgresql
            echo "Host PostgreSQL service stopped."
        fi
    else
        echo "Port 5432 is used by another process."
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
# docker exec -i libdb psql -U postgres -d library < db/schema.sql
docker exec -i libdb psql -U postgres -d library < ../db/test_schema.sql



# Install Python dependencies if venv does not exist
if [ ! -d ../backend/venv ]; then
    echo "Creating Python venv and installing requirements..."
    cd ../backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    deactivate
    cd ../scripts
fi

# Start backend (Python gRPC server) with venv activation
cd ../backend/app
source ../venv/bin/activate
nohup python3 server.py > "$LOGDIR/backend.log" 2>&1 &
echo $! > "$RUNDIR/backend.pid"
cd "$SCRIPT_DIR"


if [ ! -d ../gateway/node_modules ]; then
    echo "Installing gateway Node.js dependencies..."
    cd ../gateway
    npm install express cors @grpc/grpc-js @grpc/proto-loader
    cd ../scripts
fi

# Copy latest proto file from backend to gateway before starting gateway
if [ ! -d ../gateway/proto ]; then
    mkdir -p ../gateway/proto
fi
if cp ../backend/proto/library.proto ../gateway/proto/library.proto; then
    echo "Proto file copied successfully."
else
    echo "ERROR: Failed to copy proto file. Startup aborted."
    exit 1
fi

# Start gateway (Node.js)
cd ../gateway
nohup node index.js > "$LOGDIR/gateway.log" 2>&1 &
echo $! > "$RUNDIR/gateway.pid"
cd "$SCRIPT_DIR"
if [ ! -d ../frontend/node_modules ]; then
    echo "Installing frontend Node.js dependencies..."
    cd ../frontend
    npm install react react-dom axios
    npm install --save-dev vite
    cd ../scripts
fi

# Start frontend (Vite/React)
cd ../frontend
nohup npm run dev > "$LOGDIR/frontend.log" 2>&1 &
echo $! > "$RUNDIR/frontend.pid"
cd "$SCRIPT_DIR"
echo -e "All grpc-library-service project services have been started in background."
echo -e "Open your browser and go to: ${CYAN}http://localhost:5173${NC}"

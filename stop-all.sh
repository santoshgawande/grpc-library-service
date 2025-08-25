#!/bin/bash

RUNDIR=".run"

# Stop backend
if [ -f $RUNDIR/backend.pid ]; then
    PID=$(cat $RUNDIR/backend.pid)
    if ps -p $PID > /dev/null; then
        kill $PID
        echo "Backend stopped (PID $PID)."
    else
        echo "Backend process not running (PID $PID)."
    fi
    rm $RUNDIR/backend.pid
else
    echo "No $RUNDIR/backend.pid file found."
fi

# Stop gateway
if [ -f $RUNDIR/gateway.pid ]; then
    PID=$(cat $RUNDIR/gateway.pid)
    if ps -p $PID > /dev/null; then
        kill $PID
        echo "Gateway stopped (PID $PID)."
    else
        echo "Gateway process not running (PID $PID)."
    fi
    rm $RUNDIR/gateway.pid
else
    echo "No $RUNDIR/gateway.pid file found."
fi

# Stop frontend
if [ -f $RUNDIR/frontend.pid ]; then
    PID=$(cat $RUNDIR/frontend.pid)
    if ps -p $PID > /dev/null; then
        kill $PID
        echo "Frontend stopped (PID $PID)."
    else
        echo "Frontend process not running (PID $PID)."
    fi
    rm $RUNDIR/frontend.pid
else
    echo "No $RUNDIR/frontend.pid file found."
fi

# Stop Docker PostgreSQL container
if docker ps --format '{{.Names}}' | grep -q '^libdb$'; then
    docker stop libdb
    echo "Docker PostgreSQL container 'libdb' stopped."
else
    echo "Docker container 'libdb' is not running."
fi

echo "All grpc-library-service project services have been stopped and cleared."
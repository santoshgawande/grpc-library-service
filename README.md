# grpc-library-service

A full-stack library management system using **PostgreSQL**, **Python gRPC backend**, **Node.js API Gateway**, and **React frontend**.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Project Structure](#project-structure)
4. [Running the Project](#running-the-project)
    - [Automated Start/Stop Scripts](#automated-startstop-scripts)
    - [Manual Run (Step-by-Step)](#manual-run-step-by-step)
5. [Logs & Runtime Files](#logs--runtime-files)
6. [Database Management](#database-management)
7. [Clean Up](#clean-up)

---

## Project Overview

This project demonstrates a modern microservice architecture for a library system, featuring:

- **PostgreSQL** for persistent storage (via Docker)
- **Python gRPC** backend for business logic
- **Node.js** gateway for REST/gRPC bridging and CORS
- **React** frontend for user interaction

---

## Prerequisites

- [Docker](https://www.docker.com/)
- [Node.js & npm](https://nodejs.org/)
- [Python 3](https://www.python.org/)

---

## Project Structure

```bash
.
├── backend
│   ├── app
│   │   ├── client.py
│   │   ├── server.py
│   │   └── proto
│   │       └── library.proto
├── db
│   ├── schema.sql
│   └── test_schema.sql   # For testing/sample data
├── frontend
│   └── ...
├── gateway
│   └── index.js
├── scripts/
│   ├── start-all.sh   # Start all services
│   ├── stop-all.sh    # Stop all services
│   ├── .logs/         # All service logs
│   └── .run/          # All PID files
```

---

## Running the Project

### Automated Start/Stop Scripts

**Recommended for development and testing.**

To **start all services** (database, backend, gateway, frontend) in the background:

```bash
scripts/start-all.sh
```

To **stop all services** and the database container:

```bash
scripts/stop-all.sh
```

- Logs are stored in `scripts/.logs/`
- PID files are stored in `scripts/.run/`

---

### Manual Run (Step-by-Step)

#### 1. Start Docker and PostgreSQL

```bash
sudo systemctl start docker
docker run --name libdb -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=library -p 5432:5432 -d postgres:16

# If already created:
docker start libdb
# For normal schema:
docker exec -i libdb psql -U postgres -d library < db/schema.sql
# For test/sample data (recommended for development/testing):
# docker exec -i libdb psql -U postgres -d library < db/test_schema.sql
```

#### 2. Check the Database

```bash
docker exec -it libdb psql -U postgres -d library
docker exec -i libdb psql -U postgres -d library -c "SELECT * FROM books;"
```

#### 3. Backend (Python gRPC)

```bash
cd backend
# (Recommended) Create and activate a Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Compile proto files
python3 -m grpc_tools.protoc -I . --python_out=app --grpc_python_out=app ./proto/library.proto

# Run the server
cd app
python3 server.py
```

#### 4. API Gateway (Node.js)

```bash
cd gateway
# Install required packages (if not already in package.json)
npm install express cors @grpc/grpc-js @grpc/proto-loader
node index.js
```

#### 5. Frontend (React)

```bash
cd frontend
# Install required packages (if not already in package.json)
npm install react react-dom axios
npm install --save-dev vite
npm run dev
```

---

## Logs & Runtime Files

- **Logs:** All service logs are stored in `scripts/.logs/`
- **PID files:** All process IDs are stored in `scripts/.run/`
- Both directories are excluded from git via `.gitignore`

---

## Database Management

- The database is managed via Docker (`libdb` container).
- Schema is automatically applied on startup via `start-all.sh`.
- To manually apply schema:

    ```bash
    # For normal schema:
    docker exec -i libdb psql -U postgres -d library < db/schema.sql
    # For test/sample data (recommended for development/testing):
    docker exec -i libdb psql -U postgres -d library < db/test_schema.sql
    ```

---

## Clean Up

To stop and remove the database container:

```bash
docker stop libdb
docker rm libdb
```

To remove all logs and runtime files (optional):

```bash
rm -rf .logs/ .run/
```

---

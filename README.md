# FixPoint Backend

This README covers how to run the project, bring up the dependent services with Docker Compose, test that everything works, and example login details for management services.

## Requirements

- Node 18+ (or any Node compatible with dependencies)
- Docker & Docker Compose (for running PostgreSQL, MinIO, and pgAdmin)
- Git (optional)

## Quick start (recommended)

1. Copy the example environment variables into a `.env` file at the project root (create if missing):

```env
# Server
PORT=5000

# Postgres
POSTGRES_USER=fixpoint
POSTGRES_DB=fixpointdb
POSTGRES_PASSWORD=fixpointpass
POSTGRES_PORT=5432

# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9001

# pgAdmin (optional)
PGADMIN_DEFAULT_EMAIL=admin@fixpoint.local
PGADMIN_DEFAULT_PASSWORD=admin
PGADMIN_PORT=8080
```

2. Start required services with Docker Compose (from project root):

**Basic services only:**
```bash
docker compose up -d
```

**With pgAdmin (database management UI):**
```bash
docker compose --profile dev-tools up -d
```

This will start:
- PostgreSQL on host port 5432
- MinIO (object storage) on host port 9000
- MinIO Console on host port 9001
- pgAdmin on host port 8080 (only with dev-tools profile)

3. Install Node dependencies and run the server locally:

```bash
npm install
npm run start
```

Or for development with auto-restart:

```bash
npm run dev
```

The server default route is: `http://localhost:5000/api/`.

## Database Setup & Seeding

If you are running the project for the first time or need to reset your database, follow these steps:

1. **Run Migrations**: Create the necessary tables in the database.
   ```bash
   npm run db:migrate
   ```

2. **Seed Data**: Populate the database with demo users and branches.
   ```bash
   npm run db:seed
   ```

**To reset the entire database (Undo all migrations, remigrate, and re-seed):**
```bash
npm run db:reset
```

## Health endpoints

The project exposes health endpoints mounted under `/api/health`:

- `GET /api/health` — overall health (checks DB + storage)
- `GET /api/health/database` — database health
- `GET /api/health/storage` — MinIO storage health
- `GET /api/health/ready` — readiness probe
- `GET /api/health/live` — liveness probe

## Testing the API

**Using curl (command line):**
```bash
# Test main endpoint
curl http://localhost:5000/api/

# Test health endpoints
curl http://localhost:5000/api/health
curl http://localhost:5000/api/health/database
curl http://localhost:5000/api/health/storage
curl http://localhost:5000/api/health/ready
curl http://localhost:5000/api/health/live
```

**Using web browser:**
- Open http://localhost:5000/api/ in your browser
- Try the health endpoints: http://localhost:5000/api/health

**Using API testing tools:**
- **Postman**: Import endpoints and test with a GUI
- **Insomnia**: REST client with JSON formatting
- **Thunder Client**: VS Code extension for API testing
- **HTTPie**: Modern command-line HTTP client (`http localhost:5000/api/health`)

## Service credentials / login details

Defaults shown above match the `docker-compose.yml` environment placeholders. If you used the `.env` example, use these credentials:

- PostgreSQL (connect via tool like psql or pgAdmin):
  - Host: fixpoint_db
  - Port: 5432
  - User: fixpoint
  - Password: fixpointpass
  - Database: fixpointdb

- MinIO (S3 compatible):
  - Endpoint: http://localhost:9000
  - Access Key: minioadmin
  - Secret Key: minioadmin
  - Console: http://localhost:9001 (web UI)

- pgAdmin (optional):
  - URL: http://localhost:8080
  - Email: admin@example.com
  - Password: admin

## Running tests

This project includes Jest and Supertest for tests. To run tests:

```bash
npm test
```

If your tests require the database or MinIO, make sure Docker Compose services are up first (`docker compose up -d`).

## Troubleshooting

- DB connection errors: ensure port 5432, user fixpoint, database fixpointdb, and password fixpointpass in `.env` match the Docker Compose or external DB settings.
- MinIO connection errors: ensure MinIO is reachable at localhost:9000 and credentials minioadmin/minioadmin are set.
- Ports already in use: change the host ports in your `.env` to unused ports and restart Docker Compose.

## Quick verification checklist

1. Docker containers running:

```bash
docker ps --filter "name=fixpoint_"
```

2. Server process started and listening:

```bash
ss -ltnp | grep node
```

3. Health endpoint returns 200 when services are up:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5000/api/
```

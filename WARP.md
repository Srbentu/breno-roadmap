# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Next.js 13 portfolio/learning project that combines a React-based frontend with Three.js visualizations and a PostgreSQL-backed API. The project uses pnpm as its package manager and Docker for local database services.

## Common Commands

### Development

```bash
pnpm run dev
# Starts: Docker services → waits for Postgres → runs migrations → starts Next.js dev server
```

### Database Management

```bash
pnpm run services:up         # Start Docker Postgres container
pnpm run services:down       # Stop and remove Docker containers
pnpm run services:stop       # Stop Docker containers without removing
pnpm run migration:create    # Create a new migration file
pnpm run migration:up        # Run pending migrations
pnpm run wait-for-postgres   # Wait for Postgres to be ready
```

### Testing

```bash
pnpm test              # Run all integration tests (starts services + Next.js + Jest)
pnpm test:watch        # Run tests in watch mode
```

### Code Quality

```bash
pnpm run lint:check    # Check code formatting with Prettier
pnpm run lint:fix      # Auto-fix code formatting with Prettier
```

### Running Individual Tests

```bash
# Run a specific test file
pnpm run services:up && npx jest tests/integration/api/v1/status/get.test.js --runInBand

# Run tests matching a pattern
pnpm run services:up && npx jest --testPathPattern=migrations --runInBand
```

## Architecture

### Project Structure

- **pages/** - Next.js pages directory (both UI pages and API routes)
  - **api/v1/** - API endpoints (status, migrations)
  - Various Three.js visualization pages (galaxy, particles, shadows, etc.)
- **infra/** - Infrastructure code
  - **database.js** - PostgreSQL client wrapper with query and connection methods
  - **migrations/** - Database migration files (using node-pg-migrate)
  - **scripts/** - Utility scripts like wait-for-postgres.js
  - **compose.yaml** - Docker Compose configuration for local Postgres
- **tests/** - Integration tests organized by API route structure
  - **integration/api/v1/orchestrator.js** - Test utility that waits for services to be ready
- **styles/** - Global SCSS styles (includes reset.scss)
- **public/** - Static assets (textures, gradients for Three.js)
- **models/** - (Currently empty, likely for future data models)

### Database Layer

The database abstraction is minimal but effective:

- **infra/database.js** exports a default object with `query()` and `getNewClient()` methods
- Connection config is pulled from environment variables (POSTGRES_HOST, POSTGRES_PORT, etc.)
- SSL is automatically enabled for neon.tech hosts
- Each query creates a new client connection that's properly cleaned up

Import pattern used throughout:

```javascript
import database from "infra/database";
```

### API Architecture

API routes follow Next.js conventions under pages/api/v1/:

- **status** - Health check endpoint that queries database version, max connections, and active connections
- **migrations** - Supports GET (view pending migrations) and POST (run migrations) using node-pg-migrate

All API endpoints use the shared database module from infra/database.js.

### Migration System

Uses node-pg-migrate with configuration:

- Migration files stored in infra/migrations/
- Environment loaded from .env.development
- Migrations table name: "pgmigrations"
- Can be run via npm script or through the /api/v1/migrations POST endpoint

### Testing Approach

Integration tests follow this pattern:

1. Tests are in tests/integration/ mirroring the API structure
2. orchestrator.js utility waits for web server to be ready before tests run
3. Tests use `beforeAll(async () => await orchestrator.waitForAllServices())`
4. Jest config sets 60-second timeout and loads .env.development
5. All tests run with `--runInBand` flag (sequential execution)

### Frontend Architecture

This is a Next.js 13 app using Pages Router (not App Router):

- \_app.js loads global SCSS reset
- Heavy use of Three.js for 3D visualizations
- GSAP for animations (scroll-based transitions)
- Each page is self-contained with its own Three.js scene setup
- No global state management library

### Environment Configuration

Local development uses .env.development with these variables:

- POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_DB, POSTGRES_PASSWORD
- DATABASE_URL constructed from the above

The Docker Compose file (infra/compose.yaml) uses the same .env.development file.

### Key Dependencies

- **Next.js 13.1.6** - React framework
- **React 18.2.0** - UI library
- **Three.js** - 3D graphics
- **GSAP** - Animation library
- **node-pg-migrate** - Database migrations
- **pg** - PostgreSQL client
- **Jest 29** - Testing framework
- **Prettier** - Code formatter

### Module Resolution

jsconfig.json sets baseUrl to "." which means absolute imports work from the project root:

```javascript
import database from "infra/database"; // Not "../../../infra/database"
```

## Development Workflow

1. Start with `pnpm run dev` which orchestrates the full stack
2. Docker Postgres starts automatically (postgres-dev container)
3. Wait script polls until Postgres accepts connections
4. Migrations run automatically
5. Next.js dev server starts on port 3000

When making database changes:

1. Create migration: `pnpm run migration:create <name>`
2. Edit the generated file in infra/migrations/
3. Run migration: `pnpm run migration:up`
4. Or use the API: POST to /api/v1/migrations

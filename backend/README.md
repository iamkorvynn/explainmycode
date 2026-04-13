# ExplainMyCode Backend

FastAPI backend for the ExplainMyCode frontend.

## Features

- JWT auth with signup, login, refresh, logout, forgot/reset password
- persisted workspaces and file tree
- code execution abstraction with OneCompiler, Compiler.io, and Judge0
- AI mentor endpoints for comments, summary, explanation, bugs, assumptions, on-track status, and mentor chat
- analysis dashboard payload generation
- visualization trace endpoints
- SQLite by default for quick local setup, PostgreSQL-ready through environment config

## Quick Start

1. Create a virtual environment.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Copy env file:

```bash
cp .env.example .env
```

4. Run migrations:

```bash
alembic upgrade head
```

5. Run the API:

```bash
uvicorn app.main:app --reload
```

The API will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

## Demo Credentials

- Username: `demo`
- Password: `demo12345`

## Important Environment Variables

- `ENVIRONMENT=development|production`
- `DATABASE_URL`
- `SECRET_KEY`
- `FRONTEND_BASE_URL`
- `BACKEND_BASE_URL`
- `LLM_MODE=mock|live` where production must use `live`
- `GROQ_API_KEY`
- `CLAUDE_API_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `ONECOMPILER_BASE_URL`
- `ONECOMPILER_API_KEY`
- `COMPILER_IO_BASE_URL`
- `COMPILER_IO_API_KEY`
- `JUDGE0_BASE_URL`
- `JUDGE0_API_KEY`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`

## Production Notes

- Production no longer falls back to mock AI or mock code execution.
- Production password reset requires real SMTP configuration.
- Before launch, configure at least one live AI provider and at least one live execution provider.

## Local Frontend Integration

Use these base URLs from the frontend:

- API base: `http://localhost:8000/api/v1`
- Docs: `http://localhost:8000/docs`

## Running Tests

```bash
pytest
```

## Migrations

```bash
alembic upgrade head
```

## Docker

The backend image now runs Alembic automatically on startup through `docker-entrypoint.sh`.

For backend-only infrastructure:

```bash
docker compose up --build
```

For the full production-style stack, use the root-level deployment flow described in the main README.

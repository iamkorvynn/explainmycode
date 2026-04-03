# ExplainMyCode

ExplainMyCode is a full-stack coding workspace with authentication, persistent workspaces, code execution, AI explanations, dashboard analysis, and algorithm visualization.

## Local Development

1. Install frontend dependencies:

```bash
npm install
```

2. Install backend dependencies:

```bash
python -m pip install -r backend/requirements.txt
```

3. Copy env files:

```bash
copy .env.example .env
copy backend\.env.example backend\.env
```

4. Start the full stack:

```bash
npm run dev
```

This starts:

- frontend on `http://127.0.0.1:5173`
- backend on `http://127.0.0.1:8000`
- backend docs on `http://127.0.0.1:8000/docs`

`npm run dev:backend` now applies Alembic migrations before the API starts, so local startup stays aligned with production.

## Deploy With Docker

1. Copy the production env templates:

```bash
copy .env.production.example .env.production
copy backend\.env.production.example backend\.env.production
```

2. Edit `backend/.env.production` with your real values.

3. Build and start the production stack:

```bash
npm run docker:up
```

This starts:

- frontend on `http://localhost:8080`
- backend on `http://localhost:8000`
- backend docs proxied through the frontend container on `http://localhost:8080/docs`

To stop it:

```bash
npm run docker:down
```

## Useful Scripts

- `npm run dev`: start frontend and backend together
- `npm run dev:frontend`: start only the Vite frontend
- `npm run dev:backend`: run migrations and start only the FastAPI backend
- `npm run build`: build the frontend
- `npm run test:backend`: run backend tests
- `npm run docker:up`: build and run the production Docker stack
- `npm run docker:down`: stop the production Docker stack

## Demo Login

- Username: `demo`
- Password: `demo12345`

The demo account is intended for local development only. Production envs should keep `SEED_DEMO_DATA=false`.

## Deployment Guide

The detailed deploy checklist, required third-party services, and post-deploy verification steps are in [DEPLOYMENT.md](DEPLOYMENT.md).

## OAuth Providers

Google and GitHub OAuth are now supported. They stay hidden in the UI until you set the related backend env values:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `BACKEND_BASE_URL`
- `FRONTEND_BASE_URL`

Provider-specific setup steps are documented in [DEPLOYMENT.md](DEPLOYMENT.md).

## Vercel Frontend

If you deploy the frontend on Vercel:

- set the Vercel build command to `npm run build`
- set the output directory to `dist`
- set the Vercel environment variable `VITE_API_BASE_URL` to your backend API URL, for example `https://your-backend-domain.com/api/v1`

This repo now includes [vercel.json](vercel.json) so React Router paths like `/oauth/callback`, `/reset-password`, `/ide`, and `/analysis` rewrite correctly to the SPA entrypoint.

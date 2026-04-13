# Deployment Guide

## What Is Already Done In Code

- FastAPI startup no longer creates tables implicitly. Local and container startup now use Alembic migrations.
- The backend has health and readiness endpoints at `/api/v1/health` and `/api/v1/health/ready`.
- Password reset is now complete end to end:
  - backend reset token generation
  - SMTP email sending when configured
  - reset link generation using `FRONTEND_BASE_URL`
  - frontend `/reset-password` page
- Login and signup no longer show social login buttons unless a real provider is enabled and exposes an auth URL.
- Frontend builds are split into smaller chunks to reduce the main bundle size.
- Docker assets were added for:
  - backend image
  - frontend nginx image
  - full-stack `docker-compose.deploy.yml`

## Recommended Production Topology

Use the split deploy that is already represented in this repo:

- Vercel for the Vite SPA
- Render for the Dockerized FastAPI API
- Render Postgres for the primary database
- Render Key Value for shared rate limiting and future background jobs

The checked-in `render.yaml` now provisions:

- `explainmycode-api` as a Docker web service
- `explainmycode-db` as managed Postgres
- `explainmycode-cache` as managed Key Value with internal-only access

It also pins these production behaviors:

- `RUN_DB_MIGRATIONS=true`
- `SEED_DEMO_DATA=false`
- `LLM_MODE=live`
- `EXECUTION_PROVIDER_ORDER=judge0,onecompiler,compiler-io`
- `ONECOMPILER_API_KEY` and `COMPILER_IO_API_KEY` set blank unless you intentionally re-enable them
- production no longer falls back to mock AI, mock execution, or logged password-reset links

## Render Backend Setup

1. Create the Render Blueprint from [render.yaml](render.yaml).
2. In Render, fill the secret backend env vars for `explainmycode-api`:

- `SECRET_KEY`
- `CORS_ORIGINS`
- `FRONTEND_BASE_URL`
- `BACKEND_BASE_URL`
- `GROQ_API_KEY`
- `CLAUDE_API_KEY` if you want a second LLM fallback
- `JUDGE0_BASE_URL`
- `JUDGE0_API_KEY`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `EMAIL_FROM`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

3. Keep one stable backend URL for OAuth and one stable frontend URL for CORS and reset links.
4. Confirm the deployed API responds on:

- `/api/v1/health`
- `/api/v1/health/ready`

## Vercel Frontend Setup

Deploy the repo root as a Vite project on Vercel and set:

- build command: `npm run build`
- output directory: `dist`
- production env: `VITE_API_BASE_URL=https://your-backend-domain.com/api/v1`

Then mirror that same stable frontend URL into the backend:

- `FRONTEND_BASE_URL=https://your-frontend-domain.com`
- `CORS_ORIGINS=https://your-frontend-domain.com`

Do not use temporary preview URLs for OAuth or reset-link setup. Use one stable production URL, especially because GitHub OAuth Apps support a single callback URL.

## Optional Docker Validation

For a final local production rehearsal before going live:

1. Copy the production env templates:

```bash
copy .env.production.example .env.production
copy backend\.env.production.example backend\.env.production
```

2. Edit `backend/.env.production` with your real or staging values.
3. Start the full production stack:

```bash
npm run docker:up
```

4. Verify:

- frontend: `http://localhost:8080`
- proxied backend docs: `http://localhost:8080/docs`
- direct backend health: `http://localhost:8000/api/v1/health`
- readiness: `http://localhost:8000/api/v1/health/ready`

## CI Release Gate

The repo now includes GitHub Actions CI in `.github/workflows/ci.yml`. Every PR and every push to `main` should pass:

- `npm run build`
- `python -m pytest tests -q` in `backend`

## Launch Smoke Test

Run this exact checklist against the production URLs before launch:

1. Sign up a fresh account.
2. Log in and open the IDE.
3. Create a workspace or file, refresh the page, and confirm persistence.
4. Run code and confirm the response provider is `judge0`, not `mock-judge0`.
5. Open the mentor, dashboard, and visualization flows and confirm their provider labels are live, not `mock`.
6. Request a password reset and confirm the email link lands on `/reset-password`.
7. Complete both Google and GitHub OAuth sign-in flows.
8. Check `/api/v1/health` and `/api/v1/health/ready` after the deploy finishes.
9. Launch only after one clean end-to-end pass on the final domains.

## OAuth Setup

### Google

Create a Google OAuth client for a web application and add this authorized redirect URI:

- `{BACKEND_BASE_URL}/api/v1/auth/oauth/callback/google`

Example:

- `http://127.0.0.1:8000/api/v1/auth/oauth/callback/google` for local development
- `https://your-api-domain.com/api/v1/auth/oauth/callback/google` for production

### GitHub

Create a GitHub OAuth App and set:

- Homepage URL: `{FRONTEND_BASE_URL}`
- Authorization callback URL: `{BACKEND_BASE_URL}/api/v1/auth/oauth/callback/github`

Example:

- `http://127.0.0.1:8000/api/v1/auth/oauth/callback/github` for local development
- `https://your-api-domain.com/api/v1/auth/oauth/callback/github` for production

Once those values are in `backend/.env` or `backend/.env.production`, the Google and GitHub buttons appear automatically on the login and signup screens.

## Production Provider Requirements

Production now expects real services:

- AI mentor, dashboard, and generation features require `LLM_MODE=live` plus at least one live provider key such as `GROQ_API_KEY` or `CLAUDE_API_KEY`
- code execution requires at least one live execution provider such as `JUDGE0_BASE_URL` or `ONECOMPILER_API_KEY`
- password reset email requires SMTP configuration

If those are missing, the affected routes return service-unavailable errors instead of mock output.

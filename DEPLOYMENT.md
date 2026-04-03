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

## What You Need To Do

You still need to provide real infrastructure and secrets. These cannot be safely guessed inside the repo.

1. Create the production env files:

```bash
copy .env.production.example .env.production
copy backend\.env.production.example backend\.env.production
```

2. Edit `backend/.env.production` and set:

- `SECRET_KEY`: a long random secret
- `DATABASE_URL`: your real PostgreSQL connection string
- `CORS_ORIGINS`: your real frontend origin
- `FRONTEND_BASE_URL`: your real frontend public URL
- `BACKEND_BASE_URL`: your real backend public URL used for OAuth callbacks
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM`: for password reset emails
- `GROQ_API_KEY` and/or `CLAUDE_API_KEY`: if you want live AI instead of heuristic fallback
- `JUDGE0_BASE_URL` and `JUDGE0_API_KEY`: if you want real remote code execution instead of the safe mock fallback
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: if you want Google login
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`: if you want GitHub login

3. Decide whether you want demo data in production.

- Recommended: keep `SEED_DEMO_DATA=false`
- Only set it to `true` for private staging/demo environments

4. Start the deployment stack:

```bash
npm run docker:up
```

5. Verify these URLs:

- frontend: `http://localhost:8080`
- proxied backend docs: `http://localhost:8080/docs`
- direct backend health: `http://localhost:8000/api/v1/health`
- readiness: `http://localhost:8000/api/v1/health/ready`

## Recommended Real-World Production Setup

- Frontend container behind HTTPS on your public domain
- Backend container on a private network
- Managed PostgreSQL
- Redis for shared rate limiting and future background jobs
- SMTP or transactional email provider
- Optional Groq or Claude keys for live mentor responses
- Optional Judge0 service for live code execution

## Vercel Frontend Setup

If you deploy the frontend to Vercel, use your stable production Vercel URL or your custom domain as the frontend public URL.

Example:

- `https://your-project.vercel.app`

Then configure:

- Vercel env: `VITE_API_BASE_URL=https://your-backend-domain.com/api/v1`
- backend env: `FRONTEND_BASE_URL=https://your-project.vercel.app`
- backend env: `CORS_ORIGINS=https://your-project.vercel.app`

Do not use temporary preview URLs for OAuth provider setup. Use one stable production URL, especially because GitHub OAuth Apps support a single callback URL.

## Post-Deploy Smoke Test

After deploy, test these flows in order:

1. Sign up a fresh account.
2. Log in and open the IDE.
3. Create a file and confirm autosave works.
4. Run code and confirm whether the response comes from `judge0` or `mock-judge0`.
5. Open the mentor tabs and confirm provider labels match your configuration.
6. Request a password reset and confirm the email link lands on `/reset-password`.
7. Open the dashboard and visualization views.

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

## Current Fallback Behavior

If you do not configure external providers yet, the app still works, but with intentional fallbacks:

- AI mentor: heuristic/mock responses for several analysis endpoints
- code execution: mock Judge0 mode
- password reset: link is logged when SMTP is not configured

That makes the app deployable immediately, while still letting you switch each capability to a real provider by filling in env values.

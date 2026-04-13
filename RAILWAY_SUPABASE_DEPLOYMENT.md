# Railway + Supabase + Upstash Deployment

This guide deploys the existing app without changing application code:

- Frontend: Vercel
- Backend: Railway
- Database: Supabase Postgres
- Redis: Upstash Redis

Important defaults:

- Supabase is used as Postgres only in this pass.
- The existing FastAPI auth system stays in place.
- Production should run with `LLM_MODE=live` and real provider keys before launch.

## Files To Use

These local env templates were created in `C:\Users\numaa\Downloads\`:

- `C:\Users\numaa\Downloads\ExplainMyCode-Railway.env`
- `C:\Users\numaa\Downloads\ExplainMyCode-Vercel.env`

## Railway Backend Variables

Paste the contents of `ExplainMyCode-Railway.env` into Railway's `RAW Editor` and then replace the placeholders:

- `REPLACE_WITH_A_LONG_RANDOM_SECRET`
- `YOUR_VERCEL_DOMAIN`
- `YOUR_RAILWAY_DOMAIN`
- `[YOUR-PASSWORD]`
- `YOUR_UPSTASH_REDIS_PASSWORD`
- `YOUR_UPSTASH_REDIS_ENDPOINT`
- `YOUR_UPSTASH_REDIS_PORT`

Project-specific values already filled in:

- Supabase session pooler host: `aws-1-us-east-2.pooler.supabase.com`
- Supabase database: `postgres`
- Supabase user: `postgres.mtbuxmmhdvqkygkldvhu`
- Upstash REST reference values are stored in the file for convenience

Recommended production defaults:

- Keep `LLM_MODE=live`
- Add at least one real AI provider key before launch
- Add at least one real execution provider before launch
- Add SMTP before enabling password-reset email in production
- Leave OAuth variables blank until you explicitly enable them

## Step-By-Step Deployment

1. Push this repo to GitHub.
2. Create a Supabase project.
3. In Supabase, open `Connect` and copy the `Session pooler` connection string on port `5432`.
4. Convert the scheme to `postgresql+psycopg://` before using it in `DATABASE_URL`.
5. Put the raw password in the password position only. Do not wrap it in square brackets or quotes.
6. If your database password contains special characters, URL-encode it before inserting it into the connection string.
7. Create an Upstash Redis database.
8. In Upstash, open `Connect Your Client` and copy the Redis client connection details: `Endpoint`, `Port`, and `Password`.
9. Build `REDIS_URL` in this format:
   - `rediss://:PASSWORD@ENDPOINT:PORT`
10. Put that value into `REDIS_URL`.
11. In Railway, create a new project from the GitHub repo.
12. Open the backend service settings and set `Root Directory` to `backend`.
13. In Railway networking, generate a public domain.
14. Put that Railway domain into:
    - `BACKEND_BASE_URL=https://YOUR_RAILWAY_DOMAIN`
    - `C:\Users\numaa\Downloads\ExplainMyCode-Vercel.env` as `VITE_API_BASE_URL=https://YOUR_RAILWAY_DOMAIN/api/v1`
15. In Railway service settings, set the healthcheck path to `/api/v1/health/ready`.
16. In Railway `Variables`, open the `RAW Editor` and paste `ExplainMyCode-Railway.env`.
17. Deploy the Railway service.
18. Verify:
    - `https://YOUR_RAILWAY_DOMAIN/api/v1/health`
    - `https://YOUR_RAILWAY_DOMAIN/api/v1/health/ready`
19. In Vercel, import the same GitHub repo from the repo root.
20. Confirm these Vercel settings:
    - Build Command: `npm run build`
    - Output Directory: `dist`
21. Add the contents of `ExplainMyCode-Vercel.env` to Vercel.
22. Deploy the frontend.
23. Copy the final Vercel production domain.
24. Update Railway variables:
    - `CORS_ORIGINS=https://YOUR_VERCEL_DOMAIN`
    - `FRONTEND_BASE_URL=https://YOUR_VERCEL_DOMAIN`
25. Redeploy Railway one more time.
26. If you later enable OAuth, use these callback URLs:
    - Google: `https://YOUR_RAILWAY_DOMAIN/api/v1/auth/oauth/callback/google`
    - GitHub: `https://YOUR_RAILWAY_DOMAIN/api/v1/auth/oauth/callback/github`

## Smoke Test

Run this against the live Vercel URL:

1. Sign up and log in.
2. Open the IDE.
3. Create a workspace or file.
4. Refresh and confirm the file tree persists.
5. Run code and confirm a live execution provider responds.
6. Open mentor, dashboard, and visualization pages and confirm live providers respond.
7. Test password reset only after SMTP is configured.
8. If OAuth is configured, test both callback flows.

## Notes

- The current backend already uses `psycopg`, so `postgresql+psycopg://` is the correct SQLAlchemy URL scheme.
- Production no longer falls back to mock AI, mock execution, or logged password-reset links.
- Upstash `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are for the REST API. This backend uses `redis-py`, so it needs the Redis client connection details instead.
- The backend already exposes the readiness endpoint used by Railway:
  - `/api/v1/health/ready`
- Production validation in the app already rejects unsafe settings such as SQLite, the default secret key, and demo seed data.

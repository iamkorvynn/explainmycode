#!/bin/sh
set -eu

if [ "${RUN_DB_MIGRATIONS:-true}" = "true" ]; then
  echo "Running database migrations..."
  alembic upgrade head
fi

if [ "$#" -eq 0 ]; then
  set -- uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
fi

exec "$@"

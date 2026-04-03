from collections import defaultdict, deque
from time import time

from fastapi import HTTPException, Request, status
from redis import Redis
from redis.exceptions import RedisError

from app.core.config import settings

_buckets: dict[str, deque[float]] = defaultdict(deque)
_redis_client = Redis.from_url(settings.redis_url, decode_responses=True) if settings.redis_url else None


def _request_identity(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "unknown"


def redis_available() -> bool:
    if _redis_client is None:
        return False
    try:
        return bool(_redis_client.ping())
    except RedisError:
        return False


def _check_redis_limit(key: str, limit: int, window_seconds: int) -> bool | None:
    if _redis_client is None:
        return None
    try:
        current = _redis_client.incr(key)
        if current == 1:
            _redis_client.expire(key, window_seconds)
        return current > limit
    except RedisError:
        return None


def rate_limit(limit: int, window_seconds: int):
    def dependency(request: Request) -> None:
        identity = _request_identity(request)
        redis_key = f"rate-limit:{request.url.path}:{identity}"
        redis_limited = _check_redis_limit(redis_key, limit, window_seconds)
        if redis_limited is True:
            raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Rate limit exceeded")
        if redis_limited is False:
            return

        now = time()
        bucket = _buckets[f"{identity}:{request.url.path}"]
        while bucket and now - bucket[0] > window_seconds:
            bucket.popleft()
        if len(bucket) >= limit:
            raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Rate limit exceeded")
        bucket.append(now)

    return dependency

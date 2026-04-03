from datetime import UTC, datetime, timedelta
from hashlib import sha256
from uuid import uuid4

import bcrypt
from jose import JWTError, jwt

from app.core.config import settings
from app.core.exceptions import AppException

ALGORITHM = "HS256"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def create_token(subject: str, token_type: str, expires_delta: timedelta) -> str:
    now = datetime.now(UTC)
    payload = {
        "sub": subject,
        "type": token_type,
        "jti": str(uuid4()),
        "iat": int(now.timestamp()),
        "exp": int((now + expires_delta).timestamp()),
    }
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def create_access_token(subject: str) -> str:
    return create_token(subject, "access", timedelta(minutes=settings.access_token_expire_minutes))


def create_refresh_token(subject: str, remember_me: bool) -> str:
    days = settings.remember_refresh_token_expire_days if remember_me else settings.refresh_token_expire_days
    return create_token(subject, "refresh", timedelta(days=days))


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
    except JWTError as exc:
        raise AppException("Invalid token", code="invalid_token", status_code=401) from exc


def token_hash(token: str) -> str:
    return sha256(token.encode("utf-8")).hexdigest()

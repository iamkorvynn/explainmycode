import json
import secrets
from datetime import UTC, datetime, timedelta
from urllib.parse import quote
from uuid import uuid4

from fastapi import status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import AppException
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    token_hash,
    verify_password,
)
from app.integrations.email import EmailClient
from app.integrations.oauth import OAuthClient, OAuthIdentity
from app.models.user import User
from app.repositories.user import UserRepository


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.users = UserRepository(db)
        self.email_client = EmailClient()
        self.oauth_client = OAuthClient()

    def signup(self, username: str, email: str, password: str, confirm_password: str, phone: str | None = None) -> dict:
        if password != confirm_password:
            raise AppException("Passwords do not match", code="password_mismatch")
        if self.users.get_by_username(username):
            raise AppException("Username is already in use", code="username_taken")
        if self.users.get_by_email(email):
            raise AppException("Email is already in use", code="email_taken")

        user = self.users.create(
            username=username,
            email=email,
            phone=phone,
            hashed_password=get_password_hash(password),
        )
        self.db.commit()
        self.db.refresh(user)
        return self._issue_tokens(user, remember_me=True)

    def login(self, username: str, password: str, remember_me: bool) -> dict:
        user = self.users.get_by_username_or_email(username)
        if user is None or not verify_password(password, user.hashed_password):
            raise AppException("Invalid credentials", status_code=status.HTTP_401_UNAUTHORIZED, code="invalid_credentials")
        return self._issue_tokens(user, remember_me=remember_me)

    def refresh(self, refresh_token: str) -> dict:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise AppException("Invalid refresh token", status_code=401, code="invalid_refresh_token")

        session = self.users.get_session_by_hash(token_hash(refresh_token))
        if session is None or session.revoked_at is not None or self._is_expired(session.expires_at):
            raise AppException("Refresh session expired", status_code=401, code="expired_refresh_token")

        user = self.users.get_by_id(payload["sub"])
        if user is None:
            raise AppException("User not found", status_code=404, code="user_not_found")

        session.revoked_at = datetime.now(UTC)
        self.db.flush()
        tokens = self._issue_tokens(user, remember_me=session.remember_me)
        self.db.commit()
        return tokens

    def logout(self, refresh_token: str) -> None:
        session = self.users.get_session_by_hash(token_hash(refresh_token))
        if session:
            session.revoked_at = datetime.now(UTC)
            self.db.commit()

    def forgot_password(self, email: str) -> str:
        user = self.users.get_by_email(email)
        if user is None:
            return "If that email exists, a reset link has been sent."

        raw_token = str(uuid4())
        self.users.create_password_reset_token(
            user_id=user.id,
            token_hash=token_hash(raw_token),
            expires_at=datetime.now(UTC) + timedelta(hours=1),
        )
        self.db.commit()
        self.email_client.send_password_reset(email, raw_token)
        return "If that email exists, a reset link has been sent."

    def reset_password(self, reset_token: str, new_password: str, confirm_password: str) -> None:
        if new_password != confirm_password:
            raise AppException("Passwords do not match", code="password_mismatch")

        token_record = self.users.get_password_reset_by_hash(token_hash(reset_token))
        if token_record is None or token_record.used_at is not None or self._is_expired(token_record.expires_at):
            raise AppException("Reset token is invalid or expired", status_code=400, code="invalid_reset_token")

        token_record.user.hashed_password = get_password_hash(new_password)
        token_record.used_at = datetime.now(UTC)
        self.db.commit()

    def get_oauth_providers(self) -> list[dict]:
        return self.oauth_client.provider_metadata()

    def oauth_identity_to_tokens(self, identity: OAuthIdentity) -> dict:
        account = self.users.get_oauth_account(identity.provider, identity.provider_user_id)
        if account is not None:
            user = account.user
            if identity.full_name and not user.full_name:
                user.full_name = identity.full_name
            if identity.email and user.email != identity.email:
                user.email = identity.email
            if account.provider_email != identity.email:
                account.provider_email = identity.email
            self.db.commit()
            self.db.refresh(user)
            return self._issue_tokens(user, remember_me=True)

        user = self.users.get_by_email(identity.email)
        if user is None:
            user = self.users.create(
                username=self._next_available_username(identity.username_hint or identity.email.split("@", 1)[0]),
                email=identity.email,
                full_name=identity.full_name,
                hashed_password=get_password_hash(secrets.token_urlsafe(32)),
            )

        self.users.create_oauth_account(
            user_id=user.id,
            provider=identity.provider,
            provider_user_id=identity.provider_user_id,
            provider_email=identity.email,
        )
        self.db.commit()
        self.db.refresh(user)
        return self._issue_tokens(user, remember_me=True)

    @staticmethod
    def build_frontend_oauth_redirect(tokens: dict, provider: str) -> str:
        user_payload = {
            "id": tokens["user"].id,
            "username": tokens["user"].username,
            "email": tokens["user"].email,
            "phone": tokens["user"].phone,
            "full_name": tokens["user"].full_name,
            "is_active": tokens["user"].is_active,
        }
        return (
            f"{settings.frontend_base_url.rstrip('/')}/oauth/callback#"
            f"access_token={quote(tokens['access_token'])}&"
            f"refresh_token={quote(tokens['refresh_token'])}&"
            f"user={quote(json.dumps(user_payload))}&"
            f"provider={quote(provider)}"
        )

    @staticmethod
    def build_frontend_oauth_error_redirect(message: str) -> str:
        return f"{settings.frontend_base_url.rstrip('/')}/oauth/callback#error={quote(message)}"

    def _issue_tokens(self, user: User, remember_me: bool) -> dict:
        access_token = create_access_token(user.id)
        refresh_token = create_refresh_token(user.id, remember_me=remember_me)
        days = settings.remember_refresh_token_expire_days if remember_me else settings.refresh_token_expire_days
        self.users.create_session(
            user_id=user.id,
            token_hash=token_hash(refresh_token),
            expires_at=datetime.now(UTC) + timedelta(days=days),
            remember_me=remember_me,
        )
        self.db.commit()
        self.db.refresh(user)
        return {"access_token": access_token, "refresh_token": refresh_token, "user": user}

    @staticmethod
    def _is_expired(timestamp: datetime) -> bool:
        normalized = timestamp if timestamp.tzinfo is not None else timestamp.replace(tzinfo=UTC)
        return normalized <= datetime.now(UTC)

    def _next_available_username(self, raw_username: str) -> str:
        base = self._slugify_username(raw_username)
        candidate = base
        suffix = 1
        while self.users.get_by_username(candidate):
            suffix += 1
            candidate = f"{base}{suffix}"
        return candidate

    @staticmethod
    def _slugify_username(raw_username: str) -> str:
        normalized = "".join(ch.lower() if ch.isalnum() else "_" for ch in raw_username).strip("_")
        normalized = "_".join(part for part in normalized.split("_") if part)
        if len(normalized) < 3:
            normalized = f"user_{normalized}" if normalized else "user"
        return normalized[:50]

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.oauth_account import OAuthAccount
from app.models.password_reset import PasswordResetToken
from app.models.session import RefreshSession
from app.models.user import User


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: str) -> User | None:
        return self.db.get(User, user_id)

    def get_by_username_or_email(self, value: str) -> User | None:
        stmt = select(User).where(or_(User.username == value, User.email == value))
        return self.db.scalar(stmt)

    def get_by_email(self, email: str) -> User | None:
        stmt = select(User).where(User.email == email)
        return self.db.scalar(stmt)

    def get_by_username(self, username: str) -> User | None:
        stmt = select(User).where(User.username == username)
        return self.db.scalar(stmt)

    def create(self, **kwargs) -> User:
        user = User(**kwargs)
        self.db.add(user)
        self.db.flush()
        return user

    def get_oauth_account(self, provider: str, provider_user_id: str) -> OAuthAccount | None:
        stmt = select(OAuthAccount).where(
            OAuthAccount.provider == provider,
            OAuthAccount.provider_user_id == provider_user_id,
        )
        return self.db.scalar(stmt)

    def create_oauth_account(self, **kwargs) -> OAuthAccount:
        account = OAuthAccount(**kwargs)
        self.db.add(account)
        self.db.flush()
        return account

    def create_session(self, **kwargs) -> RefreshSession:
        session = RefreshSession(**kwargs)
        self.db.add(session)
        self.db.flush()
        return session

    def get_session_by_hash(self, hashed_token: str) -> RefreshSession | None:
        stmt = select(RefreshSession).where(RefreshSession.token_hash == hashed_token)
        return self.db.scalar(stmt)

    def create_password_reset_token(self, **kwargs) -> PasswordResetToken:
        token = PasswordResetToken(**kwargs)
        self.db.add(token)
        self.db.flush()
        return token

    def get_password_reset_by_hash(self, hashed_token: str) -> PasswordResetToken | None:
        stmt = select(PasswordResetToken).where(PasswordResetToken.token_hash == hashed_token)
        return self.db.scalar(stmt)

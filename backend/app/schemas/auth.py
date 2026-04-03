from pydantic import BaseModel, EmailStr, Field

from app.schemas.common import APIModel
from app.schemas.user import UserResponse


class SignupRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    phone: str | None = None
    password: str = Field(min_length=8, max_length=128)
    confirm_password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    username: str
    password: str
    remember_me: bool = True


class TokenResponse(APIModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class RefreshRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)
    confirm_password: str = Field(min_length=8, max_length=128)


class OAuthProviderResponse(APIModel):
    provider: str
    enabled: bool
    auth_url: str | None = None

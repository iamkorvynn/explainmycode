from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.config import settings
from app.core.rate_limit import rate_limit
from app.models.user import User
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    OAuthProviderResponse,
    RefreshRequest,
    ResetPasswordRequest,
    SignupRequest,
    TokenResponse,
)
from app.schemas.common import MessageResponse
from app.schemas.user import UserResponse
from app.services.auth import AuthService

router = APIRouter()
OAUTH_STATE_COOKIE = "explainmycode.oauth.state"
OAUTH_PKCE_COOKIE = "explainmycode.oauth.pkce"


@router.post("/signup", response_model=TokenResponse, dependencies=[Depends(rate_limit(10, 60))])
def signup(payload: SignupRequest, db: Session = Depends(get_db)) -> TokenResponse:
    service = AuthService(db)
    tokens = service.signup(payload.username, payload.email, payload.password, payload.confirm_password, payload.phone)
    return TokenResponse(access_token=tokens["access_token"], refresh_token=tokens["refresh_token"], user=tokens["user"])


@router.post("/login", response_model=TokenResponse, dependencies=[Depends(rate_limit(20, 60))])
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    service = AuthService(db)
    tokens = service.login(payload.username, payload.password, payload.remember_me)
    return TokenResponse(access_token=tokens["access_token"], refresh_token=tokens["refresh_token"], user=tokens["user"])


@router.post("/refresh", response_model=TokenResponse)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)) -> TokenResponse:
    service = AuthService(db)
    tokens = service.refresh(payload.refresh_token)
    return TokenResponse(access_token=tokens["access_token"], refresh_token=tokens["refresh_token"], user=tokens["user"])


@router.post("/logout", response_model=MessageResponse)
def logout(payload: RefreshRequest, db: Session = Depends(get_db)) -> MessageResponse:
    AuthService(db).logout(payload.refresh_token)
    return MessageResponse(message="Logged out successfully")


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)) -> MessageResponse:
    message = AuthService(db).forgot_password(payload.email)
    return MessageResponse(message=message)


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)) -> MessageResponse:
    AuthService(db).reset_password(payload.token, payload.new_password, payload.confirm_password)
    return MessageResponse(message="Password updated successfully")


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse.model_validate(current_user)


@router.get("/oauth/providers", response_model=list[OAuthProviderResponse])
def oauth_providers(db: Session = Depends(get_db)) -> list[OAuthProviderResponse]:
    providers = AuthService(db).get_oauth_providers()
    return [OAuthProviderResponse(**provider) for provider in providers]


@router.get("/oauth/start/{provider}")
def oauth_start(provider: str, request: Request, db: Session = Depends(get_db)) -> RedirectResponse:
    service = AuthService(db)
    oauth_client = service.oauth_client
    state = oauth_client.generate_state_token()
    code_verifier = oauth_client.generate_code_verifier() if provider == "google" else None
    authorization_url = oauth_client.start_authorization(provider, state, code_verifier)

    response = RedirectResponse(url=authorization_url, status_code=302)
    secure_cookie = settings.is_production or request.url.scheme == "https"
    response.set_cookie(
        OAUTH_STATE_COOKIE,
        value=f"{provider}:{state}",
        httponly=True,
        secure=secure_cookie,
        samesite="lax",
        max_age=600,
    )
    if code_verifier:
        response.set_cookie(
            OAUTH_PKCE_COOKIE,
            value=code_verifier,
            httponly=True,
            secure=secure_cookie,
            samesite="lax",
            max_age=600,
        )
    return response


@router.get("/oauth/callback/{provider}")
def oauth_callback(
    provider: str,
    request: Request,
    code: str | None = Query(default=None),
    state: str | None = Query(default=None),
    error: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> RedirectResponse:
    service = AuthService(db)

    if error:
        return RedirectResponse(service.build_frontend_oauth_error_redirect(error), status_code=302)

    stored_state = request.cookies.get(OAUTH_STATE_COOKIE)
    code_verifier = request.cookies.get(OAUTH_PKCE_COOKIE)
    if not code or not state or not stored_state or stored_state != f"{provider}:{state}":
        response = RedirectResponse(
            service.build_frontend_oauth_error_redirect("OAuth validation failed. Please try again."),
            status_code=302,
        )
        response.delete_cookie(OAUTH_STATE_COOKIE)
        response.delete_cookie(OAUTH_PKCE_COOKIE)
        return response

    try:
        identity = service.oauth_client.exchange_code_for_identity(provider, code, code_verifier)
        tokens = service.oauth_identity_to_tokens(identity)
        redirect_url = service.build_frontend_oauth_redirect(tokens, provider)
    except Exception as exc:
        message = getattr(exc, "message", None) or "OAuth login failed. Please try again."
        redirect_url = service.build_frontend_oauth_error_redirect(message)

    response = RedirectResponse(redirect_url, status_code=302)
    response.delete_cookie(OAUTH_STATE_COOKIE)
    response.delete_cookie(OAUTH_PKCE_COOKIE)
    return response

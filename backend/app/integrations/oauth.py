import base64
import hashlib
import secrets
from dataclasses import dataclass
from functools import lru_cache
from urllib.parse import urlencode

import httpx

from app.core.config import settings
from app.core.exceptions import AppException


@dataclass
class OAuthIdentity:
    provider: str
    provider_user_id: str
    email: str
    full_name: str | None = None
    username_hint: str | None = None
    avatar_url: str | None = None


class OAuthClient:
    _GOOGLE_DISCOVERY_URL = "https://accounts.google.com/.well-known/openid-configuration"
    _GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize"
    _GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
    _GITHUB_USER_URL = "https://api.github.com/user"
    _GITHUB_EMAILS_URL = "https://api.github.com/user/emails"

    def provider_metadata(self) -> list[dict]:
        return [
            self._provider_metadata("google"),
            self._provider_metadata("github"),
        ]

    def start_authorization(self, provider: str, state: str, code_verifier: str | None = None) -> str:
        if provider == "google":
            return self._build_google_auth_url(state, code_verifier)
        if provider == "github":
            return self._build_github_auth_url(state)
        raise AppException("Unsupported OAuth provider", status_code=404, code="oauth_provider_not_found")

    def exchange_code_for_identity(self, provider: str, code: str, code_verifier: str | None = None) -> OAuthIdentity:
        if provider == "google":
            return self._google_identity_from_code(code, code_verifier)
        if provider == "github":
            return self._github_identity_from_code(code)
        raise AppException("Unsupported OAuth provider", status_code=404, code="oauth_provider_not_found")

    def is_enabled(self, provider: str) -> bool:
        if provider == "google":
            return bool(settings.google_client_id and settings.google_client_secret)
        if provider == "github":
            return bool(settings.github_client_id and settings.github_client_secret)
        return False

    def generate_state_token(self) -> str:
        return secrets.token_urlsafe(32)

    def generate_code_verifier(self) -> str:
        return secrets.token_urlsafe(64)

    def create_pkce_challenge(self, code_verifier: str) -> str:
        digest = hashlib.sha256(code_verifier.encode("utf-8")).digest()
        return base64.urlsafe_b64encode(digest).decode("utf-8").rstrip("=")

    def _provider_metadata(self, provider: str) -> dict:
        enabled = self.is_enabled(provider)
        base_url = f"{settings.backend_base_url.rstrip('/')}{settings.api_v1_prefix}/auth/oauth/start/{provider}"
        return {
            "provider": provider,
            "enabled": enabled,
            "auth_url": base_url if enabled else None,
        }

    def _build_google_auth_url(self, state: str, code_verifier: str | None) -> str:
        if not self.is_enabled("google"):
            raise AppException("Google OAuth is not configured", status_code=400, code="oauth_provider_disabled")
        discovery = self._google_discovery_document()
        params = {
            "client_id": settings.google_client_id,
            "redirect_uri": self._callback_url("google"),
            "response_type": "code",
            "scope": "openid email profile",
            "state": state,
            "access_type": "offline",
            "include_granted_scopes": "true",
            "prompt": "select_account",
        }
        if code_verifier:
            params["code_challenge"] = self.create_pkce_challenge(code_verifier)
            params["code_challenge_method"] = "S256"
        return f"{discovery['authorization_endpoint']}?{urlencode(params)}"

    def _build_github_auth_url(self, state: str) -> str:
        if not self.is_enabled("github"):
            raise AppException("GitHub OAuth is not configured", status_code=400, code="oauth_provider_disabled")
        params = {
            "client_id": settings.github_client_id,
            "redirect_uri": self._callback_url("github"),
            "scope": "read:user user:email",
            "state": state,
        }
        return f"{self._GITHUB_AUTHORIZE_URL}?{urlencode(params)}"

    def _google_identity_from_code(self, code: str, code_verifier: str | None) -> OAuthIdentity:
        discovery = self._google_discovery_document()
        data = {
            "code": code,
            "client_id": settings.google_client_id,
            "client_secret": settings.google_client_secret,
            "redirect_uri": self._callback_url("google"),
            "grant_type": "authorization_code",
        }
        if code_verifier:
            data["code_verifier"] = code_verifier

        with httpx.Client(timeout=20.0) as client:
            token_response = client.post(discovery["token_endpoint"], data=data)
            token_response.raise_for_status()
            token_payload = token_response.json()

            userinfo_response = client.get(
                discovery["userinfo_endpoint"],
                headers={"Authorization": f"Bearer {token_payload['access_token']}"},
            )
            userinfo_response.raise_for_status()
            userinfo = userinfo_response.json()

        email = userinfo.get("email")
        if not email:
            raise AppException("Google account did not return an email address", status_code=400, code="oauth_email_missing")

        return OAuthIdentity(
            provider="google",
            provider_user_id=str(userinfo["sub"]),
            email=email,
            full_name=userinfo.get("name"),
            username_hint=userinfo.get("given_name") or email.split("@", 1)[0],
            avatar_url=userinfo.get("picture"),
        )

    def _github_identity_from_code(self, code: str) -> OAuthIdentity:
        with httpx.Client(timeout=20.0) as client:
            token_response = client.post(
                self._GITHUB_TOKEN_URL,
                headers={"Accept": "application/json"},
                data={
                    "client_id": settings.github_client_id,
                    "client_secret": settings.github_client_secret,
                    "code": code,
                    "redirect_uri": self._callback_url("github"),
                },
            )
            token_response.raise_for_status()
            token_payload = token_response.json()
            access_token = token_payload.get("access_token")
            if not access_token:
                raise AppException("GitHub OAuth did not return an access token", status_code=400, code="oauth_token_exchange_failed")

            headers = {
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
            }
            user_response = client.get(self._GITHUB_USER_URL, headers=headers)
            user_response.raise_for_status()
            userinfo = user_response.json()

            email = userinfo.get("email")
            if not email:
                emails_response = client.get(self._GITHUB_EMAILS_URL, headers=headers)
                emails_response.raise_for_status()
                email = self._select_github_email(emails_response.json())

        if not email:
            raise AppException("GitHub account did not return a usable email address", status_code=400, code="oauth_email_missing")

        return OAuthIdentity(
            provider="github",
            provider_user_id=str(userinfo["id"]),
            email=email,
            full_name=userinfo.get("name"),
            username_hint=userinfo.get("login") or email.split("@", 1)[0],
            avatar_url=userinfo.get("avatar_url"),
        )

    def _google_discovery_document(self) -> dict:
        return _google_discovery_document()

    def _callback_url(self, provider: str) -> str:
        return f"{settings.backend_base_url.rstrip('/')}{settings.api_v1_prefix}/auth/oauth/callback/{provider}"

    @staticmethod
    def _select_github_email(emails: list[dict]) -> str | None:
        verified = [item for item in emails if item.get("verified")]
        primary_verified = next((item for item in verified if item.get("primary")), None)
        if primary_verified:
            return primary_verified.get("email")
        if verified:
            return verified[0].get("email")
        return None


@lru_cache(maxsize=1)
def _google_discovery_document() -> dict:
    with httpx.Client(timeout=20.0) as client:
        response = client.get(OAuthClient._GOOGLE_DISCOVERY_URL)
        response.raise_for_status()
        return response.json()

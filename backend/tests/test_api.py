from app.core.config import settings


def signup_and_login(client):
    response = client.post(
        "/api/v1/auth/signup",
        json={
            "username": "alice",
            "email": "alice@example.com",
            "password": "strongpass123",
            "confirm_password": "strongpass123",
        },
    )
    assert response.status_code == 200, response.text
    return response.json()


def test_health(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_auth_me_flow(client):
    payload = signup_and_login(client)
    me = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {payload['access_token']}"},
    )
    assert me.status_code == 200
    assert me.json()["username"] == "alice"


def test_forgot_and_reset_password_flow(client, monkeypatch):
    captured: dict[str, str] = {}

    def capture_reset_token(_, recipient: str, reset_token: str):
        captured["recipient"] = recipient
        captured["token"] = reset_token

    monkeypatch.setattr("app.integrations.email.EmailClient.send_password_reset", capture_reset_token)

    signup_and_login(client)

    forgot = client.post(
        "/api/v1/auth/forgot-password",
        json={"email": "alice@example.com"},
    )
    assert forgot.status_code == 200
    assert captured["recipient"] == "alice@example.com"

    reset = client.post(
        "/api/v1/auth/reset-password",
        json={
            "token": captured["token"],
            "new_password": "newstrongpass123",
            "confirm_password": "newstrongpass123",
        },
    )
    assert reset.status_code == 200

    login = client.post(
        "/api/v1/auth/login",
        json={
            "username": "alice",
            "password": "newstrongpass123",
            "remember_me": True,
        },
    )
    assert login.status_code == 200


def test_oauth_provider_metadata_and_error_redirect(client, monkeypatch):
    monkeypatch.setattr(settings, "google_client_id", "google-client")
    monkeypatch.setattr(settings, "google_client_secret", "google-secret")
    monkeypatch.setattr(settings, "github_client_id", "")
    monkeypatch.setattr(settings, "github_client_secret", "")

    providers = client.get("/api/v1/auth/oauth/providers")
    assert providers.status_code == 200
    payload = {item["provider"]: item for item in providers.json()}
    assert payload["google"]["enabled"] is True
    assert payload["google"]["auth_url"].endswith("/api/v1/auth/oauth/start/google")
    assert payload["github"]["enabled"] is False
    assert payload["github"]["auth_url"] is None

    callback = client.get("/api/v1/auth/oauth/callback/google?error=access_denied", follow_redirects=False)
    assert callback.status_code == 302
    assert "/oauth/callback#error=access_denied" in callback.headers["location"]


def test_workspace_mentor_and_analysis_flow(client):
    payload = signup_and_login(client)
    headers = {"Authorization": f"Bearer {payload['access_token']}"}

    workspace = client.post(
        "/api/v1/workspaces",
        json={"name": "Algorithms", "description": "My code"},
        headers=headers,
    )
    assert workspace.status_code == 200, workspace.text
    workspace_id = workspace.json()["id"]

    tree = client.get(f"/api/v1/workspaces/{workspace_id}/tree", headers=headers)
    assert tree.status_code == 200
    root_folder_id = tree.json()["nodes"][0]["id"]

    create_file = client.post(
        f"/api/v1/workspaces/{workspace_id}/files",
        json={
            "parent_id": root_folder_id,
            "name": "main.py",
            "type": "file",
            "language": "python",
            "content": "def binary_search(arr, target):\n    return -1\n",
        },
        headers=headers,
    )
    assert create_file.status_code == 200, create_file.text

    summary = client.post(
        "/api/v1/mentor/summary",
        json={"code": "def binary_search(arr, target):\n    return -1\n", "language": "python"},
        headers=headers,
    )
    assert summary.status_code == 200
    assert "binary search" in summary.json()["summary"].lower()

    dashboard = client.post(
        "/api/v1/analysis/dashboard",
        json={"code": "def binary_search(arr, target):\n    return -1\n", "language": "python"},
        headers=headers,
    )
    assert dashboard.status_code == 200
    assert dashboard.json()["metrics"]["functions"] == 1

from uuid import uuid4

from app.core.config import settings


def signup_and_login(client):
    identifier = uuid4().hex[:8]
    response = client.post(
        "/api/v1/auth/signup",
        json={
            "username": f"alice_{identifier}",
            "email": f"alice_{identifier}@example.com",
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
    assert response.json()["database"] == "ok"


def test_auth_me_flow(client):
    payload = signup_and_login(client)
    me = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {payload['access_token']}"},
    )
    assert me.status_code == 200
    assert me.json()["username"] == payload["user"]["username"]


def test_forgot_and_reset_password_flow(client, monkeypatch):
    captured: dict[str, str] = {}

    def capture_reset_token(_, recipient: str, reset_token: str):
        captured["recipient"] = recipient
        captured["token"] = reset_token

    monkeypatch.setattr("app.integrations.email.EmailClient.send_password_reset", capture_reset_token)

    payload = signup_and_login(client)

    forgot = client.post(
        "/api/v1/auth/forgot-password",
        json={"email": payload["user"]["email"]},
    )
    assert forgot.status_code == 200
    assert captured["recipient"] == payload["user"]["email"]

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
            "username": payload["user"]["username"],
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


def test_visualization_library_and_generation_flow(client):
    payload = signup_and_login(client)
    headers = {"Authorization": f"Bearer {payload['access_token']}"}

    library = client.get("/api/v1/visualizations", headers=headers)
    assert library.status_code == 200
    assert any(item["id"] == "merge-sort" for item in library.json())

    template = client.get("/api/v1/visualizations/binary-search", headers=headers)
    assert template.status_code == 200
    assert template.json()["source"] == "template"
    assert template.json()["visualization_type"] == "array"

    generated_from_code = client.post(
        "/api/v1/visualizations/generate",
        json={
            "code": "def binary_search(arr, target):\n    left = 0\n    right = len(arr) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        return mid\n",
            "language": "python",
        },
        headers=headers,
    )
    assert generated_from_code.status_code == 200
    generated_payload = generated_from_code.json()
    assert generated_payload["source"] == "generated"
    assert generated_payload["title"] == "Binary Search"
    assert generated_payload["steps"]

    generated_from_prompt = client.post(
        "/api/v1/visualizations/generate",
        json={
            "algorithm_name": "Dijkstra shortest path",
            "prompt": "Show the main phases for finding the shortest route from a start node to all other nodes.",
            "language": "python",
        },
        headers=headers,
    )
    assert generated_from_prompt.status_code == 200
    prompt_payload = generated_from_prompt.json()
    assert prompt_payload["source"] == "generated"
    assert "Dijkstra" in prompt_payload["title"]
    assert prompt_payload["steps"][0]["label"] == "Define the goal"


def test_execution_prefers_onecompiler_when_configured(client, monkeypatch):
    payload = signup_and_login(client)
    headers = {"Authorization": f"Bearer {payload['access_token']}"}

    monkeypatch.setattr(settings, "onecompiler_api_key", "onecompiler-key")

    def fake_onecompiler_run(self, source_code: str, language: str, stdin: str | None = None):
        assert language == "python"
        return {
            "stdout": "hello from onecompiler\n",
            "stderr": None,
            "compile_output": None,
            "execution_time_ms": 41,
            "memory_kb": 12345,
            "exit_status": "success",
            "provider_job_id": None,
            "provider": "onecompiler",
        }

    def fail_compiler_io(*args, **kwargs):
        raise AssertionError("Compiler.io should not be called when OneCompiler succeeds.")

    def fail_judge0(*args, **kwargs):
        raise AssertionError("Judge0 should not be called when OneCompiler succeeds.")

    monkeypatch.setattr("app.integrations.onecompiler.OneCompilerClient.run_code", fake_onecompiler_run)
    monkeypatch.setattr("app.integrations.compiler_io.CompilerIOClient.run_code", fail_compiler_io)
    monkeypatch.setattr("app.integrations.judge0.Judge0Client.run_code", fail_judge0)

    response = client.post(
        "/api/v1/execution/run",
        json={"source_code": 'print("hello")', "language": "python"},
        headers=headers,
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["provider"] == "onecompiler"
    assert payload["stdout"] == "hello from onecompiler\n"
    assert payload["exit_status"] == "success"


def test_live_ai_routes_use_provider_payloads(client, monkeypatch):
    payload = signup_and_login(client)
    headers = {"Authorization": f"Bearer {payload['access_token']}"}
    code = "def binary_search(arr, target):\n    mid = len(arr) // 2\n    return arr[mid]\n"

    def fake_generate_json(_, *, preferred: str, system_prompt: str, user_prompt: str):
        if "Task: live_comments" in user_prompt:
            return {"comments": [{"line": 2, "comment": "Computes the midpoint before reading the array.", "type": "important"}]}, "groq"
        if "Task: summary" in user_prompt:
            return {"summary": "Live summary from the provider."}, "claude"
        if "Task: explanation" in user_prompt:
            return {
                "sections": [{"title": "Core Logic", "start_line": 1, "end_line": 3, "summary": "Defines and uses the midpoint."}],
                "full_explanation": "Live explanation from the provider.",
            }, "claude"
        if "Task: line_explanation" in user_prompt:
            return {
                "line_number": 2,
                "explanation": "This line finds the middle position in the list.",
                "related_lines": [1, 3],
            }, "groq"
        if "Task: bugs" in user_prompt:
            return {
                "bugs": [
                    {
                        "title": "Missing bounds check",
                        "line": 3,
                        "severity": "medium",
                        "category": "logic",
                        "description": "The code assumes the list is not empty before reading arr[mid].",
                        "fix_suggestion": "Return early when the input list is empty.",
                    }
                ]
            }, "claude"
        if "Task: assumptions" in user_prompt:
            return {
                "assumptions": [
                    {
                        "title": "Array is not empty",
                        "category": "input",
                        "description": "The code assumes there is at least one element before reading the midpoint.",
                    }
                ]
            }, "claude"
        if "Task: on_track" in user_prompt:
            return {
                "type": "warning",
                "message": "One risky edge case still needs attention.",
                "details": "Guard the empty-array path before shipping.",
            }, "groq"
        if "Task: chat" in user_prompt:
            return {
                "answer": "The code can fail on an empty list because arr[mid] becomes unsafe.",
                "citations": [{"label": "Line 3", "line": 3, "reason": "This line reads the midpoint without an empty-check."}],
                "follow_ups": ["Ask how to guard empty input"],
            }, "claude"
        if "Task: dashboard" in user_prompt:
            return {
                "summary": {
                    "primary_language": "Python",
                    "code_style": "Compact Python with a missing guard clause.",
                    "documentation_status": "Needs Improvement",
                },
                "detected_algorithms": [
                    {
                        "name": "Binary Search",
                        "complexity": "O(log n)",
                        "type": "Divide and Conquer",
                        "confidence": 0.97,
                    }
                ],
                "complexity": {"time": "O(log n)", "space": "O(1)"},
                "suggestions": [
                    {
                        "type": "best-practice",
                        "priority": "high",
                        "title": "Add an empty-input guard",
                        "description": "Prevent midpoint access when the array has no elements.",
                    }
                ],
            }, "claude"
        if "Task: visualization" in user_prompt:
            return {
                "algorithm": "binary-search",
                "title": "Binary Search",
                "description": "Live visualization from the provider.",
                "visualization_type": "array",
                "steps": [
                    {
                        "index": 0,
                        "label": "Pick the midpoint",
                        "narration": "The midpoint becomes the next comparison target.",
                        "state": {
                            "variables": [{"name": "mid", "value": "2"}],
                            "collections": [
                                {
                                    "label": "Sorted Array",
                                    "layout": "array",
                                    "items": [
                                        {"label": "0", "value": "1", "status": "dimmed"},
                                        {"label": "1", "value": "3", "status": "boundary"},
                                        {"label": "2", "value": "5", "status": "active"},
                                    ],
                                }
                            ],
                        },
                    }
                ],
            }, "claude"
        raise AssertionError(f"Unexpected prompt: {user_prompt[:80]}")

    monkeypatch.setattr("app.services.live_llm.LiveLLMClient.generate_json", fake_generate_json)

    live_comments = client.post("/api/v1/mentor/live-comments", json={"code": code, "language": "python"}, headers=headers)
    assert live_comments.status_code == 200
    assert live_comments.json()["provider"] == "groq"
    assert live_comments.json()["comments"][0]["line"] == 2

    summary = client.post("/api/v1/mentor/summary", json={"code": code, "language": "python"}, headers=headers)
    assert summary.status_code == 200
    assert summary.json()["provider"] == "claude"
    assert summary.json()["summary"] == "Live summary from the provider."

    explanation = client.post("/api/v1/mentor/explanation", json={"code": code, "language": "python"}, headers=headers)
    assert explanation.status_code == 200
    assert explanation.json()["provider"] == "claude"
    assert explanation.json()["sections"][0]["title"] == "Core Logic"

    line_explanation = client.post(
        "/api/v1/mentor/line-explanation",
        json={"code": code, "language": "python", "line_number": 2},
        headers=headers,
    )
    assert line_explanation.status_code == 200
    assert line_explanation.json()["provider"] == "groq"
    assert line_explanation.json()["related_lines"] == [1, 3]

    bugs = client.post("/api/v1/mentor/bugs", json={"code": code, "language": "python"}, headers=headers)
    assert bugs.status_code == 200
    assert bugs.json()["provider"] == "claude"
    assert bugs.json()["bugs"][0]["title"] == "Missing bounds check"

    assumptions = client.post("/api/v1/mentor/assumptions", json={"code": code, "language": "python"}, headers=headers)
    assert assumptions.status_code == 200
    assert assumptions.json()["provider"] == "claude"
    assert assumptions.json()["assumptions"][0]["title"] == "Array is not empty"

    on_track = client.post("/api/v1/mentor/on-track", json={"code": code, "language": "python"}, headers=headers)
    assert on_track.status_code == 200
    assert on_track.json()["provider"] == "groq"
    assert on_track.json()["type"] == "warning"

    chat = client.post(
        "/api/v1/mentor/chat",
        json={"code": code, "language": "python", "message": "What can fail here?", "history": []},
        headers=headers,
    )
    assert chat.status_code == 200
    assert chat.json()["provider"] == "claude"
    assert chat.json()["citations"][0]["line"] == 3

    dashboard = client.post("/api/v1/analysis/dashboard", json={"code": code, "language": "python"}, headers=headers)
    assert dashboard.status_code == 200
    assert dashboard.json()["provider"] == "claude"
    assert dashboard.json()["suggestions"][0]["title"] == "Add an empty-input guard"

    visualization = client.post(
        "/api/v1/visualizations/generate",
        json={"code": code, "language": "python"},
        headers=headers,
    )
    assert visualization.status_code == 200
    assert visualization.json()["provider"] == "claude"
    assert visualization.json()["steps"][0]["label"] == "Pick the midpoint"


def test_live_ai_requires_configured_provider_in_production(client, monkeypatch):
    payload = signup_and_login(client)
    headers = {"Authorization": f"Bearer {payload['access_token']}"}

    monkeypatch.setattr(settings, "environment", "production")
    monkeypatch.setattr(settings, "llm_mode", "live")
    monkeypatch.setattr(settings, "groq_api_key", "")
    monkeypatch.setattr(settings, "claude_api_key", "")

    response = client.post(
        "/api/v1/mentor/summary",
        json={"code": "print('hello')", "language": "python"},
        headers=headers,
    )
    assert response.status_code == 503
    assert response.json()["code"] == "live_ai_unavailable"


def test_forgot_password_requires_smtp_in_production(client, monkeypatch):
    payload = signup_and_login(client)

    monkeypatch.setattr(settings, "environment", "production")
    monkeypatch.setattr(settings, "smtp_host", "")

    response = client.post(
        "/api/v1/auth/forgot-password",
        json={"email": payload["user"]["email"]},
    )
    assert response.status_code == 503
    assert response.json()["code"] == "email_service_unavailable"

from app.core.config import settings


def signup_and_login(client):
    response = client.post(
        "/api/v1/auth/signup",
        json={
            "username": "provider-user",
            "email": "provider-user@example.com",
            "password": "strongpass123",
            "confirm_password": "strongpass123",
        },
    )
    assert response.status_code == 200, response.text
    return response.json()


def test_execution_prefers_judge0_when_provider_order_prioritizes_it(client, monkeypatch):
    payload = signup_and_login(client)
    headers = {"Authorization": f"Bearer {payload['access_token']}"}

    monkeypatch.setattr(settings, "execution_provider_order", ["judge0", "onecompiler", "compiler-io"])
    monkeypatch.setattr(settings, "judge0_base_url", "https://judge0.example.com")
    monkeypatch.setattr(settings, "onecompiler_api_key", "onecompiler-key")
    monkeypatch.setattr(settings, "compiler_io_api_key", "compiler-io-key")

    def fake_judge0_run(self, source_code: str, language: str, stdin: str | None = None):
        assert language == "python"
        return {
            "stdout": "hello from judge0\n",
            "stderr": None,
            "compile_output": None,
            "execution_time_ms": 18,
            "memory_kb": 4096,
            "exit_status": "completed",
            "provider_job_id": "job-123",
            "provider": "judge0",
        }

    def fail_onecompiler(*args, **kwargs):
        raise AssertionError("OneCompiler should not run when Judge0 succeeds first.")

    def fail_compiler_io(*args, **kwargs):
        raise AssertionError("Compiler.io should not run when Judge0 succeeds first.")

    monkeypatch.setattr("app.integrations.judge0.Judge0Client.run_live_code", fake_judge0_run)
    monkeypatch.setattr("app.integrations.onecompiler.OneCompilerClient.run_code", fail_onecompiler)
    monkeypatch.setattr("app.integrations.compiler_io.CompilerIOClient.run_code", fail_compiler_io)

    response = client.post(
        "/api/v1/execution/run",
        json={"source_code": 'print("hello")', "language": "python"},
        headers=headers,
    )
    assert response.status_code == 200
    body = response.json()
    assert body["provider"] == "judge0"
    assert body["stdout"] == "hello from judge0\n"


def test_execution_falls_back_to_next_live_provider_before_mock(client, monkeypatch):
    payload = signup_and_login(client)
    headers = {"Authorization": f"Bearer {payload['access_token']}"}

    monkeypatch.setattr(settings, "execution_provider_order", ["judge0", "onecompiler", "compiler-io"])
    monkeypatch.setattr(settings, "judge0_base_url", "https://judge0.example.com")
    monkeypatch.setattr(settings, "onecompiler_api_key", "onecompiler-key")

    def unavailable_judge0(self, source_code: str, language: str, stdin: str | None = None):
        return None

    def fake_onecompiler_run(self, source_code: str, language: str, stdin: str | None = None):
        return {
            "stdout": "fallback from onecompiler\n",
            "stderr": None,
            "compile_output": None,
            "execution_time_ms": 41,
            "memory_kb": 12345,
            "exit_status": "success",
            "provider_job_id": None,
            "provider": "onecompiler",
        }

    def fail_mock(*args, **kwargs):
        raise AssertionError("Mock Judge0 should not run when another live provider succeeds.")

    monkeypatch.setattr("app.integrations.judge0.Judge0Client.run_live_code", unavailable_judge0)
    monkeypatch.setattr("app.integrations.onecompiler.OneCompilerClient.run_code", fake_onecompiler_run)
    monkeypatch.setattr("app.integrations.judge0.Judge0Client.run_mock", fail_mock)

    response = client.post(
        "/api/v1/execution/run",
        json={"source_code": 'print("hello")', "language": "python"},
        headers=headers,
    )
    assert response.status_code == 200
    body = response.json()
    assert body["provider"] == "onecompiler"
    assert body["stdout"] == "fallback from onecompiler\n"

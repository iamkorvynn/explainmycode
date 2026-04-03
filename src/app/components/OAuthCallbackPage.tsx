import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { saveSession, type User } from "../lib/api";

export function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Completing sign-in...");
  const [error, setError] = useState("");

  useEffect(() => {
    const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "";
    const params = new URLSearchParams(hash);

    const oauthError = params.get("error");
    if (oauthError) {
      setError(oauthError);
      setMessage("");
      return;
    }

    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const userRaw = params.get("user");

    if (!accessToken || !refreshToken || !userRaw) {
      setError("OAuth sign-in did not return a complete session. Please try again.");
      setMessage("");
      return;
    }

    try {
      const user = JSON.parse(userRaw) as User;
      saveSession({ accessToken, refreshToken, user });
      navigate("/ide", { replace: true });
    } catch {
      setError("OAuth sign-in returned invalid session data. Please try again.");
      setMessage("");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-xl rounded-[24px] border border-white/15 bg-white/5 backdrop-blur-xl px-8 py-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <h1 className="text-[32px] font-semibold mb-4">OAuth Sign-In</h1>
        {message ? <p className="text-white/80 text-[16px]">{message}</p> : null}
        {error ? (
          <>
            <p className="text-[#fecaca] text-[16px] mb-6">{error}</p>
            <button
              type="button"
              onClick={() => navigate("/login", { replace: true })}
              className="rounded-[12px] px-5 py-3 text-[16px] font-medium text-white"
              style={{
                backgroundImage:
                  "linear-gradient(94.117deg, rgb(98, 142, 255) 9.9097%, rgb(135, 64, 205) 53.286%, rgb(88, 4, 117) 91.559%)",
              }}
            >
              Back to login
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

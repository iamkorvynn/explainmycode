import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

import { saveSession, type User } from "../lib/api";

export function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Completing authentication...");
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
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6 font-sans relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#eca8d6]/[0.03] rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#09090b] shadow-[0_25px_80px_rgba(0,0,0,0.85)] px-8 py-10 text-center relative z-10"
      >
        <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-[#eca8d6] mx-auto mb-4">
          <Sparkles className="w-5 h-5" />
        </div>
        <h1 className="text-2xl font-serif text-white mb-2">OAuth Authorization</h1>
        {message ? (
          <div className="flex items-center justify-center gap-2 text-white/60 text-xs font-mono py-4">
            <div className="w-3.5 h-3.5 border-2 border-[#eca8d6]/30 border-t-[#eca8d6] rounded-full animate-spin" />
            <span>{message}</span>
          </div>
        ) : null}
        {error ? (
          <div className="space-y-4 pt-2">
            <p className="text-red-300 text-xs bg-red-950/30 border border-red-500/30 rounded-xl p-3">{error}</p>
            <button
              type="button"
              onClick={() => navigate("/login", { replace: true })}
              className="rounded-full px-6 py-2.5 text-xs font-semibold bg-white text-black hover:bg-white/90 transition-all cursor-pointer"
            >
              Back to login
            </button>
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Sparkles, ArrowLeft, Lock, User, Eye, EyeOff, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ApiError, listOAuthProviders, type OAuthProvider } from "../lib/api";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [oauthProviders, setOauthProviders] = useState<OAuthProvider[]>([]);

  useEffect(() => {
    let active = true;

    async function loadOAuthProviders() {
      try {
        const providers = await listOAuthProviders();
        if (active) {
          setOauthProviders(providers.filter((provider) => provider.enabled && provider.auth_url));
        }
      } catch {
        if (active) {
          setOauthProviders([]);
        }
      }
    }

    loadOAuthProviders();
    return () => {
      active = false;
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await login({ username, password, rememberMe });
      navigate("/ide");
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Unable to log in right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-black flex items-center justify-center p-4 sm:p-6 select-none font-sans relative overflow-hidden text-white">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#eca8d6]/[0.03] rounded-full blur-[140px] pointer-events-none" />

      {/* Floating Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md rounded-[28px] bg-[#09090b] border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.85)] p-8 sm:p-10 flex flex-col justify-between"
      >
        <div>
          {/* Header & Back Link */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 text-xs font-mono text-white/50 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#eca8d6]/10 text-[#eca8d6] border border-[#eca8d6]/20 uppercase">
              STUDIO ACCESS
            </span>
          </div>

          {/* Logo & Welcome */}
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-[#eca8d6] shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="text-3xl font-serif text-white tracking-wide">
              Welcome Back
            </h1>
          </div>
          <p className="text-xs text-white/50 mb-6 font-sans">
            Log in to access your compiler sandboxes, AI Mentor, and saved workspaces.
          </p>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-medium text-white/70 mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="demo or your username"
                  required
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#eca8d6]/60 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono font-medium text-white/70">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-[11px] font-mono text-[#eca8d6] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-11 pl-10 pr-10 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#eca8d6]/60 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-black accent-[#eca8d6] cursor-pointer"
              />
              <label htmlFor="remember" className="text-xs text-white/60 cursor-pointer">
                Remember me on this browser
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-full bg-white hover:bg-white/90 text-black font-semibold text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-2 mt-4 active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              <span>{isSubmitting ? "Logging in..." : "Log In to Studio"}</span>
            </button>
          </form>

          {/* OAuth Providers */}
          {oauthProviders.length > 0 && (
            <div className="mt-6 pt-5 border-t border-white/10">
              <div className="text-[11px] font-mono text-center text-white/40 mb-3">
                Or continue with
              </div>
              <div className="space-y-2">
                {oauthProviders.map((provider) => (
                  <a
                    key={provider.name}
                    href={provider.auth_url}
                    className="w-full h-10 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-xs font-medium text-white flex items-center justify-center gap-2 transition-all shadow-xs"
                  >
                    <span>Continue with {provider.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Signup Link */}
        <div className="pt-6 mt-6 border-t border-white/10 text-center text-xs text-white/50">
          Don&apos;t have an account?{" "}
          <button
            onClick={() => navigate("/signup")}
            className="text-white font-semibold hover:underline cursor-pointer ml-1"
          >
            Create account
          </button>
        </div>
      </motion.div>
    </div>
  );
}

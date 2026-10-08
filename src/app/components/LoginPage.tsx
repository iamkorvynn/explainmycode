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
    <div className="min-h-screen w-screen bg-gradient-to-br from-[#f8d0b5] via-[#f5c29f] to-[#f3b58c] flex items-center justify-center p-4 sm:p-6 select-none font-sans relative overflow-hidden">
      {/* Background Topographic Wave Contours */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-40 mix-blend-overlay"
        viewBox="0 0 1200 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M-100 200 C300 100, 600 400, 1300 150" stroke="white" strokeWidth="2" strokeDasharray="4 8" />
        <path d="M-50 450 C350 250, 750 650, 1350 350" stroke="white" strokeWidth="2.5" />
        <path d="M-100 700 C400 500, 800 850, 1400 550" stroke="white" strokeWidth="2" />
      </svg>

      {/* Floating Stitch Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md rounded-[32px] bg-white shadow-[0_25px_70px_rgba(200,90,40,0.22)] border border-white/80 p-8 sm:p-10 flex flex-col justify-between"
      >
        <div>
          {/* Header & Back Link */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#64748b] hover:text-[#ff7a50] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to 3D Home</span>
            </button>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#ff7a50]/10 text-[#ff7a50] border border-[#ff7a50]/20 uppercase">
              Stitch Studio
            </span>
          </div>

          {/* Logo & Welcome */}
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-xl bg-[#ff7a50] flex items-center justify-center text-white shadow-md shadow-[#ff7a50]/30 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-black text-[#1e1e24] tracking-tight">
              Welcome Back
            </h1>
          </div>
          <p className="text-xs text-[#64748b] mb-6">
            Log in to access your Docker sandboxes, AI Mentor, and saved workspaces.
          </p>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-2xl bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444] text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1e1e24] mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="demo or your username"
                  required
                  className="w-full h-11 pl-10 pr-4 rounded-2xl bg-[#f8f8f7] border border-[#ebe7df] text-xs text-[#1e1e24] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#ff7a50] transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#1e1e24]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-[11px] text-[#ff7a50] hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-11 pl-10 pr-10 rounded-2xl bg-[#f8f8f7] border border-[#ebe7df] text-xs text-[#1e1e24] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#ff7a50] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#1e1e24]"
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
                className="w-4 h-4 rounded text-[#ff7a50] accent-[#ff7a50] cursor-pointer"
              />
              <label htmlFor="remember" className="text-xs text-[#64748b] cursor-pointer">
                Remember me on this browser
              </label>
            </div>

            {/* Submit Button matching Stitch coral pill */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-full bg-[#ff7a50] hover:bg-[#ff6838] text-white font-extrabold text-sm shadow-md shadow-[#ff7a50]/30 transition-all flex items-center justify-center gap-2 mt-4 active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              <span>{isSubmitting ? "Logging in..." : "Log In to Studio"}</span>
            </button>
          </form>

          {/* OAuth Providers */}
          {oauthProviders.length > 0 && (
            <div className="mt-6 pt-5 border-t border-[#f1eee7]">
              <div className="text-[11px] text-center text-[#9ca3af] font-medium mb-3">
                Or continue with
              </div>
              <div className="space-y-2">
                {oauthProviders.map((provider) => (
                  <a
                    key={provider.name}
                    href={provider.auth_url}
                    className="w-full h-10 rounded-2xl border border-[#ebe7df] bg-[#fbfbfa] hover:bg-white text-xs font-semibold text-[#1e1e24] flex items-center justify-center gap-2 transition-all shadow-xs"
                  >
                    <span>Continue with {provider.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Signup Link */}
        <div className="pt-6 mt-6 border-t border-[#f1eee7] text-center text-xs text-[#64748b]">
          Don&apos;t have an account?{" "}
          <button
            onClick={() => navigate("/signup")}
            className="text-[#ff7a50] font-bold hover:underline"
          >
            Create account
          </button>
        </div>
      </motion.div>
    </div>
  );
}

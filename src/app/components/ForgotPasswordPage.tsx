import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Mail, KeyRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setMessage("");
    setIsSubmitting(true);
    try {
      const responseMessage = await forgotPassword(email);
      setMessage(responseMessage);
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Unable to send reset email.");
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
              onClick={() => navigate("/login")}
              className="flex items-center gap-1.5 text-xs font-mono text-white/50 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </button>
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#eca8d6]/10 text-[#eca8d6] border border-[#eca8d6]/20 uppercase">
              RECOVERY
            </span>
          </div>

          {/* Logo & Welcome */}
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-[#eca8d6] shadow-sm">
              <KeyRound className="w-4 h-4" />
            </div>
            <h1 className="text-3xl font-serif text-white tracking-wide">
              Forgot Password
            </h1>
          </div>
          <p className="text-xs text-white/50 mb-6 font-sans">
            Enter your email address and we'll send you instructions to reset your password.
          </p>

          {/* Feedback messages */}
          {message ? (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
              {message}
            </div>
          ) : null}
          {errorMessage ? (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 text-xs font-mono">
              {errorMessage}
            </div>
          ) : null}

          {/* Reset Form */}
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-medium text-white/70 mb-1.5">
                Account Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  required
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#eca8d6]/60 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-full bg-white hover:bg-white/90 text-black font-semibold text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-2 mt-4 active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : null}
              <span>{isSubmitting ? "Sending Reset Link..." : "Send Reset Link"}</span>
            </button>
          </form>
        </div>

        {/* Back Link */}
        <div className="pt-6 mt-6 border-t border-white/10 text-center text-xs text-white/50">
          Remember your password?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-white font-semibold hover:underline cursor-pointer ml-1"
          >
            Log in
          </button>
        </div>
      </motion.div>
    </div>
  );
}

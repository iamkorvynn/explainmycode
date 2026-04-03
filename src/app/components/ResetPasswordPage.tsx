import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { motion } from "motion/react";

import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (!token) {
      setErrorMessage("This reset link is missing a token. Please request a new password reset email.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const responseMessage = await resetPassword({ token, newPassword, confirmPassword });
      setMessage(responseMessage);
      setTimeout(() => navigate("/login"), 1200);
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Unable to reset your password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#0f0f0f] relative h-screen w-screen overflow-hidden">
      <motion.p
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="absolute font-semibold leading-[normal] left-[60px] text-[88px] text-white top-[360px] whitespace-nowrap"
      >
        Set A New Password
      </motion.p>

      <div className="absolute left-[798px] size-[302px] top-[62px]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 302 302">
          <circle cx="151" cy="151" fill="url(#paint0_linear_reset_1)" r="151" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_reset_1" x1="151" x2="151" y1="0" y2="302">
              <stop stopColor="#124d61" />
              <stop offset="1" stopColor="#0a1f30" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="absolute flex items-center justify-center left-[1142px] size-[298.315px] top-[728px]">
        <div className="flex-none rotate-[-28.5deg]">
          <div className="relative size-[220px]">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 220 220">
              <circle cx="110" cy="110" fill="url(#paint0_linear_reset_2)" r="110" />
              <defs>
                <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_reset_2" x1="110" x2="110" y1="0" y2="220">
                  <stop stopColor="#126161" />
                  <stop offset="1" stopColor="#0a3030" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="absolute top-1/2 -translate-y-1/2 right-[60px] backdrop-blur-[26.5px] h-[796px] rounded-[20px] w-[480px] border border-solid border-white shadow-[-8px_4px_5px_0px_rgba(0,0,0,0.24)]"
        style={{
          backgroundImage:
            "linear-gradient(-53.097deg, rgba(191, 191, 191, 0.063) 5.9849%, rgba(0, 0, 0, 0) 66.277%), linear-gradient(90deg, rgba(0, 0, 0, 0.14) 0%, rgba(0, 0, 0, 0.14) 100%)",
        }}
      >
        <div className="overflow-clip relative rounded-[inherit] size-full p-[40px] flex flex-col">
          <div className="mb-[14px]">
            <h1 className="font-semibold text-[36px] text-white mb-1">Reset Password</h1>
            <p className="font-medium text-[16px] text-white">Choose a new password for your account.</p>
          </div>

          <form onSubmit={handleResetPassword} className="flex flex-col gap-[25px]">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full px-[16px] py-[14px] rounded-[12px] border border-solid border-white bg-transparent text-[20px] text-white placeholder:text-white/60 focus:outline-none focus:border-[#14b8a6] transition-colors"
              minLength={8}
              required
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-[16px] py-[14px] rounded-[12px] border border-solid border-white bg-transparent text-[20px] text-white placeholder:text-white/60 focus:outline-none focus:border-[#14b8a6] transition-colors"
              minLength={8}
              required
            />

            {!token ? (
              <div className="rounded-[12px] border border-[#f59e0b]/40 bg-[#78350f]/30 px-[16px] py-[12px] text-[14px] text-[#fde68a]">
                This link is incomplete. Request a fresh reset email and try again.
              </div>
            ) : null}
            {message ? (
              <div className="rounded-[12px] border border-[#22c55e]/30 bg-[#14532d]/30 px-[16px] py-[12px] text-[14px] text-[#bbf7d0]">
                {message}
              </div>
            ) : null}
            {errorMessage ? (
              <div className="rounded-[12px] border border-[#ef4444]/40 bg-[#7f1d1d]/30 px-[16px] py-[12px] text-[14px] text-[#fecaca]">
                {errorMessage}
              </div>
            ) : null}

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting || !token}
              className="w-full px-[10px] py-[14px] rounded-[12px] font-medium text-[20px] text-white disabled:opacity-50"
              style={{
                backgroundImage:
                  "linear-gradient(94.117deg, rgb(20, 184, 166) 9.9097%, rgb(13, 148, 136) 53.286%, rgb(15, 118, 110) 91.559%)",
              }}
            >
              {isSubmitting ? "Updating..." : "Update Password"}
            </motion.button>
          </form>

          <div className="mt-auto">
            <p className="font-medium text-[16px] text-white text-center mb-[8px]">
              Remembered it?{" "}
              <button onClick={() => navigate("/login")} className="text-[#14b8a6] hover:underline">
                Back to login
              </button>
            </p>
            <div className="bg-gradient-to-b from-[rgba(98,98,98,0)] to-[rgba(98,98,98,0.25)] flex items-center justify-between px-[6px] py-[4px] rounded-[6px]">
              <p className="font-normal text-[16px] text-white">Terms & Conditions</p>
              <p className="font-normal text-[16px] text-white">Support</p>
              <p className="font-normal text-[16px] text-white">Customer Care</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="absolute h-0 left-[300px] top-[550px] w-[590px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 590 2">
          <line stroke="#4D4D4D" strokeDasharray="12 12" strokeLinecap="round" strokeWidth="2" x1="1" x2="589" y1="1" y2="1" />
        </svg>
      </div>
    </div>
  );
}

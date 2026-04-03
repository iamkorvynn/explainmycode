import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
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
    <div className="bg-[#0f0f0f] relative h-screen w-screen overflow-hidden">
      {/* Main Heading */}
      <motion.p
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="absolute font-semibold leading-[normal] left-[60px] text-[96px] text-white top-[381px] whitespace-nowrap"
      >
        No Worries.!!
      </motion.p>

      {/* Decorative Circle 1 */}
      <div className="absolute left-[798px] size-[302px] top-[62px]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 302 302">
          <circle cx="151" cy="151" fill="url(#paint0_linear_forgot_1)" r="151" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_forgot_1" x1="151" x2="151" y1="0" y2="302">
              <stop stopColor="#61003A" />
              <stop offset="1" stopColor="#2D0A30" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Decorative Circle 2 */}
      <div className="absolute flex items-center justify-center left-[1142px] size-[298.315px] top-[728px]">
        <div className="flex-none rotate-[-28.5deg]">
          <div className="relative size-[220px]">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 220 220">
              <circle cx="110" cy="110" fill="url(#paint0_linear_forgot_2)" r="110" />
              <defs>
                <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_forgot_2" x1="110" x2="110" y1="0" y2="220">
                  <stop stopColor="#61004B" />
                  <stop offset="1" stopColor="#220A30" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* Forgot Password Card */}
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
          {/* Header */}
          <div className="mb-[14px]">
            <h1 className="font-semibold text-[36px] text-white mb-1">Forgot Password ?</h1>
            <p className="font-medium text-[16px] text-white">Please enter you're email</p>
          </div>

          {/* Reset Form */}
          <form onSubmit={handleResetPassword} className="flex flex-col gap-[25px]">
            {/* Email Input */}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
              className="w-full px-[16px] py-[14px] rounded-[12px] border border-solid border-white bg-transparent text-[20px] text-white placeholder:text-white/60 focus:outline-none focus:border-[#e948c5] transition-colors"
              required
            />

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

            {/* Reset Button */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
              className="w-full px-[10px] py-[14px] rounded-[12px] font-medium text-[20px] text-white"
              style={{
                backgroundImage:
                  "linear-gradient(94.117deg, rgb(233, 72, 197) 9.9097%, rgb(205, 64, 123) 53.286%, rgb(117, 4, 45) 91.559%)",
              }}
            >
              {isSubmitting ? "Sending..." : "Reset Password"}
            </motion.button>
          </form>

          {message ? (
            <button onClick={() => navigate("/login")} className="mt-[16px] text-[16px] text-[#e948c5] hover:underline">
              Back to login
            </button>
          ) : null}

          {/* Bottom Section */}
          <div className="mt-auto">
            <p className="font-medium text-[16px] text-white text-center mb-[8px]">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-[#e948c5] hover:underline"
              >
                Signup
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

      {/* Decorative Line */}
      <div className="absolute h-0 left-[337px] top-[550px] w-[554px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 554 2">
          <line stroke="#4D4D4D" strokeDasharray="12 12" strokeLinecap="round" strokeWidth="2" x1="1" x2="553" y1="1" y2="1" />
        </svg>
      </div>
    </div>
  );
}

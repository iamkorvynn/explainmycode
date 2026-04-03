import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import svgPaths from "../../imports/svg-pwkn6tbatj";
import { useAuth } from "../context/AuthContext";
import { ApiError, listOAuthProviders, type OAuthProvider } from "../lib/api";

export function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (password !== confirmPassword) {
      setErrorMessage("Passwords don't match.");
      return;
    }
    if (!email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    setIsSubmitting(true);
    try {
      await signup({ username, email, password, confirmPassword });
      navigate("/ide");
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Unable to create your account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasOAuthProviders = oauthProviders.length > 0;

  return (
    <div className="bg-[#0f0f0f] relative h-screen w-screen overflow-hidden">
      {/* Main Heading */}
      <motion.p
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="absolute font-semibold leading-[normal] left-[60px] text-[96px] text-white top-[381px] whitespace-nowrap"
      >
        Roll the Carpet.!
      </motion.p>

      {/* Decorative Circle 1 */}
      <div className="absolute left-[795px] size-[302px] top-[60px]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 302 302">
          <circle cx="151" cy="151" fill="url(#paint0_linear_signup_1)" r="151" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_signup_1" x1="151" x2="151" y1="0" y2="302">
              <stop stopColor="#190061" />
              <stop offset="1" stopColor="#0A1B30" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Decorative Circle 2 */}
      <div className="absolute flex items-center justify-center left-[1149px] size-[298.315px] top-[698px]">
        <div className="flex-none rotate-[-28.5deg]">
          <div className="relative size-[220px]">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 220 220">
              <circle cx="110" cy="110" fill="url(#paint0_linear_signup_2)" r="110" />
              <defs>
                <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_signup_2" x1="110" x2="110" y1="0" y2="220">
                  <stop stopColor="#000F61" />
                  <stop offset="1" stopColor="#0A1730" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* Signup Card */}
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
            <h1 className="font-semibold text-[36px] text-white mb-1">Signup</h1>
            <p className="font-medium text-[16px] text-white">Just some details to get you in.!</p>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="flex flex-col gap-[25px]">
            {/* Username Input */}
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full px-[16px] py-[14px] rounded-[12px] border border-solid border-white bg-transparent text-[20px] text-white placeholder:text-white/60 focus:outline-none focus:border-[#3b82f6] transition-colors"
            />

            {/* Email/Phone Input */}
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-[16px] py-[14px] rounded-[12px] border border-solid border-white bg-transparent text-[20px] text-white placeholder:text-white/60 focus:outline-none focus:border-[#3b82f6] transition-colors"
            />

            {/* Password Inputs */}
            <div className="flex flex-col gap-[12px]">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-[16px] py-[14px] rounded-[12px] border border-solid border-white bg-transparent text-[20px] text-white placeholder:text-white/60 focus:outline-none focus:border-[#3b82f6] transition-colors"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="w-full px-[16px] py-[14px] rounded-[12px] border border-solid border-white bg-transparent text-[20px] text-white placeholder:text-white/60 focus:outline-none focus:border-[#3b82f6] transition-colors"
              />
            </div>

            {/* Signup Button */}
            {errorMessage ? (
              <div className="rounded-[12px] border border-[#ef4444]/40 bg-[#7f1d1d]/30 px-[16px] py-[12px] text-[14px] text-[#fecaca]">
                {errorMessage}
              </div>
            ) : null}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
              className="w-full px-[10px] py-[14px] rounded-[12px] font-semibold text-[20px] text-white"
              style={{
                backgroundImage:
                  "linear-gradient(94.117deg, rgb(46, 76, 238) 9.9097%, rgb(34, 30, 191) 53.286%, rgb(4, 15, 117) 91.559%)",
              }}
            >
              {isSubmitting ? "Creating account..." : "Signup"}
            </motion.button>
          </form>

          {hasOAuthProviders ? (
            <>
              <div className="flex gap-[20px] items-center my-[16px]">
                <div className="flex-1 h-[2px] bg-[#4d4d4d] rounded-full" />
                <p className="font-medium text-[16px] text-[#4d4d4d]">Or</p>
                <div className="flex-1 h-[2px] bg-[#4d4d4d] rounded-full" />
              </div>

              <div className="flex gap-[18px] items-center justify-center mb-[8px]">
                {oauthProviders.map((provider) => (
                  <SocialIcon key={provider.provider} type={provider.provider as "google" | "facebook" | "github"} authUrl={provider.auth_url ?? ""} />
                ))}
              </div>
            </>
          ) : null}

          {/* Bottom Section */}
          <div className="mt-auto">
            <p className="font-medium text-[16px] text-white text-center mb-[8px]">
              Already Registered?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-[#3b82f6] hover:underline"
              >
                Login
              </button>
            </p>
            <div className="bg-gradient-to-b from-[rgba(98,98,98,0)] to-[rgba(98,98,98,0.07)] flex items-center justify-between px-[6px] py-[4px] rounded-[6px]">
              <p className="font-normal text-[16px] text-white">Terms & Conditions</p>
              <p className="font-normal text-[16px] text-white">Support</p>
              <p className="font-normal text-[16px] text-white">Customer Care</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Decorative Line */}
      <div className="absolute h-0 left-[316px] top-[550px] w-[575px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 575 2">
          <line stroke="#4D4D4D" strokeDasharray="12 12" strokeLinecap="round" strokeWidth="2" x1="1" x2="574" y1="1" y2="1" />
        </svg>
      </div>
    </div>
  );
}

function SocialIcon({ type, authUrl }: { type: "google" | "facebook" | "github"; authUrl: string }) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="relative size-[42px] cursor-pointer"
      onClick={() => window.location.assign(authUrl)}
    >
      {type === "google" && (
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 42 42">
          <g clipPath="url(#clip0_google_signup)">
            <path d={svgPaths.p17249700} fill="white" />
            <path d={svgPaths.p6eed480} fill="#E33629" />
            <path d={svgPaths.p2051fc00} fill="#F8BD00" />
            <path d={svgPaths.p36f9a900} fill="#587DBD" />
            <path d={svgPaths.p4fd1480} fill="#319F43" />
          </g>
          <defs>
            <clipPath id="clip0_google_signup">
              <rect fill="white" height="42" width="42" />
            </clipPath>
          </defs>
        </svg>
      )}
      {type === "facebook" && (
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 42 42">
          <g clipPath="url(#clip0_facebook_signup)">
            <path d={svgPaths.p17708a00} fill="#1877F2" />
            <path d={svgPaths.p984ba00} fill="white" />
          </g>
          <defs>
            <clipPath id="clip0_facebook_signup">
              <rect fill="white" height="42" width="42" />
            </clipPath>
          </defs>
        </svg>
      )}
      {type === "github" && (
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 42 42">
          <g>
            <path d={svgPaths.p18209680} fill="white" />
          </g>
        </svg>
      )}
    </motion.button>
  );
}

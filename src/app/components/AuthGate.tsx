import { Navigate } from "react-router";

import { useAuth } from "../context/AuthContext";

function FullscreenMessage({ message }: { message: string }) {
  return (
    <div className="min-h-screen w-screen bg-[#020617] text-[#e5e7eb] flex items-center justify-center">
      <div className="text-sm text-[#9ca3af]">{message}</div>
    </div>
  );
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return <FullscreenMessage message="Checking your session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export function RedirectIfAuthenticated({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return <FullscreenMessage message="Loading ExplainMyCode..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/ide" replace />;
  }

  return <>{children}</>;
}

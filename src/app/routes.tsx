import { createBrowserRouter } from "react-router";
import { MainIDE } from "./components/MainIDE";
import { AlgorithmVisualization } from "./components/AlgorithmVisualization";
import { AIAnalysisDashboard } from "./components/AIAnalysisDashboard";
import { LoginPage } from "./components/LoginPage";
import { SignupPage } from "./components/SignupPage";
import { ForgotPasswordPage } from "./components/ForgotPasswordPage";
import { OAuthCallbackPage } from "./components/OAuthCallbackPage";
import { ResetPasswordPage } from "./components/ResetPasswordPage";
import { RedirectIfAuthenticated, RequireAuth } from "./components/AuthGate";

function GuestLogin() {
  return (
    <RedirectIfAuthenticated>
      <LoginPage />
    </RedirectIfAuthenticated>
  );
}

function GuestSignup() {
  return (
    <RedirectIfAuthenticated>
      <SignupPage />
    </RedirectIfAuthenticated>
  );
}

function GuestForgotPassword() {
  return (
    <RedirectIfAuthenticated>
      <ForgotPasswordPage />
    </RedirectIfAuthenticated>
  );
}

function GuestResetPassword() {
  return (
    <RedirectIfAuthenticated>
      <ResetPasswordPage />
    </RedirectIfAuthenticated>
  );
}

function OAuthCallback() {
  return <OAuthCallbackPage />;
}

function ProtectedIDE() {
  return (
    <RequireAuth>
      <MainIDE />
    </RequireAuth>
  );
}

function ProtectedVisualization() {
  return (
    <RequireAuth>
      <AlgorithmVisualization />
    </RequireAuth>
  );
}

function ProtectedAnalysis() {
  return (
    <RequireAuth>
      <AIAnalysisDashboard />
    </RequireAuth>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: GuestLogin,
  },
  {
    path: "/login",
    Component: GuestLogin,
  },
  {
    path: "/signup",
    Component: GuestSignup,
  },
  {
    path: "/forgot-password",
    Component: GuestForgotPassword,
  },
  {
    path: "/reset-password",
    Component: GuestResetPassword,
  },
  {
    path: "/oauth/callback",
    Component: OAuthCallback,
  },
  {
    path: "/ide",
    Component: ProtectedIDE,
  },
  {
    path: "/visualize",
    Component: ProtectedVisualization,
  },
  {
    path: "/analysis",
    Component: ProtectedAnalysis,
  },
]);

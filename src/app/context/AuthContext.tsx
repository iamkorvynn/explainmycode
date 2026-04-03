import { createContext, useContext, useEffect, useMemo, useState } from "react";

import {
  ApiError,
  clearSession,
  forgotPassword as forgotPasswordRequest,
  getMe,
  getStoredSession,
  login as loginRequest,
  logout as logoutRequest,
  resetPassword as resetPasswordRequest,
  saveSession,
  signup as signupRequest,
  subscribeToSessionChanges,
  type User,
} from "../lib/api";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (payload: { username: string; password: string; rememberMe: boolean }) => Promise<void>;
  signup: (payload: { username: string; email: string; password: string; confirmPassword: string; phone?: string }) => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (payload: { token: string; newPassword: string; confirmPassword: string }) => Promise<string>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readUserFromStorage() {
  return getStoredSession()?.user ?? null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readUserFromStorage());
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToSessionChanges(() => {
      setUser(readUserFromStorage());
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      const session = getStoredSession();
      if (!session) {
        if (active) {
          setIsInitializing(false);
        }
        return;
      }

      try {
        const freshUser = await getMe();
        if (active) {
          saveSession({
            accessToken: session.accessToken,
            refreshToken: session.refreshToken,
            user: freshUser,
          });
          setUser(freshUser);
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          clearSession();
          if (active) {
            setUser(null);
          }
        }
      } finally {
        if (active) {
          setIsInitializing(false);
        }
      }
    }

    bootstrap();
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isInitializing,
      async login(payload) {
        const session = await loginRequest(payload);
        setUser(session.user);
      },
      async signup(payload) {
        const session = await signupRequest(payload);
        setUser(session.user);
      },
      async forgotPassword(email: string) {
        const response = await forgotPasswordRequest(email);
        return response.message;
      },
      async resetPassword(payload) {
        const response = await resetPasswordRequest(payload);
        return response.message;
      },
      async logout() {
        await logoutRequest();
        setUser(null);
      },
      async refreshUser() {
        const session = getStoredSession();
        if (!session) {
          setUser(null);
          return;
        }
        const freshUser = await getMe();
        saveSession({
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          user: freshUser,
        });
        setUser(freshUser);
      },
    }),
    [isInitializing, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

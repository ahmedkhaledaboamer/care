import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { setUnauthorizedHandler } from '../api/client';
import { authApi, profileApi } from '../api/services';
import type { User } from '../api/types';
import { tokenStore } from './tokenStore';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  /** True while a stored token is being validated on first load. */
  isRestoring: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (body: { name: string; email: string; password: string; passwordConfirm: string }) => Promise<User>;
  /** Stores a token returned without a user (resetPassword) and loads the profile. */
  loginWithToken: (token: string) => Promise<User>;
  setSession: (token: string, user: User) => void;
  updateUser: (user: User) => void;
  logout: (opts?: { redirectTo?: string }) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** The API returns the password hash and reset fields with the user — never keep them. */
function sanitize(u: User): User {
  const { password, passwordResetCode, passwordResetExpires, passwordResetVerified, passwordChangedAt, ...safe } = u as User & Record<string, unknown>;
  void password, passwordResetCode, passwordResetExpires, passwordResetVerified, passwordChangedAt;
  return safe as User;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const initial = tokenStore.getSession();
  const [token, setToken] = useState<string | null>(initial?.token ?? null);
  const [user, setUser] = useState<User | null>(initial?.user ?? null);
  const [isRestoring, setIsRestoring] = useState<boolean>(!!initial?.token && !initial?.user);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const locationRef = useRef(location);
  locationRef.current = location;

  const setSession = useCallback((t: string, raw: User) => {
    const u = sanitize(raw);
    tokenStore.set({ token: t, user: u });
    setToken(t);
    setUser(u);
  }, []);

  const clearSession = useCallback(() => {
    tokenStore.set(null);
    setToken(null);
    setUser(null);
    // Drop every cached private resource (cart, wishlist, orders, ...).
    queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== 'public' });
  }, [queryClient]);

  const logout = useCallback(
    (opts?: { redirectTo?: string }) => {
      clearSession();
      navigate(opts?.redirectTo ?? '/', { replace: true });
    },
    [clearSession, navigate]
  );

  // 401 on any authenticated request → session is invalid/expired.
  useEffect(() => {
    setUnauthorizedHandler((message) => {
      if (!tokenStore.get()) return;
      clearSession();
      const loc = locationRef.current;
      navigate('/login', {
        replace: true,
        state: { from: `${loc.pathname}${loc.search}`, reason: message }
      });
    });
    return () => setUnauthorizedHandler(null);
  }, [clearSession, navigate]);

  // Validate/refresh the stored session once on load.
  useEffect(() => {
    if (!initial?.token) return;
    const ctrl = new AbortController();
    profileApi
      .getMe(ctrl.signal)
      .then((me) => {
        if (tokenStore.get() === initial.token) setSession(initial.token, me);
      })
      .catch(() => {
        /* 401 is handled globally; network errors keep the cached user */
      })
      .finally(() => setIsRestoring(false));
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login({ email, password });
      queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== 'public' });
      setSession(res.token, res.data);
      return res.data;
    },
    [queryClient, setSession]
  );

  const signup = useCallback(
    async (body: { name: string; email: string; password: string; passwordConfirm: string }) => {
      const res = await authApi.signup(body);
      setSession(res.token, res.data);
      return res.data;
    },
    [setSession]
  );

  const loginWithToken = useCallback(
    async (t: string) => {
      tokenStore.set({ token: t, user: null });
      setToken(t);
      const me = await profileApi.getMe();
      setSession(t, me);
      return me;
    },
    [setSession]
  );

  const updateUser = useCallback(
    (u: User) => {
      const t = tokenStore.get();
      if (t) setSession(t, u);
    },
    [setSession]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: !!token && !!user,
      isRestoring,
      login,
      signup,
      loginWithToken,
      setSession,
      updateUser,
      logout
    }),
    [user, token, isRestoring, login, signup, loginWithToken, setSession, updateUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

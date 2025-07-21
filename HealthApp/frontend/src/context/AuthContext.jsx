// src/context/AuthContext.jsx
// Provides app-wide auth state + actions. Persists tokens + user in localStorage.

import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { registerUser, loginUser, refreshToken } from "../api/auth";
import { fetchProfile } from "../api/protected";

const STORAGE_KEY = "authTokens"; // { access, refresh, user }

export const AuthContext = createContext(null);

export function AuthProvider({ children, autoLoginAfterRegister = true }) {
  const [access, setAccess] = useState(null);
  const [refresh, setRefresh] = useState(null);
  const [user, setUser] = useState(null); // { username, user_id, first_name, last_name }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load from localStorage once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setAccess(parsed.access || null);
        setRefresh(parsed.refresh || null);
        setUser(parsed.user || null);
      }
    } catch (err) {
      console.error("Failed to parse authTokens from storage", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const persist = useCallback((next) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (err) {
      console.error("Failed to persist auth state", err);
    }
  }, []);

  const clearPersisted = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      // ignore
    }
  }, []);

  const setAuthState = useCallback((tokens) => {
    setAccess(tokens?.access || null);
    setRefresh(tokens?.refresh || null);
    setUser(tokens?.user || null);
    persist(tokens || {});
  }, [persist]);

  const logout = useCallback(() => {
    setAuthState(null);
    clearPersisted();
  }, [setAuthState, clearPersisted]);

  const handleRegister = useCallback(
    async ({ first_name, last_name, password }) => {
      setError(null);
      try {
        const regData = await registerUser({ first_name, last_name, password });
        // regData => { username, user_id, first_name, last_name }
        if (autoLoginAfterRegister) {
          // attempt login with generated username + provided password
          const tokens = await loginUser({ username: regData.username, password });
          setAuthState({ ...tokens, user: regData });
        } else {
          // just store user; user must log in manually
          setUser(regData);
          alert(`This is your username: ${regData.username}. Use this for login`)
        }
        return { success: true, data: regData };
      } catch (err) {
        console.error("Register error", err);
        setError(err.message || "Registration failed");
        return { success: false, error: err };
      }
    },
    [autoLoginAfterRegister, setAuthState]
  );

  const handleLogin = useCallback(async ({ username, password }) => {
    setError(null);
    try {
      const tokens = await loginUser({ username, password });
      // fetch user profile after login so we have user info
      let profile = null;
      try {
        profile = await fetchProfile(tokens.access, username);
      } catch (profileErr) {
        // Non-fatal; backend might not have /profile/
        console.warn("Profile fetch failed", profileErr);
      }
      const userData = profile || { username };
      setAuthState({ ...tokens, user: userData });
      return { success: true, data: userData };
    } catch (err) {
      console.error("Login error", err);
      setError(err.message || "Login failed");
      return { success: false, error: err };
    }
  }, [setAuthState]);

  // Simple token refresh (optional) - call manually or from a timer
  const handleRefresh = useCallback(async () => {
    if (!refresh) return null;
    try {
      const tokens = await refreshToken({ refresh });
      const next = { access: tokens.access, refresh: tokens.refresh || refresh, user };
      setAuthState(next);
      return next;
    } catch (err) {
      console.error("Refresh failed", err);
      logout();
      return null;
    }
  }, [refresh, user, setAuthState, logout]);

  /**
   * Authenticated fetch helper exposed via context.
   * Usage: await authFetch(() => fetchProfile(access)) // but we wrap so we can auto refresh in future.
   * For now, just passes through existing valid access token.
   */
  const authFetch = useCallback(
    async (fn) => {
      if (!access) throw new Error("Not authenticated");
      try {
        return await fn(access);
      } catch (err) {
        // If unauthorized, attempt refresh once.
        if (err.status === 401 && refresh) {
          const newTokens = await handleRefresh();
          if (newTokens?.access) {
            return await fn(newTokens.access);
          }
        }
        throw err;
      }
    },
    [access, refresh, handleRefresh]
  );

  const value = useMemo(
    () => ({
      access,
      refresh,
      user,
      loading,
      error,
      register: handleRegister,
      login: handleLogin,
      refreshTokens: handleRefresh,
      logout,
      authFetch,
    }),
    [access, refresh, user, loading, error, handleRegister, handleLogin, handleRefresh, logout, authFetch]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
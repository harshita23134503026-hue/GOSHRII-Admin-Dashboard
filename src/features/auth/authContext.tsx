import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AdminUser } from '../../types';
import { mockDb } from '../../services/mockDb';

// ==========================================
// AUTH STATE & CONTEXT TYPES
// ==========================================

interface AuthState {
  isAuthenticated: boolean;
  admin: AdminUser | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AUTH_STORAGE_KEY = 'goshrii_auth_session';

const AuthContext = createContext<AuthContextValue | null>(null);

// ==========================================
// AUTH PROVIDER
// ==========================================

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Rehydrate from localStorage on mount
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.isAuthenticated && parsed.admin) {
          // Normalize legacy roles if present in stored session
          if (parsed.admin.role === 'super_admin' || parsed.admin.role === 'ops_lead') {
            parsed.admin.role = 'admin';
            parsed.admin.roleLabel = 'Admin';
          } else if (parsed.admin.role === 'st_admin') {
            parsed.admin.role = 'store_manager';
            parsed.admin.roleLabel = 'Store Manager';
          }
          return { isAuthenticated: true, admin: parsed.admin };
        }
      }
    } catch {
      // ignore malformed data
    }
    return { isAuthenticated: false, admin: null };
  });

  // Persist auth state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
  }, [authState]);

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      const result = mockDb.validateAdminCredentials(email, password);
      if (result) {
        const admin = { ...result, lastLogin: new Date().toISOString() };
        setAuthState({ isAuthenticated: true, admin });
        return { success: true };
      }
      return { success: false, error: 'Invalid email or password. Please try again.' };
    },
    []
  );

  const logout = useCallback(() => {
    setAuthState({ isAuthenticated: false, admin: null });
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ==========================================
// useAuth HOOK
// ==========================================

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
};

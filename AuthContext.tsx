import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '@/types';
import * as authService from '@/services/auth';

interface AuthContextValue {
  user: User | null;
  isAdmin: boolean;
  isLoggedIn: boolean;
  isGuest: boolean;
  guestName: string;
  login: (email: string, password: string) => { error?: string };
  register: (name: string, email: string, password: string) => { error?: string };
  logout: () => void;
  continueAsGuest: (name: string) => void;
  exitGuest: () => void;
  refreshUser: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const GUEST_KEY = 'guest_name';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [guestName, setGuestName] = useState('');

  useEffect(() => {
    authService.ensureAdminExists();
    const current = authService.getCurrentUser();
    if (current) setUser(current);
    else {
      const gName = localStorage.getItem(`unidrop_${GUEST_KEY}`);
      if (gName) setGuestName(gName);
    }
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'unidrop_currentUser' || event.key === 'unidrop_users') setUser(authService.getCurrentUser());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const refreshUser = useCallback(() => setUser(authService.getCurrentUser()), []);

  const login = useCallback((email: string, password: string) => {
    const result = authService.login(email, password);
    if (result.user) {
      setUser(result.user);
      setGuestName('');
      localStorage.removeItem(`unidrop_${GUEST_KEY}`);
    }
    return { error: result.error };
  }, []);

  const register = useCallback((name: string, email: string, password: string) => {
    const result = authService.register(name, email, password);
    if (result.user) {
      setUser(result.user);
      setGuestName('');
      localStorage.removeItem(`unidrop_${GUEST_KEY}`);
    }
    return { error: result.error };
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const continueAsGuest = useCallback((name: string) => {
    const safeName = name.trim() || 'Khách';
    setGuestName(safeName);
    localStorage.setItem(`unidrop_${GUEST_KEY}`, safeName);
  }, []);

  const exitGuest = useCallback(() => {
    setGuestName('');
    localStorage.removeItem(`unidrop_${GUEST_KEY}`);
  }, []);

  const updateProfile = useCallback((updates: Partial<User>) => {
    if (!user) return;
    const updated = authService.updateProfile(user.id, updates);
    if (updated) setUser(updated);
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      isAdmin: user?.role === 'admin',
      isLoggedIn: !!user,
      isGuest: !user && !!guestName,
      guestName,
      login,
      register,
      logout,
      continueAsGuest,
      exitGuest,
      refreshUser,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

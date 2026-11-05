import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  request, 
  setAccessToken, 
  setOnUnauthorized, 
  ApiError 
} from '../services/apiClient';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  status: 'active' | 'suspended';
  createdAt: string;
  lastLoginAt?: string;
}

export interface UserSession {
  id: string;
  userAgent: string;
  ipAddress: string;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

interface AuthContextType {
  user: AuthUser | null;
  status: AuthStatus;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ emailVerificationRequired: boolean }>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  updateProfile: (name: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  getSessions: () => Promise<UserSession[]>;
  revokeSession: (sessionId: string) => Promise<void>;
  deleteAccount: (confirmationText: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_CHANNEL_NAME = 'aura_auth_channel';
const LOGOUT_EVENT_KEY = 'aura_logout_event_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  // Handle cross-tab logout via BroadcastChannel
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
        channel.onmessage = (event) => {
          if (event.data?.type === 'LOGOUT') {
            setAccessToken(null);
            setUser(null);
            setStatus('anonymous');
          } else if (event.data?.type === 'LOGIN') {
            // Re-fetch profile on login from another tab
            request<{ user: AuthUser }>('/auth/me')
              .then(res => {
                setUser(res.user);
                setStatus('authenticated');
              })
              .catch(() => {});
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel not supported in this environment', e);
    }

    // Storage event fallback for older browsers
    const handleStorage = (e: StorageEvent) => {
      if (e.key === LOGOUT_EVENT_KEY) {
        setAccessToken(null);
        setUser(null);
        setStatus('anonymous');
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      channel?.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Broadcast helper
  const broadcastAuthEvent = (type: 'LOGIN' | 'LOGOUT') => {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
        channel.postMessage({ type });
        channel.close();
      }
    } catch {}
    if (type === 'LOGOUT') {
      localStorage.setItem(LOGOUT_EVENT_KEY, Date.now().toString());
    }
  };

  // Register unauthorized callback from apiClient
  useEffect(() => {
    setOnUnauthorized(() => {
      setUser(null);
      setStatus('anonymous');
      broadcastAuthEvent('LOGOUT');
    });
  }, []);

  // On initial mount: silent refresh to restore session
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const refreshData = await request<{ accessToken: string; user: AuthUser }>('/auth/refresh', {
          method: 'POST',
        });

        if (isMounted) {
          setAccessToken(refreshData.accessToken);
          setUser(refreshData.user);
          setStatus('authenticated');
        }
      } catch {
        if (isMounted) {
          setAccessToken(null);
          setUser(null);
          setStatus('anonymous');
        }
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string, rememberMe: boolean = false) => {
    const res = await request<{ accessToken: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, rememberMe }),
    });

    setAccessToken(res.accessToken);
    setUser(res.user);
    setStatus('authenticated');
    broadcastAuthEvent('LOGIN');
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await request<{ user: AuthUser; accessToken?: string; emailVerificationRequired: boolean }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });

    if (res.accessToken && !res.emailVerificationRequired) {
      setAccessToken(res.accessToken);
      setUser(res.user);
      setStatus('authenticated');
      broadcastAuthEvent('LOGIN');
    }

    return { emailVerificationRequired: res.emailVerificationRequired };
  }, []);

  const logout = useCallback(async () => {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Logout request warning', e);
    } finally {
      setAccessToken(null);
      setUser(null);
      setStatus('anonymous');
      broadcastAuthEvent('LOGOUT');
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    await request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    await request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }, []);

  const verifyEmail = useCallback(async (token: string) => {
    const res = await request<{ user?: AuthUser; accessToken?: string }>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });

    if (res.accessToken && res.user) {
      setAccessToken(res.accessToken);
      setUser(res.user);
      setStatus('authenticated');
      broadcastAuthEvent('LOGIN');
    }
  }, []);

  const resendVerification = useCallback(async (email: string) => {
    await request('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }, []);

  const updateProfile = useCallback(async (name: string) => {
    const res = await request<{ user: AuthUser }>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    });
    setUser(res.user);
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    await request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }, []);

  const getSessions = useCallback(async () => {
    const res = await request<{ sessions: UserSession[] }>('/auth/sessions');
    return res.sessions;
  }, []);

  const revokeSession = useCallback(async (sessionId: string) => {
    await request(`/auth/sessions/${sessionId}`, { method: 'DELETE' });
  }, []);

  const deleteAccount = useCallback(async (confirmationText: string) => {
    await request('/auth/account', {
      method: 'DELETE',
      body: JSON.stringify({ confirmationText }),
    });
    setAccessToken(null);
    setUser(null);
    setStatus('anonymous');
    broadcastAuthEvent('LOGOUT');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        verifyEmail,
        resendVerification,
        updateProfile,
        changePassword,
        getSessions,
        revokeSession,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

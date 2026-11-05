import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function getSafeRedirect(redirectParam: string | null, fallback: string = '/'): string {
  if (!redirectParam) return fallback;
  // Prevent open redirect vulnerabilities (must start with / and not // or contain :)
  if (redirectParam.startsWith('/') && !redirectParam.startsWith('//') && !redirectParam.includes(':')) {
    return redirectParam;
  }
  return fallback;
}

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--paper)] text-[var(--ink)]">
        <div className="w-10 h-10 border-3 border-[var(--ink)] border-t-[var(--tomato)] rounded-full animate-spin mb-4" />
        <span className="font-fraunces italic text-lg text-[var(--ink)]">Opening your planner...</span>
      </div>
    );
  }

  if (status === 'anonymous') {
    const currentPath = location.pathname + location.search;
    return <Navigate to={`/login?redirect=${encodeURIComponent(currentPath)}`} replace />;
  }

  return <>{children}</>;
};

export const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--paper)] text-[var(--ink)]">
        <div className="w-10 h-10 border-3 border-[var(--ink)] border-t-[var(--tomato)] rounded-full animate-spin mb-4" />
        <span className="font-fraunces italic text-lg text-[var(--ink)]">Verifying session...</span>
      </div>
    );
  }

  if (status === 'authenticated') {
    const searchParams = new URLSearchParams(location.search);
    const redirectUrl = getSafeRedirect(searchParams.get('redirect'), '/');
    return <Navigate to={redirectUrl} replace />;
  }

  return <>{children}</>;
};

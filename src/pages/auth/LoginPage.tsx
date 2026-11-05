import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { TextField } from '../../components/auth/TextField';
import { PasswordField } from '../../components/auth/PasswordField';
import { Banner } from '../../components/auth/Banner';
import { authCopy } from '../../i18n/auth.en';
import { getSafeRedirect } from '../../components/auth/RouteGuards';
import { ArrowRight, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = `Sign In — ${authCopy.common.appName}`;
    emailRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);

    // Validation
    const nextErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      nextErrors.email = authCopy.errors.requiredField;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = authCopy.errors.invalidEmail;
    }

    if (!password) {
      nextErrors.password = authCopy.errors.requiredField;
    }

    setErrors(nextErrors);

    // Accessibility focus management: focus first invalid field
    if (nextErrors.email) {
      emailRef.current?.focus();
      return;
    }
    if (nextErrors.password) {
      passwordRef.current?.focus();
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password, rememberMe);
      const searchParams = new URLSearchParams(location.search);
      const target = getSafeRedirect(searchParams.get('redirect'), '/');
      navigate(target, { replace: true });
    } catch (err: any) {
      setErrorBanner(err.detail || authCopy.login.invalidCredentials);
      passwordRef.current?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '') || '/api/v1';
    window.location.href = `${apiBase}/auth/oauth/google`;
  };

  return (
    <AuthLayout
      title={authCopy.login.title}
      subtitle={authCopy.login.subtitle}
    >
      {errorBanner && (
        <Banner
          type="error"
          message={errorBanner}
          onDismiss={() => setErrorBanner(null)}
        />
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Email */}
        <TextField
          ref={emailRef}
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          label={authCopy.login.emailLabel}
          placeholder={authCopy.login.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          required
        />

        {/* Password */}
        <PasswordField
          ref={passwordRef}
          id="login-password"
          name="password"
          autoComplete="current-password"
          label={authCopy.login.passwordLabel}
          placeholder={authCopy.login.passwordPlaceholder}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          required
          rightAction={
            <Link
              to="/forgot-password"
              className="text-xs text-[var(--tomato-ink)] hover:underline font-semibold"
            >
              {authCopy.login.forgotPassword}
            </Link>
          }
        />

        {/* Remember Me */}
        <div className="flex items-center gap-2.5 pt-1">
          <input
            type="checkbox"
            id="login-remember"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-2 border-[var(--ink)] accent-[var(--tomato)] cursor-pointer"
          />
          <label
            htmlFor="login-remember"
            className="text-xs text-[var(--muted)] cursor-pointer select-none font-medium"
          >
            {authCopy.login.rememberMe}
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="planner-btn btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 mt-2 group"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{authCopy.common.loading}</span>
            </>
          ) : (
            <>
              <span className="font-bold">{authCopy.login.submitButton}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-[var(--rule)]"></div>
          <span className="flex-shrink mx-3 text-xs font-caveat font-bold text-[var(--faint)]">
            {authCopy.common.or}
          </span>
          <div className="flex-grow border-t border-[var(--rule)]"></div>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          className="planner-btn btn-secondary w-full py-2.5 text-xs text-[var(--ink)] flex items-center justify-center gap-2.5"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="font-semibold">{authCopy.login.googleButton}</span>
        </button>

        {/* Quick Demo Login (Instant Access) */}
        <button
          type="button"
          onClick={async () => {
            setEmail('demo@aura.local');
            setPassword('AuraPlanner2026!');
            setIsLoading(true);
            try {
              await login('demo@aura.local', 'AuraPlanner2026!', false);
              navigate('/', { replace: true });
            } catch (err: any) {
              setErrorBanner(err.detail || 'Demo sign-in failed.');
            } finally {
              setIsLoading(false);
            }
          }}
          className="planner-btn btn-secondary w-full py-2.5 text-xs text-[var(--tomato-ink)] font-bold flex items-center justify-center gap-2 border-dashed border-2 border-[var(--tomato)] hover:bg-[var(--tomato)]/10"
        >
          <span>⚡ One-Click Sign In (Demo User: Mathi)</span>
        </button>

        {/* Footer Link */}
        <div className="text-center pt-2 text-xs text-[var(--muted)]">
          <span>{authCopy.login.noAccount} </span>
          <Link
            to="/signup"
            className="text-[var(--tomato-ink)] font-semibold hover:underline"
          >
            {authCopy.login.signUpLink}
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};


import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { TextField } from '../../components/auth/TextField';
import { PasswordField } from '../../components/auth/PasswordField';
import { StrengthMeter, evaluatePasswordStrength } from '../../components/auth/StrengthMeter';
import { Banner } from '../../components/auth/Banner';
import { authCopy } from '../../i18n/auth.en';
import { ArrowRight, Loader2, MailCheck } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [verificationPending, setVerificationPending] = useState(false);

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = `Create Account — ${authCopy.common.appName}`;
    nameRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);

    const nextErrors: typeof errors = {};

    if (!name.trim()) {
      nextErrors.name = authCopy.errors.requiredField;
    }

    if (!email.trim()) {
      nextErrors.email = authCopy.errors.requiredField;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = authCopy.errors.invalidEmail;
    }

    const strength = evaluatePasswordStrength(password);
    if (!password) {
      nextErrors.password = authCopy.errors.requiredField;
    } else if (!strength.hasLength) {
      nextErrors.password = authCopy.errors.passwordTooShort;
    } else if (!strength.hasLetter) {
      nextErrors.password = authCopy.errors.passwordMissingLetter;
    } else if (!strength.hasNumber) {
      nextErrors.password = authCopy.errors.passwordMissingNumber;
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = authCopy.errors.requiredField;
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = authCopy.errors.passwordMismatch;
    }

    setErrors(nextErrors);

    // Focus first invalid field
    if (nextErrors.name) {
      nameRef.current?.focus();
      return;
    }
    if (nextErrors.email) {
      emailRef.current?.focus();
      return;
    }
    if (nextErrors.password) {
      passwordRef.current?.focus();
      return;
    }
    if (nextErrors.confirmPassword) {
      confirmPasswordRef.current?.focus();
      return;
    }

    setIsLoading(true);

    try {
      const res = await register(name, email, password);
      if (res.emailVerificationRequired) {
        setVerificationPending(true);
      } else {
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      setErrorBanner(err.detail || 'Failed to create account.');
      emailRef.current?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '') || '/api/v1';
    window.location.href = `${apiBase}/auth/oauth/google`;
  };

  if (verificationPending) {
    return (
      <AuthLayout
        title={authCopy.signup.successTitle}
        subtitle={authCopy.signup.successMessage}
      >
        <div className="text-center py-6 space-y-4">
          <div className="w-14 h-14 rounded-full bg-[var(--green)]/15 border-2 border-[var(--green)] flex items-center justify-center mx-auto text-[var(--green)]">
            <MailCheck className="w-7 h-7 stroke-[2.5]" />
          </div>

          <p className="text-xs text-[var(--muted)] max-w-sm mx-auto leading-relaxed">
            We sent a verification link to <strong className="text-[var(--ink)]">{email}</strong>. Click the link to complete registration.
          </p>

          <div className="pt-4">
            <Link
              to="/login"
              className="planner-btn btn-primary px-6 py-2.5 text-xs font-semibold"
            >
              {authCopy.common.backToLogin}
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={authCopy.signup.title}
      subtitle={authCopy.signup.subtitle}
    >
      {errorBanner && (
        <Banner
          type="error"
          message={errorBanner}
          onDismiss={() => setErrorBanner(null)}
        />
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Full Name */}
        <TextField
          ref={nameRef}
          id="signup-name"
          name="name"
          autoComplete="name"
          label={authCopy.signup.nameLabel}
          placeholder={authCopy.signup.namePlaceholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          required
        />

        {/* Email */}
        <TextField
          ref={emailRef}
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          label={authCopy.signup.emailLabel}
          placeholder={authCopy.signup.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          required
        />

        {/* Password */}
        <div>
          <PasswordField
            ref={passwordRef}
            id="signup-password"
            name="password"
            autoComplete="new-password"
            label={authCopy.signup.passwordLabel}
            placeholder={authCopy.signup.passwordPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            required
          />
          <StrengthMeter password={password} />
        </div>

        {/* Confirm Password */}
        <PasswordField
          ref={confirmPasswordRef}
          id="signup-confirm-password"
          name="confirmPassword"
          autoComplete="new-password"
          label={authCopy.signup.confirmPasswordLabel}
          placeholder={authCopy.signup.confirmPasswordPlaceholder}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          required
        />

        {/* Terms text */}
        <p className="text-[11.5px] text-[var(--muted)] leading-relaxed pt-1">
          {authCopy.signup.termsText}
        </p>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="planner-btn btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 group"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{authCopy.common.loading}</span>
            </>
          ) : (
            <>
              <span className="font-bold">{authCopy.signup.submitButton}</span>
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
          <span className="font-semibold">{authCopy.signup.googleButton}</span>
        </button>

        {/* Footer Link */}
        <div className="text-center pt-2 text-xs text-[var(--muted)]">
          <span>{authCopy.signup.hasAccount} </span>
          <Link
            to="/login"
            className="text-[var(--tomato-ink)] font-semibold hover:underline"
          >
            {authCopy.signup.signInLink}
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};


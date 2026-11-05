import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { TextField } from '../../components/auth/TextField';
import { Banner } from '../../components/auth/Banner';
import { authCopy } from '../../i18n/auth.en';
import { ArrowLeft, ArrowRight, Loader2, MailCheck } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | undefined>(undefined);

  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = `Reset Password — ${authCopy.common.appName}`;
    emailRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);

    if (!email.trim()) {
      setEmailError(authCopy.errors.requiredField);
      emailRef.current?.focus();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError(authCopy.errors.invalidEmail);
      emailRef.current?.focus();
      return;
    }

    setEmailError(undefined);
    setIsLoading(true);

    try {
      await forgotPassword(email);
      setIsSubmitted(true);
    } catch (err: any) {
      setErrorBanner(err.detail || 'Failed to request reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <AuthLayout
        title={authCopy.forgotPassword.confirmationTitle}
        subtitle={authCopy.forgotPassword.confirmationMessage}
      >
        <div className="text-center py-6 space-y-4">
          <div className="w-14 h-14 rounded-full bg-[var(--green)]/15 border-2 border-[var(--green)] flex items-center justify-center mx-auto text-[var(--green)]">
            <MailCheck className="w-7 h-7 stroke-[2.5]" />
          </div>

          <p className="text-xs text-[var(--muted)] max-w-sm mx-auto leading-relaxed">
            If an Aura account exists for <strong className="text-[var(--ink)]">{email}</strong>, a secure reset link valid for 30 minutes has been sent.
          </p>

          <div className="pt-4 flex flex-col items-center gap-3">
            <Link
              to="/login"
              className="planner-btn btn-primary px-6 py-2.5 text-xs font-semibold"
            >
              {authCopy.common.backToLogin}
            </Link>

            <button
              type="button"
              onClick={() => setIsSubmitted(false)}
              className="text-xs text-[var(--muted)] hover:text-[var(--ink)] underline"
            >
              Try another email address
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={authCopy.forgotPassword.title}
      subtitle={authCopy.forgotPassword.subtitle}
    >
      {errorBanner && (
        <Banner
          type="error"
          message={errorBanner}
          onDismiss={() => setErrorBanner(null)}
        />
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <TextField
          ref={emailRef}
          id="forgot-email"
          name="email"
          type="email"
          autoComplete="email"
          label={authCopy.forgotPassword.emailLabel}
          placeholder={authCopy.forgotPassword.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={emailError}
          required
        />

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
              <span className="font-bold">{authCopy.forgotPassword.submitButton}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        <div className="text-center pt-2">
          <Link
            to="/login"
            className="text-xs font-semibold text-[var(--ink)] hover:text-[var(--tomato-ink)] inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{authCopy.common.backToLogin}</span>
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

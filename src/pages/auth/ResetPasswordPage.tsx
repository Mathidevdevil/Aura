import React, { useState, useRef, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { PasswordField } from '../../components/auth/PasswordField';
import { StrengthMeter, evaluatePasswordStrength } from '../../components/auth/StrengthMeter';
import { Banner } from '../../components/auth/Banner';
import { authCopy } from '../../i18n/auth.en';
import { ArrowRight, Loader2, CheckCircle2, AlertOctagon } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});

  const newPasswordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = `Set New Password — ${authCopy.common.appName}`;
    if (!token) {
      setTokenError(authCopy.resetPassword.tokenExpiredMessage);
    } else {
      newPasswordRef.current?.focus();
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!token) {
      setTokenError(authCopy.resetPassword.tokenExpiredMessage);
      return;
    }

    const nextErrors: typeof errors = {};
    const strength = evaluatePasswordStrength(newPassword);

    if (!newPassword) {
      nextErrors.newPassword = authCopy.errors.requiredField;
    } else if (!strength.hasLength) {
      nextErrors.newPassword = authCopy.errors.passwordTooShort;
    } else if (!strength.hasLetter) {
      nextErrors.newPassword = authCopy.errors.passwordMissingLetter;
    } else if (!strength.hasNumber) {
      nextErrors.newPassword = authCopy.errors.passwordMissingNumber;
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = authCopy.errors.requiredField;
    } else if (confirmPassword !== newPassword) {
      nextErrors.confirmPassword = authCopy.errors.passwordMismatch;
    }

    setErrors(nextErrors);

    if (nextErrors.newPassword) {
      newPasswordRef.current?.focus();
      return;
    }
    if (nextErrors.confirmPassword) {
      confirmPasswordRef.current?.focus();
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(token, newPassword);
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    } catch (err: any) {
      if (err.status === 400 || err.status === 404 || err.code?.includes('TOKEN')) {
        setTokenError(err.detail || authCopy.resetPassword.tokenExpiredMessage);
      } else {
        setFormError(err.detail || 'Failed to reset password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenError) {
    return (
      <AuthLayout
        title={authCopy.resetPassword.tokenExpiredTitle}
        subtitle={authCopy.resetPassword.tokenExpiredMessage}
      >
        <div className="text-center py-6 space-y-4">
          <div className="w-14 h-14 rounded-full bg-[var(--tomato)]/15 border-2 border-[var(--tomato)] flex items-center justify-center mx-auto text-[var(--tomato-ink)]">
            <AlertOctagon className="w-7 h-7 stroke-[2.5]" />
          </div>

          <p className="text-xs text-[var(--muted)] max-w-sm mx-auto leading-relaxed">
            For security, password reset tokens are single-use and expire within 30 minutes of issuance.
          </p>

          <div className="pt-4 flex flex-col items-center gap-3">
            <Link
              to="/forgot-password"
              className="planner-btn btn-primary px-6 py-2.5 text-xs font-semibold"
            >
              {authCopy.resetPassword.requestNewLinkButton}
            </Link>

            <Link
              to="/login"
              className="text-xs text-[var(--muted)] hover:text-[var(--ink)] underline"
            >
              {authCopy.common.backToLogin}
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (isSuccess) {
    return (
      <AuthLayout
        title={authCopy.resetPassword.successTitle}
        subtitle={authCopy.resetPassword.successMessage}
      >
        <div className="text-center py-6 space-y-4">
          <div className="w-14 h-14 rounded-full bg-[var(--green)]/15 border-2 border-[var(--green)] flex items-center justify-center mx-auto text-[var(--green)]">
            <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
          </div>

          <p className="text-xs text-[var(--muted)] max-w-sm mx-auto leading-relaxed">
            Redirecting you to sign in with your new credentials...
          </p>

          <div className="pt-4">
            <Link
              to="/login"
              className="planner-btn btn-primary px-6 py-2.5 text-xs font-semibold"
            >
              Sign in now
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={authCopy.resetPassword.title}
      subtitle={authCopy.resetPassword.subtitle}
    >
      {formError && (
        <Banner
          type="error"
          message={formError}
          onDismiss={() => setFormError(null)}
        />
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <PasswordField
            ref={newPasswordRef}
            id="reset-new-password"
            name="newPassword"
            autoComplete="new-password"
            label={authCopy.resetPassword.newPasswordLabel}
            placeholder={authCopy.resetPassword.newPasswordPlaceholder}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={errors.newPassword}
            required
          />
          <StrengthMeter password={newPassword} />
        </div>

        <PasswordField
          ref={confirmPasswordRef}
          id="reset-confirm-password"
          name="confirmPassword"
          autoComplete="new-password"
          label={authCopy.resetPassword.confirmPasswordLabel}
          placeholder={authCopy.resetPassword.confirmPasswordPlaceholder}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
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
              <span className="font-bold">{authCopy.resetPassword.submitButton}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        <div className="text-center pt-2">
          <Link
            to="/login"
            className="text-xs text-[var(--muted)] hover:text-[var(--ink)] underline"
          >
            {authCopy.common.backToLogin}
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};


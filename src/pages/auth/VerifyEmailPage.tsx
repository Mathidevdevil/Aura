import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { TextField } from '../../components/auth/TextField';
import { Banner } from '../../components/auth/Banner';
import { authCopy } from '../../i18n/auth.en';
import { CheckCircle2, AlertOctagon, Loader2, MailCheck } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { verifyEmail, resendVerification } = useAuth();

  const [state, setState] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Resend form state
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    document.title = `Verify Email — ${authCopy.common.appName}`;

    if (!token) {
      setState('failed');
      setErrorMessage('Missing verification token. Please use the exact link sent to your email.');
      return;
    }

    let isMounted = true;

    async function executeVerification() {
      try {
        await verifyEmail(token as string);
        if (isMounted) {
          setState('success');
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 2000);
        }
      } catch (err: any) {
        if (isMounted) {
          setState('failed');
          setErrorMessage(err.detail || authCopy.verifyEmail.failedMessage);
        }
      }
    }

    executeVerification();

    return () => {
      isMounted = false;
    };
  }, [token, verifyEmail, navigate]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resendEmail)) return;

    setIsResending(true);
    setResendSuccess(false);

    try {
      await resendVerification(resendEmail);
      setResendSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.detail || 'Failed to resend verification email.');
    } finally {
      setIsResending(false);
    }
  };

  if (state === 'verifying') {
    return (
      <AuthLayout
        title={authCopy.verifyEmail.verifyingTitle}
        subtitle={authCopy.verifyEmail.verifyingSubtitle}
      >
        <div className="text-center py-10 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-[var(--tomato)]" />
          <p className="text-xs text-[var(--muted)]">Verifying security token...</p>
        </div>
      </AuthLayout>
    );
  }

  if (state === 'success') {
    return (
      <AuthLayout
        title={authCopy.verifyEmail.successTitle}
        subtitle={authCopy.verifyEmail.successMessage}
      >
        <div className="text-center py-6 space-y-4">
          <div className="w-14 h-14 rounded-full bg-[var(--green)]/15 border-2 border-[var(--green)] flex items-center justify-center mx-auto text-[var(--green)]">
            <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
          </div>

          <p className="text-xs text-[var(--muted)] max-w-sm mx-auto leading-relaxed">
            Your Aura account is fully activated. Redirecting you to your notebook planner...
          </p>

          <div className="pt-4">
            <Link
              to="/"
              className="planner-btn btn-primary px-6 py-2.5 text-xs font-semibold"
            >
              {authCopy.verifyEmail.goToDashboardButton}
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={authCopy.verifyEmail.failedTitle}
      subtitle={errorMessage || authCopy.verifyEmail.failedMessage}
    >
      <div className="space-y-6">
        <div className="w-12 h-12 rounded-full bg-[var(--tomato)]/15 border-2 border-[var(--tomato)] flex items-center justify-center mx-auto text-[var(--tomato-ink)]">
          <AlertOctagon className="w-6 h-6 stroke-[2.5]" />
        </div>

        {resendSuccess && (
          <Banner
            type="success"
            message={authCopy.verifyEmail.resendSuccess}
          />
        )}

        <form onSubmit={handleResend} className="space-y-4 pt-2 border-t border-[var(--rule)]">
          <div className="text-xs font-semibold text-[var(--ink)]">
            Need a new verification link?
          </div>

          <TextField
            id="resend-email"
            name="email"
            type="email"
            label="Account email"
            placeholder="you@example.com"
            value={resendEmail}
            onChange={(e) => setResendEmail(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={isResending}
            className="planner-btn btn-primary w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2"
          >
            {isResending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Sending link...</span>
              </>
            ) : (
              <>
                <MailCheck className="w-3.5 h-3.5" />
                <span>{authCopy.verifyEmail.resendButton}</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
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
};

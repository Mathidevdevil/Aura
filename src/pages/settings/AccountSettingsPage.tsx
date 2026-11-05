import React, { useState, useEffect } from 'react';
import { useAuth, UserSession } from '../../context/AuthContext';
import { TextField } from '../../components/auth/TextField';
import { PasswordField } from '../../components/auth/PasswordField';
import { StrengthMeter, evaluatePasswordStrength } from '../../components/auth/StrengthMeter';
import { Banner } from '../../components/auth/Banner';
import { Toast } from '../../components/auth/Toast';
import { authCopy } from '../../i18n/auth.en';
import { 
  ShieldCheck, 
  KeyRound, 
  Laptop, 
  Trash2, 
  Loader2, 
  AlertTriangle 
} from 'lucide-react';

export const AccountSettingsPage: React.FC = () => {
  const { 
    user, 
    updateProfile, 
    changePassword, 
    getSessions, 
    revokeSession, 
    deleteAccount 
  } = useAuth();

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Sessions State
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  // Delete Account State
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Feedback State
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    document.title = `Account Settings — ${authCopy.common.appName}`;
    loadSessions();
  }, []);

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user?.name]);

  const loadSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const data = await getSessions();
      setSessions(data);
    } catch {
      // Sessions loading silently fails if offline
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsUpdatingProfile(true);
    setBanner(null);

    try {
      await updateProfile(name.trim());
      setToastMessage('Profile name updated successfully.');
    } catch (err: any) {
      setBanner({ type: 'error', message: err.detail || 'Failed to update profile.' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);

    const strength = evaluatePasswordStrength(newPassword);
    if (!currentPassword) {
      setBanner({ type: 'error', message: 'Current password is required.' });
      return;
    }
    if (!strength.hasLength || !strength.hasLetter || !strength.hasNumber) {
      setBanner({ type: 'error', message: 'New password does not meet security requirements.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setBanner({ type: 'error', message: 'New passwords do not match.' });
      return;
    }

    setIsChangingPassword(true);

    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setToastMessage('Password updated. All other active sessions have been revoked.');
      loadSessions();
    } catch (err: any) {
      setBanner({ type: 'error', message: err.detail || 'Failed to update password.' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeSession(sessionId);
      setToastMessage('Session signed out.');
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (err: any) {
      setBanner({ type: 'error', message: err.detail || 'Failed to revoke session.' });
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmation !== 'DELETE') return;

    if (!window.confirm('Are you absolutely certain? This will delete all your processes, goals, and history permanently.')) {
      return;
    }

    setIsDeletingAccount(true);

    try {
      await deleteAccount(deleteConfirmation);
    } catch (err: any) {
      setBanner({ type: 'error', message: err.detail || 'Failed to delete account.' });
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      
      {/* Page Header */}
      <div className="pb-4 border-b-2 border-[var(--ink)]">
        <h1 className="font-fraunces font-semibold text-[36px] text-[var(--ink)] leading-tight">
          {authCopy.account.title}
        </h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          {authCopy.account.subtitle}
        </p>
      </div>

      {banner && (
        <Banner
          type={banner.type}
          message={banner.message}
          onDismiss={() => setBanner(null)}
        />
      )}

      {toastMessage && (
        <Toast
          type="success"
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* 1. Profile Section */}
      <section className="planner-card p-6 sm:p-7 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[var(--rule)]">
          <ShieldCheck className="w-5 h-5 text-[var(--tomato)]" />
          <h2 className="font-fraunces font-semibold text-xl text-[var(--ink)]">
            {authCopy.account.profileSection}
          </h2>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
          <TextField
            id="profile-email"
            name="email"
            type="email"
            label={authCopy.account.emailLabel}
            value={user?.email || ''}
            disabled
            className="opacity-70 cursor-not-allowed bg-[var(--card)]"
            helperText="Email cannot be changed directly."
          />

          <TextField
            id="profile-name"
            name="name"
            label={authCopy.account.nameLabel}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={isUpdatingProfile || name === user?.name}
            className="planner-btn btn-primary text-xs py-2 px-4"
          >
            {isUpdatingProfile ? 'Saving...' : authCopy.account.updateProfileButton}
          </button>
        </form>
      </section>

      {/* 2. Security / Password Section */}
      <section className="planner-card p-6 sm:p-7 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[var(--rule)]">
          <KeyRound className="w-5 h-5 text-[var(--blue)]" />
          <h2 className="font-fraunces font-semibold text-xl text-[var(--ink)]">
            {authCopy.account.securitySection}
          </h2>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <PasswordField
            id="current-password"
            label={authCopy.account.currentPasswordLabel}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />

          <div>
            <PasswordField
              id="account-new-password"
              label={authCopy.account.newPasswordLabel}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <StrengthMeter password={newPassword} />
          </div>

          <PasswordField
            id="account-confirm-password"
            label={authCopy.account.confirmPasswordLabel}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={isChangingPassword || !currentPassword || !newPassword}
            className="planner-btn btn-primary text-xs py-2 px-4"
          >
            {isChangingPassword ? 'Updating...' : authCopy.account.changePasswordButton}
          </button>
        </form>
      </section>

      {/* 3. Active Sessions Section */}
      <section className="planner-card p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--rule)]">
          <div className="flex items-center gap-2">
            <Laptop className="w-5 h-5 text-[var(--green)]" />
            <h2 className="font-fraunces font-semibold text-xl text-[var(--ink)]">
              {authCopy.account.sessionsSection}
            </h2>
          </div>

          <button
            type="button"
            onClick={loadSessions}
            className="text-xs text-[var(--tomato-ink)] font-semibold hover:underline"
          >
            Refresh
          </button>
        </div>

        {isLoadingSessions ? (
          <div className="py-6 text-center text-xs text-[var(--muted)]">
            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[var(--tomato)]" />
            <span>Loading active sessions...</span>
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-6 text-center text-xs text-[var(--muted)]">
            <span>Current session active.</span>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--rule)]">
            {sessions.map((sess) => (
              <li key={sess.id} className="py-3 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[var(--ink)]">
                      {sess.userAgent || 'Web Browser'}
                    </span>
                    {sess.isCurrent && (
                      <span className="goal-pill border-[var(--green)] text-[var(--green)] text-[10px] py-0 px-2 font-bold">
                        {authCopy.account.currentSessionBadge}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[var(--muted)] tabular-nums">
                    IP: {sess.ipAddress} • Signed in: {new Date(sess.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {!sess.isCurrent && (
                  <button
                    type="button"
                    onClick={() => handleRevokeSession(sess.id)}
                    className="planner-btn btn-secondary text-xs py-1 px-2.5 text-[var(--tomato-ink)]"
                  >
                    {authCopy.account.revokeButton}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 4. Danger Zone: Delete Account */}
      <section className="planner-card p-6 sm:p-7 border-2 border-[var(--tomato)] space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[var(--rule)] text-[var(--tomato-ink)]">
          <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
          <h2 className="font-fraunces font-semibold text-xl">
            {authCopy.account.dangerSection}
          </h2>
        </div>

        <p className="text-xs text-[var(--muted)] leading-relaxed">
          {authCopy.account.deleteWarning}
        </p>

        <form onSubmit={handleDeleteAccount} className="space-y-4 max-w-md pt-2">
          <TextField
            id="delete-confirmation-input"
            label={authCopy.account.deleteConfirmationPrompt}
            placeholder="DELETE"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={isDeletingAccount || deleteConfirmation !== 'DELETE'}
            className="planner-btn bg-[var(--tomato)] text-white hover:bg-[var(--tomato-ink)] text-xs py-2 px-4 flex items-center gap-2 disabled:opacity-50"
          >
            {isDeletingAccount ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            <span>{authCopy.account.deleteButton}</span>
          </button>
        </form>
      </section>

    </div>
  );
};


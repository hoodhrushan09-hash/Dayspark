import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User as UserIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../common/Logo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup' | 'forgot';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  onSuccess,
}) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Reset errors when mode changes
  const switchMode = (newMode: 'signin' | 'signup' | 'forgot') => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await signInWithGoogle();
      onClose();
      onSuccess?.();
    } catch (err: unknown) {
      console.error('Google sign-in error:', err);
      if (err instanceof Error && err.message.includes('popup-closed-by-user')) {
        setErrorMessage('Sign-in cancelled. Please try again.');
      } else {
        setErrorMessage('Unable to complete Google sign-in. Please try again or use email.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (mode === 'signup') {
      if (!displayName.trim()) {
        setErrorMessage('Please enter your name.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }

      setIsLoading(true);
      try {
        await signUpWithEmail(email.trim(), password, displayName.trim());
        onClose();
        onSuccess?.();
      } catch (err: unknown) {
        console.error('Signup error:', err);
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('email-already-in-use')) {
          setErrorMessage('An account with this email already exists. Try signing in.');
        } else if (msg.includes('invalid-email')) {
          setErrorMessage('The email address provided is invalid.');
        } else {
          setErrorMessage('Could not create account. Please check details and try again.');
        }
      } finally {
        setIsLoading(false);
      }
    } else if (mode === 'signin') {
      if (!email.trim() || !email.includes('@')) {
        setErrorMessage('Please enter your email address.');
        return;
      }
      if (!password) {
        setErrorMessage('Please enter your password.');
        return;
      }

      setIsLoading(true);
      try {
        await signInWithEmail(email.trim(), password);
        onClose();
        onSuccess?.();
      } catch (err: unknown) {
        console.error('Sign-in error:', err);
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('invalid-credential') || msg.includes('user-not-found') || msg.includes('wrong-password')) {
          setErrorMessage('Incorrect email or password. Please check and try again.');
        } else if (msg.includes('too-many-requests')) {
          setErrorMessage('Too many failed attempts. Please wait a few moments or reset password.');
        } else {
          setErrorMessage('Sign in failed. Please check your credentials.');
        }
      } finally {
        setIsLoading(false);
      }
    } else if (mode === 'forgot') {
      if (!email.trim() || !email.includes('@')) {
        setErrorMessage('Please enter your email address.');
        return;
      }

      setIsLoading(true);
      try {
        await resetPassword(email.trim());
        setSuccessMessage('Password reset instructions have been sent to your email.');
      } catch (err: unknown) {
        console.error('Password reset error:', err);
        setErrorMessage('Could not send reset instructions. Please verify the email and try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
    >
      <div className="text-center mb-6">
        <div className="flex justify-center mb-3">
          <Logo size="md" />
        </div>
        <h3 className="text-2xl font-bold text-[#262626] dark:text-[#F3F3F0] tracking-tight">
          {mode === 'signin' && 'Welcome back'}
          {mode === 'signup' && 'Create your DaySpark account'}
          {mode === 'forgot' && 'Reset your password'}
        </h3>
        <p className="text-sm text-[#747474] dark:text-[#A0A09B] mt-1.5">
          {mode === 'signin' && 'Plan your day and continue making progress.'}
          {mode === 'signup' && 'Free forever for personal planning. No credit card required.'}
          {mode === 'forgot' && 'Enter your account email to receive a secure recovery link.'}
        </p>
      </div>

      {/* Error alert banner */}
      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success alert banner */}
      {successMessage && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Google Sign-in button */}
      {mode !== 'forgot' && (
        <div className="mb-4">
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="btn-press w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-white dark:bg-[#292B28] hover:bg-[#F8F8F5] dark:hover:bg-[#323530] text-sm font-medium text-[#262626] dark:text-[#F3F3F0] shadow-2xs hover:shadow-xs disabled:opacity-50 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF7058]"
          >
            <svg className="w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-105" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E8E7E0] dark:border-[#2E302B]"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-[#20221F] px-2 text-[#747474] dark:text-[#A0A09B]">
                Or continue with email
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {mode === 'signup' && (
          <div>
            <label className="block text-xs font-semibold text-[#262626] dark:text-[#F3F3F0] mb-1">
              Your Name
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#747474]" />
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Alex Morgan"
                className="input-smooth w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#292B28] text-[#262626] dark:text-[#F3F3F0]"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[#262626] dark:text-[#F3F3F0] mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#747474]" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input-smooth w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#292B28] text-[#262626] dark:text-[#F3F3F0]"
            />
          </div>
        </div>

        {mode !== 'forgot' && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#262626] dark:text-[#F3F3F0]">
                Password
              </label>
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="text-xs font-medium text-[#FF7058] hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#747474]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-smooth w-full pl-9 pr-9 py-2 text-sm rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#292B28] text-[#262626] dark:text-[#F3F3F0]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#747474] hover:text-[#262626] dark:hover:text-[#F3F3F0] transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {mode === 'signup' && (
          <div>
            <label className="block text-xs font-semibold text-[#262626] dark:text-[#F3F3F0] mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#747474]" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="input-smooth w-full pl-9 pr-9 py-2 text-sm rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#292B28] text-[#262626] dark:text-[#F3F3F0]"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#747474] hover:text-[#262626] dark:hover:text-[#F3F3F0] transition-colors p-1"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="btn-press w-full mt-2 py-2.5 px-4 rounded-xl font-semibold text-sm text-white bg-[#FF7058] hover:bg-[#F06148] shadow-xs hover:shadow-md hover:shadow-[#FF7058]/20 disabled:opacity-50 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF7058]"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span>Processing...</span>
            </span>
          ) : (
            <>
              {mode === 'signin' && 'Sign In'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'forgot' && 'Send Reset Email'}
            </>
          )}
        </button>
      </form>

      {/* Mode switcher links */}
      <div className="mt-5 pt-4 border-t border-[#E8E7E0] dark:border-[#2E302B] text-center text-xs text-[#747474] dark:text-[#A0A09B]">
        {mode === 'signin' && (
          <p>
            Don't have an account yet?{' '}
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className="font-semibold text-[#FF7058] hover:underline cursor-pointer"
            >
              Sign up for free
            </button>
          </p>
        )}
        {mode === 'signup' && (
          <p>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className="font-semibold text-[#FF7058] hover:underline cursor-pointer"
            >
              Sign in
            </button>
          </p>
        )}
        {mode === 'forgot' && (
          <p>
            Remember your password?{' '}
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className="font-semibold text-[#FF7058] hover:underline cursor-pointer"
            >
              Back to sign in
            </button>
          </p>
        )}
      </div>
    </Modal>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LandingPage } from './components/landing/LandingPage';
import { AppShell } from './components/app/AppShell';
import { AuthModal } from './components/auth/AuthModal';
import { Logo } from './components/common/Logo';
import { LoadingScreen } from './components/common/LoadingScreen';

function AppContent() {
  const { currentUser, loading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | 'forgot'>('signin');

  // Check URL pathname or query params for direct auth links (e.g. /login, /signup)
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('login')) {
      setAuthModalMode('signin');
      setAuthModalOpen(true);
    } else if (path.includes('signup') || path.includes('register')) {
      setAuthModalMode('signup');
      setAuthModalOpen(true);
    } else if (path.includes('forgot')) {
      setAuthModalMode('forgot');
      setAuthModalOpen(true);
    }
  }, []);

  // Sync document title for landing page and auth modal states
  useEffect(() => {
    if (authModalOpen) {
      if (authModalMode === 'signin') {
        document.title = 'Sign In | DaySpark';
      } else if (authModalMode === 'signup') {
        document.title = 'Create Account | DaySpark';
      } else if (authModalMode === 'forgot') {
        document.title = 'Reset Password | DaySpark';
      }
    } else if (!currentUser) {
      document.title = 'DaySpark — Make today count, your way';
    }
  }, [authModalOpen, authModalMode, currentUser]);

  if (loading) {
    return <LoadingScreen message="Getting your day ready..." />;
  }

  return (
    <>
      {currentUser ? (
        <AppShell />
      ) : (
        <LandingPage
          onOpenSignIn={() => {
            setAuthModalMode('signin');
            setAuthModalOpen(true);
          }}
          onOpenSignUp={() => {
            setAuthModalMode('signup');
            setAuthModalOpen(true);
          }}
        />
      )}

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

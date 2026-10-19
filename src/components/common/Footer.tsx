import React, { useState } from 'react';
import { Logo } from './Logo';
import { Modal } from './Modal';
import { Sparkles, Shield, FileText } from 'lucide-react';

interface FooterProps {
  onOpenSignIn: () => void;
  onOpenSignUp: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenSignIn, onOpenSignUp }) => {
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  return (
    <footer className="border-t border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#161715] transition-colors py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand col */}
          <div className="md:col-span-2 space-y-4">
            <Logo size="md" />
            <p className="text-sm text-[#747474] dark:text-[#A0A09B] max-w-sm leading-relaxed">
              DaySpark helps you turn overwhelming days into calm, manageable plans through small,
              meaningful actions. Plan your day, build daily habits, and protect your focus.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FF7058]/10 text-xs text-[#FF7058] font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Make today count, your way.</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#262626] dark:text-[#F3F3F0] mb-3">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm text-[#747474] dark:text-[#A0A09B]">
              <li>
                <a href="#features" className="hover:text-[#FF7058] transition-all duration-150 hover:translate-x-1 inline-block">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-[#FF7058] transition-all duration-150 hover:translate-x-1 inline-block">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#preview" className="hover:text-[#FF7058] transition-all duration-150 hover:translate-x-1 inline-block">
                  Interactive Demo
                </a>
              </li>
              <li>
                <a href="#benefits" className="hover:text-[#FF7058] transition-all duration-150 hover:translate-x-1 inline-block">
                  Benefits
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-[#FF7058] transition-all duration-150 hover:translate-x-1 inline-block">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Account & Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#262626] dark:text-[#F3F3F0] mb-3">
              Account & Legal
            </h4>
            <ul className="space-y-2.5 text-sm text-[#747474] dark:text-[#A0A09B]">
              <li>
                <button
                  onClick={onOpenSignIn}
                  className="hover:text-[#FF7058] transition-all duration-150 hover:translate-x-1 cursor-pointer text-left inline-block"
                >
                  Sign In
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenSignUp}
                  className="hover:text-[#FF7058] transition-all duration-150 hover:translate-x-1 cursor-pointer text-left inline-block"
                >
                  Create Account
                </button>
              </li>
              <li>
                <button
                  onClick={() => setPrivacyOpen(true)}
                  className="hover:text-[#FF7058] transition-all duration-150 hover:translate-x-1 cursor-pointer text-left inline-block"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setTermsOpen(true)}
                  className="hover:text-[#FF7058] transition-all duration-150 hover:translate-x-1 cursor-pointer text-left inline-block"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#E8E7E0] dark:border-[#2E302B] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#747474] dark:text-[#A0A09B]">
          <p>© {new Date().getFullYear()} DaySpark. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span>Built with care for everyday focus and calm productivity.</span>
          </p>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      <Modal
        isOpen={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
        title="DaySpark Privacy Policy"
        maxWidth="lg"
      >
        <div className="space-y-3 text-sm text-[#747474] dark:text-[#A0A09B] leading-relaxed max-h-96 overflow-y-auto pr-1">
          <div className="flex items-center gap-2 text-[#262626] dark:text-[#F3F3F0] font-semibold">
            <Shield className="w-4 h-4 text-[#8EDCC0]" />
            <span>Your Data Belongs to You</span>
          </div>
          <p>
            DaySpark stores your tasks, goals, habits, and focus logs in Cloud Firestore securely
            associated with your user account ID.
          </p>
          <p>
            We do not sell, rent, or monetize your personal productivity records. Security rules enforce
            that only your authenticated account has permission to read or modify your data.
          </p>
          <p>
            You can delete your account and all associated cloud data at any time from the DaySpark
            settings menu.
          </p>
        </div>
      </Modal>

      {/* Terms Modal */}
      <Modal
        isOpen={termsOpen}
        onClose={() => setTermsOpen(false)}
        title="DaySpark Terms of Service"
        maxWidth="lg"
      >
        <div className="space-y-3 text-sm text-[#747474] dark:text-[#A0A09B] leading-relaxed max-h-96 overflow-y-auto pr-1">
          <div className="flex items-center gap-2 text-[#262626] dark:text-[#F3F3F0] font-semibold">
            <FileText className="w-4 h-4 text-[#8BCBFA]" />
            <span>Terms of Use</span>
          </div>
          <p>
            By using DaySpark, you agree to use the workspace for personal productivity and planning.
          </p>
          <p>
            DaySpark is provided to help manage personal routines and scheduling. While we strive for high
            availability and secure persistence, always keep critical backups for irreplaceable business records.
          </p>
        </div>
      </Modal>
    </footer>
  );
};

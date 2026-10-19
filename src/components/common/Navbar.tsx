import React, { useState } from 'react';
import { Menu, X, Moon, Sun, ArrowRight } from 'lucide-react';
import { Logo } from './Logo';
import { useTheme } from '../../contexts/ThemeContext';

interface NavbarProps {
  onOpenSignIn: () => void;
  onOpenSignUp: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSignIn, onOpenSignUp }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { effectiveTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(effectiveTheme === 'dark' ? 'light' : 'dark');
  };

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Interactive Demo', href: '#preview' },
    { label: 'Benefits', href: '#benefits' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#FFFDF9]/85 dark:bg-[#161715]/85 border-b border-[#E8E7E0] dark:border-[#2E302B] transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#"
          className="flex items-center gap-2 group transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF7058] rounded-xl"
        >
          <Logo size="md" />
        </a>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#747474] dark:text-[#A0A09B]">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="relative py-1 group transition-colors duration-200 hover:text-[#262626] dark:hover:text-[#F3F3F0] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF7058] rounded-md px-1"
            >
              <span className="transition-transform duration-150 inline-block group-hover:-translate-y-0.5">{link.label}</span>
              {/* Refined animated underline */}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FF7058] rounded-full transition-all duration-200 ease-out group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* Action buttons */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="p-2 rounded-xl text-[#747474] dark:text-[#A0A09B] hover:text-[#262626] dark:hover:text-white hover:bg-[#F5F5F2] dark:hover:bg-[#292B28] transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#FF7058] focus-visible:outline-hidden group"
          >
            {effectiveTheme === 'dark' ? (
              <Sun className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 transition-transform duration-300 group-hover:-rotate-12 group-hover:text-[#FF7058]" />
            )}
          </button>

          <button
            onClick={onOpenSignIn}
            className="btn-press px-4 py-2 text-sm font-medium text-[#262626] dark:text-[#F3F3F0] hover:text-[#FF7058] dark:hover:text-[#FF7058] rounded-xl hover:bg-[#FF7058]/8 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#FF7058] focus-visible:outline-hidden"
          >
            Sign In
          </button>

          <button
            onClick={onOpenSignUp}
            className="btn-press flex items-center gap-1.5 px-4.5 py-2 text-sm font-semibold text-white bg-[#FF7058] hover:bg-[#F06148] rounded-xl shadow-xs hover:shadow-md hover:shadow-[#FF7058]/25 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#FF7058] focus-visible:outline-hidden group"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-[#747474] hover:bg-[#F5F5F2] dark:hover:bg-[#292B28] transition-colors duration-200"
          >
            {effectiveTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="p-2 rounded-lg text-[#262626] dark:text-[#F3F3F0] hover:bg-[#F5F5F2] dark:hover:bg-[#292B28] transition-colors duration-200"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#161715] px-4 pt-3 pb-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-2.5">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 px-2.5 rounded-lg text-sm font-medium text-[#747474] dark:text-[#A0A09B] hover:text-[#262626] dark:hover:text-[#F3F3F0] hover:bg-[#F5F5F2] dark:hover:bg-[#20221F] transition-all duration-150"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pt-3 border-t border-[#E8E7E0] dark:border-[#2E302B] flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSignIn();
              }}
              className="w-full py-2.5 text-sm font-medium text-center rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] text-[#262626] dark:text-[#F3F3F0] hover:bg-[#F5F5F2] dark:hover:bg-[#20221F] transition-all duration-150 active:scale-[0.99]"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSignUp();
              }}
              className="w-full py-2.5 text-sm font-medium text-center rounded-xl bg-[#FF7058] hover:bg-[#F06148] text-white shadow-xs hover:shadow-md transition-all duration-150 active:scale-[0.99]"
            >
              Get Started — It's Free
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

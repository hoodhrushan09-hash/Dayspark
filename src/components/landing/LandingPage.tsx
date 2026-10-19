import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Flame,
  Clock,
  Target,
  BarChart3,
  Sliders,
  ChevronDown,
  Smile,
  ShieldCheck,
  Compass,
  Layers,
} from 'lucide-react';
import { Navbar } from '../common/Navbar';
import { Footer } from '../common/Footer';
import { InteractivePreview } from './InteractivePreview';

interface LandingPageProps {
  onOpenSignIn: () => void;
  onOpenSignUp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenSignIn, onOpenSignUp }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    document.title = 'DaySpark — Make today count, your way';
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      q: 'What is DaySpark?',
      a: 'DaySpark is a calm personal productivity application combining your daily to-dos, calendar timeline, habit matrix, goal milestones, and focus timer into a single, beautifully organized space.',
    },
    {
      q: 'Is DaySpark free to use?',
      a: 'Yes, DaySpark is free for personal daily planning and task tracking. You can create an account, log your habits, track goals, and access your data across devices.',
    },
    {
      q: 'Can I sign in with Google?',
      a: 'Absolutely. DaySpark supports both one-click Google Sign-In and standard email/password authentication via Firebase Authentication.',
    },
    {
      q: 'Will my tasks and records be saved?',
      a: 'Yes. All tasks, goals, habits, completed focus sessions, and user preferences are automatically synchronized with Cloud Firestore and tied exclusively to your account.',
    },
    {
      q: 'Can I use DaySpark on my phone or tablet?',
      a: 'Yes. DaySpark has been built from the ground up with responsive layouts, touch-friendly controls, and seamless mobile navigation for all screen sizes.',
    },
    {
      q: 'Can I switch between light and dark mode?',
      a: 'Yes! DaySpark features a handcrafted dark theme, light theme, system preference detection, and customizable accent colors (Coral, Mint, Sky, Lavender, Yellow).',
    },
    {
      q: 'Can I delete my account if I choose?',
      a: 'Yes. You can permanently delete your account and all associated Firestore records at any time directly in the Settings page.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9] dark:bg-[#161715] text-[#262626] dark:text-[#F3F3F0] transition-colors duration-200">
      <Navbar onOpenSignIn={onOpenSignIn} onOpenSignUp={onOpenSignUp} />

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6 overflow-hidden">
        {/* Subtle geometric warm glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#FF7058]/10 via-[#FFD166]/10 to-[#8EDCC0]/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

        <div className="max-w-4xl mx-auto text-center">
          {/* Friendly pill badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF7058]/10 border border-[#FF7058]/20 text-xs font-semibold text-[#FF7058] mb-6 transition-all duration-200 hover:scale-105 hover:bg-[#FF7058]/15 cursor-default shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Make today count, your way</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#262626] dark:text-[#F3F3F0] leading-[1.15] mb-6">
            Make space for <br className="hidden sm:inline" />
            <span className="text-[#FF7058] inline-block transition-transform duration-300 hover:scale-[1.01]">
              what matters.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-[#747474] dark:text-[#A0A09B] max-w-2xl mx-auto leading-relaxed mb-8">
            Plan your day, find your focus, and build better routines — all in one calm, colorful workspace designed to encourage, not overwhelm.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={onOpenSignUp}
              className="btn-press group w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-white bg-[#FF7058] hover:bg-[#F06148] shadow-md shadow-[#FF7058]/20 hover:shadow-lg hover:shadow-[#FF7058]/30 flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF7058]"
            >
              <span>Get Started — It's Free</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
            <a
              href="#preview"
              className="btn-press w-full sm:w-auto px-6 py-3.5 rounded-xl font-medium text-[#262626] dark:text-[#F3F3F0] border border-[#E8E7E0] dark:border-[#2E302B] bg-white/60 dark:bg-[#20221F]/60 hover:bg-[#F8F8F5] dark:hover:bg-[#20221F] hover:border-[#747474]/30 shadow-2xs hover:shadow-xs transition-all duration-200 text-center focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF7058]"
            >
              Explore DaySpark
            </a>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-[#747474] dark:text-[#A0A09B]">
            <span className="flex items-center gap-1.5 transition-colors duration-150 hover:text-[#262626] dark:hover:text-white cursor-default">
              <CheckCircle2 className="w-4 h-4 text-[#8EDCC0]" /> Free account
            </span>
            <span className="flex items-center gap-1.5 transition-colors duration-150 hover:text-[#262626] dark:hover:text-white cursor-default">
              <CheckCircle2 className="w-4 h-4 text-[#8EDCC0]" /> No credit card
            </span>
            <span className="flex items-center gap-1.5 transition-colors duration-150 hover:text-[#262626] dark:hover:text-white cursor-default">
              <CheckCircle2 className="w-4 h-4 text-[#8EDCC0]" /> Instant sync
            </span>
          </div>
        </div>

        {/* HERO INTERACTIVE WORKSPACE PREVIEW */}
        <div className="max-w-5xl mx-auto mt-12 sm:mt-16">
          <InteractivePreview onGetStarted={onOpenSignUp} />
        </div>
      </section>

      {/* TRUST & VALUE STRIP */}
      <section className="py-12 border-y border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9]/60 dark:bg-[#181917]/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="card-lift p-4 rounded-2xl border border-transparent hover:border-[#E8E7E0] dark:hover:border-[#2E302B] hover:bg-white dark:hover:bg-[#1E201C] flex items-start gap-3.5 group cursor-default">
              <div className="p-2.5 rounded-xl bg-[#FF7058]/10 text-[#FF7058] flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#262626] dark:text-[#F3F3F0]">
                  Your day, organized.
                </h3>
                <p className="text-xs text-[#747474] dark:text-[#A0A09B] mt-1 leading-relaxed">
                  Clear priority indicators and daily focus tasks turn sprawling backlogs into calm daily action.
                </p>
              </div>
            </div>

            <div className="card-lift p-4 rounded-2xl border border-transparent hover:border-[#E8E7E0] dark:hover:border-[#2E302B] hover:bg-white dark:hover:bg-[#1E201C] flex items-start gap-3.5 group cursor-default">
              <div className="p-2.5 rounded-xl bg-[#8BCBFA]/20 text-[#2B79B3] dark:text-[#8BCBFA] flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#262626] dark:text-[#F3F3F0]">
                  Your goals, in sight.
                </h3>
                <p className="text-xs text-[#747474] dark:text-[#A0A09B] mt-1 leading-relaxed">
                  Break big aspirations into manageable milestones and see continuous progress over time.
                </p>
              </div>
            </div>

            <div className="card-lift p-4 rounded-2xl border border-transparent hover:border-[#E8E7E0] dark:hover:border-[#2E302B] hover:bg-white dark:hover:bg-[#1E201C] flex items-start gap-3.5 group cursor-default">
              <div className="p-2.5 rounded-xl bg-[#8EDCC0]/20 text-[#1F5443] dark:text-[#8EDCC0] flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#262626] dark:text-[#F3F3F0]">
                  Your progress, visible.
                </h3>
                <p className="text-xs text-[#747474] dark:text-[#A0A09B] mt-1 leading-relaxed">
                  Real statistics on completed tasks, habit consistency streaks, and deep focus sessions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VARIED FEATURES SECTION */}
      <section id="features" className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#262626] dark:text-[#F3F3F0] tracking-tight">
              Everything you need to make today count.
            </h2>
            <p className="text-base text-[#747474] dark:text-[#A0A09B] mt-3">
              Thoughtfully built productivity tools that work harmoniously without clutter or stress.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1: Large Panel */}
            <div className="card-lift group md:col-span-2 p-8 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#1E201C] flex flex-col justify-between hover:border-[#FF7058]/40">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-[#FF7058]/10 text-[#FF7058] flex items-center justify-center mb-5 transition-transform duration-200 group-hover:scale-110">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-[#262626] dark:text-[#F3F3F0] transition-colors duration-200 group-hover:text-[#FF7058]">
                  Smart Daily Planning & Prioritization
                </h3>
                <p className="text-sm text-[#747474] dark:text-[#A0A09B] mt-2 leading-relaxed max-w-xl">
                  Choose your single most important priority for today. Organize tasks with categories, due dates, estimated minutes, and recurrence rules so you always know what to tackle next.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E8E7E0] dark:border-[#2E302B] flex flex-wrap gap-2 text-xs text-[#747474] dark:text-[#A0A09B]">
                <span className="px-2.5 py-1 rounded-lg bg-[#F5F5F2] dark:bg-[#282A26] transition-colors group-hover:bg-[#FF7058]/10 group-hover:text-[#FF7058]">
                  Urgent / High / Medium / Low
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#F5F5F2] dark:bg-[#282A26] transition-colors group-hover:bg-[#FF7058]/10 group-hover:text-[#FF7058]">
                  Custom Categories
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#F5F5F2] dark:bg-[#282A26] transition-colors group-hover:bg-[#FF7058]/10 group-hover:text-[#FF7058]">
                  Estimated Time
                </span>
              </div>
            </div>

            {/* Feature 2: Compact */}
            <div className="card-lift group p-8 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#1E201C] flex flex-col justify-between hover:border-[#8BCBFA]/50">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-[#8BCBFA]/20 text-[#2C7AB4] dark:text-[#8BCBFA] flex items-center justify-center mb-5 transition-transform duration-200 group-hover:scale-110">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-[#262626] dark:text-[#F3F3F0] transition-colors duration-200 group-hover:text-[#2C7AB4] dark:group-hover:text-[#8BCBFA]">
                  Calendar & Upcoming
                </h3>
                <p className="text-sm text-[#747474] dark:text-[#A0A09B] mt-2 leading-relaxed">
                  Switch effortlessly between Month, Week, and Day views. Click any calendar cell to schedule tasks directly.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E8E7E0] dark:border-[#2E302B] text-xs font-semibold text-[#8BCBFA]">
                Visual date planning
              </div>
            </div>

            {/* Feature 3: Compact */}
            <div className="card-lift group p-8 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#1E201C] flex flex-col justify-between hover:border-[#FFD166]/60">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-[#FFD166]/20 text-[#B8870A] dark:text-[#FFD166] flex items-center justify-center mb-5 transition-transform duration-200 group-hover:scale-110">
                  <Flame className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-[#262626] dark:text-[#F3F3F0] transition-colors duration-200 group-hover:text-[#B8870A] dark:group-hover:text-[#FFD166]">
                  Habit Matrix & Streaks
                </h3>
                <p className="text-sm text-[#747474] dark:text-[#A0A09B] mt-2 leading-relaxed">
                  Build habits gradually. Tap daily check-ins on a 7-day visual matrix and track your current and longest streaks.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E8E7E0] dark:border-[#2E302B] text-xs font-semibold text-[#FFD166]">
                Encouraging streak math
              </div>
            </div>

            {/* Feature 4: Large Panel */}
            <div className="card-lift group md:col-span-2 p-8 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#1E201C] flex flex-col justify-between hover:border-[#8EDCC0]/50">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-[#8EDCC0]/20 text-[#1E4D3E] dark:text-[#8EDCC0] flex items-center justify-center mb-5 transition-transform duration-200 group-hover:scale-110">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-[#262626] dark:text-[#F3F3F0] transition-colors duration-200 group-hover:text-[#1E4D3E] dark:group-hover:text-[#8EDCC0]">
                  Integrated Focus Timer
                </h3>
                <p className="text-sm text-[#747474] dark:text-[#A0A09B] mt-2 leading-relaxed max-w-xl">
                  Run 25-minute Pomodoro sessions, 5-minute short breaks, or customized durations. Associate sessions directly with tasks and store completed focus time in your records.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E8E7E0] dark:border-[#2E302B] flex flex-wrap gap-2 text-xs text-[#747474] dark:text-[#A0A09B]">
                <span className="px-2.5 py-1 rounded-lg bg-[#F5F5F2] dark:bg-[#282A26] transition-colors group-hover:bg-[#8EDCC0]/15 group-hover:text-[#1E4D3E] dark:group-hover:text-[#8EDCC0]">
                  SVG Animated Ring
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#F5F5F2] dark:bg-[#282A26] transition-colors group-hover:bg-[#8EDCC0]/15 group-hover:text-[#1E4D3E] dark:group-hover:text-[#8EDCC0]">
                  Background Throttling Resilient
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#F5F5F2] dark:bg-[#282A26] transition-colors group-hover:bg-[#8EDCC0]/15 group-hover:text-[#1E4D3E] dark:group-hover:text-[#8EDCC0]">
                  Session History Logging
                </span>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="card-lift group p-8 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#1E201C] flex flex-col justify-between hover:border-[#B8A7F9]/50">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-[#B8A7F9]/20 text-[#6B50CA] dark:text-[#B8A7F9] flex items-center justify-center mb-5 transition-transform duration-200 group-hover:scale-110">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-[#262626] dark:text-[#F3F3F0] transition-colors duration-200 group-hover:text-[#6B50CA] dark:group-hover:text-[#B8A7F9]">
                  Goals & Milestones
                </h3>
                <p className="text-sm text-[#747474] dark:text-[#A0A09B] mt-2 leading-relaxed">
                  Set long-term targets, track milestones with checkboxes, and watch overall goal completion update dynamically.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E8E7E0] dark:border-[#2E302B] text-xs font-semibold text-[#B8A7F9]">
                Structured achievement
              </div>
            </div>

            {/* Feature 6 */}
            <div className="card-lift group p-8 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#1E201C] flex flex-col justify-between hover:border-[#FF7058]/40">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-[#FF7058]/10 text-[#FF7058] flex items-center justify-center mb-5 transition-transform duration-200 group-hover:scale-110">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-[#262626] dark:text-[#F3F3F0] transition-colors duration-200 group-hover:text-[#FF7058]">
                  Real Productivity Insights
                </h3>
                <p className="text-sm text-[#747474] dark:text-[#A0A09B] mt-2 leading-relaxed">
                  No fabricated metrics. Calculate real weekly completion trends, total focus hours, and category distributions.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E8E7E0] dark:border-[#2E302B] text-xs font-semibold text-[#FF7058]">
                Real data calculations
              </div>
            </div>

            {/* Feature 7 */}
            <div className="card-lift group p-8 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#1E201C] flex flex-col justify-between hover:border-[#8EDCC0]/50">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-[#8EDCC0]/20 text-[#1E4D3E] dark:text-[#8EDCC0] flex items-center justify-center mb-5 transition-transform duration-200 group-hover:scale-110">
                  <Sliders className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-[#262626] dark:text-[#F3F3F0] transition-colors duration-200 group-hover:text-[#1E4D3E] dark:group-hover:text-[#8EDCC0]">
                  Themes & Personal Accents
                </h3>
                <p className="text-sm text-[#747474] dark:text-[#A0A09B] mt-2 leading-relaxed">
                  Choose Light, Dark, or System themes. Pick your accent color and toggle reduced motion options.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#E8E7E0] dark:border-[#2E302B] text-xs font-semibold text-[#8EDCC0]">
                Made for your eyes
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 bg-[#F8F8F5] dark:bg-[#181917]/50 border-y border-[#E8E7E0] dark:border-[#2E302B]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#262626] dark:text-[#F3F3F0] tracking-tight">
              How DaySpark Works
            </h2>
            <p className="text-sm text-[#747474] dark:text-[#A0A09B] mt-2">
              Three simple steps to bring calm structure to your workday.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="card-lift p-6 rounded-2xl bg-white dark:bg-[#20221F] border border-[#E8E7E0] dark:border-[#2E302B] relative hover:border-[#FF7058]/40 shadow-2xs group cursor-default">
              <span className="text-3xl font-extrabold text-[#FF7058] opacity-60 font-mono transition-opacity duration-200 group-hover:opacity-100">
                01
              </span>
              <h3 className="text-lg font-bold text-[#262626] dark:text-[#F3F3F0] mt-3 transition-colors group-hover:text-[#FF7058]">
                Plan your day
              </h3>
              <p className="text-xs text-[#747474] dark:text-[#A0A09B] mt-2 leading-relaxed">
                Add tasks, select your most important priority, and schedule items into your calendar.
              </p>
            </div>

            <div className="card-lift p-6 rounded-2xl bg-white dark:bg-[#20221F] border border-[#E8E7E0] dark:border-[#2E302B] relative hover:border-[#FFD166]/60 shadow-2xs group cursor-default">
              <span className="text-3xl font-extrabold text-[#FFD166] opacity-80 font-mono transition-opacity duration-200 group-hover:opacity-100">
                02
              </span>
              <h3 className="text-lg font-bold text-[#262626] dark:text-[#F3F3F0] mt-3 transition-colors group-hover:text-[#B8870A] dark:group-hover:text-[#FFD166]">
                Find your focus
              </h3>
              <p className="text-xs text-[#747474] dark:text-[#A0A09B] mt-2 leading-relaxed">
                Work through tasks at your own pace. Start a 25-minute focus session when you need deep immersion.
              </p>
            </div>

            <div className="card-lift p-6 rounded-2xl bg-white dark:bg-[#20221F] border border-[#E8E7E0] dark:border-[#2E302B] relative hover:border-[#8EDCC0]/60 shadow-2xs group cursor-default">
              <span className="text-3xl font-extrabold text-[#8EDCC0] opacity-80 font-mono transition-opacity duration-200 group-hover:opacity-100">
                03
              </span>
              <h3 className="text-lg font-bold text-[#262626] dark:text-[#F3F3F0] mt-3 transition-colors group-hover:text-[#1E4D3E] dark:group-hover:text-[#8EDCC0]">
                See your progress
              </h3>
              <p className="text-xs text-[#747474] dark:text-[#A0A09B] mt-2 leading-relaxed">
                Check off daily habits, review completed tasks, and watch milestones reach 100%.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section id="benefits" className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#262626] dark:text-[#F3F3F0] tracking-tight">
              Practical benefits for real work.
            </h2>
            <p className="text-sm text-[#747474] dark:text-[#A0A09B] mt-2">
              No hollow productivity jargon. Here is how DaySpark practically improves your everyday workflow:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="card-lift group p-6 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#1E201C] flex items-start gap-4 hover:border-[#8BCBFA]/50 cursor-default">
              <div className="p-2 rounded-xl bg-[#8BCBFA]/20 text-[#2B79B3] dark:text-[#8BCBFA] flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                <Smile className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#262626] dark:text-[#F3F3F0] transition-colors group-hover:text-[#2B79B3] dark:group-hover:text-[#8BCBFA]">
                  Reduce Planning Friction
                </h4>
                <p className="text-xs text-[#747474] dark:text-[#A0A09B] mt-1.5 leading-relaxed">
                  Quick-add tasks with intuitive shortcuts, auto-grouping by date, and zero unnecessary complex configuration.
                </p>
              </div>
            </div>

            <div className="card-lift group p-6 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#1E201C] flex items-start gap-4 hover:border-[#8EDCC0]/50 cursor-default">
              <div className="p-2 rounded-xl bg-[#8EDCC0]/20 text-[#1E4D3E] dark:text-[#8EDCC0] flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#262626] dark:text-[#F3F3F0] transition-colors group-hover:text-[#1E4D3E] dark:group-hover:text-[#8EDCC0]">
                  One Unified Workspace
                </h4>
                <p className="text-xs text-[#747474] dark:text-[#A0A09B] mt-1.5 leading-relaxed">
                  Stop juggling a separate habit app, a separate Pomodoro timer, a calendar app, and a task manager.
                </p>
              </div>
            </div>

            <div className="card-lift group p-6 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#1E201C] flex items-start gap-4 hover:border-[#FFD166]/60 cursor-default">
              <div className="p-2 rounded-xl bg-[#FFD166]/20 text-[#B8870A] dark:text-[#FFD166] flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#262626] dark:text-[#F3F3F0] transition-colors group-hover:text-[#B8870A] dark:group-hover:text-[#FFD166]">
                  Gentle, Non-Punitive Routines
                </h4>
                <p className="text-xs text-[#747474] dark:text-[#A0A09B] mt-1.5 leading-relaxed">
                  DaySpark encourages consistency without shaming you for missed days or resetting progress aggressively.
                </p>
              </div>
            </div>

            <div className="card-lift group p-6 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#1E201C] flex items-start gap-4 hover:border-[#FF7058]/40 cursor-default">
              <div className="p-2 rounded-xl bg-[#FF7058]/10 text-[#FF7058] flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#262626] dark:text-[#F3F3F0] transition-colors group-hover:text-[#FF7058]">
                  Fast Global Search (Cmd+K)
                </h4>
                <p className="text-xs text-[#747474] dark:text-[#A0A09B] mt-1.5 leading-relaxed">
                  Press Cmd+K or Ctrl+K anywhere to instantly search across all tasks, habits, and goals in milliseconds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-20 px-4 sm:px-6 bg-[#F8F8F5] dark:bg-[#181917]/50 border-y border-[#E8E7E0] dark:border-[#2E302B]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#262626] dark:text-[#F3F3F0] tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-[#747474] dark:text-[#A0A09B] mt-2">
              Straightforward answers about DaySpark and how it works.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border bg-white dark:bg-[#20221F] overflow-hidden transition-all duration-200 ${
                    isOpen
                      ? 'border-[#FF7058]/50 shadow-sm'
                      : 'border-[#E8E7E0] dark:border-[#2E302B] hover:border-[#FF7058]/40 hover:bg-[#FFFDF9] dark:hover:bg-[#232522] hover:-translate-y-0.5 hover:shadow-xs'
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-[#262626] dark:text-[#F3F3F0] cursor-pointer transition-colors duration-150 hover:text-[#FF7058] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF7058]"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#747474] transition-transform duration-200 flex-shrink-0 ${
                        isOpen ? 'rotate-180 text-[#FF7058]' : 'group-hover:text-[#FF7058]'
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-[#747474] dark:text-[#A0A09B] leading-relaxed border-t border-[#E8E7E0]/60 dark:border-[#2E302B]/60 pt-3 animate-in fade-in duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-20 px-4 sm:px-6 text-center">
        <div className="card-lift max-w-3xl mx-auto p-10 sm:p-14 rounded-3xl border border-[#FF7058]/30 bg-gradient-to-br from-[#FFFDF9] via-[#FFF6F4] to-[#FFF9E6] dark:from-[#20221F] dark:via-[#262320] dark:to-[#22211A] shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#262626] dark:text-[#F3F3F0] tracking-tight mb-4">
              Your next great day starts here.
            </h2>
            <p className="text-sm sm:text-base text-[#747474] dark:text-[#A0A09B] max-w-lg mx-auto mb-8 leading-relaxed">
              Start small. Stay organized. Make progress at your own pace without pressure or noise.
            </p>
            <button
              onClick={onOpenSignUp}
              className="btn-press group/btn px-8 py-3.5 rounded-xl font-semibold text-white bg-[#FF7058] hover:bg-[#F06148] shadow-md shadow-[#FF7058]/25 hover:shadow-xl hover:shadow-[#FF7058]/35 inline-flex items-center gap-2 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF7058]"
            >
              <span>Create Your Free Account</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      <Footer onOpenSignIn={onOpenSignIn} onOpenSignUp={onOpenSignUp} />
    </div>
  );
};

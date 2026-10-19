import React, { useState } from 'react';
import {
  User as UserIcon,
  Moon,
  Sun,
  Palette,
  Clock,
  Calendar,
  LogOut,
  Trash2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme, ACCENT_COLORS } from '../../contexts/ThemeContext';
import { Modal } from '../common/Modal';

export const SettingsView: React.FC = () => {
  const { currentUser, userProfile, updateProfileData, signOut, deleteAccount } = useAuth();
  const { theme, setTheme, accentColor, setAccentColor, reducedMotion, setReducedMotion } = useTheme();

  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [dateFormat, setDateFormat] = useState(userProfile?.dateFormat || 'MMM D, YYYY');
  const [timeFormat, setTimeFormat] = useState(userProfile?.timeFormat || '12h');
  const [weekStart, setWeekStart] = useState(userProfile?.weekStart || 'monday');

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await updateProfileData({
        displayName: displayName.trim(),
        dateFormat,
        timeFormat,
        weekStart,
      });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setIsDeleting(true);
    try {
      await deleteAccount();
    } catch (err) {
      console.error('Account deletion error:', err);
      setIsDeleting(false);
    }
  };

  const userInitial = (displayName || currentUser?.email || 'U')[0].toUpperCase();

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-12 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#262626] dark:text-[#F3F3F0] tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-[#747474] dark:text-[#A0A09B] mt-1">
          Customize your profile, workspace appearance, and account preferences.
        </p>
      </div>

      {/* Profile Section */}
      <div className="p-6 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs space-y-5">
        <h2 className="text-base font-bold text-[#262626] dark:text-[#F3F3F0] flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-[#FF7058]" />
          <span>Profile Information</span>
        </h2>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF7058] to-[#FFD166] text-white flex items-center justify-center text-xl font-bold shadow-xs">
            {userProfile?.photoURL ? (
              <img
                src={userProfile.photoURL}
                alt="Avatar"
                className="w-full h-full rounded-2xl object-cover"
              />
            ) : (
              userInitial
            )}
          </div>
          <div>
            <div className="text-sm font-bold text-[#262626] dark:text-[#F3F3F0]">
              {userProfile?.displayName || 'DaySpark Member'}
            </div>
            <div className="text-xs text-[#747474] dark:text-[#A0A09B] mt-0.5">
              {currentUser?.email || 'Authenticated User'}
            </div>
            <span className="inline-block text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold mt-1.5">
              Sync Active (Cloud Firestore)
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-[#262626] dark:text-[#F3F3F0] mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input-smooth w-full px-3.5 py-2 text-sm rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-white dark:bg-[#262824] text-[#262626] dark:text-[#F3F3F0]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#262626] dark:text-[#F3F3F0] mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#747474]" /> Date Format
              </label>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-white dark:bg-[#262824] text-[#262626] dark:text-[#F3F3F0] hover:border-[#FF7058]/40 transition-colors cursor-pointer"
              >
                <option value="MMM D, YYYY">Oct 18, 2026</option>
                <option value="YYYY-MM-DD">2026-10-18</option>
                <option value="DD/MM/YYYY">18/10/2026</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#262626] dark:text-[#F3F3F0] mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#747474]" /> Time Format
              </label>
              <select
                value={timeFormat}
                onChange={(e) => setTimeFormat(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-white dark:bg-[#262824] text-[#262626] dark:text-[#F3F3F0] hover:border-[#FF7058]/40 transition-colors cursor-pointer"
              >
                <option value="12h">12-Hour (e.g. 2:30 PM)</option>
                <option value="24h">24-Hour (e.g. 14:30)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#262626] dark:text-[#F3F3F0] mb-1">
                Week Starts On
              </label>
              <select
                value={weekStart}
                onChange={(e) => setWeekStart(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-white dark:bg-[#262824] text-[#262626] dark:text-[#F3F3F0] hover:border-[#FF7058]/40 transition-colors cursor-pointer"
              >
                <option value="monday">Monday</option>
                <option value="sunday">Sunday</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {profileSuccess ? (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 animate-in fade-in duration-150">
                <CheckCircle2 className="w-4 h-4" /> Changes saved
              </span>
            ) : (
              <span />
            )}

            <button
              type="submit"
              disabled={isSavingProfile}
              className="btn-press px-4.5 py-2 rounded-xl bg-[#FF7058] hover:bg-[#F06148] text-white text-xs font-semibold shadow-xs hover:shadow-md hover:shadow-[#FF7058]/20 disabled:opacity-50 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF7058]"
            >
              {isSavingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Appearance Section */}
      <div className="p-6 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs space-y-5">
        <h2 className="text-base font-bold text-[#262626] dark:text-[#F3F3F0] flex items-center gap-2">
          <Palette className="w-4 h-4 text-[#8BCBFA]" />
          <span>Appearance & Theme</span>
        </h2>

        {/* Theme mode */}
        <div>
          <label className="block text-xs font-semibold text-[#262626] dark:text-[#F3F3F0] mb-2">
            Theme Mode
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(
              [
                { id: 'system', label: 'System Theme', desc: 'Syncs with OS' },
                { id: 'light', label: 'Light', desc: 'Clean & warm' },
                { id: 'dark', label: 'Dark', desc: 'Comfortable contrast' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTheme(opt.id)}
                className={`btn-press p-3.5 rounded-2xl border text-left cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF7058] ${
                  theme === opt.id
                    ? 'border-[#FF7058] bg-[#FF7058]/5 dark:bg-[#FF7058]/10 text-[#FF7058] shadow-2xs'
                    : 'border-[#E8E7E0] dark:border-[#2E302B] hover:bg-[#F5F5F2] dark:hover:bg-[#282A26] text-[#747474] hover:border-[#FF7058]/40'
                }`}
              >
                <div className="text-xs font-bold capitalize">{opt.label}</div>
                <div className="text-[10px] mt-0.5 opacity-80">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Accent color */}
        <div>
          <label className="block text-xs font-semibold text-[#262626] dark:text-[#F3F3F0] mb-2">
            Brand Accent Color
          </label>
          <div className="flex flex-wrap items-center gap-3">
            {ACCENT_COLORS.map((col) => (
              <button
                key={col.value}
                type="button"
                onClick={() => setAccentColor(col.value)}
                className={`btn-press flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF7058] ${
                  accentColor === col.value
                    ? 'border-[#262626] dark:border-white ring-2 ring-offset-1 ring-[#FF7058] scale-105 shadow-2xs'
                    : 'border-[#E8E7E0] dark:border-[#2E302B] text-[#747474] hover:bg-[#F5F5F2] dark:hover:bg-[#282A26] hover:border-[#FF7058]/40'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full transition-transform duration-200 group-hover:scale-125" style={{ backgroundColor: col.value }} />
                <span>{col.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Reduced motion toggle */}
        <div className="pt-3 border-t border-[#E8E7E0] dark:border-[#2E302B] flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#262626] dark:text-[#F3F3F0]">
              Reduced Motion
            </div>
            <div className="text-[11px] text-[#747474] dark:text-[#A0A09B]">
              Minimize interface transitions and motion effects
            </div>
          </div>
          <input
            type="checkbox"
            checked={reducedMotion}
            onChange={(e) => setReducedMotion(e.target.checked)}
            className="rounded accent-[#FF7058] w-4 h-4 cursor-pointer"
          />
        </div>
      </div>

      {/* Account Danger Zone */}
      <div className="p-6 rounded-3xl border border-red-200 dark:border-red-950/60 bg-red-50/40 dark:bg-red-950/20 space-y-4">
        <h2 className="text-base font-bold text-red-800 dark:text-red-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
          <span>Account Security & Actions</span>
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <div className="text-xs font-bold text-[#262626] dark:text-[#F3F3F0]">
              Sign Out of DaySpark
            </div>
            <div className="text-[11px] text-[#747474] dark:text-[#A0A09B]">
              Safely end your current session. All your cloud data remains saved.
            </div>
          </div>
          <button
            onClick={() => setShowSignOutConfirm(true)}
            className="btn-press px-4 py-2 text-xs font-semibold rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-white dark:bg-[#20221F] text-[#262626] dark:text-[#F3F3F0] hover:bg-[#F5F5F2] dark:hover:bg-[#282A26] flex items-center gap-1.5 self-start sm:self-auto cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF7058]"
          >
            <LogOut className="w-3.5 h-3.5 transition-transform duration-200 hover:-translate-x-0.5" />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-red-200 dark:border-red-900/50">
          <div>
            <div className="text-xs font-bold text-red-700 dark:text-red-300">
              Permanently Delete Account
            </div>
            <div className="text-[11px] text-[#747474] dark:text-[#A0A09B]">
              Irreversibly erase your user profile, tasks, goals, habits, and focus history from Firestore.
            </div>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="btn-press px-4 py-2 text-xs font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-xs hover:shadow-md hover:shadow-red-500/20 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <Trash2 className="w-3.5 h-3.5 transition-transform duration-200 hover:scale-110" />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      {/* Sign Out Confirm Modal */}
      <Modal
        isOpen={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        title="Sign Out of DaySpark"
        maxWidth="sm"
      >
        <p className="text-xs text-[#747474] dark:text-[#A0A09B] mb-5">
          Are you sure you want to sign out? You can sign back in anytime with your credentials.
        </p>
        <div className="flex justify-end gap-2.5">
          <button
            onClick={() => setShowSignOutConfirm(false)}
            className="btn-press px-3.5 py-1.5 text-xs font-medium rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] hover:bg-[#F5F5F2] dark:hover:bg-[#282A26] transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF7058]"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              setShowSignOutConfirm(false);
              signOut();
            }}
            className="btn-press px-4 py-1.5 text-xs font-semibold rounded-xl bg-[#FF7058] text-white hover:bg-[#F06148] shadow-xs hover:shadow-md hover:shadow-[#FF7058]/20 transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF7058]"
          >
            Sign Out
          </button>
        </div>
      </Modal>

      {/* Delete Account Confirm Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Permanently Delete Account"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-xs text-red-700 dark:text-red-300">
            <strong>Warning:</strong> This action cannot be undone. All your tasks, habits, goals, and focus history stored in Cloud Firestore will be immediately erased.
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#262626] dark:text-[#F3F3F0] mb-1">
              Type <span className="font-mono font-bold text-red-600">DELETE</span> to confirm:
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="input-smooth w-full px-3 py-2 text-xs rounded-xl border border-red-300 dark:border-red-900 bg-white dark:bg-[#262824] text-[#262626] dark:text-[#F3F3F0]"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="btn-press px-3.5 py-1.5 text-xs font-medium rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] hover:bg-[#F5F5F2] dark:hover:bg-[#282A26] transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF7058]"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== 'DELETE' || isDeleting}
              className="btn-press px-4 py-1.5 text-xs font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white disabled:opacity-40 shadow-xs hover:shadow-md hover:shadow-red-500/20 transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-red-500"
            >
              {isDeleting ? 'Deleting...' : 'Permanently Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

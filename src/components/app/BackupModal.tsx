import React, { useState } from 'react';
import {
  Download,
  Upload,
  FileText,
  Database,
  CheckCircle2,
  AlertTriangle,
  X,
  FileSpreadsheet,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import {
  Task,
  Project,
  Note,
  Habit,
  HabitRecord,
  Goal,
  FocusSession,
  WeeklyReview,
  Expense,
  Budget,
  Reminder,
} from '../../types';
import {
  generateBackupJSON,
  generateTasksCSV,
  generateExpensesCSV,
  downloadFile,
  validateBackupFile,
  applyBackupImport,
  BackupPreviewSummary,
  DaySparkBackupPayload,
} from '../../services/backupService';
import { useAuth } from '../../contexts/AuthContext';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    tasks: Task[];
    projects: Project[];
    notes: Note[];
    habits: Habit[];
    habitRecords: HabitRecord[];
    goals: Goal[];
    focusSessions: FocusSession[];
    weeklyReviews: WeeklyReview[];
    expenses: Expense[];
    budgets: Budget[];
    reminders: Reminder[];
  };
}

export const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose, data }) => {
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [duplicateStrategy, setDuplicateStrategy] = useState<'skip' | 'overwrite'>('skip');

  // Import state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [previewSummary, setPreviewSummary] = useState<BackupPreviewSummary | null>(null);
  const [parsedPayload, setParsedPayload] = useState<DaySparkBackupPayload | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    const jsonStr = generateBackupJSON(data);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadFile(jsonStr, `dayspark-backup-${dateStr}.json`, 'application/json');
  };

  const handleExportTasksCSV = () => {
    const csvStr = generateTasksCSV(data.tasks);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadFile(csvStr, `dayspark-tasks-${dateStr}.csv`, 'text/csv');
  };

  const handleExportExpensesCSV = () => {
    const csvStr = generateExpensesCSV(data.expenses);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadFile(csvStr, `dayspark-expenses-${dateStr}.csv`, 'text/csv');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setImportError(null);
    setImportSuccessMessage(null);

    try {
      const text = await file.text();
      const validation = validateBackupFile(text);

      if (!validation.valid || !validation.payload || !validation.summary) {
        setImportError(validation.error || 'Invalid backup structure.');
        setPreviewSummary(null);
        setParsedPayload(null);
      } else {
        setPreviewSummary(validation.summary);
        setParsedPayload(validation.payload);
      }
    } catch (err: any) {
      setImportError(`Failed to read file: ${err.message}`);
    }
  };

  const handleConfirmImport = async () => {
    if (!currentUser || !parsedPayload) return;
    setIsImporting(true);
    setImportError(null);

    try {
      const result = await applyBackupImport(
        currentUser.uid,
        parsedPayload,
        duplicateStrategy,
        data
      );

      setImportSuccessMessage(
        `Successfully restored ${result.importedCount} records (${result.skippedCount} duplicates skipped).`
      );
      setParsedPayload(null);
      setPreviewSummary(null);
      setImportFile(null);
    } catch (err: any) {
      setImportError(`Import failed: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#1A1B19] p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E7E0] dark:border-[#2E302B]">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#8BCBFA]/15 text-[#1A4F78] dark:text-[#8BCBFA]">
              <Database className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-[#262626] dark:text-[#F3F3F0]">
                Data Backup, Export & Restore
              </h2>
              <p className="text-xs text-[#747474]">
                Your data belongs to you. Export complete JSON or restore anytime.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#747474] hover:text-[#262626] dark:hover:text-white hover:bg-[#F5F5F2] dark:hover:bg-[#282A26] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-[#F5F5F2] dark:bg-[#282A26] p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${
              activeTab === 'export'
                ? 'bg-white dark:bg-[#20221F] text-[#FF7058] shadow-2xs'
                : 'text-[#747474]'
            }`}
          >
            Export & Backup
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${
              activeTab === 'import'
                ? 'bg-white dark:bg-[#20221F] text-[#FF7058] shadow-2xs'
                : 'text-[#747474]'
            }`}
          >
            Import & Restore
          </button>
        </div>

        {/* EXPORT TAB */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] bg-white dark:bg-[#20221F] space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-[#FF7058]" />
                  <div>
                    <h4 className="text-xs font-bold text-[#262626] dark:text-[#F3F3F0]">
                      Complete Workspace Backup (JSON)
                    </h4>
                    <p className="text-[11px] text-[#747474] mt-0.5">
                      Includes all tasks, projects, notes, habits, goals, focus sessions, and expenses.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleExportJSON}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FF7058] text-white text-xs font-bold hover:bg-[#e65e47] shrink-0 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download JSON</span>
                </button>
              </div>

              <div className="text-[10px] text-[#A0A09B] font-mono flex items-center gap-2 pt-1 border-t border-[#E8E7E0]/50 dark:border-[#2E302B]/50">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Zero secrets, tokens, or credentials included. Encrypted in transit.</span>
              </div>
            </div>

            {/* CSV Exports */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] bg-white dark:bg-[#20221F] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                  <div>
                    <h5 className="text-xs font-bold text-[#262626] dark:text-[#F3F3F0]">
                      Tasks Spreadsheet
                    </h5>
                    <span className="text-[10px] text-[#747474]">{data.tasks.length} items</span>
                  </div>
                </div>
                <button
                  onClick={handleExportTasksCSV}
                  className="px-2.5 py-1 rounded-lg border border-[#E8E7E0] dark:border-[#2E302B] text-xs font-semibold text-[#747474] hover:text-[#262626]"
                >
                  Export CSV
                </button>
              </div>

              <div className="p-3.5 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] bg-white dark:bg-[#20221F] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                  <div>
                    <h5 className="text-xs font-bold text-[#262626] dark:text-[#F3F3F0]">
                      Expenses Spreadsheet
                    </h5>
                    <span className="text-[10px] text-[#747474]">{data.expenses.length} records</span>
                  </div>
                </div>
                <button
                  onClick={handleExportExpensesCSV}
                  className="px-2.5 py-1 rounded-lg border border-[#E8E7E0] dark:border-[#2E302B] text-xs font-semibold text-[#747474] hover:text-[#262626]"
                >
                  Export CSV
                </button>
              </div>
            </div>
          </div>
        )}

        {/* IMPORT TAB */}
        {activeTab === 'import' && (
          <div className="space-y-4">
            {importSuccessMessage && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{importSuccessMessage}</span>
              </div>
            )}

            {importError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            {/* File Dropzone */}
            <label className="block p-6 rounded-2xl border-2 border-dashed border-[#E8E7E0] dark:border-[#2E302B] hover:border-[#FF7058] bg-[#F5F5F2]/50 dark:bg-[#282A26]/50 text-center cursor-pointer transition-colors">
              <Upload className="w-8 h-8 text-[#FF7058] mx-auto mb-2" />
              <span className="text-xs font-bold text-[#262626] dark:text-[#F3F3F0] block">
                {importFile ? importFile.name : 'Click to select DaySpark JSON backup'}
              </span>
              <span className="text-[11px] text-[#747474] mt-0.5 block">
                Only valid DaySpark .json backup files are accepted
              </span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {/* Preview Summary */}
            {previewSummary && (
              <div className="p-4 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] bg-white dark:bg-[#20221F] space-y-3 animate-in fade-in">
                <h4 className="text-xs font-bold text-[#262626] dark:text-[#F3F3F0]">
                  Backup Preview ({previewSummary.totalRecords} total records detected)
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-[#F5F5F2] dark:bg-[#282A26]">
                    <span className="text-[#747474] block text-[10px]">Tasks</span>
                    <span className="font-bold">{previewSummary.tasksCount}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#F5F5F2] dark:bg-[#282A26]">
                    <span className="text-[#747474] block text-[10px]">Projects</span>
                    <span className="font-bold">{previewSummary.projectsCount}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#F5F5F2] dark:bg-[#282A26]">
                    <span className="text-[#747474] block text-[10px]">Notes</span>
                    <span className="font-bold">{previewSummary.notesCount}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#F5F5F2] dark:bg-[#282A26]">
                    <span className="text-[#747474] block text-[10px]">Expenses</span>
                    <span className="font-bold">{previewSummary.expensesCount}</span>
                  </div>
                </div>

                {/* Duplicate strategy radio */}
                <div className="pt-2 border-t border-[#E8E7E0]/50 dark:border-[#2E302B]/50 space-y-1.5">
                  <span className="text-xs font-semibold text-[#747474]">Duplicate handling:</span>
                  <div className="flex items-center gap-4 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="dupStrategy"
                        checked={duplicateStrategy === 'skip'}
                        onChange={() => setDuplicateStrategy('skip')}
                      />
                      <span>Skip existing records</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="dupStrategy"
                        checked={duplicateStrategy === 'overwrite'}
                        onChange={() => setDuplicateStrategy('overwrite')}
                      />
                      <span>Update existing records</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-2">
                  <button
                    onClick={handleConfirmImport}
                    disabled={isImporting}
                    className="px-5 py-2 rounded-2xl bg-[#FF7058] hover:bg-[#e65e47] text-white text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {isImporting ? 'Restoring Data...' : 'Confirm & Restore'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

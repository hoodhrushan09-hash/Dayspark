import React, { useState } from 'react';
import { Sliders, ArrowUp, ArrowDown, Eye, EyeOff, RotateCcw, Check, Sparkles } from 'lucide-react';
import { Modal } from '../common/Modal';
import { DashboardConfig, DashboardWidgetConfig } from '../../types';
import { DEFAULT_DASHBOARD_CONFIG } from '../../services/userService';

interface DashboardCustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig?: DashboardConfig;
  onSaveConfig: (config: DashboardConfig) => Promise<void>;
}

export const DashboardCustomizeModal: React.FC<DashboardCustomizeModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onSaveConfig,
}) => {
  const mergeWithDefaults = (existing?: DashboardConfig) => {
    if (!existing?.widgets || existing.widgets.length === 0) {
      return [...DEFAULT_DASHBOARD_CONFIG.widgets];
    }
    const existingMap = new Map(existing.widgets.map((w) => [w.id, w]));
    const merged: DashboardWidgetConfig[] = [...existing.widgets];
    DEFAULT_DASHBOARD_CONFIG.widgets.forEach((dw) => {
      if (!existingMap.has(dw.id)) {
        merged.push({ ...dw, order: merged.length + 1 });
      }
    });
    return merged.sort((a, b) => a.order - b.order);
  };

  const [widgets, setWidgets] = useState<DashboardWidgetConfig[]>(() => {
    return mergeWithDefaults(currentConfig);
  });
  const [isSaving, setIsSaving] = useState(false);

  // Sync state if modal reopens
  React.useEffect(() => {
    if (isOpen) {
      setWidgets(mergeWithDefaults(currentConfig));
    }
  }, [isOpen, currentConfig]);

  if (!isOpen) return null;

  const toggleWidget = (id: string) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w))
    );
  };

  const moveUp = (index: number) => {
    if (index <= 0) return;
    setWidgets((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy.map((w, idx) => ({ ...w, order: idx + 1 }));
    });
  };

  const moveDown = (index: number) => {
    if (index >= widgets.length - 1) return;
    setWidgets((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy.map((w, idx) => ({ ...w, order: idx + 1 }));
    });
  };

  const handleReset = () => {
    setWidgets([...DEFAULT_DASHBOARD_CONFIG.widgets]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveConfig({ widgets });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Customize Dashboard" maxWidth="md">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#747474] dark:text-[#A0A09B]">
            Show, hide, and reorder dashboard widgets to match your daily workflow.
          </p>

          <button
            type="button"
            onClick={handleReset}
            className="btn-press flex items-center gap-1 text-[11px] font-semibold text-[#747474] hover:text-[#262626] dark:hover:text-white cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Default</span>
          </button>
        </div>

        {/* Widgets List */}
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {widgets.map((w, idx) => (
            <div
              key={w.id}
              className={`p-3 rounded-2xl border transition-all duration-150 flex items-center justify-between gap-3 ${
                w.enabled
                  ? 'bg-white dark:bg-[#20221F] border-[#E8E7E0] dark:border-[#2E302B] shadow-2xs'
                  : 'bg-[#F9F9F6] dark:bg-[#1A1B19] border-[#EAEAE5] dark:border-[#282A26] opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleWidget(w.id)}
                  className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                    w.enabled
                      ? 'bg-[#FF7058]/10 text-[#FF7058] border-[#FF7058]/30'
                      : 'bg-[#E8E7E0] dark:bg-[#2E302B] text-[#747474] border-transparent'
                  }`}
                  title={w.enabled ? 'Hide widget' : 'Show widget'}
                >
                  {w.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                <div>
                  <div className="text-xs font-bold text-[#262626] dark:text-[#F3F3F0]">
                    {w.label}
                  </div>
                  <div className="text-[11px] text-[#747474] dark:text-[#A0A09B]">
                    {w.description}
                  </div>
                </div>
              </div>

              {/* Order Controls */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => moveUp(idx)}
                  className="btn-press p-1.5 rounded-lg border border-[#E8E7E0] dark:border-[#2E302B] text-[#747474] hover:text-[#262626] dark:hover:text-white disabled:opacity-30 cursor-pointer"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  disabled={idx === widgets.length - 1}
                  onClick={() => moveDown(idx)}
                  className="btn-press p-1.5 rounded-lg border border-[#E8E7E0] dark:border-[#2E302B] text-[#747474] hover:text-[#262626] dark:hover:text-white disabled:opacity-30 cursor-pointer"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="btn-press px-4 py-2 text-xs font-medium rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] text-[#747474] hover:bg-[#F5F5F2] dark:hover:bg-[#282A26] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="btn-press px-5 py-2 text-xs font-semibold rounded-xl bg-[#FF7058] hover:bg-[#F06148] text-white shadow-xs hover:shadow-md hover:shadow-[#FF7058]/20 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? 'Saving...' : 'Save Layout'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

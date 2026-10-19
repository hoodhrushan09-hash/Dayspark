import React, { useState } from 'react';
import { Target, Plus, CheckCircle2, Circle, Calendar, Trash2, Edit2, ChevronDown } from 'lucide-react';
import { Goal, GoalStatus } from '../../types';
import { formatDate } from '../../lib/dates';

interface GoalsViewProps {
  goals: Goal[];
  onToggleMilestone: (goal: Goal, milestoneId: string) => Promise<void>;
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal: (goalId: string) => Promise<void>;
  onOpenNewGoalModal: () => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  onToggleMilestone,
  onEditGoal,
  onDeleteGoal,
  onOpenNewGoalModal,
}) => {
  const [statusFilter, setStatusFilter] = useState<GoalStatus | 'all'>('all');
  const [expandedGoals, setExpandedGoals] = useState<Record<string, boolean>>({});

  const toggleExpand = (goalId: string) => {
    setExpandedGoals((prev) => ({ ...prev, [goalId]: !prev[goalId] }));
  };

  const filteredGoals = goals.filter((g) => {
    if (statusFilter !== 'all' && g.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#262626] dark:text-[#F3F3F0] tracking-tight">
            Goals & Milestones
          </h1>
          <p className="text-sm text-[#747474] dark:text-[#A0A09B] mt-1">
            Turn long-term ambitions into clear, manageable steps.
          </p>
        </div>

        <button
          onClick={onOpenNewGoalModal}
          className="btn-press group px-4 py-2.5 rounded-xl bg-[#FF7058] hover:bg-[#F06148] text-white text-sm font-semibold flex items-center gap-2 shadow-xs hover:shadow-md hover:shadow-[#FF7058]/20 self-start sm:self-auto cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF7058]"
        >
          <Plus className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Filter Tabs with tactile feedback */}
      <div className="flex items-center gap-2">
        {(['all', 'active', 'completed', 'paused'] as const).map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl capitalize transition-all duration-200 cursor-pointer ${
              statusFilter === st
                ? 'bg-[#FF7058] text-white shadow-2xs scale-[1.02]'
                : 'bg-[#FFFDF9] dark:bg-[#20221F] border border-[#E8E7E0] dark:border-[#2E302B] text-[#747474] hover:text-[#262626] dark:hover:text-white hover:bg-[#F5F5F2] dark:hover:bg-[#262824] active:scale-95'
            }`}
          >
            {st} ({st === 'all' ? goals.length : goals.filter((g) => g.status === st).length})
          </button>
        ))}
      </div>

      {/* Goals List */}
      {filteredGoals.length === 0 ? (
        <div className="card-lift p-12 text-center rounded-2xl border border-dashed border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9]/50 dark:bg-[#20221F]/50">
          <div className="w-12 h-12 rounded-2xl bg-[#B8A7F9]/20 text-[#6B50CA] dark:text-[#B8A7F9] flex items-center justify-center mx-auto mb-3 transition-transform duration-200 hover:scale-110">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#262626] dark:text-[#F3F3F0]">
            No goals found in this view
          </h3>
          <p className="text-xs text-[#747474] dark:text-[#A0A09B] max-w-sm mx-auto mt-1 mb-4 leading-relaxed">
            Create a long-term goal with concrete milestones to track your steady progress.
          </p>
          <button
            onClick={onOpenNewGoalModal}
            className="btn-press px-4 py-2 rounded-xl bg-[#FF7058] hover:bg-[#F06148] text-white text-xs font-semibold cursor-pointer shadow-xs hover:shadow-md"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredGoals.map((goal) => {
            const isExpanded = expandedGoals[goal.id] !== false; // Default expanded
            const milestones = goal.milestones || [];
            const completedCount = milestones.filter((m) => m.completed).length;

            return (
              <div
                key={goal.id}
                className="card-lift group p-5 sm:p-6 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs hover:border-[#B8A7F9]/50 space-y-4"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#B8A7F9]/20 text-[#6B50CA] dark:text-[#B8A7F9] font-bold transition-transform duration-150 group-hover:scale-105">
                        {goal.category}
                      </span>
                      {goal.status === 'completed' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                          Completed
                        </span>
                      )}
                      {goal.targetDate && (
                        <span className="text-xs text-[#747474] dark:text-[#A0A09B] flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Target: {formatDate(goal.targetDate)}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-[#262626] dark:text-[#F3F3F0] transition-colors group-hover:text-[#6B50CA] dark:group-hover:text-[#B8A7F9]">
                      {goal.title}
                    </h3>
                    {goal.description && (
                      <p className="text-xs text-[#747474] dark:text-[#A0A09B] leading-relaxed max-w-xl">
                        {goal.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => onEditGoal(goal)}
                      className="btn-press p-2 rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] text-[#747474] hover:text-[#262626] dark:hover:text-white hover:bg-[#F5F5F2] dark:hover:bg-[#282A26] transition-all duration-150 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF7058]"
                      aria-label="Edit goal"
                    >
                      <Edit2 className="w-4 h-4 transition-transform duration-200 hover:rotate-12" />
                    </button>
                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      className="btn-press p-2 rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] text-[#747474] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-150 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-red-400"
                      aria-label="Delete goal"
                    >
                      <Trash2 className="w-4 h-4 transition-transform duration-200 hover:scale-110" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar & Milestone summary with hover height expansion */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#747474] dark:text-[#A0A09B]">
                      {completedCount} of {milestones.length} milestones complete
                    </span>
                    <span className="font-bold text-[#FF7058] transition-transform duration-200 group-hover:scale-105">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-[#F5F5F2] dark:bg-[#282A26] h-2.5 rounded-full overflow-hidden transition-all duration-200 hover:h-3">
                    <div
                      className="h-full bg-gradient-to-r from-[#FF7058] to-[#8EDCC0] transition-all duration-300 rounded-full"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>

                {/* Milestones toggleable list with hover row feedback */}
                {milestones.length > 0 && (
                  <div className="pt-2 border-t border-[#E8E7E0] dark:border-[#2E302B]">
                    <button
                      onClick={() => toggleExpand(goal.id)}
                      className="w-full flex items-center justify-between py-1 text-xs font-semibold text-[#747474] dark:text-[#A0A09B] hover:text-[#262626] dark:hover:text-white cursor-pointer transition-colors"
                    >
                      <span>Milestones ({milestones.length})</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 text-[#B8A7F9]' : 'group-hover:text-[#B8A7F9]'
                        }`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="space-y-1.5 mt-2.5 animate-in fade-in duration-200">
                        {milestones.map((m) => (
                          <div
                            key={m.id}
                            onClick={() => onToggleMilestone(goal, m.id)}
                            className="group/m flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F5F5F2] dark:hover:bg-[#282A26] hover:-translate-y-0.5 transition-all duration-150 cursor-pointer"
                          >
                            <button
                              type="button"
                              className="text-[#FF7058] transition-transform duration-150 group-hover/m:scale-115 active:scale-90 cursor-pointer"
                              aria-label={m.completed ? 'Mark milestone incomplete' : 'Mark milestone complete'}
                            >
                              {m.completed ? (
                                <CheckCircle2 className="w-4 h-4 text-[#8EDCC0] transition-colors" />
                              ) : (
                                <Circle className="w-4 h-4 text-[#A0A09B] group-hover/m:text-[#FF7058] transition-colors" />
                              )}
                            </button>
                            <span
                              className={`text-xs font-medium transition-colors ${
                                m.completed
                                  ? 'line-through text-[#747474] dark:text-[#A0A09B]'
                                  : 'text-[#262626] dark:text-[#F3F3F0] group-hover/m:text-[#FF7058]'
                              }`}
                            >
                              {m.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

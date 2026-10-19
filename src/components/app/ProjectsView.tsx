import React, { useState } from 'react';
import {
  Folder,
  Plus,
  CheckCircle2,
  Clock,
  Calendar,
  MoreVertical,
  Trash2,
  Edit2,
  Archive,
  ArrowRight,
  Sparkles,
  BarChart2,
  BookOpen,
  Filter,
} from 'lucide-react';
import { Project, Task, Note, FocusSession, Priority } from '../../types';
import {
  createProject,
  updateProject,
  deleteProject,
} from '../../services/projectService';
import {
  createTask,
  updateTask,
  toggleTaskCompletion,
  deleteTask,
} from '../../services/taskService';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../lib/dates';

interface ProjectsViewProps {
  projects: Project[];
  tasks: Task[];
  notes?: Note[];
  focusSessions?: FocusSession[];
  onOpenNewTaskModal?: (defaultDate?: string) => void;
}

const PROJECT_COLORS = [
  '#FF7058', // Coral
  '#8BCBFA', // Sky
  '#B8A7F9', // Lavender
  '#8EDCC0', // Mint
  '#FFD166', // Gold
  '#F472B6', // Pink
  '#60A5FA', // Blue
  '#34D399', // Emerald
];

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  tasks,
  notes = [],
  focusSessions = [],
}) => {
  const { currentUser } = useAuth();

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    projects[0]?.id || null
  );

  // Modals
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [deadline, setDeadline] = useState('');

  // Quick Task Add inside Kanban
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [quickTaskColumn, setQuickTaskColumn] = useState<'todo' | 'inprogress' | 'done'>('todo');

  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0] || null;

  // Filter tasks belonging to active project
  const projectTasks = activeProject
    ? tasks.filter((t) => t.projectId === activeProject.id)
    : [];

  const todoTasks = projectTasks.filter(
    (t) => !t.completed && (t.kanbanColumn === 'todo' || !t.kanbanColumn)
  );
  const inProgressTasks = projectTasks.filter(
    (t) => !t.completed && t.kanbanColumn === 'inprogress'
  );
  const doneTasks = projectTasks.filter(
    (t) => t.completed || t.kanbanColumn === 'done'
  );

  const completedCount = projectTasks.filter((t) => t.completed).length;
  const progressPercent =
    projectTasks.length > 0 ? Math.round((completedCount / projectTasks.length) * 100) : 0;

  // Project linked notes & focus sessions
  const linkedNotes = activeProject
    ? notes.filter((n) => n.linkedProjectId === activeProject.id)
    : [];
  const projectFocusMinutes = activeProject
    ? focusSessions
        .filter((s) => s.taskTitle?.includes(activeProject.name))
        .reduce((sum, s) => sum + (s.durationMinutes || 0), 0)
    : 0;

  const handleOpenCreateProject = () => {
    setEditingProject(null);
    setName('');
    setDescription('');
    setColor(PROJECT_COLORS[0]);
    setDeadline('');
    setIsProjectModalOpen(true);
  };

  const handleOpenEditProject = (proj: Project) => {
    setEditingProject(proj);
    setName(proj.name);
    setDescription(proj.description || '');
    setColor(proj.color || PROJECT_COLORS[0]);
    setDeadline(proj.deadline || '');
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !name.trim()) return;

    if (editingProject) {
      await updateProject(currentUser.uid, editingProject.id, {
        name: name.trim(),
        description: description.trim(),
        color,
        deadline: deadline || undefined,
      });
    } else {
      const newId = await createProject(currentUser.uid, {
        name: name.trim(),
        description: description.trim(),
        color,
        deadline: deadline || undefined,
        status: 'active',
      });
      setSelectedProjectId(newId);
    }
    setIsProjectModalOpen(false);
  };

  const handleDeleteProject = async (projId: string) => {
    if (!currentUser) return;
    if (confirm('Are you sure you want to delete this project? Existing tasks will remain in your general list.')) {
      await deleteProject(currentUser.uid, projId);
      const remaining = projects.filter((p) => p.id !== projId);
      setSelectedProjectId(remaining[0]?.id || null);
    }
  };

  const handleMoveTaskColumn = async (task: Task, newColumn: 'todo' | 'inprogress' | 'done') => {
    if (!currentUser) return;
    const isCompleted = newColumn === 'done';
    await updateTask(currentUser.uid, task.id, {
      kanbanColumn: newColumn,
      completed: isCompleted,
      completedAt: isCompleted ? new Date().toISOString() : undefined,
    });
  };

  const handleCreateQuickTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !activeProject || !quickTaskTitle.trim()) return;

    await createTask(currentUser.uid, {
      title: quickTaskTitle.trim(),
      completed: quickTaskColumn === 'done',
      priority: 'medium',
      category: 'Work',
      projectId: activeProject.id,
      kanbanColumn: quickTaskColumn,
    });

    setQuickTaskTitle('');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#B8A7F9]/15 text-[#5B45B2] dark:text-[#B8A7F9]">
              <Folder className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#262626] dark:text-[#F3F3F0] tracking-tight">
              Projects & Kanban Boards
            </h1>
          </div>
          <p className="text-sm text-[#747474] dark:text-[#A0A09B] mt-1">
            Organize multi-step initiatives, visualize deliverables, and move cards across columns.
          </p>
        </div>

        <button
          onClick={handleOpenCreateProject}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FF7058] hover:bg-[#e65e47] text-white font-bold text-xs shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Horizontal Tab Bar */}
      {projects.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {projects.map((proj) => {
            const isSelected = activeProject?.id === proj.id;
            const pTasks = tasks.filter((t) => t.projectId === proj.id);
            const pDone = pTasks.filter((t) => t.completed).length;

            return (
              <button
                key={proj.id}
                onClick={() => setSelectedProjectId(proj.id)}
                className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-white dark:bg-[#20221F] text-[#262626] dark:text-white border border-[#E8E7E0] dark:border-[#2E302B] shadow-2xs scale-[1.02]'
                    : 'text-[#747474] hover:bg-[#F5F5F2] dark:hover:bg-[#282A26]'
                }`}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: proj.color || '#FF7058' }}
                />
                <span>{proj.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-[#F5F5F2] dark:bg-[#282A26] text-[#747474]">
                  {pDone}/{pTasks.length}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Active Project Workspace */}
      {activeProject ? (
        <div className="space-y-6">
          {/* Active Project Hero Banner */}
          <div className="p-6 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-12 rounded-full shrink-0"
                  style={{ backgroundColor: activeProject.color || '#FF7058' }}
                />
                <div>
                  <h2 className="text-xl font-black text-[#262626] dark:text-[#F3F3F0]">
                    {activeProject.name}
                  </h2>
                  <p className="text-xs text-[#747474] dark:text-[#A0A09B] mt-0.5 max-w-xl">
                    {activeProject.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeProject.deadline && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] text-xs font-semibold text-[#747474]">
                    <Calendar className="w-3.5 h-3.5 text-[#FF7058]" />
                    <span>Due: {formatDate(activeProject.deadline)}</span>
                  </div>
                )}

                <button
                  onClick={() => handleOpenEditProject(activeProject)}
                  className="p-2 rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] text-[#747474] hover:text-[#262626] dark:hover:text-white transition-colors"
                  title="Edit Project"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleDeleteProject(activeProject.id)}
                  className="p-2 rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] text-[#747474] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Delete Project"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Progress Meter */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-[#747474]">
                <span>Overall Completion</span>
                <span>
                  {progressPercent}% ({completedCount} of {projectTasks.length} tasks completed)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#E8E7E0] dark:bg-[#2E302B] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor: activeProject.color || '#FF7058',
                  }}
                />
              </div>
            </div>

            {/* Context chips: linked notes and focus time */}
            <div className="flex items-center gap-4 pt-1 text-xs text-[#747474] flex-wrap">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#8BCBFA]" />
                <span>{linkedNotes.length} linked note(s)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#FF7058]" />
                <span>{projectFocusMinutes} focus mins logged</span>
              </span>
            </div>
          </div>

          {/* Quick Task Bar */}
          <form
            onSubmit={handleCreateQuickTask}
            className="flex items-center gap-2 p-2 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs"
          >
            <input
              type="text"
              placeholder={`Add task directly to ${activeProject.name}...`}
              value={quickTaskTitle}
              onChange={(e) => setQuickTaskTitle(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs text-[#262626] dark:text-[#F3F3F0] bg-transparent outline-hidden placeholder:text-[#A0A09B]"
            />
            <select
              value={quickTaskColumn}
              onChange={(e) => setQuickTaskColumn(e.target.value as any)}
              className="px-2.5 py-1 rounded-xl text-xs font-semibold border border-[#E8E7E0] dark:border-[#2E302B] bg-[#F5F5F2] dark:bg-[#282A26] text-[#747474]"
            >
              <option value="todo">To Do</option>
              <option value="inprogress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-[#FF7058] text-white text-xs font-bold hover:bg-[#e65e47] transition-colors"
            >
              Add
            </button>
          </form>

          {/* 3-Column Kanban Board */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Column 1: To Do */}
            <div className="p-4 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8E7E0] dark:border-[#2E302B]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="text-xs font-bold text-[#262626] dark:text-[#F3F3F0]">
                    To Do
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#F5F5F2] dark:bg-[#282A26] font-bold text-[#747474]">
                  {todoTasks.length}
                </span>
              </div>

              <div className="space-y-2 min-h-[220px]">
                {todoTasks.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#A0A09B] border border-dashed border-[#E8E7E0] dark:border-[#2E302B] rounded-2xl">
                    No tasks to do
                  </div>
                ) : (
                  todoTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] bg-white dark:bg-[#282A26] shadow-2xs space-y-2 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-[#262626] dark:text-[#F3F3F0]">
                          {t.title}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            t.priority === 'urgent'
                              ? 'bg-rose-100 text-rose-600'
                              : 'bg-black/5 dark:bg-white/10 text-[#747474]'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-[#E8E7E0]/50 dark:border-[#2E302B]/50 text-[10px] text-[#747474]">
                        {t.dueDate ? <span>Due: {t.dueDate}</span> : <span />}
                        <button
                          type="button"
                          onClick={() => handleMoveTaskColumn(t, 'inprogress')}
                          className="flex items-center gap-1 font-bold text-[#FF7058] hover:underline"
                        >
                          <span>Start</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Column 2: In Progress */}
            <div className="p-4 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8E7E0] dark:border-[#2E302B]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-xs font-bold text-[#262626] dark:text-[#F3F3F0]">
                    In Progress
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#F5F5F2] dark:bg-[#282A26] font-bold text-[#747474]">
                  {inProgressTasks.length}
                </span>
              </div>

              <div className="space-y-2 min-h-[220px]">
                {inProgressTasks.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#A0A09B] border border-dashed border-[#E8E7E0] dark:border-[#2E302B] rounded-2xl">
                    No active tasks
                  </div>
                ) : (
                  inProgressTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-white dark:bg-[#282A26] shadow-2xs space-y-2 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-[#262626] dark:text-[#F3F3F0]">
                          {t.title}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600">
                          Active
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-[#E8E7E0]/50 dark:border-[#2E302B]/50 text-[10px] text-[#747474]">
                        <button
                          type="button"
                          onClick={() => handleMoveTaskColumn(t, 'todo')}
                          className="hover:underline"
                        >
                          ← To Do
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveTaskColumn(t, 'done')}
                          className="flex items-center gap-1 font-bold text-emerald-600 hover:underline"
                        >
                          <span>Complete</span>
                          <CheckCircle2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Column 3: Done */}
            <div className="p-4 rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8E7E0] dark:border-[#2E302B]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-[#262626] dark:text-[#F3F3F0]">
                    Done
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#F5F5F2] dark:bg-[#282A26] font-bold text-[#747474]">
                  {doneTasks.length}
                </span>
              </div>

              <div className="space-y-2 min-h-[220px]">
                {doneTasks.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#A0A09B] border border-dashed border-[#E8E7E0] dark:border-[#2E302B] rounded-2xl">
                    No completed tasks yet
                  </div>
                ) : (
                  doneTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-2xl border border-emerald-100 dark:border-emerald-950/40 bg-white/70 dark:bg-[#282A26]/70 shadow-2xs space-y-2 opacity-90"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="text-xs font-semibold line-through text-[#747474] truncate">
                          {t.title}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-[#E8E7E0]/50 dark:border-[#2E302B]/50 text-[10px] text-[#A0A09B]">
                        <span>Done</span>
                        <button
                          type="button"
                          onClick={() => handleMoveTaskColumn(t, 'todo')}
                          className="hover:underline text-[#747474]"
                        >
                          Reopen
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center rounded-3xl border border-dashed border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] space-y-3">
          <Folder className="w-12 h-12 text-[#FF7058]/30 mx-auto" />
          <h3 className="text-base font-bold text-[#262626] dark:text-[#F3F3F0]">
            No projects yet
          </h3>
          <p className="text-xs text-[#747474] max-w-sm mx-auto">
            Create your first project to organize larger initiatives with Kanban boards, milestones, and task boards.
          </p>
          <button
            onClick={handleOpenCreateProject}
            className="px-5 py-2.5 rounded-2xl bg-[#FF7058] text-white text-xs font-bold shadow-xs hover:bg-[#e65e47]"
          >
            Create First Project
          </button>
        </div>
      )}

      {/* Project Create / Edit Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] p-6 shadow-xl space-y-4 animate-in fade-in">
            <h3 className="text-base font-bold text-[#262626] dark:text-[#F3F3F0]">
              {editingProject ? 'Edit Project' : 'New Project'}
            </h3>

            <form onSubmit={handleSaveProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#747474] mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Website Redesign, Fitness Goals 2026, Tax Filing"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#F5F5F2] dark:bg-[#282A26] text-xs text-[#262626] dark:text-[#F3F3F0] outline-hidden focus:ring-2 focus:ring-[#FF7058]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#747474] mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="What is the objective of this project?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#F5F5F2] dark:bg-[#282A26] text-xs text-[#262626] dark:text-[#F3F3F0] outline-hidden focus:ring-2 focus:ring-[#FF7058] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#747474] mb-1.5">
                  Color Theme
                </label>
                <div className="flex items-center gap-2">
                  {PROJECT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        color === c ? 'scale-125 ring-2 ring-offset-2 ring-[#FF7058]' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#747474] mb-1">
                  Target Deadline (Optional)
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#F5F5F2] dark:bg-[#282A26] text-xs text-[#262626] dark:text-[#F3F3F0] outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E7E0] dark:border-[#2E302B]">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#747474]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#FF7058] text-white text-xs font-bold hover:bg-[#e65e47] transition-colors"
                >
                  {editingProject ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

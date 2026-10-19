import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Pin,
  Trash2,
  Archive,
  Tag,
  CheckSquare,
  Square,
  Clock,
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Folder,
} from 'lucide-react';
import { Note, NoteChecklistItem, Task, Goal, Project } from '../../types';
import {
  createNote,
  updateNote,
  deleteNote,
  toggleNotePinned,
  toggleNoteArchived,
} from '../../services/noteService';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../lib/dates';

interface NotesViewProps {
  notes: Note[];
  tasks?: Task[];
  goals?: Goal[];
  projects?: Project[];
}

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  tasks = [],
  goals = [],
  projects = [],
}) => {
  const { currentUser } = useAuth();

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewFilter, setViewFilter] = useState<'all' | 'pinned' | 'archived'>('all');

  // Active note editor state
  const activeNote = notes.find((n) => n.id === selectedNoteId) || null;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [checklists, setChecklists] = useState<NoteChecklistItem[]>([]);
  const [linkedTaskId, setLinkedTaskId] = useState<string>('');
  const [linkedProjectId, setLinkedProjectId] = useState<string>('');
  const [linkedGoalId, setLinkedGoalId] = useState<string>('');

  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef(true);

  // Sync editor state when active note changes
  useEffect(() => {
    if (activeNote) {
      isInitialLoadRef.current = true;
      setTitle(activeNote.title);
      setContent(activeNote.content || '');
      setTags(activeNote.tags || []);
      setChecklists(activeNote.checklists || []);
      setLinkedTaskId(activeNote.linkedTaskId || '');
      setLinkedProjectId(activeNote.linkedProjectId || '');
      setLinkedGoalId(activeNote.linkedGoalId || '');
      setSaveStatus('saved');
      setTimeout(() => {
        isInitialLoadRef.current = false;
      }, 100);
    } else {
      setTitle('');
      setContent('');
      setTags([]);
      setChecklists([]);
    }
  }, [selectedNoteId]);

  // Debounced Auto-Save
  const triggerAutoSave = (updatedData: Partial<Note>) => {
    if (!currentUser || !activeNote || isInitialLoadRef.current) return;
    setSaveStatus('unsaved');

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        await updateNote(currentUser.uid, activeNote.id, updatedData);
        setSaveStatus('saved');
      } catch (err) {
        console.error('Failed to auto-save note:', err);
        setSaveStatus('unsaved');
      }
    }, 800);
  };

  const handleCreateNewNote = async () => {
    if (!currentUser) return;
    const newId = await createNote(currentUser.uid, {
      title: 'Untitled Note',
      content: '',
      tags: [],
      isPinned: false,
      isArchived: false,
      checklists: [],
    });
    setSelectedNoteId(newId);
  };

  const handleDeleteActiveNote = async () => {
    if (!currentUser || !activeNote) return;
    if (confirm('Are you sure you want to delete this note?')) {
      await deleteNote(currentUser.uid, activeNote.id);
      const remaining = notes.filter((n) => n.id !== activeNote.id);
      setSelectedNoteId(remaining[0]?.id || null);
    }
  };

  // Checklist helper
  const handleAddChecklistItem = () => {
    const newItem: NoteChecklistItem = {
      id: `chk_${Date.now()}`,
      text: '',
      completed: false,
    };
    const updated = [...checklists, newItem];
    setChecklists(updated);
    triggerAutoSave({ checklists: updated });
  };

  const handleToggleChecklist = (id: string) => {
    const updated = checklists.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setChecklists(updated);
    triggerAutoSave({ checklists: updated });
  };

  const handleUpdateChecklistText = (id: string, text: string) => {
    const updated = checklists.map((item) =>
      item.id === id ? { ...item, text } : item
    );
    setChecklists(updated);
    triggerAutoSave({ checklists: updated });
  };

  const handleRemoveChecklistItem = (id: string) => {
    const updated = checklists.filter((item) => item.id !== id);
    setChecklists(updated);
    triggerAutoSave({ checklists: updated });
  };

  // Tag helper
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTagInput.trim()) {
      e.preventDefault();
      const sanitized = newTagInput.trim().replace(/^#/, '');
      if (!tags.includes(sanitized)) {
        const updated = [...tags, sanitized];
        setTags(updated);
        triggerAutoSave({ tags: updated });
      }
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = tags.filter((t) => t !== tagToRemove);
    setTags(updated);
    triggerAutoSave({ tags: updated });
  };

  // All unique tags across all notes
  const allTags = Array.from(
    new Set(notes.flatMap((n) => n.tags || []).filter(Boolean))
  );

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    if (viewFilter === 'pinned' && !n.isPinned) return false;
    if (viewFilter === 'archived' && !n.isArchived) return false;
    if (viewFilter === 'all' && n.isArchived) return false;

    if (selectedTag && !n.tags?.includes(selectedTag)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = n.title.toLowerCase().includes(q);
      const matchContent = n.content.toLowerCase().includes(q);
      const matchTag = n.tags?.some((t) => t.toLowerCase().includes(q));
      return matchTitle || matchContent || matchTag;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#8BCBFA]/15 text-[#1A4F78] dark:text-[#8BCBFA]">
              <BookOpen className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#262626] dark:text-[#F3F3F0] tracking-tight">
              Knowledge Hub & Notes
            </h1>
          </div>
          <p className="text-sm text-[#747474] dark:text-[#A0A09B] mt-1">
            Capture thoughts, checklists, project context, and knowledge in one connected space.
          </p>
        </div>

        <button
          onClick={handleCreateNewNote}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FF7058] hover:bg-[#e65e47] text-white font-bold text-xs shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Main Split-Pane Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[580px]">
        {/* Left Column: Sidebar Filters & Notes List */}
        <div className="md:col-span-5 flex flex-col space-y-4">
          {/* Search & Filter Bar */}
          <div className="p-3.5 rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#747474] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search notes, tags, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#F5F5F2] dark:bg-[#282A26] text-xs text-[#262626] dark:text-[#F3F3F0] outline-hidden focus:ring-2 focus:ring-[#FF7058]"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1">
              {(['all', 'pinned', 'archived'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setViewFilter(filter)}
                  className={`px-3 py-1 rounded-lg text-xs capitalize font-semibold transition-colors cursor-pointer ${
                    viewFilter === filter
                      ? 'bg-[#FF7058]/12 text-[#FF7058] font-bold'
                      : 'text-[#747474] hover:bg-[#F5F5F2] dark:hover:bg-[#282A26]'
                  }`}
                >
                  {filter}
                </button>
              ))}

              {selectedTag && (
                <button
                  onClick={() => setSelectedTag(null)}
                  className="ml-auto text-[10px] px-2 py-0.5 rounded-md bg-[#FF7058]/10 text-[#FF7058] font-semibold flex items-center gap-1"
                >
                  <span>#{selectedTag}</span>
                  <span>×</span>
                </button>
              )}
            </div>

            {/* Tags Pills */}
            {allTags.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={`px-2 py-0.5 rounded-md shrink-0 transition-colors ${
                      selectedTag === tag
                        ? 'bg-[#FF7058] text-white font-bold'
                        : 'bg-[#F5F5F2] dark:bg-[#282A26] text-[#747474] hover:text-[#262626]'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notes Scroll List */}
          <div className="flex-1 space-y-2 overflow-y-auto max-h-[500px] pr-1">
            {filteredNotes.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-[#E8E7E0] dark:border-[#2E302B] text-xs text-[#747474]">
                No notes found matching current view.
              </div>
            ) : (
              filteredNotes.map((note) => {
                const isSelected = note.id === selectedNoteId;
                return (
                  <div
                    key={note.id}
                    onClick={() => setSelectedNoteId(note.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#FF7058] bg-[#FF7058]/6 shadow-2xs'
                        : 'border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] hover:bg-[#F5F5F2]/80 dark:hover:bg-[#262824]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          {note.isPinned && (
                            <Pin className="w-3 h-3 text-[#FF7058] fill-[#FF7058] shrink-0" />
                          )}
                          <h4 className="text-xs font-bold text-[#262626] dark:text-[#F3F3F0] truncate">
                            {note.title || 'Untitled'}
                          </h4>
                        </div>
                        <p className="text-[11px] text-[#747474] dark:text-[#A0A09B] mt-1 line-clamp-2">
                          {note.content || '(Empty note)'}
                        </p>
                      </div>

                      <span className="text-[10px] text-[#A0A09B] font-mono shrink-0">
                        {note.updatedAt?.split('T')[0] || ''}
                      </span>
                    </div>

                    {note.tags && note.tags.length > 0 && (
                      <div className="flex items-center gap-1 mt-2 flex-wrap">
                        {note.tags.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="text-[9px] px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/10 text-[#747474]"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Note Editor */}
        <div className="md:col-span-7 flex flex-col rounded-3xl border border-[#E8E7E0] dark:border-[#2E302B] bg-[#FFFDF9] dark:bg-[#20221F] shadow-2xs overflow-hidden">
          {activeNote ? (
            <div className="flex flex-col h-full p-6 space-y-4">
              {/* Top Editor Toolbar */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E7E0] dark:border-[#2E302B]">
                <div className="flex items-center gap-2">
                  {/* Save Status Indicator */}
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      saveStatus === 'saved'
                        ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
                        : saveStatus === 'saving'
                        ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/30'
                        : 'text-[#747474]'
                    }`}
                  >
                    {saveStatus === 'saved' ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Saved</span>
                      </>
                    ) : saveStatus === 'saving' ? (
                      <>
                        <Clock className="w-3 h-3 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3" />
                        <span>Unsaved</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={async () => {
                      if (!currentUser) return;
                      await toggleNotePinned(currentUser.uid, activeNote);
                    }}
                    className={`p-1.5 rounded-xl border transition-colors ${
                      activeNote.isPinned
                        ? 'border-[#FF7058] bg-[#FF7058]/10 text-[#FF7058]'
                        : 'border-[#E8E7E0] dark:border-[#2E302B] text-[#747474] hover:text-[#262626]'
                    }`}
                    title={activeNote.isPinned ? 'Unpin note' : 'Pin note to top'}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={async () => {
                      if (!currentUser) return;
                      await toggleNoteArchived(currentUser.uid, activeNote);
                    }}
                    className="p-1.5 rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] text-[#747474] hover:text-[#262626] transition-colors"
                    title={activeNote.isArchived ? 'Unarchive' : 'Archive note'}
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleDeleteActiveNote}
                    className="p-1.5 rounded-xl border border-[#E8E7E0] dark:border-[#2E302B] text-[#747474] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Delete note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Note Title Input */}
              <input
                type="text"
                placeholder="Note Title..."
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  triggerAutoSave({ title: e.target.value });
                }}
                className="text-xl sm:text-2xl font-black text-[#262626] dark:text-[#F3F3F0] bg-transparent outline-hidden tracking-tight placeholder:text-[#A0A09B]"
              />

              {/* Associations Bar: Link to Task or Project */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-[#747474] dark:text-[#A0A09B] flex items-center gap-1">
                  <LinkIcon className="w-3 h-3" />
                  <span>Link:</span>
                </span>

                {projects.length > 0 && (
                  <select
                    value={linkedProjectId}
                    onChange={(e) => {
                      setLinkedProjectId(e.target.value);
                      triggerAutoSave({ linkedProjectId: e.target.value });
                    }}
                    className="px-2 py-1 rounded-lg border border-[#E8E7E0] dark:border-[#2E302B] bg-[#F5F5F2] dark:bg-[#282A26] text-xs text-[#262626] dark:text-[#F3F3F0]"
                  >
                    <option value="">No Project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        Project: {p.name}
                      </option>
                    ))}
                  </select>
                )}

                {tasks.length > 0 && (
                  <select
                    value={linkedTaskId}
                    onChange={(e) => {
                      setLinkedTaskId(e.target.value);
                      triggerAutoSave({ linkedTaskId: e.target.value });
                    }}
                    className="px-2 py-1 rounded-lg border border-[#E8E7E0] dark:border-[#2E302B] bg-[#F5F5F2] dark:bg-[#282A26] text-xs text-[#262626] dark:text-[#F3F3F0]"
                  >
                    <option value="">No Task</option>
                    {tasks.slice(0, 15).map((t) => (
                      <option key={t.id} value={t.id}>
                        Task: {t.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Tags Editor */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded-lg bg-[#FF7058]/10 text-[#FF7058] font-semibold flex items-center gap-1"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="+ tag (press Enter)"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="text-xs px-2 py-0.5 rounded-lg border border-dashed border-[#E8E7E0] dark:border-[#2E302B] bg-transparent text-[#747474] outline-hidden w-28"
                />
              </div>

              {/* Checklists inside note */}
              {checklists.length > 0 && (
                <div className="p-3 rounded-2xl bg-[#F5F5F2] dark:bg-[#282A26] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#747474]">
                    <span>Checklist ({checklists.filter((c) => c.completed).length}/{checklists.length})</span>
                    <button
                      onClick={handleAddChecklistItem}
                      className="text-[#FF7058] hover:underline"
                    >
                      + Add Item
                    </button>
                  </div>
                  {checklists.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleChecklist(item.id)}
                        className="text-[#FF7058]"
                      >
                        {item.completed ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4 text-[#747474]" />
                        )}
                      </button>
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => handleUpdateChecklistText(item.id, e.target.value)}
                        placeholder="Action item..."
                        className={`text-xs bg-transparent flex-1 outline-hidden ${
                          item.completed ? 'line-through text-[#A0A09B]' : 'text-[#262626] dark:text-[#F3F3F0]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveChecklistItem(item.id)}
                        className="text-[#A0A09B] hover:text-rose-500 text-xs px-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Note Content Textarea */}
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  triggerAutoSave({ content: e.target.value });
                }}
                placeholder="Write your note, thoughts, meeting minutes, or ideas here..."
                className="flex-1 w-full bg-transparent resize-none text-sm text-[#262626] dark:text-[#F3F3F0] outline-hidden placeholder:text-[#A0A09B] leading-relaxed min-h-[220px]"
              />

              {/* Bottom Quick Tools */}
              <div className="pt-2 border-t border-[#E8E7E0] dark:border-[#2E302B] flex items-center justify-between text-xs text-[#747474]">
                <button
                  type="button"
                  onClick={handleAddChecklistItem}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#E8E7E0] dark:border-[#2E302B] hover:bg-[#F5F5F2] dark:hover:bg-[#282A26] transition-colors"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-[#FF7058]" />
                  <span>Add Checklist</span>
                </button>
                <span>
                  {content.length} characters · {content.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#747474] space-y-3">
              <BookOpen className="w-12 h-12 text-[#FF7058]/30" />
              <div className="text-sm font-bold text-[#262626] dark:text-[#F3F3F0]">
                No note selected
              </div>
              <p className="text-xs max-w-xs">
                Select a note from the left sidebar or create a new one to start writing.
              </p>
              <button
                onClick={handleCreateNewNote}
                className="px-4 py-2 rounded-2xl bg-[#FF7058] text-white text-xs font-bold shadow-xs hover:bg-[#e65e47]"
              >
                Create Note
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Edit3,
  FileText,
  Plus,
  Search,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { StudyNoteRecord } from '../utils/recommendationEngine.ts';

const NOTE_SUBJECTS = [
  'All',
  'Java',
  'Python',
  'DBMS',
  'OS',
  'CN',
  'DSA',
  'OOP',
  'C',
  'Aptitude',
];

export function StudyNotesPage() {
  const { notes, createNote, updateNote, toggleNoteImportant, removeNote } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [onlyImportant, setOnlyImportant] = useState(false);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<StudyNoteRecord | null>(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('DBMS');
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [important, setImportant] = useState(false);
  const [saving, setSaving] = useState(false);

  const importantNotesCount = notes.filter((n) => Boolean(n.important)).length;

  const openNewNoteModal = () => {
    setEditingNote(null);
    setTitle('');
    setSubject(selectedSubject !== 'All' ? selectedSubject : 'DBMS');
    setTopic('');
    setContent('');
    setImportant(onlyImportant);
    setEditorOpen(true);
  };

  const openEditNoteModal = (note: StudyNoteRecord) => {
    setEditingNote(note);
    setTitle(note.title);
    setSubject(note.subject);
    setTopic(note.topic);
    setContent(note.content);
    setImportant(Boolean(note.important));
    setEditorOpen(true);
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !topic.trim() || !content.trim()) return;
    setSaving(true);
    try {
      if (editingNote) {
        await updateNote({
          ...editingNote,
          title: title.trim(),
          subject,
          topic: topic.trim(),
          content: content.trim(),
          important: Boolean(important),
        });
      } else {
        await createNote({
          title: title.trim(),
          subject,
          topic: topic.trim(),
          content: content.trim(),
          important: Boolean(important),
        });
      }
      setEditorOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const filteredNotes = notes.filter((n) => {
    const isNoteImportant = Boolean(n.important);
    if (onlyImportant && !isNoteImportant) return false;
    if (selectedSubject !== 'All' && n.subject !== selectedSubject) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.topic.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.subject.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-blue-600">Module 3 · Revision Repository</div>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">Study Notes</h1>
          <p className="text-sm text-slate-600">
            Create, organize, search, and mark important revision notes across Java, Python, DBMS, OS, CN, and DSA.
          </p>
        </div>

        <button
          type="button"
          onClick={openNewNoteModal}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg inline-flex items-center gap-2 self-start cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Study Note</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes by title, topic, subject, or content..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* All Notes vs Important Only Filter Toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOnlyImportant(false)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                !onlyImportant
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              All Notes ({notes.length})
            </button>

            <button
              type="button"
              onClick={() => setOnlyImportant((prev) => !prev)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg border inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                onlyImportant
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-amber-50/70 text-amber-900 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  onlyImportant ? 'fill-white text-white' : 'fill-amber-400 text-amber-500'
                }`}
              />
              <span>Important Only ({importantNotesCount})</span>
            </button>
          </div>
        </div>

        {/* Subject Filter Bar */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          {NOTE_SUBJECTS.map((subj) => (
            <button
              key={subj}
              type="button"
              onClick={() => setSelectedSubject(subj)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                selectedSubject === subj
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {subj}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filter Status Line */}
      {onlyImportant && (
        <div className="px-4 py-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 fill-amber-400 text-amber-600 shrink-0" />
            <span>
              Showing <strong>Important Only</strong> ({filteredNotes.length} of {notes.length} total notes). Click the star button on any note to mark or unmark it as important.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOnlyImportant(false)}
            className="font-semibold text-amber-900 underline hover:text-amber-700 shrink-0 ml-3 cursor-pointer"
          >
            Show All Notes
          </button>
        </div>
      )}

      {/* Notes Grid */}
      {filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map((note) => {
            const isImp = Boolean(note.important);
            return (
              <div
                key={note.id}
                className={`p-5 rounded-xl border bg-white flex flex-col justify-between transition-colors ${
                  isImp
                    ? 'border-amber-300 ring-1 ring-amber-200/60'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <div className="truncate">
                      <span className="font-semibold text-blue-600">{note.subject}</span>
                      <span className="mx-1.5">·</span>
                      <span>{note.topic}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleNoteImportant(note.id)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold border inline-flex items-center gap-1 shrink-0 transition-colors cursor-pointer ${
                        isImp
                          ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                      title={isImp ? 'Unmark Important' : 'Mark as Important'}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          isImp ? 'fill-amber-400 text-amber-500' : 'text-slate-400'
                        }`}
                      />
                      <span>{isImp ? 'Important' : 'Mark Important'}</span>
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-2.5">{note.title}</h3>
                  <p className="text-xs text-slate-600 mt-2 whitespace-pre-line line-clamp-5 leading-relaxed">
                    {note.content}
                  </p>
                </div>

                <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => openEditNoteModal(note)}
                      className="text-slate-600 hover:text-blue-600 font-medium inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => removeNote(note.id)}
                      className="text-slate-400 hover:text-red-600 inline-flex items-center gap-1 cursor-pointer"
                      aria-label="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 rounded-xl border border-dashed border-slate-200 bg-white text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">
            {onlyImportant
              ? 'No Important Notes Found for This Filter'
              : 'No Study Notes Found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {onlyImportant
              ? 'You currently have no notes marked as Important in this category. Click "Show All Notes" below to mark notes as Important, or create a new important note.'
              : 'Create revision notes for key CSE concepts (like DBMS Normalization, Java Multithreading, or OS Deadlocks).'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            {onlyImportant && (
              <button
                type="button"
                onClick={() => {
                  setOnlyImportant(false);
                  setSelectedSubject('All');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Show All Notes ({notes.length})
              </button>
            )}
            <button
              type="button"
              onClick={openNewNoteModal}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Study Note</span>
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit Note Modal */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-xl w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">
                {editingNote ? 'Edit Study Note' : 'Create Study Note'}
              </h3>
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Note Title *
                </label>
                <input
                  type="text"
                  required
                  maxLength={150}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., BCNF vs 3NF Normalization Rules"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subject *
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-blue-600"
                  >
                    {NOTE_SUBJECTS.filter((s) => s !== 'All').map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Topic *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Functional Dependencies"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Note Content *
                </label>
                <textarea
                  rows={6}
                  required
                  maxLength={10000}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write key definitions, formulas, complexity trade-offs, or code snippets..."
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={important}
                  onChange={(e) => setImportant(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Mark as Important for final placement revision</span>
              </label>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditorOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg cursor-pointer"
                >
                  {saving ? 'Saving...' : editingNote ? 'Update Note' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

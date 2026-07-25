import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { StudentUser } from '../../types';
import { BookOpen, Download, Bookmark, Search, Eye, FileText, FileBox, FileCode, Image, X } from 'lucide-react';

export const StudentNotesView: React.FC = () => {
  const { currentUser } = useAuth();
  const { notes, toggleNoteBookmark } = useData();

  if (!currentUser || currentUser.role !== 'Student') return null;
  const student = currentUser as StudentUser;

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [previewNote, setPreviewNote] = useState<any | null>(null);

  // Strict section filter
  const myNotes = notes.filter(
    n => n.department === student.department && n.year === student.year && n.section === student.section
  );

  const filtered = myNotes.filter(n => {
    if (filterType === 'Bookmarks' && !n.bookmarkedBy.includes(student.id)) return false;
    if (filterType !== 'All' && filterType !== 'Bookmarks' && n.fileType !== filterType.toLowerCase()) return false;

    return n.title.toLowerCase().includes(searchTerm.toLowerCase()) || n.subject.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-6 w-6 text-red-500" />;
      case 'ppt': return <FileBox className="h-6 w-6 text-amber-500" />;
      case 'docx': return <FileCode className="h-6 w-6 text-blue-500" />;
      case 'image': return <Image className="h-6 w-6 text-emerald-500" />;
      default: return <FileText className="h-6 w-6 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-purple-600" /> Notes Library & Course Material
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Access, preview, download, and bookmark lecture slides and study guides uploaded for <span className="font-semibold text-slate-900 dark:text-white">{student.department} ({student.year} {student.section})</span>.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
          {(['All', 'Bookmarks', 'PDF', 'PPT', 'DOCX'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                filterType === f
                  ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search study material by topic or subject..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
        />
      </div>

      {/* Notes Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No notes found for current filter</p>
          </div>
        ) : (
          filtered.map(n => {
            const isBookmarked = n.bookmarkedBy.includes(student.id);
            return (
              <div
                key={n.id}
                className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
                      {getFileIcon(n.fileType)}
                    </div>
                    <button
                      onClick={() => toggleNoteBookmark(n.id, student.id)}
                      className={`p-2 rounded-xl transition-colors ${
                        isBookmarked
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-amber-600'
                      }`}
                      title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Note'}
                    >
                      <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
                    </button>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug">
                    {n.title}
                  </h3>
                  <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mt-0.5">
                    {n.subject}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                    {n.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-[10px] text-slate-400 font-mono">
                    <p>{n.fileName}</p>
                    <p>{n.fileSize}</p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPreviewNote(n)}
                      className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 text-xs font-semibold hover:bg-purple-100 transition-colors flex items-center gap-1"
                    >
                      <Eye className="h-3.5 w-3.5" /> Preview
                    </button>
                    <button
                      onClick={() => alert(`Downloading note: ${n.fileName}`)}
                      className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                      title="Download File"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Preview Modal */}
      {previewNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setPreviewNote(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
                {getFileIcon(previewNote.fileType)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{previewNote.title}</h3>
                <p className="text-xs text-slate-500">{previewNote.subject} • Uploaded by {previewNote.facultyName}</p>
              </div>
            </div>

            {/* Document Viewer Canvas Simulation */}
            <div className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800/80 p-6 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center space-y-3">
              <BookOpen className="h-12 w-12 text-purple-500 animate-pulse" />
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Interactive Document Viewer</p>
                <p className="text-xs text-slate-500 max-w-md mt-1">{previewNote.description}</p>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-white dark:bg-slate-900 px-3 py-1 rounded-full border">
                {previewNote.fileName} ({previewNote.fileSize})
              </span>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => alert(`Downloading note: ${previewNote.fileName}`)}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
              >
                <Download className="h-4 w-4" /> Download Complete File
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

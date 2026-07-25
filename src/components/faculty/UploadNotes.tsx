import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { FacultyUser, NoteItem } from '../../types';
import { BookOpen, Upload, Trash2, FileText, Download, Search, FileCode, Image, FileBox, Plus, X, ExternalLink } from 'lucide-react';
import { generateGoogleDriveFileUrl } from '../../lib/googleServices';

interface UploadNotesProps {
  selectedYear: string;
  setSelectedYear: (y: string) => void;
  selectedSection: string;
  setSelectedSection: (s: string) => void;
}

export const UploadNotes: React.FC<UploadNotesProps> = ({
  selectedYear,
  setSelectedYear,
  selectedSection,
  setSelectedSection
}) => {
  const { currentUser } = useAuth();
  const { notes, uploadNote, deleteNote } = useData();

  if (!currentUser || currentUser.role !== 'Faculty') return null;
  const faculty = currentUser as FacultyUser;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [form, setForm] = useState({
    title: '',
    subject: 'Cloud Computing',
    description: '',
    fileType: 'pdf' as 'pdf' | 'ppt' | 'docx' | 'image',
    fileName: 'Module_4_Lecture_Notes.pdf',
    fileSize: '3.5 MB'
  });

  const filteredNotes = notes.filter(
    n =>
      n.department === faculty.department &&
      n.year === selectedYear &&
      n.section === selectedSection &&
      (n.title.toLowerCase().includes(searchTerm.toLowerCase()) || n.subject.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-6 w-6 text-red-500" />;
      case 'ppt': return <FileBox className="h-6 w-6 text-amber-500" />;
      case 'docx': return <FileCode className="h-6 w-6 text-blue-500" />;
      case 'image': return <Image className="h-6 w-6 text-emerald-500" />;
      default: return <FileText className="h-6 w-6 text-indigo-500" />;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;

    const fileName = form.fileName || `${form.title.replace(/\s+/g, '_')}.${form.fileType}`;

    uploadNote({
      title: form.title,
      subject: form.subject,
      description: form.description,
      fileType: form.fileType,
      fileName,
      fileSize: form.fileSize || '2.4 MB',
      department: faculty.department,
      year: selectedYear,
      section: selectedSection,
      facultyId: faculty.id,
      facultyName: faculty.fullName,
      driveFileUrl: generateGoogleDriveFileUrl(fileName)
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-purple-600" /> Academic Notes & Study Repository
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Upload course slides, PDF handouts, lab manuals, and diagrams for <span className="font-semibold text-slate-900 dark:text-white">{faculty.department} ({selectedYear} {selectedSection})</span>.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition-all flex items-center gap-2"
        >
          <Upload className="h-4 w-4" /> Upload Course Material
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search notes by topic or subject..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
        />
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No study notes uploaded for this section</p>
            <p className="text-xs text-slate-500 mt-1">Click "Upload Course Material" above to publish PDF, PPT, or DOCX notes.</p>
          </div>
        ) : (
          filteredNotes.map(n => (
            <div
              key={n.id}
              className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
                    {getFileIcon(n.fileType)}
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    {n.fileType}
                  </span>
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
                  <p className="truncate max-w-[130px]">{n.fileName}</p>
                  <p>{n.fileSize}</p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => alert(`Downloading file: ${n.fileName}`)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                    title="Download Note"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteNote(n.id)}
                    className="p-2 rounded-xl bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400 hover:bg-red-100 transition-colors"
                    title="Delete Note"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Upload Course Material
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 4: Kubernetes Architecture & Pods"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cloud Computing"
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    File Format *
                  </label>
                  <select
                    value={form.fileType}
                    onChange={e => setForm({ ...form, fileType: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="pdf">PDF Document (.pdf)</option>
                    <option value="ppt">PowerPoint (.ppt/.pptx)</option>
                    <option value="docx">Word Document (.docx)</option>
                    <option value="image">Diagram / Image (.png/.jpg)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  File Name & Simulated Size
                </label>
                <input
                  type="text"
                  value={form.fileName}
                  onChange={e => setForm({ ...form, fileName: e.target.value })}
                  placeholder="e.g. Lecture_Slides_U4.pdf"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Topic Notes / Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Key concepts covered in this document..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs"
                >
                  Publish Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

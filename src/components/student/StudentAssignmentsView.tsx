import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { StudentUser } from '../../types';
import { FileText, Paperclip, CheckCircle2, Clock, AlertCircle, Search, Upload, ExternalLink, Award, X } from 'lucide-react';
import { generateGoogleDriveFileUrl } from '../../lib/googleServices';

export const StudentAssignmentsView: React.FC = () => {
  const { currentUser } = useAuth();
  const { assignments, studentProgressList, assignmentSubmissions, submitAssignment, toggleStudentAssignmentStatus } = useData();

  if (!currentUser || currentUser.role !== 'Student') return null;
  const student = currentUser as StudentUser;

  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Completed' | 'Overdue'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Submission modal state
  const [submittingAsgId, setSubmittingAsgId] = useState<string | null>(null);
  const [subFile, setSubFile] = useState<File | null>(null);
  const [subNotes, setSubNotes] = useState('');

  // Strict section filter
  const myAssignments = assignments.filter(
    a => a.department === student.department && a.year === student.year && a.section === student.section
  );

  const filtered = myAssignments.filter(asg => {
    const prog = studentProgressList.find(p => p.assignmentId === asg.id && p.studentId === student.id);
    const isCompleted = prog?.status === 'Completed';

    const isOverdue = new Date(asg.deadline) < new Date() && !isCompleted;

    if (filterStatus === 'Completed' && !isCompleted) return false;
    if (filterStatus === 'Pending' && (isCompleted || isOverdue)) return false;
    if (filterStatus === 'Overdue' && !isOverdue) return false;

    return asg.title.toLowerCase().includes(searchTerm.toLowerCase()) || asg.subject.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAsgId) return;

    const fileName = subFile ? subFile.name : `Assignment_Submission_${Date.now()}.pdf`;
    const driveUrl = generateGoogleDriveFileUrl(fileName);

    submitAssignment({
      assignmentId: submittingAsgId,
      studentId: student.id,
      studentName: student.fullName,
      registerNumber: student.registerNumber,
      fileName,
      driveFileUrl: driveUrl,
      notes: subNotes
    });

    setSubmittingAsgId(null);
    setSubFile(null);
    setSubNotes('');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="h-6 w-6 text-indigo-600" /> Coursework & Assignments Tracker
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track pending homework, download attached resources, and submit coursework for <span className="font-semibold text-slate-900 dark:text-white">{student.department} ({student.year} {student.section})</span>.
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
          {(['All', 'Pending', 'Completed', 'Overdue'] as const).map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                filterStatus === st
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search assignments by title or subject..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
        />
      </div>

      {/* Assignment Items */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No assignments matching "{filterStatus}" filter</p>
          </div>
        ) : (
          filtered.map(asg => {
            const prog = studentProgressList.find(p => p.assignmentId === asg.id && p.studentId === student.id);
            const submission = assignmentSubmissions.find(s => s.assignmentId === asg.id && s.studentId === student.id);
            const isCompleted = prog?.status === 'Completed' || !!submission;
            const isOverdue = new Date(asg.deadline) < new Date() && !isCompleted;

            return (
              <div
                key={asg.id}
                className={`p-6 rounded-3xl border transition-all shadow-xs flex flex-col justify-between gap-4 ${
                  isCompleted
                    ? 'bg-slate-50/70 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800'
                    : isOverdue
                    ? 'bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {asg.subject}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-500 font-mono">By {asg.facultyName}</span>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      submission?.status === 'Graded'
                        ? 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200'
                        : isCompleted
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200'
                    }`}>
                      {submission?.status === 'Graded' ? 'Graded' : isCompleted ? '✓ Submitted' : 'Pending'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {asg.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {asg.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      📅 Deadline: {asg.deadline}
                    </span>
                    {asg.attachmentName && (
                      <button
                        onClick={() => alert(`Downloading assignment resource: ${asg.attachmentName}`)}
                        className="inline-flex items-center gap-1 font-mono text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                      >
                        <Paperclip className="h-3.5 w-3.5" /> {asg.attachmentName}
                      </button>
                    )}
                  </div>

                  {/* Submission Details & Google Drive Badge */}
                  {submission && (
                    <div className="mt-3 p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                          <Upload className="h-3.5 w-3.5 text-indigo-600" />
                          Submitted File: {submission.fileName}
                        </span>
                        {submission.driveFileUrl && (
                          <a
                            href={submission.driveFileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="h-3.5 w-3.5" /> View on Google Drive
                          </a>
                        )}
                      </div>

                      {submission.status === 'Graded' && (
                        <div className="pt-2 border-t border-indigo-100 dark:border-indigo-900/50 flex items-center gap-4 text-xs font-semibold">
                          <span className="text-purple-700 dark:text-purple-300 flex items-center gap-1">
                            <Award className="h-4 w-4" /> Grade: {submission.grade || 'A+'}
                          </span>
                          {submission.feedback && (
                            <span className="text-slate-600 dark:text-slate-400">
                              Feedback: "{submission.feedback}"
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 border-t pt-3 border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setSubmittingAsgId(asg.id)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <Upload className="h-4 w-4" />
                    {submission ? 'Resubmit / Update on Drive' : 'Upload Solution (Google Drive)'}
                  </button>

                  <button
                    onClick={() => toggleStudentAssignmentStatus(asg.id, student.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isCompleted
                        ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {isCompleted ? 'Mark Pending' : 'Quick Complete'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Submission Modal */}
      {submittingAsgId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Upload className="h-5 w-5 text-teal-600" /> Submit Assignment
              </h3>
              <button
                onClick={() => setSubmittingAsgId(null)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Upload Assignment PDF / Document
                </label>
                <input
                  type="file"
                  required
                  onChange={e => setSubFile(e.target.files?.[0] || null)}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-2.5 text-xs text-slate-900 dark:text-white"
                />
                <p className="text-[10px] text-teal-600 dark:text-teal-400 mt-1 font-semibold">
                  * Note: Submissions are stored and synced with Google Drive.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notes / Comments for Faculty (Optional)
                </label>
                <textarea
                  rows={3}
                  value={subNotes}
                  onChange={e => setSubNotes(e.target.value)}
                  placeholder="E.g., Solved all 5 problems as instructed."
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSubmittingAsgId(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
                >
                  Upload & Sync to Google Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

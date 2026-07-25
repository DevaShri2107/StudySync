import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { FacultyUser, Assignment } from '../../types';
import { FileText, Plus, Trash2, Edit2, Calendar, Paperclip, Clock, AlertCircle, X, Check, Eye, Award, ExternalLink, CheckCircle } from 'lucide-react';

interface ManageAssignmentsProps {
  selectedYear: string;
  setSelectedYear: (y: string) => void;
  selectedSection: string;
  setSelectedSection: (s: string) => void;
}

export const ManageAssignments: React.FC<ManageAssignmentsProps> = ({
  selectedYear,
  setSelectedYear,
  selectedSection,
  setSelectedSection
}) => {
  const { currentUser } = useAuth();
  const { assignments, assignmentSubmissions, gradeSubmission, createAssignment, updateAssignment, deleteAssignment, years } = useData();

  if (!currentUser || currentUser.role !== 'Faculty') return null;
  const faculty = currentUser as FacultyUser;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  // Grading modal state
  const [viewingSubmissionsAsg, setViewingSubmissionsAsg] = useState<Assignment | null>(null);
  const [gradingSubId, setGradingSubId] = useState<string | null>(null);
  const [gradeInput, setGradeInput] = useState('A+');
  const [feedbackInput, setFeedbackInput] = useState('Excellent work and clear logic.');

  const [form, setForm] = useState({
    title: '',
    subject: 'Distributed Systems',
    description: '',
    deadline: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    priority: 'Medium' as 'High' | 'Medium' | 'Low',
    attachmentName: ''
  });

  const filteredAssignments = assignments.filter(
    a => a.department === faculty.department && a.year === selectedYear && a.section === selectedSection
  );

  const handleOpenCreate = () => {
    setEditingAssignment(null);
    setForm({
      title: '',
      subject: 'Distributed Systems',
      description: '',
      deadline: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      priority: 'Medium',
      attachmentName: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (asg: Assignment) => {
    setEditingAssignment(asg);
    setForm({
      title: asg.title,
      subject: asg.subject,
      description: asg.description,
      deadline: asg.deadline,
      priority: asg.priority,
      attachmentName: asg.attachmentName || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.subject) return;

    if (editingAssignment) {
      updateAssignment(editingAssignment.id, {
        title: form.title,
        subject: form.subject,
        description: form.description,
        deadline: form.deadline,
        priority: form.priority,
        attachmentName: form.attachmentName || undefined
      });
    } else {
      createAssignment({
        title: form.title,
        subject: form.subject,
        description: form.description,
        deadline: form.deadline,
        priority: form.priority,
        attachmentName: form.attachmentName || 'Assignment_Guidelines.pdf',
        attachmentSize: '1.5 MB',
        attachmentType: 'pdf',
        department: faculty.department,
        year: selectedYear,
        section: selectedSection,
        facultyId: faculty.id,
        facultyName: faculty.fullName
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="h-6 w-6 text-indigo-600" /> Assignment Management Portal
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create, edit, and delete coursework assignments for <span className="font-semibold text-slate-900 dark:text-white">{faculty.department} ({selectedYear} {selectedSection})</span>.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Create New Assignment
        </button>
      </div>

      {/* Filter Section Context */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-500">Filter Context:</span>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-xs"
          >
            {years.map(y => (
              <option key={y.id} value={y.name}>{y.name}</option>
            ))}
          </select>
          <select
            value={selectedSection}
            onChange={e => setSelectedSection(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-xs"
          >
            <option value="Section A">Section A</option>
            <option value="Section B">Section B</option>
            <option value="Section C">Section C</option>
            <option value="Section D">Section D</option>
          </select>
        </div>
        <span className="font-medium text-indigo-600">{filteredAssignments.length} Assignments</span>
      </div>

      {/* Assignment List */}
      <div className="space-y-3">
        {filteredAssignments.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No assignments created for {selectedYear} {selectedSection}</p>
            <p className="text-xs text-slate-500 mt-1">Click "Create New Assignment" above to assign coursework.</p>
          </div>
        ) : (
          filteredAssignments.map(asg => (
            <div
              key={asg.id}
              className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    asg.priority === 'High'
                      ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-200'
                      : asg.priority === 'Medium'
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200'
                  }`}>
                    {asg.priority} Priority
                  </span>
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    {asg.subject}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {asg.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                  {asg.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" /> Deadline: <span className="font-semibold text-slate-800 dark:text-slate-200">{asg.deadline}</span>
                  </span>
                  {asg.attachmentName && (
                    <span className="flex items-center gap-1 font-mono text-indigo-600 dark:text-indigo-400">
                      <Paperclip className="h-3.5 w-3.5" /> {asg.attachmentName}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setViewingSubmissionsAsg(asg)}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 text-xs font-semibold hover:bg-teal-100 transition-colors flex items-center gap-1.5"
                >
                  <Eye className="h-3.5 w-3.5" /> Submissions ({assignmentSubmissions.filter(s => s.assignmentId === asg.id).length})
                </button>
                <button
                  onClick={() => handleOpenEdit(asg)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 transition-colors flex items-center gap-1"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => deleteAssignment(asg.id)}
                  className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-100 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Consensus & Raft Protocol"
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
                    placeholder="e.g. Distributed Systems"
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Priority *
                  </label>
                  <select
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value as 'High' | 'Medium' | 'Low' })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Deadline Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={form.deadline}
                    onChange={e => setForm({ ...form, deadline: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Attachment Name (Simulated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lab_Exercise_3.pdf"
                    value={form.attachmentName}
                    onChange={e => setForm({ ...form, attachmentName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Instructions & Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide detailed submission requirements..."
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
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
                >
                  {editingAssignment ? 'Save Changes' : 'Publish Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Submissions Modal */}
      {viewingSubmissionsAsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Eye className="h-5 w-5 text-teal-600" /> Student Submissions: {viewingSubmissionsAsg.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{viewingSubmissionsAsg.subject} • {selectedYear} {selectedSection}</p>
              </div>
              <button
                onClick={() => { setViewingSubmissionsAsg(null); setGradingSubId(null); }}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {assignmentSubmissions.filter(s => s.assignmentId === viewingSubmissionsAsg.id).length === 0 ? (
              <div className="p-12 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No submissions uploaded yet</p>
                <p className="text-xs text-slate-500 mt-1">Students will appear here once they upload coursework via Google Drive.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignmentSubmissions
                  .filter(s => s.assignmentId === viewingSubmissionsAsg.id)
                  .map(sub => (
                    <div key={sub.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">{sub.studentName}</h4>
                          <p className="text-xs text-slate-500 font-mono">Reg No: {sub.registerNumber} • Submitted: {sub.submittedAt.split('T')[0]}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          sub.status === 'Graded'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {sub.status === 'Graded' ? `Graded (${sub.grade || 'A'})` : 'Needs Grading'}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
                        <span className="font-mono text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Paperclip className="h-3.5 w-3.5 text-indigo-600" /> {sub.fileName}
                        </span>
                        {sub.driveFileUrl && (
                          <a
                            href={sub.driveFileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1 rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 text-[11px] font-bold hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" /> View Google Drive File
                          </a>
                        )}
                      </div>

                      {/* Grading Interface */}
                      {gradingSubId === sub.id ? (
                        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 space-y-3">
                          <h5 className="font-bold text-xs text-indigo-900 dark:text-indigo-300">Evaluate & Grade Submission</h5>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-1">Grade</label>
                              <select
                                value={gradeInput}
                                onChange={e => setGradeInput(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 text-xs"
                              >
                                <option value="A+">A+ (Outstanding)</option>
                                <option value="A">A (Excellent)</option>
                                <option value="B">B (Good)</option>
                                <option value="C">C (Satisfactory)</option>
                                <option value="Re-submit">Re-submit Required</option>
                              </select>
                            </div>
                            <div className="col-span-2">
                              <label className="block text-[10px] font-bold text-slate-600 mb-1">Faculty Feedback</label>
                              <input
                                type="text"
                                value={feedbackInput}
                                onChange={e => setFeedbackInput(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 text-xs"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              onClick={() => setGradingSubId(null)}
                              className="px-3 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => {
                                gradeSubmission(sub.id, gradeInput, feedbackInput);
                                setGradingSubId(null);
                              }}
                              className="px-4 py-1 text-xs font-bold bg-indigo-600 text-white rounded-lg shadow-xs"
                            >
                              Save Grade & Notify Student
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-xs pt-1">
                          {sub.status === 'Graded' ? (
                            <p className="text-slate-600 dark:text-slate-400">
                              <span className="font-bold text-purple-600">Grade: {sub.grade}</span> — Feedback: "{sub.feedback}"
                            </p>
                          ) : (
                            <p className="text-slate-400 italic">No grade entered yet.</p>
                          )}
                          <button
                            onClick={() => {
                              setGradingSubId(sub.id);
                              if (sub.grade) setGradeInput(sub.grade);
                              if (sub.feedback) setFeedbackInput(sub.feedback);
                            }}
                            className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300 font-semibold hover:bg-indigo-100 flex items-center gap-1"
                          >
                            <Award className="h-3.5 w-3.5" /> {sub.status === 'Graded' ? 'Edit Grade' : 'Grade Submission'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

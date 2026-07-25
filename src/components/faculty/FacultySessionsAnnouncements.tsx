import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { FacultyUser } from '../../types';
import { Calendar, Megaphone, Plus, Trash2, Video, Clock, CheckCircle2, AlertCircle, X, ExternalLink, Users } from 'lucide-react';
import { generateGoogleMeetUrl, generateGoogleCalendarUrl } from '../../lib/googleServices';

interface FacultySessionsAnnouncementsProps {
  selectedYear: string;
  setSelectedYear: (y: string) => void;
  selectedSection: string;
  setSelectedSection: (s: string) => void;
}

export const FacultySessionsAnnouncements: React.FC<FacultySessionsAnnouncementsProps> = ({
  selectedYear,
  setSelectedYear,
  selectedSection,
  setSelectedSection
}) => {
  const { currentUser } = useAuth();
  const {
    studySessions,
    createStudySession,
    deleteStudySession,
    announcements,
    createAnnouncement,
    deleteAnnouncement,
    years
  } = useData();

  if (!currentUser || currentUser.role !== 'Faculty') return null;
  const faculty = currentUser as FacultyUser;

  const [activeTab, setActiveTab] = useState<'Sessions' | 'Announcements'>('Sessions');

  // Study session modal state
  const [isSessionModal, setIsSessionModal] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    topic: '',
    subject: 'Distributed Systems',
    description: '',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    time: '14:30',
    durationMinutes: 60,
    meetingUrl: 'https://meet.studysync.com/live-session'
  });

  // Announcement modal state
  const [isAncModal, setIsAncModal] = useState(false);
  const [ancForm, setAncForm] = useState({
    title: '',
    message: '',
    priority: 'Important' as 'Normal' | 'Important' | 'Urgent'
  });

  const filteredSessions = studySessions.filter(
    s => s.department === faculty.department && s.year === selectedYear && s.section === selectedSection
  );

  const filteredAnnouncements = announcements.filter(
    a => a.department === faculty.department && a.year === selectedYear && a.section === selectedSection
  );

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionForm.topic) return;

    const meetUrl = sessionForm.meetingUrl || generateGoogleMeetUrl(sessionForm.topic);
    const calUrl = generateGoogleCalendarUrl({
      title: `${sessionForm.subject}: ${sessionForm.topic}`,
      description: sessionForm.description || `Study session hosted by ${faculty.fullName}`,
      startDate: sessionForm.date,
      startTime: sessionForm.time,
      durationMinutes: Number(sessionForm.durationMinutes),
      location: meetUrl
    });

    createStudySession({
      topic: sessionForm.topic,
      subject: sessionForm.subject,
      description: sessionForm.description,
      date: sessionForm.date,
      time: sessionForm.time,
      durationMinutes: Number(sessionForm.durationMinutes),
      department: faculty.department,
      year: selectedYear,
      section: selectedSection,
      facultyId: faculty.id,
      facultyName: faculty.fullName,
      meetingUrl: meetUrl,
      calendarUrl: calUrl
    });

    setIsSessionModal(false);
  };

  const handleCreateAnc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ancForm.title || !ancForm.message) return;

    createAnnouncement({
      title: ancForm.title,
      message: ancForm.message,
      priority: ancForm.priority,
      department: faculty.department,
      year: selectedYear,
      section: selectedSection,
      facultyId: faculty.id,
      facultyName: faculty.fullName
    });

    setIsAncModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="h-6 w-6 text-amber-500" /> Live Study Sessions & Broadcast Announcements
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Schedule interactive review classes or dispatch instant broadcasts to <span className="font-semibold text-slate-900 dark:text-white">{faculty.department} ({selectedYear} {selectedSection})</span>.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('Sessions')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'Sessions'
                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Study Sessions ({filteredSessions.length})
          </button>
          <button
            onClick={() => setActiveTab('Announcements')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'Announcements'
                ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Announcements ({filteredAnnouncements.length})
          </button>
        </div>
      </div>

      {/* Content for Sessions */}
      {activeTab === 'Sessions' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-500">Active Sessions for {selectedYear} {selectedSection}</span>
            <button
              onClick={() => setIsSessionModal(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" /> Schedule Study Session
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSessions.length === 0 ? (
              <div className="col-span-full p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No study sessions scheduled</p>
                <p className="text-xs text-slate-500 mt-1">Schedule a live Q&A or exam revision class for students.</p>
              </div>
            ) : (
              filteredSessions.map(s => {
                const attendedCount = s.attendedStudentIds?.length || 0;
                return (
                  <div
                    key={s.id}
                    className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{s.subject}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          {s.durationMinutes} mins
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        {s.topic}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {s.description}
                      </p>

                      <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">📅 Schedule: {s.date} at {s.time}</p>
                        {s.meetingUrl && (
                          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 font-mono text-[11px] bg-indigo-50 dark:bg-indigo-950/40 p-2 rounded-xl border border-indigo-100 dark:border-indigo-900">
                            <span className="truncate flex items-center gap-1">
                              <Video className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                              {s.meetingUrl}
                            </span>
                            <a
                              href={s.meetingUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-md"
                              title="Open Google Meet"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        )}
                        {s.calendarUrl && (
                          <a
                            href={s.calendarUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                          >
                            <Calendar className="h-3.5 w-3.5" /> Sync to Google Calendar
                          </a>
                        )}
                      </div>

                      {/* Live Attendance Tracker Badge */}
                      <div className="mt-3 p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
                        <span className="font-semibold flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-emerald-600" />
                          Live Attendance Joined:
                        </span>
                        <span className="font-bold text-sm bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded-xl border border-emerald-300">
                          {attendedCount} Present
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                      <button
                        onClick={() => deleteStudySession(s.id)}
                        className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold flex items-center gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Cancel Session
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Content for Announcements */}
      {activeTab === 'Announcements' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-500">Section Broadcasts ({selectedYear} {selectedSection})</span>
            <button
              onClick={() => setIsAncModal(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" /> Post New Announcement
            </button>
          </div>

          <div className="space-y-3">
            {filteredAnnouncements.length === 0 ? (
              <div className="p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <Megaphone className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No announcements posted for this section</p>
                <p className="text-xs text-slate-500 mt-1">Post urgent updates, exam schedules, or departmental notices.</p>
              </div>
            ) : (
              filteredAnnouncements.map(a => (
                <div
                  key={a.id}
                  className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-start justify-between gap-4"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        a.priority === 'Urgent'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : a.priority === 'Important'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {a.priority}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(a.postedAt).toLocaleString()}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {a.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {a.message}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteAnnouncement(a.id)}
                    className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Schedule Study Session Modal */}
      {isSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
            <button onClick={() => setIsSessionModal(false)} className="absolute top-4 right-4 text-slate-400">
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Schedule Live Study Session
            </h3>

            <form onSubmit={handleCreateSession} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Topic *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CAP Theorem & Consistency Models Revision"
                  value={sessionForm.topic}
                  onChange={e => setSessionForm({ ...sessionForm, topic: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={sessionForm.subject}
                    onChange={e => setSessionForm({ ...sessionForm, subject: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    value={sessionForm.durationMinutes}
                    onChange={e => setSessionForm({ ...sessionForm, durationMinutes: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={sessionForm.date}
                    onChange={e => setSessionForm({ ...sessionForm, date: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={sessionForm.time}
                    onChange={e => setSessionForm({ ...sessionForm, time: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Session Description</label>
                <textarea
                  rows={2}
                  placeholder="Key discussion agenda..."
                  value={sessionForm.description}
                  onChange={e => setSessionForm({ ...sessionForm, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsSessionModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-xs">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold">
                  Save & Notify Students
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post Announcement Modal */}
      {isAncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
            <button onClick={() => setIsAncModal(false)} className="absolute top-4 right-4 text-slate-400">
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Post Section Announcement
            </h3>

            <form onSubmit={handleCreateAnc} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mid-Term Lab Exam Schedule Change"
                  value={ancForm.title}
                  onChange={e => setAncForm({ ...ancForm, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Priority Level</label>
                <select
                  value={ancForm.priority}
                  onChange={e => setAncForm({ ...ancForm, priority: e.target.value as any })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                >
                  <option value="Normal">Normal</option>
                  <option value="Important">Important</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Message Content *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Write clear instructions for students..."
                  value={ancForm.message}
                  onChange={e => setAncForm({ ...ancForm, message: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAncModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-xs">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold">
                  Publish Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

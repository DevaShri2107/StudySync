import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { StudentUser } from '../../types';
import { CircularProgress } from '../common/CircularProgress';
import { GraduationCap, Calendar, CheckCircle2, XCircle, BarChart3, Clock, AlertTriangle, Video, ExternalLink } from 'lucide-react';

export const StudentAttendanceView: React.FC = () => {
  const { currentUser } = useAuth();
  const { getStudentAttendanceStats, attendanceSessions, studySessions, joinStudySessionAndMarkAttendance } = useData();

  if (!currentUser || currentUser.role !== 'Student') return null;
  const student = currentUser as StudentUser;

  const stats = getStudentAttendanceStats(
    student.id,
    student.department,
    student.year,
    student.section
  );

  const [activeSubTab, setActiveSubTab] = useState<'Overall' | 'SubjectWise' | 'History'>('Overall');

  // Filter history for this student
  const myHistory = attendanceSessions
    .filter(s => s.department === student.department && s.year === student.year && s.section === student.section)
    .map(s => {
      const rec = s.records.find(r => r.studentId === student.id);
      return {
        id: s.id,
        date: s.date,
        subject: s.subject,
        facultyName: s.facultyName,
        status: rec ? rec.status : 'Not Marked'
      };
    });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-emerald-600" /> Attendance Telemetry & Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time tracking of overall attendance percentage, subject performance, and historical session logs.
          </p>
        </div>

        {/* Subtab Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveSubTab('Overall')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeSubTab === 'Overall' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Overall Summary
          </button>
          <button
            onClick={() => setActiveSubTab('SubjectWise')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeSubTab === 'SubjectWise' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Subject Breakdown
          </button>
          <button
            onClick={() => setActiveSubTab('History')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeSubTab === 'History' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Class History ({myHistory.length})
          </button>
        </div>
      </div>

      {/* Main Circular Metric Box */}
      <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col md:flex-row items-center justify-around gap-8 text-center md:text-left">
        <CircularProgress
          value={stats.overallPercentage}
          size={160}
          strokeWidth={14}
          showLabel={true}
          sublabel="Attendance %"
        />

        <div className="space-y-3 max-w-md">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200">
            {stats.overallPercentage >= 75 ? '🟢 Eligible for University Examinations (> 75%)' : '🔴 Shortage of Attendance Notice (< 75%)'}
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {stats.attendedClasses} Classes Attended
          </h2>

          <p className="text-xs text-slate-500 leading-relaxed">
            Total conduct sessions: <span className="font-bold text-slate-900 dark:text-white">{stats.totalClasses}</span>. You have missed <span className="font-bold text-red-600">{stats.totalClasses - stats.attendedClasses}</span> classes in {student.department} ({student.year} {student.section}).
          </p>
        </div>
      </div>

      {/* View 1: Subject-Wise Breakdown */}
      {activeSubTab === 'SubjectWise' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" /> Subject-wise Performance Matrix
          </h2>

          {stats.subjectWise.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
              <p className="text-xs text-slate-500">No subject-wise attendance logs recorded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.subjectWise.map((sub, idx) => (
                <div key={idx} className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{sub.subject}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Attended {sub.attended} out of {sub.total} classes
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-extrabold ${
                      sub.percentage >= 75 ? 'text-emerald-600' : sub.percentage >= 60 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {sub.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Live Google Meet Sessions & Real-time Attendance */}
      {studySessions.filter(s => s.department === student.department && s.year === student.year && s.section === student.section).length > 0 && (
        <div className="p-6 rounded-3xl border border-indigo-200 dark:border-indigo-900 bg-gradient-to-br from-indigo-50/50 via-white to-amber-50/30 dark:from-indigo-950/20 dark:via-slate-900 dark:to-amber-950/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Video className="h-5 w-5 text-indigo-600" /> Active & Upcoming Google Meet Classes
            </h2>
            <span className="text-[11px] font-semibold text-slate-500">
              * Note: Attendance is automatically marked PRESENT upon joining.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studySessions
              .filter(s => s.department === student.department && s.year === student.year && s.section === student.section)
              .map(s => {
                const isAttended = s.attendedStudentIds?.includes(student.id);
                return (
                  <div key={s.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{s.subject}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isAttended
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {isAttended ? '✓ Present' : 'Not Joined Yet'}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">{s.topic}</h3>
                      <p className="text-xs text-slate-500 mt-1">📅 {s.date} at {s.time} ({s.durationMinutes} mins)</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      {s.meetingUrl && (
                        <button
                          onClick={() => joinStudySessionAndMarkAttendance(s.id, student)}
                          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
                        >
                          <Video className="h-4 w-4" />
                          {isAttended ? 'Rejoin Google Meet' : 'Join Session & Mark Present'}
                        </button>
                      )}
                      {s.calendarUrl && (
                        <a
                          href={s.calendarUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 flex items-center gap-1"
                        >
                          <Calendar className="h-3.5 w-3.5 text-amber-500" /> Calendar
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* View 2: History List */}
      {(activeSubTab === 'Overall' || activeSubTab === 'History') && (
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-600" /> Session History Logs
          </h2>

          {myHistory.length === 0 ? (
            <p className="text-xs text-slate-500">No session records logged yet for your batch.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {myHistory.map(h => (
                <div key={h.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white text-xs">{h.subject}</span>
                    <p className="text-[11px] text-slate-400 font-mono">Date: {h.date} • Faculty: {h.facultyName}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    h.status === 'Present'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200'
                      : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-200'
                  }`}>
                    {h.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

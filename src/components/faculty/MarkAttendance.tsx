import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { FacultyUser, StudentUser, AttendanceEntry } from '../../types';
import { UserCheck, CheckCircle2, XCircle, Calendar, Layers, BookOpen, Save, CheckSquare, Square } from 'lucide-react';

interface MarkAttendanceProps {
  selectedYear: string;
  setSelectedYear: (y: string) => void;
  selectedSection: string;
  setSelectedSection: (s: string) => void;
}

export const MarkAttendance: React.FC<MarkAttendanceProps> = ({
  selectedYear,
  setSelectedYear,
  selectedSection,
  setSelectedSection
}) => {
  const { currentUser, users } = useAuth();
  const { years, saveAttendanceSession, attendanceSessions } = useData();

  if (!currentUser || currentUser.role !== 'Faculty') return null;
  const faculty = currentUser as FacultyUser;

  const [subject, setSubject] = useState('Distributed Systems');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Target students belonging strictly to Faculty Dept * Year * Section
  const targetStudents = (users.filter(u => u.role === 'Student') as StudentUser[]).filter(
    s => s.department === faculty.department && s.year === selectedYear && s.section === selectedSection
  );

  // Local state for checkboxes
  const [attendanceMap, setAttendanceMap] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    targetStudents.forEach(s => { initial[s.id] = true; }); // Default present
    return initial;
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleToggle = (id: string) => {
    setAttendanceMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectAll = (present: boolean) => {
    const updated: Record<string, boolean> = {};
    targetStudents.forEach(s => { updated[s.id] = present; });
    setAttendanceMap(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetStudents.length === 0) {
      alert('No students found in this section to mark attendance.');
      return;
    }

    const records: AttendanceEntry[] = targetStudents.map(s => ({
      studentId: s.id,
      studentName: s.fullName,
      registerNumber: s.registerNumber,
      status: attendanceMap[s.id] !== false ? 'Present' : 'Absent'
    }));

    const presentCount = records.filter(r => r.status === 'Present').length;
    const absentCount = records.length - presentCount;

    saveAttendanceSession({
      date,
      subject,
      department: faculty.department,
      year: selectedYear,
      section: selectedSection,
      facultyId: faculty.id,
      facultyName: faculty.fullName,
      records,
      totalStudents: records.length,
      presentCount,
      absentCount
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const historySessions = attendanceSessions.filter(
    s => s.department === faculty.department && s.year === selectedYear && s.section === selectedSection
  );

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <UserCheck className="h-6 w-6 text-emerald-600" /> Attendance Management Module
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Select Year & Section, review student list, mark attendance, and save session to automatically update student analytics.
        </p>
      </div>

      {/* Select Year and Section */}
      <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Faculty Department
            </label>
            <input
              type="text"
              disabled
              value={faculty.department}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Academic Year
            </label>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white"
            >
              {years.map(y => (
                <option key={y.id} value={y.name}>{y.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Section
            </label>
            <select
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white"
            >
              <option value="Section A">Section A</option>
              <option value="Section B">Section B</option>
              <option value="Section C">Section C</option>
              <option value="Section D">Section D</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Subject & Date
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Subject"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-2 text-xs text-slate-900 dark:text-white"
              />
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-2 text-[11px] text-slate-900 dark:text-white"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Student List & Attendance Form */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Student Attendance Sheet — {faculty.department} ({selectedYear} {selectedSection})
            </h2>
            <p className="text-xs text-slate-500">
              Total Enrolled Students in this section: <span className="font-bold text-slate-900 dark:text-white">{targetStudents.length}</span>
            </p>
          </div>

          {targetStudents.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSelectAll(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 transition-colors"
              >
                Mark All Present
              </button>
              <button
                type="button"
                onClick={() => handleSelectAll(false)}
                className="px-3 py-1.5 rounded-xl bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 text-xs font-semibold hover:bg-red-100 transition-colors"
              >
                Mark All Absent
              </button>
            </div>
          )}
        </div>

        {savedSuccess && (
          <div className="my-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> Attendance session saved successfully! Notifications dispatched.
          </div>
        )}

        {targetStudents.length === 0 ? (
          <div className="text-center py-12">
            <UserCheck className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No students enrolled in {faculty.department} ({selectedYear} {selectedSection})
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Students can register using the registration form or load demo data.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="mt-4 space-y-4">
            <div className="divide-y divide-slate-100 dark:divide-slate-800 border-t border-b border-slate-100 dark:border-slate-800">
              {targetStudents.map((std, idx) => {
                const isPresent = attendanceMap[std.id] !== false;
                return (
                  <div
                    key={std.id}
                    onClick={() => handleToggle(std.id)}
                    className={`py-3 px-2 flex items-center justify-between transition-colors cursor-pointer rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                      isPresent ? '' : 'bg-red-50/30 dark:bg-red-950/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-400 w-6">#{idx + 1}</span>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{std.fullName}</p>
                        <p className="text-[11px] font-mono text-slate-500">{std.registerNumber} • {std.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        isPresent
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200'
                          : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-200'
                      }`}>
                        {isPresent ? 'Present' : 'Absent'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggle(std.id);
                        }}
                        className="p-1 rounded-lg text-slate-500 hover:text-indigo-600"
                      >
                        {isPresent ? (
                          <CheckSquare className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <Square className="h-5 w-5 text-red-500" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                Present: <span className="font-bold text-emerald-600">{Object.values(attendanceMap).filter(v => v !== false).length}</span> |
                Absent: <span className="font-bold text-red-600">{targetStudents.length - Object.values(attendanceMap).filter(v => v !== false).length}</span>
              </span>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
              >
                <Save className="h-4 w-4" /> Save Attendance Session
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Attendance History for this Section */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">
          Recent Logged Sessions for {selectedYear} {selectedSection}
        </h2>

        {historySessions.length === 0 ? (
          <p className="text-xs text-slate-500">No previous sessions logged for this batch.</p>
        ) : (
          <div className="space-y-2">
            {historySessions.map(hs => (
              <div key={hs.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between border border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{hs.subject}</span>
                  <span className="text-slate-500 ml-2 font-mono">({hs.date})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">{hs.presentCount} Present</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-red-600 font-bold">{hs.absentCount} Absent</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

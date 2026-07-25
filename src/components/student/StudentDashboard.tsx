import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { StudentUser } from '../../types';
import { CircularProgress } from '../common/CircularProgress';
import { StatCard } from '../common/StatCard';
import {
  GraduationCap,
  FileText,
  CalendarCheck,
  BookOpen,
  Megaphone,
  Video,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Bell,
  Sparkles,
  Calendar
} from 'lucide-react';

interface StudentDashboardProps {
  setActiveTab: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ setActiveTab }) => {
  const { currentUser } = useAuth();
  const {
    getStudentAttendanceStats,
    assignments,
    studentProgressList,
    announcements,
    studySessions,
    plannerTasks,
    togglePlannerTask,
    joinStudySessionAndMarkAttendance
  } = useData();

  if (!currentUser || currentUser.role !== 'Student') return null;
  const student = currentUser as StudentUser;

  // STRICT ACCESS RESTRICTION: Student accesses ONLY data matching their Dept, Year, Section
  const attendanceStats = getStudentAttendanceStats(
    student.id,
    student.department,
    student.year,
    student.section
  );

  const studentAssignments = assignments.filter(
    a => a.department === student.department && a.year === student.year && a.section === student.section
  );

  const pendingAssignments = studentAssignments.filter(a => {
    const prog = studentProgressList.find(p => p.assignmentId === a.id && p.studentId === student.id);
    return !prog || prog.status !== 'Completed';
  });

  const studentAnnouncements = announcements.filter(
    a => a.department === student.department && a.year === student.year && a.section === student.section
  );

  const studentSessions = studySessions.filter(
    s => s.department === student.department && s.year === student.year && s.section === student.section
  );

  const studentPlanner = plannerTasks.filter(t => t.studentId === student.id);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Student Gradient Banner */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-indigo-600 via-teal-600 to-violet-700 p-6 sm:p-8 text-white shadow-xl shadow-indigo-200/50 dark:shadow-indigo-950/50">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-emerald-100 mb-2 border border-white/20">
              <GraduationCap className="h-3.5 w-3.5" /> Student Portal • {student.department}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {student.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 font-mono">
              Reg No: {student.registerNumber} | Batch: {student.year} • {student.section}
            </p>
          </div>

          {/* Attendance Indicator Pill */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex items-center gap-4 shrink-0">
            <CircularProgress
              value={attendanceStats.overallPercentage}
              size={80}
              strokeWidth={7}
              showLabel={true}
            />
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-200">Overall Attendance</span>
              <p className="text-lg font-extrabold text-white">{attendanceStats.attendedClasses} / {attendanceStats.totalClasses} Sessions</p>
              <p className="text-[11px] text-emerald-100 font-medium">
                {attendanceStats.overallPercentage >= 75 ? ' Good standing (> 75%)' : ' Below threshold (< 75%)'}
              </p>
            </div>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Attendance"
          value={`${attendanceStats.overallPercentage}%`}
          icon={GraduationCap}
          subtext={`${attendanceStats.attendedClasses} / ${attendanceStats.totalClasses} Attended`}
          color={attendanceStats.overallPercentage >= 75 ? 'emerald' : 'rose'}
          onClick={() => setActiveTab('Attendance')}
        />
        <StatCard
          title="Pending Homework"
          value={pendingAssignments.length}
          icon={FileText}
          subtext="Course assignments due"
          color="indigo"
          onClick={() => setActiveTab('Assignments')}
        />
        <StatCard
          title="Planner Tasks"
          value={studentPlanner.filter(t => !t.completed).length}
          icon={CalendarCheck}
          subtext="Pending study tasks"
          color="amber"
          onClick={() => setActiveTab('Planner')}
        />
        <StatCard
          title="Announcements"
          value={studentAnnouncements.length}
          icon={Megaphone}
          subtext="Broadcasts for batch"
          color="purple"
        />
      </div>

      {/* Main Grid: Schedule, Assignments, & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Upcoming Assignments & Tasks */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Upcoming Assignments */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" /> Upcoming Course Assignments
              </h2>
              <button
                onClick={() => setActiveTab('Assignments')}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
              >
                View All <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {studentAssignments.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                <p className="text-xs text-slate-500">No active assignments published for your batch.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {studentAssignments.slice(0, 3).map(asg => {
                  const prog = studentProgressList.find(p => p.assignmentId === asg.id && p.studentId === student.id);
                  const isCompleted = prog?.status === 'Completed';

                  return (
                    <div
                      key={asg.id}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isCompleted
                          ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 opacity-80'
                          : 'bg-white dark:bg-slate-900 border-indigo-100 dark:border-indigo-950 shadow-xs'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                            {asg.subject}
                          </span>
                          <span className="text-[10px] text-slate-400">• Deadline: {asg.deadline}</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                          {asg.title}
                        </h3>
                      </div>

                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200'
                      }`}>
                        {isCompleted ? '✓ Completed' : 'Pending'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Study Planner Tasks Checklist */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-amber-500" /> Study Planner Checklist
              </h2>
              <button
                onClick={() => setActiveTab('Planner')}
                className="text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline flex items-center gap-1"
              >
                Open Planner <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {studentPlanner.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                <p className="text-xs text-slate-500">No tasks in your personal planner yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {studentPlanner.slice(0, 4).map(t => (
                  <div
                    key={t.id}
                    onClick={() => togglePlannerTask(t.id)}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={t.completed}
                        onChange={() => togglePlannerTask(t.id)}
                        className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span className={`text-xs font-semibold ${t.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                        {t.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{t.dueDate}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Column 2: Live Study Sessions & Announcements */}
        <div className="space-y-6">
          
          {/* Live Study Sessions */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <h2 className="font-bold text-slate-900 dark:text-white text-base mb-3 flex items-center gap-2">
              <Video className="h-5 w-5 text-indigo-600" /> Upcoming Study Sessions
            </h2>

            {studentSessions.length === 0 ? (
              <p className="text-xs text-slate-500">No live study sessions scheduled for your section.</p>
            ) : (
              <div className="space-y-3">
                {studentSessions.map(s => {
                  const isAttended = s.attendedStudentIds?.includes(student.id);
                  return (
                    <div key={s.id} className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">{s.subject}</p>
                        {isAttended && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Marked Present
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">{s.topic}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300">📅 {s.date} at {s.time}</p>
                      
                      <div className="pt-2 flex flex-wrap items-center gap-2">
                        {s.meetingUrl && (
                          <button
                            onClick={() => joinStudySessionAndMarkAttendance(s.id, student)}
                            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold transition-all shadow-xs flex items-center gap-1"
                          >
                            <Video className="h-3.5 w-3.5" />
                            {isAttended ? 'Rejoin Google Meet' : 'Join Session & Mark Attendance'}
                          </button>
                        )}
                        {s.calendarUrl && (
                          <a
                            href={s.calendarUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1"
                          >
                            <Calendar className="h-3.5 w-3.5 text-amber-500" /> Google Calendar
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Announcements */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <h2 className="font-bold text-slate-900 dark:text-white text-base mb-3 flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-purple-600" /> Batch Broadcasts
            </h2>

            {studentAnnouncements.length === 0 ? (
              <p className="text-xs text-slate-500">No recent announcements for {student.year} {student.section}.</p>
            ) : (
              <div className="space-y-3">
                {studentAnnouncements.map(a => (
                  <div key={a.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{a.title}</span>
                      <span className="text-[9px] font-mono text-purple-600 dark:text-purple-400 font-bold uppercase">{a.priority}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">{a.message}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">By {a.facultyName}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

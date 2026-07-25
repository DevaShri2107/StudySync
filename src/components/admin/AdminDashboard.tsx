import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { StatCard } from '../common/StatCard';
import {
  Users,
  GraduationCap,
  Building,
  Calendar,
  Layers,
  FileText,
  BarChart3,
  UserCheck,
  Plus,
  ShieldCheck,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { FacultyUser, StudentUser } from '../../types';

interface AdminDashboardProps {
  setActiveTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ setActiveTab }) => {
  const { users } = useAuth();
  const { departments, years, sections, assignments, attendanceSessions } = useData();

  const facultyList = users.filter(u => u.role === 'Faculty') as FacultyUser[];
  const studentList = users.filter(u => u.role === 'Student') as StudentUser[];

  // Calculate total classes marked and overall attendance average
  let totalMarkedClasses = attendanceSessions.length;
  let overallAttAvg = 100;
  if (totalMarkedClasses > 0) {
    const sumPresents = attendanceSessions.reduce((acc, s) => acc + s.presentCount, 0);
    const sumTotals = attendanceSessions.reduce((acc, s) => acc + s.totalStudents, 0);
    if (sumTotals > 0) {
      overallAttAvg = Math.round((sumPresents / sumTotals) * 100);
    }
  }

  return (
    <div className="space-y-6 pb-12">
      
      {/* Gradient Welcome Banner */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-800 p-6 sm:p-8 text-white shadow-xl shadow-indigo-200/50 dark:shadow-indigo-950/50">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-indigo-100 mb-2 border border-white/20">
              <ShieldCheck className="h-3.5 w-3.5" /> System Administrator Console
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Academic Control Center
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100/90 max-w-xl mt-1">
              Manage departments, faculty accounts, student enrollments, attendance metrics, and system configuration from a centralized workspace.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveTab('Faculty')}
              className="px-5 py-2.5 rounded-2xl bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs transition-all shadow-md flex items-center gap-2 hover:-translate-y-0.5"
            >
              <Users className="h-4 w-4 text-indigo-600" /> Manage Faculty
            </button>
            <button
              onClick={() => setActiveTab('Students')}
              className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-2 backdrop-blur-md hover:-translate-y-0.5"
            >
              <GraduationCap className="h-4 w-4" /> View Students
            </button>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      </div>

      {/* Primary Statistics Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" /> Platform Overview & Key Metrics
          </h2>
          <span className="text-xs text-slate-500">Real-time telemetry</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
          <StatCard
            title="Students"
            value={studentList.length}
            icon={GraduationCap}
            subtext="Enrolled"
            color="emerald"
            onClick={() => setActiveTab('Students')}
          />
          <StatCard
            title="Faculty"
            value={facultyList.length}
            icon={Users}
            subtext="Active Teachers"
            color="indigo"
            onClick={() => setActiveTab('Faculty')}
          />
          <StatCard
            title="Departments"
            value={departments.length}
            icon={Building}
            subtext="Academic Branches"
            color="purple"
            onClick={() => setActiveTab('Settings')}
          />
          <StatCard
            title="Years"
            value={years.length}
            icon={Calendar}
            subtext="I to IV Year"
            color="blue"
            onClick={() => setActiveTab('Settings')}
          />
          <StatCard
            title="Sections"
            value={sections.length}
            icon={Layers}
            subtext="Batches"
            color="amber"
            onClick={() => setActiveTab('Settings')}
          />
          <StatCard
            title="Assignments"
            value={assignments.length}
            icon={FileText}
            subtext="Total Created"
            color="rose"
          />
          <StatCard
            title="Attendance"
            value={`${overallAttAvg}%`}
            icon={UserCheck}
            subtext={`${totalMarkedClasses} Sessions`}
            color="teal"
            onClick={() => setActiveTab('Reports')}
          />
        </div>
      </div>

      {/* Quick Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Registered Faculty Members List */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Faculty Roster ({facultyList.length})
              </h3>
              <p className="text-xs text-slate-500">Registered teaching staff</p>
            </div>
            <button
              onClick={() => setActiveTab('Faculty')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
            >
              View All <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {facultyList.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
              <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">No faculty members registered yet.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Faculty can self-register or use Demo Data.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {facultyList.slice(0, 5).map(f => (
                <div key={f.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between border border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{f.fullName}</p>
                    <p className="text-[11px] text-slate-500">{f.department} • <span className="font-mono">{f.employeeId}</span></p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-medium border border-indigo-200 dark:border-indigo-800">
                    {f.email}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Registered Students List */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Student Roster ({studentList.length})
              </h3>
              <p className="text-xs text-slate-500">Enrolled student accounts</p>
            </div>
            <button
              onClick={() => setActiveTab('Students')}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
            >
              View All <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {studentList.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
              <GraduationCap className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">No students registered yet.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Students register specifying Dept, Year, and Section.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {studentList.slice(0, 5).map(s => (
                <div key={s.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between border border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{s.fullName}</p>
                    <p className="text-[11px] text-slate-500">{s.department} • {s.year} - {s.section}</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-medium border border-emerald-200 dark:border-emerald-800">
                    {s.registerNumber}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

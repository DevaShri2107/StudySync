import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { FacultyUser, StudentUser } from '../../types';
import { StatCard } from '../common/StatCard';
import {
  GraduationCap,
  UserCheck,
  FileText,
  BookOpen,
  Calendar,
  Megaphone,
  Layers,
  ChevronRight,
  Plus,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface FacultyDashboardProps {
  setActiveTab: (tab: string) => void;
  selectedYear: string;
  setSelectedYear: (y: string) => void;
  selectedSection: string;
  setSelectedSection: (s: string) => void;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({
  setActiveTab,
  selectedYear,
  setSelectedYear,
  selectedSection,
  setSelectedSection
}) => {
  const { currentUser, users } = useAuth();
  const { years, sections, assignments, notes, attendanceSessions, announcements } = useData();

  if (!currentUser || currentUser.role !== 'Faculty') return null;
  const faculty = currentUser as FacultyUser;

  // Find all sections belonging to Faculty's department and selected Year
  // Available sections for Faculty Dept + Selected Year
  const availableSections = sections.filter(s => {
    // If section matches dept/year or general section list
    return true; // We show Section A, B, C, D dynamically
  });

  const sectionOptions = ['Section A', 'Section B', 'Section C', 'Section D'];

  // Students in this specific Dept + Year + Section
  const targetStudents = (users.filter(u => u.role === 'Student') as StudentUser[]).filter(
    s => s.department === faculty.department && s.year === selectedYear && s.section === selectedSection
  );

  // Active assignments for selected Dept + Year + Section
  const filteredAssignments = assignments.filter(
    a => a.department === faculty.department && a.year === selectedYear && a.section === selectedSection
  );

  // Notes for this section
  const filteredNotes = notes.filter(
    n => n.department === faculty.department && n.year === selectedYear && n.section === selectedSection
  );

  return (
    <div className="space-y-6 pb-12">
      
      {/* Welcome Card & Department Info */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-6 sm:p-8 text-white shadow-xl shadow-indigo-200/50 dark:shadow-indigo-950/50">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-indigo-100 mb-2 border border-white/20">
              <GraduationCap className="h-3.5 w-3.5" /> Faculty Console • {faculty.department}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {faculty.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100/90 mt-1 font-mono">
              Employee ID: {faculty.employeeId} | Department: {faculty.department}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveTab('Attendance')}
              className="px-5 py-2.5 rounded-2xl bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs transition-all shadow-md flex items-center gap-2 hover:-translate-y-0.5"
            >
              <UserCheck className="h-4 w-4 text-indigo-600" /> Mark Attendance
            </button>
            <button
              onClick={() => setActiveTab('Assignments')}
              className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-2 backdrop-blur-md hover:-translate-y-0.5"
            >
              <FileText className="h-4 w-4" /> Create Assignment
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Year & Automatic Section Selector */}
      <div className="rounded-[32px] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-600" /> Target Batch & Section Navigator
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select an academic year to automatically view every available section in <span className="font-semibold text-indigo-600 dark:text-indigo-400">{faculty.department}</span>.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Year selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              1. Select Academic Year
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {years.map(y => (
                <button
                  key={y.id}
                  onClick={() => setSelectedYear(y.name)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all border ${
                    selectedYear === y.name
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200 dark:shadow-indigo-950'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {y.name}
                </button>
              ))}
            </div>
          </div>

          {/* Automatic Sections list */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              2. Available Sections for {faculty.department} ({selectedYear})
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {sectionOptions.map(sec => (
                <button
                  key={sec}
                  onClick={() => setSelectedSection(sec)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all border flex items-center justify-between ${
                    selectedSection === sec
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200 dark:shadow-emerald-950'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{sec}</span>
                  {selectedSection === sec && <span className="w-2 h-2 rounded-full bg-white animate-ping" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-900 dark:text-indigo-200 flex items-center justify-between font-medium">
          <span>Active Context: <span className="font-bold text-indigo-700 dark:text-indigo-300">{faculty.department} • {selectedYear} • {selectedSection}</span></span>
          <span className="font-bold text-indigo-600 dark:text-indigo-400">{targetStudents.length} Students Enrolled</span>
        </div>
      </div>

      {/* Quick Statistics Cards for Selected Batch */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Students Enrolled"
          value={targetStudents.length}
          icon={GraduationCap}
          subtext={`${faculty.department} (${selectedSection})`}
          color="emerald"
        />
        <StatCard
          title="Active Assignments"
          value={filteredAssignments.length}
          icon={FileText}
          subtext="Created for this batch"
          color="indigo"
          onClick={() => setActiveTab('Assignments')}
        />
        <StatCard
          title="Uploaded Notes"
          value={filteredNotes.length}
          icon={BookOpen}
          subtext="PDFs, PPTs, Docs"
          color="purple"
          onClick={() => setActiveTab('Notes')}
        />
        <StatCard
          title="Attendance Sessions"
          value={attendanceSessions.filter(s => s.department === faculty.department && s.year === selectedYear && s.section === selectedSection).length}
          icon={UserCheck}
          subtext="Classes logged"
          color="teal"
          onClick={() => setActiveTab('Attendance')}
        />
      </div>

      {/* Quick Actions Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => setActiveTab('Attendance')}
          className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Mark Attendance</h3>
              <p className="text-xs text-slate-500">Log daily student presence</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
        </div>

        <div
          onClick={() => setActiveTab('Assignments')}
          className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Manage Assignments</h3>
              <p className="text-xs text-slate-500">Create & grade task submissions</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
        </div>

        <div
          onClick={() => setActiveTab('Notes')}
          className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Course Materials</h3>
              <p className="text-xs text-slate-500">Upload PDF, PPT & DOCX files</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
        </div>
      </div>

    </div>
  );
};

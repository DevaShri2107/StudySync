import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Common Components
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { LoginModal } from './components/auth/LoginModal';
import { FacultyRegisterModal } from './components/auth/FacultyRegisterModal';
import { StudentRegisterModal } from './components/auth/StudentRegisterModal';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ManageUsers } from './components/admin/ManageUsers';
import { AdminReports } from './components/admin/AdminReports';
import { AdminSettings } from './components/admin/AdminSettings';

// Faculty Components
import { FacultyDashboard } from './components/faculty/FacultyDashboard';
import { MarkAttendance } from './components/faculty/MarkAttendance';
import { ManageAssignments } from './components/faculty/ManageAssignments';
import { UploadNotes } from './components/faculty/UploadNotes';
import { FacultySessionsAnnouncements } from './components/faculty/FacultySessionsAnnouncements';

// Student Components
import { StudentDashboard } from './components/student/StudentDashboard';
import { StudentAttendanceView } from './components/student/StudentAttendanceView';
import { StudentAssignmentsView } from './components/student/StudentAssignmentsView';
import { StudentNotesView } from './components/student/StudentNotesView';
import { StudentPlannerView } from './components/student/StudentPlannerView';

// Profile Component
import { UserProfile } from './components/profile/UserProfile';

import {
  GraduationCap,
  Users,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  BookOpen,
  CalendarCheck
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentUser, login } = useAuth();
  const { seedDemoData } = useData();

  const [activeTab, setActiveTab] = useState('Home');

  // Auth Modals state
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isFacultyRegOpen, setIsFacultyRegOpen] = useState(false);
  const [isStudentRegOpen, setIsStudentRegOpen] = useState(false);

  // Faculty selection state
  const [facultyYear, setFacultyYear] = useState('III Year');
  const [facultySection, setFacultySection] = useState('Section A');

  // Render role-based content
  const renderContent = () => {
    if (!currentUser) {
      return (
        <div className="max-w-5xl mx-auto space-y-8 py-6">
          
          {/* Landing Hero */}
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-8 sm:p-12 text-white shadow-xl shadow-indigo-200/50 dark:shadow-indigo-950/50">
            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-indigo-100 border border-white/20">
                <Sparkles className="h-4 w-4 text-amber-300" /> Sleek Academic Platform
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                StudySync Academic & Collaborative Learning
              </h1>

              <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed font-normal">
                Enterprise academic management with role-based access for Administrators, Faculty, and Students. Streamlined attendance telemetry, assignment grading, study planners, and broadcast announcements.
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="px-6 py-3 rounded-2xl bg-white text-indigo-900 font-bold text-xs sm:text-sm shadow-md hover:bg-indigo-50 transition-all flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Lock className="h-4 w-4 text-indigo-600" /> Sign In / Login
                </button>
                <button
                  onClick={() => setIsStudentRegOpen(true)}
                  className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all flex items-center gap-2 backdrop-blur-md hover:-translate-y-0.5 active:translate-y-0"
                >
                  <GraduationCap className="h-4 w-4" /> Register Student
                </button>
                <button
                  onClick={() => setIsFacultyRegOpen(true)}
                  className="px-6 py-3 rounded-2xl bg-purple-500/20 hover:bg-purple-500/30 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all flex items-center gap-2 backdrop-blur-md hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Users className="h-4 w-4" /> Register Faculty
                </button>
              </div>
            </div>

            {/* Decorative soft glow */}
            <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          </div>

          {/* Role Access Portals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Student Card */}
            <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Student Portal</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Track course attendance percentage, submit homework via Google Drive, manage daily study planner tasks, and download faculty notes.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => setIsStudentRegOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
                >
                  Create Student Account
                </button>
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Student Sign In
                </button>
              </div>
            </div>

            {/* Faculty Card */}
            <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Faculty Portal</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Mark section-wise attendance, issue subject assignments, grade submitted student solutions, and schedule live broadcast sessions.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => setIsFacultyRegOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
                >
                  Create Faculty Account
                </button>
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Faculty Sign In
                </button>
              </div>
            </div>

            {/* Administrator Card */}
            <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">System Administrator</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Configure college departments, class sections per academic year, approve faculty & student user registrations, and export analytics.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs"
                >
                  Admin Portal Login
                </button>
              </div>
            </div>

          </div>

        </div>
      );
    }

    // Role = Administrator
    if (currentUser.role === 'Administrator') {
      switch (activeTab) {
        case 'ManageUsers': return <ManageUsers />;
        case 'Reports': return <AdminReports />;
        case 'Settings': return <AdminSettings />;
        case 'Profile': return <UserProfile />;
        case 'Dashboard':
        case 'Home':
        default:
          return <AdminDashboard setActiveTab={setActiveTab} />;
      }
    }

    // Role = Faculty
    if (currentUser.role === 'Faculty') {
      switch (activeTab) {
        case 'Attendance':
          return (
            <MarkAttendance
              selectedYear={facultyYear}
              setSelectedYear={setFacultyYear}
              selectedSection={facultySection}
              setSelectedSection={setFacultySection}
            />
          );
        case 'Assignments':
          return (
            <ManageAssignments
              selectedYear={facultyYear}
              setSelectedYear={setFacultyYear}
              selectedSection={facultySection}
              setSelectedSection={setFacultySection}
            />
          );
        case 'Notes':
          return (
            <UploadNotes
              selectedYear={facultyYear}
              setSelectedYear={setFacultyYear}
              selectedSection={facultySection}
              setSelectedSection={setFacultySection}
            />
          );
        case 'Sessions':
          return (
            <FacultySessionsAnnouncements
              selectedYear={facultyYear}
              setSelectedYear={setFacultyYear}
              selectedSection={facultySection}
              setSelectedSection={setFacultySection}
            />
          );
        case 'Profile':
          return <UserProfile />;
        case 'Home':
        default:
          return (
            <FacultyDashboard
              setActiveTab={setActiveTab}
              selectedYear={facultyYear}
              setSelectedYear={setFacultyYear}
              selectedSection={facultySection}
              setSelectedSection={setFacultySection}
            />
          );
      }
    }

    // Role = Student
    if (currentUser.role === 'Student') {
      switch (activeTab) {
        case 'Attendance': return <StudentAttendanceView />;
        case 'Assignments': return <StudentAssignmentsView />;
        case 'Notes': return <StudentNotesView />;
        case 'Planner': return <StudentPlannerView />;
        case 'Profile': return <UserProfile />;
        case 'Home':
        default:
          return <StudentDashboard setActiveTab={setActiveTab} />;
      }
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-[#F8F9FF] dark:bg-[#0A0D14] text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openLoginModal={() => setIsLoginOpen(true)}
        openFacultyRegisterModal={() => setIsFacultyRegOpen(true)}
        openStudentRegisterModal={() => setIsStudentRegOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderContent()}
      </main>

      {/* Bottom Role-based Navigation Bar */}
      {currentUser && (
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      )}

      {/* Authentication Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToStudentReg={() => { setIsLoginOpen(false); setIsStudentRegOpen(true); }}
        onSwitchToFacultyReg={() => { setIsLoginOpen(false); setIsFacultyRegOpen(true); }}
      />

      <FacultyRegisterModal
        isOpen={isFacultyRegOpen}
        onClose={() => setIsFacultyRegOpen(false)}
        onSwitchToLogin={() => { setIsFacultyRegOpen(false); setIsLoginOpen(true); }}
      />

      <StudentRegisterModal
        isOpen={isStudentRegOpen}
        onClose={() => setIsStudentRegOpen(false)}
        onSwitchToLogin={() => { setIsStudentRegOpen(false); setIsLoginOpen(true); }}
      />

    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <MainLayout />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

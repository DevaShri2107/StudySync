import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';
import {
  GraduationCap,
  Sun,
  Moon,
  Bell,
  LogOut,
  Database,
  Sparkles,
  Layers
} from 'lucide-react';
import { NotificationDrawer } from './NotificationDrawer';
import { ConnectedServicesModal } from './ConnectedServicesModal';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openLoginModal: () => void;
  openFacultyRegisterModal: () => void;
  openStudentRegisterModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  openLoginModal,
  openFacultyRegisterModal,
  openStudentRegisterModal
}) => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, isDemoLoaded, seedDemoData, resetToCleanDatabase } = useData();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  // Unread count
  const unreadNotifs = currentUser
    ? notifications.filter(n => {
        if (n.recipientUserId && n.recipientUserId !== currentUser.id) return false;
        if (n.targetRole && n.targetRole !== currentUser.role) return false;
        return !n.isReadBy.includes(currentUser.id);
      }).length
    : 0;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Administrator':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Faculty':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Student':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-slate-200/80 dark:border-slate-800">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Logo & Platform Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-950/50 text-white shrink-0">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  StudySync
                </span>
                <span className="hidden sm:inline-block rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800">
                  Academic OS
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Collaborative Learning & Academic Telemetry
              </p>
            </div>
          </div>

          {/* Quick Demo Data Toggle & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Quick Demo Seed / Clean Database Controller */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={resetToCleanDatabase}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1 ${
                  !isDemoLoaded
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                }`}
                title="Strict clean initial state with Administrator only"
              >
                <Database className="h-3.5 w-3.5 text-slate-500" />
                Clean DB
              </button>
              <button
                onClick={seedDemoData}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1 ${
                  isDemoLoaded
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                }`}
                title="Populate with sample students, faculty, assignments, and notes"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Load Demo Data
              </button>
            </div>

            {/* Notifications Bell */}
            {currentUser && (
              <button
                onClick={() => setIsNotifOpen(true)}
                className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifs > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
                    {unreadNotifs}
                  </span>
                )}
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} theme`}
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5 text-amber-400" />}
            </button>

            {/* Google Workspace Connected Services Button */}
            {currentUser && (
              <button
                onClick={() => setIsServicesOpen(true)}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all border border-slate-200/80 dark:border-slate-700"
                title="Google Workspace Services (Drive, Meet, Calendar, Gmail)"
              >
                <Layers className="h-4 w-4 text-indigo-500" />
                <span>Google Services</span>
              </button>
            )}

            {/* User Profile Pill & Logout / Login */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white max-w-[120px] truncate">
                    {currentUser.fullName}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium border inline-block w-fit ml-auto ${getRoleBadge(currentUser.role)}`}>
                    {currentUser.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={openLoginModal}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all"
              >
                Sign In
              </button>
            )}

          </div>

        </div>
      </header>

      {/* Notification Drawer */}
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />

      {/* Google Workspace Connected Services Modal */}
      <ConnectedServicesModal isOpen={isServicesOpen} onClose={() => setIsServicesOpen(false)} />
    </>
  );
};

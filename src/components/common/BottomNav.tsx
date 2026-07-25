import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  GraduationCap,
  FileText,
  CalendarCheck,
  User,
  Users,
  BookOpen,
  BarChart3,
  Settings,
  Clock,
  Home
} from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  // Define tabs based on prompt role specifications
  let navItems: { id: string; label: string; icon: React.FC<{ className?: string }> }[] = [];

  if (currentUser.role === 'Student') {
    navItems = [
      { id: 'Home', label: 'Home', icon: Home },
      { id: 'Attendance', label: 'Attendance', icon: GraduationCap },
      { id: 'Assignments', label: 'Assignments', icon: FileText },
      { id: 'Planner', label: 'Planner', icon: CalendarCheck },
      { id: 'Profile', label: 'Profile', icon: User }
    ];
  } else if (currentUser.role === 'Faculty') {
    navItems = [
      { id: 'Home', label: 'Home', icon: Home },
      { id: 'Attendance', label: 'Attendance', icon: GraduationCap },
      { id: 'Assignments', label: 'Assignments', icon: FileText },
      { id: 'Notes', label: 'Notes', icon: BookOpen },
      { id: 'Profile', label: 'Profile', icon: User }
    ];
  } else if (currentUser.role === 'Administrator') {
    navItems = [
      { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'Faculty', label: 'Faculty', icon: Users },
      { id: 'Students', label: 'Students', icon: GraduationCap },
      { id: 'Reports', label: 'Reports', icon: BarChart3 },
      { id: 'Settings', label: 'Settings', icon: Settings }
    ];
  }

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-lg px-3 py-2 rounded-3xl shadow-xl shadow-indigo-500/5 dark:shadow-slate-950/80 max-w-md w-[calc(100%-2rem)]">
      <div className="flex items-center justify-around">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 font-bold shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              <span className={`text-xs ${isActive ? 'inline-block' : 'hidden sm:inline-block'}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

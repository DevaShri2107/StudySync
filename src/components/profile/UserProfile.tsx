import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { StudentUser, FacultyUser } from '../../types';
import { User, Shield, Mail, Lock, Moon, Sun, LogOut, Check, Building, GraduationCap, Award, Eye, EyeOff } from 'lucide-react';

export const UserProfile: React.FC = () => {
  const { currentUser, logout, resetUserPassword } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [msg, setMsg] = useState({ text: '', error: false });

  if (!currentUser) return null;

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;

    const res = resetUserPassword(currentUser.id, newPassword);
    if (res.success) {
      setMsg({ text: 'Password updated successfully!', error: false });
      setOldPassword('');
      setNewPassword('');
    } else {
      setMsg({ text: res.error || 'Password update failed.', error: true });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Administrator': return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200';
      case 'Faculty': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200';
      default: return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200';
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      
      {/* Profile Card Header */}
      <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-md shrink-0">
          {currentUser.fullName.charAt(0)}
        </div>

        <div className="space-y-1 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {currentUser.fullName}
            </h1>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getRoleBadgeColor(currentUser.role)}`}>
              {currentUser.role}
            </span>
          </div>

          <p className="text-xs text-slate-500 font-mono flex items-center justify-center sm:justify-start gap-1">
            <Mail className="h-3.5 w-3.5 text-slate-400" /> {currentUser.email}
          </p>

          {currentUser.role === 'Student' && (
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
              Reg No: {(currentUser as StudentUser).registerNumber} • {(currentUser as StudentUser).department} ({(currentUser as StudentUser).year} {(currentUser as StudentUser).section})
            </p>
          )}

          {currentUser.role === 'Faculty' && (
            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
              Employee ID: {(currentUser as FacultyUser).employeeId} • Department: {(currentUser as FacultyUser).department}
            </p>
          )}
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400 text-xs font-semibold hover:bg-red-100 transition-colors flex items-center gap-1.5 shrink-0"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>

      {/* Account Details & Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Security & Password Change */}
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="h-5 w-5 text-indigo-600" /> Password & Security
          </h2>

          {msg.text && (
            <div className={`p-3 rounded-2xl text-xs font-semibold ${
              msg.error ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handlePasswordReset} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
              <div className="relative">
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  required
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pr-10 pl-3 py-2 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title={showOldPassword ? 'Hide password' : 'Show password'}
                >
                  {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">New Password (e.g. Pass@123)</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pr-10 pl-3 py-2 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
            >
              Update Password
            </button>
          </form>
        </div>

        {/* System Preferences */}
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" /> Platform Preferences
          </h2>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Appearance Theme</p>
              <p className="text-[11px] text-slate-500">Toggle between Light and Dark Material 3 theme</p>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 flex items-center gap-2 text-xs font-semibold"
            >
              {theme === 'dark' ? <Moon className="h-4 w-4 text-indigo-400" /> : <Sun className="h-4 w-4 text-amber-500" />}
              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
            <p className="font-bold">🔐 Security Lock</p>
            <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
              Your account is locked to the official domain <span className="font-mono font-bold">@studysync.com</span> with role-based access rules.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};

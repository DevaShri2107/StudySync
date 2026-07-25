import React from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Bell, X, CheckCheck, FileText, Calendar, Megaphone, GraduationCap } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useData();
  const { currentUser } = useAuth();

  if (!isOpen || !currentUser) return null;

  // Filter notifications relevant for user
  const userNotifs = notifications.filter(n => {
    if (n.recipientUserId && n.recipientUserId !== currentUser.id) return false;
    if (n.targetRole && n.targetRole !== currentUser.role) return false;

    if (currentUser.role === 'Student') {
      const std = currentUser;
      if (n.department && n.department !== std.department) return false;
      if (n.year && n.year !== std.year) return false;
      if (n.section && n.section !== std.section) return false;
    } else if (currentUser.role === 'Faculty') {
      const fac = currentUser;
      if (n.department && n.department !== fac.department) return false;
    }
    return true;
  });

  const unreadCount = userNotifs.filter(n => !n.isReadBy.includes(currentUser.id)).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Assignment': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'Attendance': return <GraduationCap className="h-4 w-4 text-emerald-500" />;
      case 'Announcement': return <Megaphone className="h-4 w-4 text-purple-500" />;
      case 'Study Session': return <Calendar className="h-4 w-4 text-amber-500" />;
      default: return <Bell className="h-4 w-4 text-indigo-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l dark:border-slate-800 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="font-semibold text-slate-900 dark:text-white">Notifications Center</h2>
            {unreadCount > 0 && (
              <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {unreadCount} new
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action bar */}
        {userNotifs.length > 0 && (
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-500 dark:text-slate-400">Total {userNotifs.length} notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllNotificationsRead(currentUser.id)}
                className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>
        )}

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {userNotifs.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">No notifications yet</p>
              <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
                Updates regarding assignments, attendance, and announcements will appear here.
              </p>
            </div>
          ) : (
            userNotifs.map(n => {
              const isRead = n.isReadBy.includes(currentUser.id);
              return (
                <div
                  key={n.id}
                  onClick={() => markNotificationRead(n.id, currentUser.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isRead
                      ? 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 opacity-75'
                      : 'bg-indigo-50/30 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/50 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-xs">
                      {getTypeIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {n.title}
                        </span>
                        {!isRead && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {n.message}
                      </p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 block">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};

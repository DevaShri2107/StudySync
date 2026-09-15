import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getIntegrationStatus, saveIntegrationStatus, GoogleIntegrationStatus } from '../../lib/googleAuthService';
import {
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  HardDrive,
  Calendar,
  Video,
  Mail,
  RefreshCw,
  Check,
  Globe
} from 'lucide-react';

interface ConnectedServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectedServicesModal: React.FC<ConnectedServicesModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();

  if (!isOpen || !currentUser) return null;

  const [status, setStatus] = useState<GoogleIntegrationStatus>(() =>
    getIntegrationStatus(currentUser.id, currentUser.email)
  );
  const [connectingService, setConnectingService] = useState<string | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const toggleService = (key: 'driveConnected' | 'calendarConnected' | 'gmailConnected' | 'meetConnected', name: string) => {
    setConnectingService(key);
    setTimeout(() => {
      const updated = {
        ...status,
        [key]: !status[key]
      };
      setStatus(updated);
      saveIntegrationStatus(updated);
      setConnectingService(null);
      setNotificationMsg(`${name} ${updated[key] ? 'successfully connected' : 'disconnected'}.`);
      setTimeout(() => setNotificationMsg(null), 3500);
    }, 600);
  };

  const services = [
    {
      id: 'driveConnected',
      name: 'Google Drive',
      description: 'Used to store, preview, and download academic lecture notes, assignment attachments, and student homework submissions securely in dedicated class folders.',
      icon: HardDrive,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800',
      connected: status.driveConnected,
      scopes: ['https://www.googleapis.com/auth/drive.file']
    },
    {
      id: 'calendarConnected',
      name: 'Google Calendar',
      description: 'Automatically creates calendar events and timely reminders for upcoming faculty study sessions, exams, and student daily planner deadlines.',
      icon: Calendar,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800',
      connected: status.calendarConnected,
      scopes: ['https://www.googleapis.com/auth/calendar.events']
    },
    {
      id: 'meetConnected',
      name: 'Google Meet',
      description: 'Generates secure Google Meet conference room links for faculty-scheduled interactive review sessions and real-time student Q&A classes.',
      icon: Video,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800',
      connected: status.meetConnected,
      scopes: ['Google Meet Workspace API']
    },
    {
      id: 'gmailConnected',
      name: 'Gmail Notifications',
      description: 'Dispatches critical academic bulletins, low-attendance warnings (<60% & 60-75%), and assignment grading announcements to official student @gmail.com accounts.',
      icon: Mail,
      color: 'text-red-500 bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800',
      connected: status.gmailConnected,
      scopes: ['https://www.googleapis.com/auth/gmail.send']
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 my-8">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900">
            <Globe className="h-6 w-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800 mb-1">
              <Shield className="h-3 w-3" /> Minimum Required Scopes Principle
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Google Workspace Connected Services
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Connected Google Account: <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{currentUser.email}</span>
            </p>
          </div>
        </div>

        {notificationMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{notificationMsg}</span>
          </div>
        )}

        {/* Services List */}
        <div className="space-y-3.5">
          {services.map(s => {
            const Icon = s.icon;
            const isToggling = connectingService === s.id;
            return (
              <div
                key={s.id}
                className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-indigo-200 dark:hover:border-indigo-900/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 flex-1">
                  <div className={`p-2.5 rounded-xl border shrink-0 ${s.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {s.name}
                      </h4>
                      {s.connected ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <Check className="h-3 w-3" /> Connected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          Not Connected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {s.description}
                    </p>
                    <div className="pt-0.5">
                      <span className="text-[10px] text-slate-400 font-mono">
                        Scope: {s.scopes.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 sm:self-center">
                  <button
                    onClick={() => toggleService(s.id as any, s.name)}
                    disabled={isToggling}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                      s.connected
                        ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {isToggling && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                    {!isToggling && (s.connected ? 'Disconnect' : 'Connect')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security Disclosures */}
        <div className="mt-6 p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" /> Google OAuth Security Guarantee
          </p>
          <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-400">
            StudySync adheres strictly to Google's principle of least privilege. We never ask for, view, or store your Google Account password or client secrets. All operations are isolated to dedicated StudySync files, events, and virtual meeting rooms.
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
          >
            Close Settings
          </button>
        </div>

      </div>
    </div>
  );
};

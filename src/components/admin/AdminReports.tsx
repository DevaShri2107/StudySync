import React from 'react';
import { useData } from '../../context/DataContext';
import { BarChart3, FileSpreadsheet, Download, CheckCircle2, TrendingUp, Layers, Users } from 'lucide-react';

export const AdminReports: React.FC = () => {
  const { reports, attendanceSessions, assignments, departments } = useData();

  const handleDownloadReport = (title: string) => {
    alert(`Downloading report "${title}" in PDF/Excel format...`);
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-indigo-600" /> Executive Academic Reports & Telemetry
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Detailed analytics on overall attendance performance, assignment compliance, and department engagement metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reports.map(rep => (
          <div key={rep.id} className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
            <div>
              <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 w-fit mb-3">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug">
                {rep.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                {rep.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono">
                Updated {new Date(rep.generatedAt).toLocaleDateString()}
              </span>
              <button
                onClick={() => handleDownloadReport(rep.title)}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Download className="h-3.5 w-3.5" /> Export PDF
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Attendance Metrics Table */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-600" /> Attendance Telemetry Breakdown
        </h2>

        {attendanceSessions.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
            <p className="text-xs text-slate-500">No attendance sessions recorded in the database yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Department & Batch</th>
                  <th className="px-4 py-3">Faculty</th>
                  <th className="px-4 py-3 text-right">Attendance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {attendanceSessions.map(att => {
                  const rate = att.totalStudents > 0 ? Math.round((att.presentCount / att.totalStudents) * 100) : 0;
                  return (
                    <tr key={att.id}>
                      <td className="px-4 py-3 font-mono text-slate-900 dark:text-white">{att.date}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{att.subject}</td>
                      <td className="px-4 py-3">{att.department} ({att.year} {att.section})</td>
                      <td className="px-4 py-3">{att.facultyName}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                          rate >= 75 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-red-100 text-red-800'
                        }`}>
                          {rate}% ({att.presentCount}/{att.totalStudents})
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

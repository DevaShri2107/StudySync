import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  Users,
  GraduationCap,
  Trash2,
  KeyRound,
  Search,
  Filter,
  Plus,
  X,
  AlertTriangle,
  Check,
  Building,
  Calendar,
  Layers,
  BookOpen
} from 'lucide-react';
import { FacultyUser, StudentUser, User } from '../../types';

interface ManageUsersProps {
  initialRoleTab?: 'Faculty' | 'Students';
}

export const ManageUsers: React.FC<ManageUsersProps> = ({ initialRoleTab = 'Faculty' }) => {
  const { users, deleteUser, resetUserPassword } = useAuth();
  const { departments, years, sections } = useData();

  const [roleTab, setRoleTab] = useState<'Faculty' | 'Students'>(initialRoleTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('All');

  // Reset Password Modal state
  const [selectedUserForReset, setSelectedUserForReset] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetStatus, setResetStatus] = useState<{ success?: boolean; message?: string }>({});

  // Class assignment state
  const [selectedFacultyForClass, setSelectedFacultyForClass] = useState<FacultyUser | null>(null);
  const [assignedClasses, setAssignedClasses] = useState<Record<string, { year: string; section: string; subject: string }[]>>({});
  const [newClassForm, setNewClassForm] = useState({ year: years[0]?.name || 'I Year', section: 'Section A', subject: 'Computer Networks' });

  const facultyList = users.filter(u => u.role === 'Faculty') as FacultyUser[];
  const studentList = users.filter(u => u.role === 'Student') as StudentUser[];

  const currentList = roleTab === 'Faculty' ? facultyList : studentList;

  const filteredUsers = currentList.filter(u => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.role === 'Faculty' && (u as FacultyUser).employeeId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.role === 'Student' && (u as StudentUser).registerNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDept = filterDept === 'All' || u.department === filterDept;

    return matchesSearch && matchesDept;
  });

  const handleDelete = (user: User) => {
    if (confirm(`Are you sure you want to delete ${user.fullName} (${user.email})?`)) {
      const res = deleteUser(user.id);
      if (!res.success) {
        alert(res.error);
      }
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForReset) return;

    const res = resetUserPassword(selectedUserForReset.id, newPassword);
    if (!res.success) {
      setResetStatus({ success: false, message: res.error });
    } else {
      setResetStatus({ success: true, message: `Password for ${selectedUserForReset.fullName} successfully updated!` });
      setTimeout(() => {
        setSelectedUserForReset(null);
        setNewPassword('');
        setResetStatus({});
      }, 1500);
    }
  };

  const handleAddClassMapping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFacultyForClass) return;

    const facId = selectedFacultyForClass.id;
    const existing = assignedClasses[facId] || [];
    setAssignedClasses({
      ...assignedClasses,
      [facId]: [...existing, { ...newClassForm }]
    });
    alert(`Assigned ${newClassForm.subject} (${newClassForm.year} - ${newClassForm.section}) to ${selectedFacultyForClass.fullName}`);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-600" /> User Directory & Account Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage faculty profiles, student registrations, reset passwords, and assign classes.
          </p>
        </div>

        {/* Role Sub-tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setRoleTab('Faculty')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
              roleTab === 'Faculty'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Users className="h-4 w-4" /> Faculty ({facultyList.length})
          </button>
          <button
            onClick={() => setRoleTab('Students')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
              roleTab === 'Students'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="h-4 w-4" /> Students ({studentList.length})
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${roleTab.toLowerCase()} by name, email, ID...`}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="All">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.name}>{d.code}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No {roleTab.toLowerCase()} found</p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting search filters or register new users.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Full Name & ID</th>
                  <th className="px-4 py-3">Email Address</th>
                  <th className="px-4 py-3">Department</th>
                  {roleTab === 'Students' && <th className="px-4 py-3">Year / Section</th>}
                  {roleTab === 'Faculty' && <th className="px-4 py-3">Assigned Classes</th>}
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map(user => {
                  const isFaculty = user.role === 'Faculty';
                  const facultyObj = isFaculty ? (user as FacultyUser) : null;
                  const studentObj = !isFaculty ? (user as StudentUser) : null;
                  const facClasses = facultyObj ? (assignedClasses[facultyObj.id] || []) : [];

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      
                      {/* Name & ID */}
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 dark:text-white">{user.fullName}</div>
                        <div className="text-[10px] font-mono text-slate-500">
                          {isFaculty ? `Emp ID: ${facultyObj?.employeeId}` : `Reg No: ${studentObj?.registerNumber}`}
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-300">
                        {user.email}
                      </td>

                      {/* Department */}
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                          {user.department}
                        </span>
                      </td>

                      {/* Year & Section for Student */}
                      {roleTab === 'Students' && (
                        <td className="px-4 py-3 font-medium text-emerald-600 dark:text-emerald-400">
                          {studentObj?.year} - {studentObj?.section}
                        </td>
                      )}

                      {/* Assigned Classes for Faculty */}
                      {roleTab === 'Faculty' && (
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-1">
                            {facClasses.length === 0 ? (
                              <span className="text-slate-400 italic text-[11px]">Default All Sections</span>
                            ) : (
                              facClasses.map((c, i) => (
                                <span key={i} className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-[10px] font-medium border border-indigo-200 dark:border-indigo-800">
                                  {c.subject} ({c.year} {c.section})
                                </span>
                              ))
                            )}
                            <button
                              onClick={() => setSelectedFacultyForClass(facultyObj)}
                              className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] hover:bg-indigo-50 hover:text-indigo-600 font-bold"
                              title="Assign Class"
                            >
                              + Assign
                            </button>
                          </div>
                        </td>
                      )}

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedUserForReset(user)}
                            className="p-1.5 rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 hover:bg-amber-100 transition-colors"
                            title="Reset Password"
                          >
                            <KeyRound className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            className="p-1.5 rounded-xl bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400 hover:bg-red-100 transition-colors"
                            title="Delete User Account"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reset Password Modal */}
      {selectedUserForReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setSelectedUserForReset(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-amber-500" /> Reset User Password
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Set a new password for <span className="font-semibold text-slate-900 dark:text-white">{selectedUserForReset.fullName}</span> ({selectedUserForReset.email}).
            </p>

            {resetStatus.message && (
              <div className={`mt-3 p-3 rounded-xl text-xs flex items-center gap-2 ${
                resetStatus.success
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {resetStatus.message}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="e.g. NewPass@2026"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForReset(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs"
                >
                  Confirm Password Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Class Modal for Faculty */}
      {selectedFacultyForClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setSelectedFacultyForClass(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-600" /> Assign Class to Faculty
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Assign specific Year, Section, and Subject to <span className="font-semibold">{selectedFacultyForClass.fullName}</span>.
            </p>

            <form onSubmit={handleAddClassMapping} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems"
                  value={newClassForm.subject}
                  onChange={e => setNewClassForm({ ...newClassForm, subject: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Year</label>
                  <select
                    value={newClassForm.year}
                    onChange={e => setNewClassForm({ ...newClassForm, year: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
                  >
                    {years.map(y => (
                      <option key={y.id} value={y.name}>{y.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Section</label>
                  <select
                    value={newClassForm.section}
                    onChange={e => setNewClassForm({ ...newClassForm, section: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="Section A">Section A</option>
                    <option value="Section B">Section B</option>
                    <option value="Section C">Section C</option>
                    <option value="Section D">Section D</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedFacultyForClass(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
                >
                  Save Class Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

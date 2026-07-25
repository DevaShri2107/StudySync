import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  Settings,
  Building,
  Calendar,
  Layers,
  Plus,
  Trash2,
  Edit2,
  ShieldAlert,
  Database,
  Check,
  X,
  Lock,
  Mail
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const {
    departments,
    years,
    sections,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    addYear,
    deleteYear,
    addSection,
    deleteSection,
    seedDemoData,
    resetToCleanDatabase
  } = useData();

  const { currentUser } = useAuth();

  // Dept modal form
  const [deptForm, setDeptForm] = useState({ name: '', code: '' });
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);

  // Year form
  const [newYearName, setNewYearName] = useState('');

  // Section form
  const [sectionForm, setSectionForm] = useState({
    name: '',
    departmentId: '',
    yearId: ''
  });

  const handleSaveDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.name || !deptForm.code) return;

    if (editingDeptId) {
      updateDepartment(editingDeptId, deptForm.name, deptForm.code);
      setEditingDeptId(null);
    } else {
      addDepartment(deptForm.name, deptForm.code);
    }
    setDeptForm({ name: '', code: '' });
  };

  const handleSaveYear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYearName.trim()) return;
    addYear(newYearName);
    setNewYearName('');
  };

  const handleSaveSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionForm.name.trim()) return;
    const targetDeptId = sectionForm.departmentId || departments[0]?.id;
    const targetYearId = sectionForm.yearId || years[0]?.id;
    if (!targetDeptId || !targetYearId) return;

    addSection(sectionForm.name, targetDeptId, targetYearId);
    setSectionForm({ ...sectionForm, name: '' });
  };

  // Helper to match sections under department & year
  const getSectionsForDeptAndYear = (deptId: string, deptCode: string, deptName: string, yearId: string, yearName: string) => {
    return sections.filter(s => {
      const matchesDept = s.departmentId === deptId || s.departmentId === deptCode || s.departmentId === deptName;
      const matchesYear = s.yearId === yearId || s.yearId === yearName;
      return matchesDept && matchesYear;
    });
  };

  // Find sections not matching any department/year
  const assignedSectionIds = new Set<string>();
  departments.forEach(d => {
    years.forEach(y => {
      getSectionsForDeptAndYear(d.id, d.code, d.name, y.id, y.name).forEach(s => assignedSectionIds.add(s.id));
    });
  });
  const unassignedSections = sections.filter(s => !assignedSectionIds.has(s.id));

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="h-6 w-6 text-indigo-600" /> Academic Master Configuration
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure departments, academic years, sections, domain authentication locks, and system databases.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Departments Manager */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <h2 className="font-bold text-slate-900 dark:text-white text-base mb-3 flex items-center gap-2">
            <Building className="h-5 w-5 text-indigo-600" /> Departments ({departments.length})
          </h2>

          <form onSubmit={handleSaveDepartment} className="mb-4 space-y-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
            <input
              type="text"
              required
              placeholder="Department Name (e.g. Mechanical)"
              value={deptForm.name}
              onChange={e => setDeptForm({ ...deptForm, name: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs"
            />
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Code (e.g. ME)"
                value={deptForm.code}
                onChange={e => setDeptForm({ ...deptForm, code: e.target.value })}
                className="w-1/2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-mono"
              />
              <button
                type="submit"
                className="w-1/2 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
              >
                {editingDeptId ? 'Update' : '+ Add Dept'}
              </button>
            </div>
          </form>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {departments.map(d => (
              <div key={d.id} className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{d.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">Code: {d.code}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingDeptId(d.id);
                      setDeptForm({ name: d.name, code: d.code });
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => deleteDepartment(d.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Academic Years Manager */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <h2 className="font-bold text-slate-900 dark:text-white text-base mb-3 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" /> Academic Years ({years.length})
          </h2>

          <form onSubmit={handleSaveYear} className="mb-4 flex gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
            <input
              type="text"
              required
              placeholder="e.g. V Year"
              value={newYearName}
              onChange={e => setNewYearName(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shrink-0"
            >
              + Add Year
            </button>
          </form>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {years.map(y => (
              <div key={y.id} className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">{y.name}</span>
                <button
                  onClick={() => deleteYear(y.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Sections Manager Organized by Department & Year */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-4 dark:border-slate-800">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
              <Layers className="h-5 w-5 text-amber-600" /> Class Sections Configuration ({sections.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Sections are organized hierarchically under each Department and Academic Year.
            </p>
          </div>
        </div>

        {/* Form to Add New Section */}
        <form onSubmit={handleSaveSection} className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            + Add New Section
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Select Department</label>
              <select
                value={sectionForm.departmentId || departments[0]?.id || ''}
                onChange={e => setSectionForm({ ...sectionForm, departmentId: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Select Academic Year</label>
              <select
                value={sectionForm.yearId || years[0]?.id || ''}
                onChange={e => setSectionForm({ ...sectionForm, yearId: e.target.value })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
              >
                {years.map(y => (
                  <option key={y.id} value={y.id}>
                    {y.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Section Name</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="e.g. Section E"
                  value={sectionForm.name}
                  onChange={e => setSectionForm({ ...sectionForm, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs shrink-0 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Organized Hierarchy View */}
        <div className="space-y-6">
          {departments.map(d => (
            <div key={d.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-xs">
              <div className="px-5 py-3.5 bg-slate-100/70 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Building className="h-4 w-4 text-indigo-600" />
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{d.name}</span>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-mono font-bold">
                    {d.code}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {years.map(y => {
                  const matching = getSectionsForDeptAndYear(d.id, d.code, d.name, y.id, y.name);
                  return (
                    <div key={y.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-blue-500" />
                          {y.name}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">
                          {matching.length} {matching.length === 1 ? 'Section' : 'Sections'}
                        </span>
                      </div>

                      {matching.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic">No sections configured for {y.name} in {d.code}.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {matching.map(s => (
                            <div
                              key={s.id}
                              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center gap-2 group hover:border-amber-400 transition-colors"
                            >
                              <span className="text-xs font-semibold text-slate-900 dark:text-white">{s.name}</span>
                              <button
                                onClick={() => deleteSection(s.id)}
                                className="text-slate-300 hover:text-red-600 transition-colors"
                                title={`Delete ${s.name}`}
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {unassignedSections.length > 0 && (
            <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/30 p-4">
              <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-2">Unassigned / General Sections</h4>
              <div className="flex flex-wrap gap-2">
                {unassignedSections.map(s => (
                  <div key={s.id} className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 text-xs font-semibold flex items-center gap-2">
                    <span>{s.name}</span>
                    <button onClick={() => deleteSection(s.id)} className="text-slate-400 hover:text-red-600">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Domain Lock & System Security Info */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Lock className="h-5 w-5 text-indigo-600" /> Authentication Domain Lock Rule
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Per strict security guidelines, all user registrations (Faculty & Student) must strictly end with <span className="font-mono font-bold text-indigo-600">@studysync.com</span>. Any external email providers (e.g., gmail.com) are automatically rejected during sign up.
          </p>
          <div className="mt-3 p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-xs font-mono text-indigo-700 dark:text-indigo-300">
            ✅ Domain Restriction: @studysync.com (ACTIVE)
          </div>
        </div>

        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Database className="h-5 w-5 text-purple-600" /> Database Seed State Control
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Switch between clean production default (containing only Default Administrator) and pre-filled demo dataset for evaluation.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={resetToCleanDatabase}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-semibold"
            >
              Reset to Clean DB
            </button>
            <button
              onClick={seedDemoData}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
            >
              Load Full Demo Data
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

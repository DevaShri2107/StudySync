import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Department,
  Year,
  Section,
  AttendanceSession,
  Assignment,
  AssignmentSubmission,
  StudentAssignmentProgress,
  NoteItem,
  StudySession,
  Announcement,
  AppNotification,
  StudyPlannerTask,
  SystemReport,
  StudentUser
} from '../types';
import {
  DEFAULT_DEPARTMENTS,
  DEFAULT_YEARS,
  DEFAULT_SECTIONS,
  DEMO_ASSIGNMENTS,
  DEMO_ATTENDANCE,
  DEMO_NOTES,
  DEMO_SESSIONS,
  DEMO_ANNOUNCEMENTS,
  DEMO_NOTIFICATIONS,
  DEMO_PLANNER
} from '../data/initialData';

interface DataContextType {
  departments: Department[];
  years: Year[];
  sections: Section[];
  attendanceSessions: AttendanceSession[];
  assignments: Assignment[];
  assignmentSubmissions: AssignmentSubmission[];
  studentProgressList: StudentAssignmentProgress[];
  notes: NoteItem[];
  studySessions: StudySession[];
  announcements: Announcement[];
  notifications: AppNotification[];
  plannerTasks: StudyPlannerTask[];
  reports: SystemReport[];
  isDemoLoaded: boolean;

  // Department actions
  addDepartment: (name: string, code: string) => void;
  updateDepartment: (id: string, name: string, code: string) => void;
  deleteDepartment: (id: string) => void;

  // Year actions
  addYear: (name: string) => void;
  deleteYear: (id: string) => void;

  // Section actions
  addSection: (name: string, departmentId: string, yearId: string) => void;
  deleteSection: (id: string) => void;

  // Attendance
  saveAttendanceSession: (sessionData: Omit<AttendanceSession, 'id' | 'createdAt'>) => void;
  getStudentAttendanceStats: (studentId: string, department: string, year: string, section: string) => {
    overallPercentage: number;
    totalClasses: number;
    attendedClasses: number;
    subjectWise: { subject: string; attended: number; total: number; percentage: number }[];
  };

  // Assignments & Submissions
  createAssignment: (asg: Omit<Assignment, 'id' | 'createdAt'>) => void;
  updateAssignment: (id: string, asg: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  toggleStudentAssignmentStatus: (assignmentId: string, studentId: string) => void;
  submitAssignment: (sub: Omit<AssignmentSubmission, 'id' | 'submittedAt' | 'status'>) => void;
  gradeSubmission: (submissionId: string, grade: string, feedback: string) => void;

  // Notes
  uploadNote: (note: Omit<NoteItem, 'id' | 'uploadedAt' | 'bookmarkedBy'>) => void;
  deleteNote: (id: string) => void;
  toggleNoteBookmark: (noteId: string, studentId: string) => void;

  // Study Sessions & Attendance Sync
  createStudySession: (session: Omit<StudySession, 'id' | 'createdAt'>) => void;
  deleteStudySession: (id: string) => void;
  joinStudySessionAndMarkAttendance: (sessionId: string, student: StudentUser) => void;

  // Announcements
  createAnnouncement: (anc: Omit<Announcement, 'id' | 'postedAt'>) => void;
  deleteAnnouncement: (id: string) => void;

  // Notifications
  markNotificationRead: (notificationId: string, userId: string) => void;
  markAllNotificationsRead: (userId: string) => void;

  // Planner
  addPlannerTask: (task: Omit<StudyPlannerTask, 'id' | 'createdAt'>) => void;
  updatePlannerTask: (id: string, task: Partial<StudyPlannerTask>) => void;
  deletePlannerTask: (id: string) => void;
  togglePlannerTask: (id: string) => void;

  // Database Seed / Reset
  seedDemoData: () => void;
  resetToCleanDatabase: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  DEPARTMENTS: 'studysync_departments_v1',
  YEARS: 'studysync_years_v1',
  SECTIONS: 'studysync_sections_v1',
  ATTENDANCE: 'studysync_attendance_v1',
  ASSIGNMENTS: 'studysync_assignments_v1',
  PROGRESS: 'studysync_progress_v1',
  NOTES: 'studysync_notes_v1',
  SESSIONS: 'studysync_sessions_v1',
  ANNOUNCEMENTS: 'studysync_announcements_v1',
  NOTIFICATIONS: 'studysync_notifications_v1',
  PLANNER: 'studysync_planner_v1',
  DEMO_FLAG: 'studysync_demo_loaded_v1'
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [departments, setDepartments] = useState<Department[]>(() => {
    const s = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
    return s ? JSON.parse(s) : DEFAULT_DEPARTMENTS;
  });

  const [years, setYears] = useState<Year[]>(() => {
    const s = localStorage.getItem(STORAGE_KEYS.YEARS);
    return s ? JSON.parse(s) : DEFAULT_YEARS;
  });

  const [sections, setSections] = useState<Section[]>(() => {
    const s = localStorage.getItem(STORAGE_KEYS.SECTIONS);
    return s ? JSON.parse(s) : DEFAULT_SECTIONS;
  });

  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>(() => {
    const s = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    return s ? JSON.parse(s) : [];
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const s = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
    return s ? JSON.parse(s) : [];
  });

  const [assignmentSubmissions, setAssignmentSubmissions] = useState<AssignmentSubmission[]>(() => {
    const s = localStorage.getItem('studysync_submissions_v1');
    return s ? JSON.parse(s) : [];
  });

  const [studentProgressList, setStudentProgressList] = useState<StudentAssignmentProgress[]>(() => {
    const s = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    return s ? JSON.parse(s) : [];
  });

  const [notes, setNotes] = useState<NoteItem[]>(() => {
    const s = localStorage.getItem(STORAGE_KEYS.NOTES);
    return s ? JSON.parse(s) : [];
  });

  const [studySessions, setStudySessions] = useState<StudySession[]>(() => {
    const s = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return s ? JSON.parse(s) : [];
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const s = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
    return s ? JSON.parse(s) : [];
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const s = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return s ? JSON.parse(s) : [];
  });

  const [plannerTasks, setPlannerTasks] = useState<StudyPlannerTask[]>(() => {
    const s = localStorage.getItem(STORAGE_KEYS.PLANNER);
    return s ? JSON.parse(s) : [];
  });

  const [isDemoLoaded, setIsDemoLoaded] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.DEMO_FLAG) === 'true';
  });

  // Local storage & Firestore synchronization
  useEffect(() => {
    const unsubs = [
      onSnapshot(collection(db, 'departments'), s => {
        if (!s.empty) setDepartments(s.docs.map(d => ({ id: d.id, ...d.data() } as Department)));
      }, err => console.warn('Firestore dept err:', err)),
      onSnapshot(collection(db, 'years'), s => {
        if (!s.empty) setYears(s.docs.map(d => ({ id: d.id, ...d.data() } as Year)));
      }, err => console.warn('Firestore year err:', err)),
      onSnapshot(collection(db, 'sections'), s => {
        if (!s.empty) setSections(s.docs.map(d => ({ id: d.id, ...d.data() } as Section)));
      }, err => console.warn('Firestore sec err:', err)),
      onSnapshot(collection(db, 'attendance_sessions'), s => {
        if (!s.empty) setAttendanceSessions(s.docs.map(d => ({ id: d.id, ...d.data() } as AttendanceSession)));
      }, err => console.warn('Firestore att err:', err)),
      onSnapshot(collection(db, 'assignments'), s => {
        if (!s.empty) setAssignments(s.docs.map(d => ({ id: d.id, ...d.data() } as Assignment)));
      }, err => console.warn('Firestore asg err:', err)),
      onSnapshot(collection(db, 'assignment_submissions'), s => {
        if (!s.empty) setAssignmentSubmissions(s.docs.map(d => ({ id: d.id, ...d.data() } as AssignmentSubmission)));
      }, err => console.warn('Firestore sub err:', err)),
      onSnapshot(collection(db, 'notes'), s => {
        if (!s.empty) setNotes(s.docs.map(d => ({ id: d.id, ...d.data() } as NoteItem)));
      }, err => console.warn('Firestore note err:', err)),
      onSnapshot(collection(db, 'study_sessions'), s => {
        if (!s.empty) setStudySessions(s.docs.map(d => ({ id: d.id, ...d.data() } as StudySession)));
      }, err => console.warn('Firestore session err:', err)),
      onSnapshot(collection(db, 'announcements'), s => {
        if (!s.empty) setAnnouncements(s.docs.map(d => ({ id: d.id, ...d.data() } as Announcement)));
      }, err => console.warn('Firestore anc err:', err)),
      onSnapshot(collection(db, 'planner_tasks'), s => {
        if (!s.empty) setPlannerTasks(s.docs.map(d => ({ id: d.id, ...d.data() } as StudyPlannerTask)));
      }, err => console.warn('Firestore plan err:', err))
    ];
    return () => unsubs.forEach(unsub => unsub());
  }, []);

  useEffect(() => { localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(departments)); }, [departments]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.YEARS, JSON.stringify(years)); }, [years]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SECTIONS, JSON.stringify(sections)); }, [sections]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceSessions)); }, [attendanceSessions]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments)); }, [assignments]);
  useEffect(() => { localStorage.setItem('studysync_submissions_v1', JSON.stringify(assignmentSubmissions)); }, [assignmentSubmissions]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(studentProgressList)); }, [studentProgressList]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(studySessions)); }, [studySessions]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements)); }, [announcements]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PLANNER, JSON.stringify(plannerTasks)); }, [plannerTasks]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.DEMO_FLAG, String(isDemoLoaded)); }, [isDemoLoaded]);

  // Department handlers
  const addDepartment = (name: string, code: string) => {
    const newDept: Department = {
      id: `dept_${Date.now()}`,
      name: name.trim(),
      code: code.trim().toUpperCase()
    };
    setDepartments(prev => [...prev, newDept]);
    setDoc(doc(db, 'departments', newDept.id), newDept).catch(() => {});
  };

  const updateDepartment = (id: string, name: string, code: string) => {
    const updated = { name: name.trim(), code: code.trim().toUpperCase() };
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, ...updated } : d));
    setDoc(doc(db, 'departments', id), updated, { merge: true }).catch(() => {});
  };

  const deleteDepartment = (id: string) => {
    setDepartments(prev => prev.filter(d => d.id !== id));
    deleteDoc(doc(db, 'departments', id)).catch(() => {});
  };

  // Year handlers
  const addYear = (name: string) => {
    const newYear: Year = {
      id: `year_${Date.now()}`,
      name: name.trim()
    };
    setYears(prev => [...prev, newYear]);
    setDoc(doc(db, 'years', newYear.id), newYear).catch(() => {});
  };

  const deleteYear = (id: string) => {
    setYears(prev => prev.filter(y => y.id !== id));
    deleteDoc(doc(db, 'years', id)).catch(() => {});
  };

  // Section handlers
  const addSection = (name: string, departmentId: string, yearId: string) => {
    const newSection: Section = {
      id: `sec_${Date.now()}`,
      name: name.trim(),
      departmentId,
      yearId
    };
    setSections(prev => [...prev, newSection]);
    setDoc(doc(db, 'sections', newSection.id), newSection).catch(() => {});
  };

  const deleteSection = (id: string) => {
    setSections(prev => prev.filter(s => s.id !== id));
    deleteDoc(doc(db, 'sections', id)).catch(() => {});
  };

  // Attendance
  const saveAttendanceSession = (sessionData: Omit<AttendanceSession, 'id' | 'createdAt'>) => {
    const newSession: AttendanceSession = {
      ...sessionData,
      id: `att_${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    setAttendanceSessions(prev => [newSession, ...prev]);
    setDoc(doc(db, 'attendance_sessions', newSession.id), newSession).catch(() => {});

    // Send automatic notification
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      department: sessionData.department,
      year: sessionData.year,
      section: sessionData.section,
      title: `Attendance Updated: ${sessionData.subject}`,
      message: `Attendance for ${sessionData.date} has been updated by ${sessionData.facultyName}.`,
      type: 'Attendance',
      isReadBy: [],
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const getStudentAttendanceStats = (studentId: string, department: string, year: string, section: string) => {
    const relevantSessions = attendanceSessions.filter(
      s => s.department === department && s.year === year && s.section === section
    );

    let totalClasses = 0;
    let attendedClasses = 0;
    const subjectMap: Record<string, { total: number; attended: number }> = {};

    relevantSessions.forEach(session => {
      const rec = session.records.find(r => r.studentId === studentId);
      if (rec) {
        totalClasses++;
        if (!subjectMap[session.subject]) {
          subjectMap[session.subject] = { total: 0, attended: 0 };
        }
        subjectMap[session.subject].total++;

        if (rec.status === 'Present') {
          attendedClasses++;
          subjectMap[session.subject].attended++;
        }
      }
    });

    const overallPercentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 100;

    const subjectWise = Object.keys(subjectMap).map(subj => {
      const item = subjectMap[subj];
      return {
        subject: subj,
        total: item.total,
        attended: item.attended,
        percentage: item.total > 0 ? Math.round((item.attended / item.total) * 100) : 100
      };
    });

    return {
      overallPercentage,
      totalClasses,
      attendedClasses,
      subjectWise
    };
  };

  // Assignment Handlers
  const createAssignment = (asg: Omit<Assignment, 'id' | 'createdAt'>) => {
    const newAsg: Assignment = {
      ...asg,
      id: `asg_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setAssignments(prev => [newAsg, ...prev]);
    setDoc(doc(db, 'assignments', newAsg.id), newAsg).catch(() => {});

    // Send Notification
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      department: asg.department,
      year: asg.year,
      section: asg.section,
      title: `New Assignment: ${asg.title}`,
      message: `${asg.facultyName} assigned ${asg.title} (${asg.subject}). Deadline: ${asg.deadline}`,
      type: 'Assignment',
      isReadBy: [],
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
    setDoc(doc(db, 'notifications', newNotif.id), newNotif).catch(() => {});
  };

  const updateAssignment = (id: string, asg: Partial<Assignment>) => {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, ...asg } : a));
    setDoc(doc(db, 'assignments', id), asg, { merge: true }).catch(() => {});
  };

  const deleteAssignment = (id: string) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
    deleteDoc(doc(db, 'assignments', id)).catch(() => {});
  };

  const toggleStudentAssignmentStatus = (assignmentId: string, studentId: string) => {
    setStudentProgressList(prev => {
      const existing = prev.find(p => p.assignmentId === assignmentId && p.studentId === studentId);
      if (existing) {
        return prev.map(p =>
          p.assignmentId === assignmentId && p.studentId === studentId
            ? { ...p, status: p.status === 'Completed' ? 'Pending' : 'Completed', completedAt: new Date().toISOString() }
            : p
        );
      } else {
        return [...prev, { assignmentId, studentId, status: 'Completed', completedAt: new Date().toISOString() }];
      }
    });
  };

  const submitAssignment = (subData: Omit<AssignmentSubmission, 'id' | 'submittedAt' | 'status'>) => {
    const newSubmission: AssignmentSubmission = {
      ...subData,
      id: `sub_${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'Submitted'
    };

    setAssignmentSubmissions(prev => [newSubmission, ...prev.filter(s => !(s.assignmentId === subData.assignmentId && s.studentId === subData.studentId))]);
    setDoc(doc(db, 'assignment_submissions', newSubmission.id), newSubmission).catch(() => {});

    // Automatically update progress to completed
    setStudentProgressList(prev => {
      const existing = prev.find(p => p.assignmentId === subData.assignmentId && p.studentId === subData.studentId);
      if (existing) {
        return prev.map(p =>
          p.assignmentId === subData.assignmentId && p.studentId === subData.studentId
            ? { ...p, status: 'Completed', completedAt: new Date().toISOString(), submissionNote: subData.fileName }
            : p
        );
      }
      return [...prev, { assignmentId: subData.assignmentId, studentId: subData.studentId, status: 'Completed', completedAt: new Date().toISOString(), submissionNote: subData.fileName }];
    });
  };

  const gradeSubmission = (submissionId: string, grade: string, feedback: string) => {
    setAssignmentSubmissions(prev =>
      prev.map(s => (s.id === submissionId ? { ...s, status: 'Graded', grade, feedback } : s))
    );
    setDoc(doc(db, 'assignment_submissions', submissionId), { status: 'Graded', grade, feedback }, { merge: true }).catch(() => {});
  };

  // Notes
  const uploadNote = (note: Omit<NoteItem, 'id' | 'uploadedAt' | 'bookmarkedBy'>) => {
    const newNote: NoteItem = {
      ...note,
      id: `note_${Date.now()}`,
      uploadedAt: new Date().toISOString(),
      bookmarkedBy: []
    };
    setNotes(prev => [newNote, ...prev]);
    setDoc(doc(db, 'notes', newNote.id), newNote).catch(() => {});
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    deleteDoc(doc(db, 'notes', id)).catch(() => {});
  };

  const toggleNoteBookmark = (noteId: string, studentId: string) => {
    setNotes(prev =>
      prev.map(n => {
        if (n.id === noteId) {
          const isBookmarked = n.bookmarkedBy.includes(studentId);
          const updated = {
            ...n,
            bookmarkedBy: isBookmarked
              ? n.bookmarkedBy.filter(id => id !== studentId)
              : [...n.bookmarkedBy, studentId]
          };
          setDoc(doc(db, 'notes', noteId), { bookmarkedBy: updated.bookmarkedBy }, { merge: true }).catch(() => {});
          return updated;
        }
        return n;
      })
    );
  };

  // Study Sessions
  const createStudySession = (session: Omit<StudySession, 'id' | 'createdAt'>) => {
    const newSession: StudySession = {
      ...session,
      id: `ses_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setStudySessions(prev => [newSession, ...prev]);
    setDoc(doc(db, 'study_sessions', newSession.id), newSession).catch(() => {});

    // Send notification
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      department: session.department,
      year: session.year,
      section: session.section,
      title: `Study Session Scheduled: ${session.topic}`,
      message: `${session.facultyName} scheduled a session on ${session.date} at ${session.time}.`,
      type: 'Study Session',
      isReadBy: [],
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
    setDoc(doc(db, 'notifications', newNotif.id), newNotif).catch(() => {});
  };

  const deleteStudySession = (id: string) => {
    setStudySessions(prev => prev.filter(s => s.id !== id));
    deleteDoc(doc(db, 'study_sessions', id)).catch(() => {});
  };

  const joinStudySessionAndMarkAttendance = (sessionId: string, student: StudentUser) => {
    // 1. Record student in session's attended list
    setStudySessions(prev =>
      prev.map(s => {
        if (s.id === sessionId) {
          const currentAttended = s.attendedStudentIds || [];
          if (!currentAttended.includes(student.id)) {
            return { ...s, attendedStudentIds: [...currentAttended, student.id] };
          }
        }
        return s;
      })
    );

    const session = studySessions.find(s => s.id === sessionId);
    if (session) {
      // 2. Mark student as PRESENT in Attendance Records for this subject and date
      setAttendanceSessions(prev => {
        const existingSessionIndex = prev.findIndex(
          att => att.date === session.date && att.subject === session.subject && att.section === session.section
        );

        if (existingSessionIndex !== -1) {
          const existingSession = prev[existingSessionIndex];
          let updated = false;
          const updatedRecords = existingSession.records.map(r => {
            if (r.studentId === student.id || r.registerNumber === student.registerNumber) {
              updated = true;
              return { ...r, status: 'Present' as const };
            }
            return r;
          });

          if (!updated) {
            updatedRecords.push({
              studentId: student.id,
              studentName: student.fullName,
              registerNumber: student.registerNumber,
              status: 'Present'
            });
          }

          const presentCount = updatedRecords.filter(r => r.status === 'Present').length;
          const absentCount = updatedRecords.filter(r => r.status === 'Absent').length;

          const newSessions = [...prev];
          newSessions[existingSessionIndex] = {
            ...existingSession,
            records: updatedRecords,
            presentCount,
            absentCount
          };
          return newSessions;
        } else {
          // Create new attendance session record with Present status
          const newAttSession: AttendanceSession = {
            id: `att_${Date.now()}`,
            date: session.date,
            subject: session.subject,
            department: session.department,
            year: session.year,
            section: session.section,
            facultyId: session.facultyId,
            facultyName: session.facultyName,
            records: [
              {
                studentId: student.id,
                studentName: student.fullName,
                registerNumber: student.registerNumber,
                status: 'Present'
              }
            ],
            totalStudents: 1,
            presentCount: 1,
            absentCount: 0,
            createdAt: new Date().toISOString()
          };
          return [newAttSession, ...prev];
        }
      });

      // 3. Launch Google Meet link in new tab if available
      if (session.meetingUrl) {
        window.open(session.meetingUrl, '_blank');
      }
    }
  };

  // Announcements
  const createAnnouncement = (anc: Omit<Announcement, 'id' | 'postedAt'>) => {
    const newAnc: Announcement = {
      ...anc,
      id: `anc_${Date.now()}`,
      postedAt: new Date().toISOString()
    };
    setAnnouncements(prev => [newAnc, ...prev]);
    setDoc(doc(db, 'announcements', newAnc.id), newAnc).catch(() => {});

    // Send Notification
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      department: anc.department,
      year: anc.year,
      section: anc.section,
      title: `Announcement: ${anc.title}`,
      message: anc.message,
      type: 'Announcement',
      isReadBy: [],
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
    setDoc(doc(db, 'notifications', newNotif.id), newNotif).catch(() => {});
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    deleteDoc(doc(db, 'announcements', id)).catch(() => {});
  };

  // Notifications
  const markNotificationRead = (notificationId: string, userId: string) => {
    setNotifications(prev =>
      prev.map(n => {
        if (n.id === notificationId && !n.isReadBy.includes(userId)) {
          const updated = { ...n, isReadBy: [...n.isReadBy, userId] };
          setDoc(doc(db, 'notifications', notificationId), { isReadBy: updated.isReadBy }, { merge: true }).catch(() => {});
          return updated;
        }
        return n;
      })
    );
  };

  const markAllNotificationsRead = (userId: string) => {
    setNotifications(prev =>
      prev.map(n => {
        const updated = {
          ...n,
          isReadBy: n.isReadBy.includes(userId) ? n.isReadBy : [...n.isReadBy, userId]
        };
        setDoc(doc(db, 'notifications', n.id), { isReadBy: updated.isReadBy }, { merge: true }).catch(() => {});
        return updated;
      })
    );
  };

  // Planner
  const addPlannerTask = (task: Omit<StudyPlannerTask, 'id' | 'createdAt'>) => {
    const newTask: StudyPlannerTask = {
      ...task,
      id: `pln_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setPlannerTasks(prev => [newTask, ...prev]);
    setDoc(doc(db, 'planner_tasks', newTask.id), newTask).catch(() => {});
  };

  const updatePlannerTask = (id: string, task: Partial<StudyPlannerTask>) => {
    setPlannerTasks(prev => prev.map(t => t.id === id ? { ...t, ...task } : t));
    setDoc(doc(db, 'planner_tasks', id), task, { merge: true }).catch(() => {});
  };

  const deletePlannerTask = (id: string) => {
    setPlannerTasks(prev => prev.filter(t => t.id !== id));
    deleteDoc(doc(db, 'planner_tasks', id)).catch(() => {});
  };

  const togglePlannerTask = (id: string) => {
    setPlannerTasks(prev => prev.map(t => {
      if (t.id === id) {
        const updated = { ...t, completed: !t.completed };
        setDoc(doc(db, 'planner_tasks', id), { completed: updated.completed }, { merge: true }).catch(() => {});
        return updated;
      }
      return t;
    }));
  };

  // Seed / Reset
  const seedDemoData = () => {
    setAssignments(DEMO_ASSIGNMENTS);
    setAttendanceSessions(DEMO_ATTENDANCE);
    setNotes(DEMO_NOTES);
    setStudySessions(DEMO_SESSIONS);
    setAnnouncements(DEMO_ANNOUNCEMENTS);
    setNotifications(DEMO_NOTIFICATIONS);
    setPlannerTasks(DEMO_PLANNER);
    setIsDemoLoaded(true);
  };

  const resetToCleanDatabase = () => {
    setAssignments([]);
    setAttendanceSessions([]);
    setNotes([]);
    setStudySessions([]);
    setAnnouncements([]);
    setNotifications([]);
    setPlannerTasks([]);
    setStudentProgressList([]);
    setIsDemoLoaded(false);
  };

  const reports: SystemReport[] = [
    {
      id: 'rep_1',
      title: 'Overall Department Attendance Matrix',
      type: 'Attendance Summary',
      generatedAt: new Date().toISOString(),
      description: 'Monthly summary of attendance averages across all departments and sections.'
    },
    {
      id: 'rep_2',
      title: 'Assignment Completion & Submission Analysis',
      type: 'Assignment Submissions',
      generatedAt: new Date().toISOString(),
      description: 'Submission rates, pending statuses, and faculty grading completion.'
    },
    {
      id: 'rep_3',
      title: 'Academic Performance & Active Engagement Report',
      type: 'Department Performance',
      generatedAt: new Date().toISOString(),
      description: 'Aggregated analytics on notes usage, study session attendance, and platform engagement.'
    }
  ];

  return (
    <DataContext.Provider
      value={{
        departments,
        years,
        sections,
        attendanceSessions,
        assignments,
        assignmentSubmissions,
        studentProgressList,
        notes,
        studySessions,
        announcements,
        notifications,
        plannerTasks,
        reports,
        isDemoLoaded,

        addDepartment,
        updateDepartment,
        deleteDepartment,

        addYear,
        deleteYear,

        addSection,
        deleteSection,

        saveAttendanceSession,
        getStudentAttendanceStats,

        createAssignment,
        updateAssignment,
        deleteAssignment,
        toggleStudentAssignmentStatus,
        submitAssignment,
        gradeSubmission,

        uploadNote,
        deleteNote,
        toggleNoteBookmark,

        createStudySession,
        deleteStudySession,
        joinStudySessionAndMarkAttendance,

        createAnnouncement,
        deleteAnnouncement,

        markNotificationRead,
        markAllNotificationsRead,

        addPlannerTask,
        updatePlannerTask,
        deletePlannerTask,
        togglePlannerTask,

        seedDemoData,
        resetToCleanDatabase
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

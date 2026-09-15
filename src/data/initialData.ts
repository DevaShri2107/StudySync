import {
  AdminUser,
  Department,
  Year,
  Section,
  FacultyUser,
  StudentUser,
  Assignment,
  AttendanceSession,
  NoteItem,
  StudySession,
  Announcement,
  AppNotification,
  StudyPlannerTask
} from '../types';

export const DEFAULT_ADMIN: AdminUser = {
  id: 'admin_default_01',
  email: 'admin@gmail.com',
  fullName: 'System Administrator',
  role: 'Administrator',
  createdAt: new Date().toISOString()
};

export const DEFAULT_DEPARTMENTS: Department[] = [
  { id: 'dept_cse', name: 'Computer Science & Engineering', code: 'CSE' },
  { id: 'dept_it', name: 'Information Technology', code: 'IT' },
  { id: 'dept_ece', name: 'Electronics & Communication', code: 'ECE' },
  { id: 'dept_me', name: 'Mechanical Engineering', code: 'ME' }
];

export const DEFAULT_YEARS: Year[] = [
  { id: 'year_1', name: 'I Year' },
  { id: 'year_2', name: 'II Year' },
  { id: 'year_3', name: 'III Year' },
  { id: 'year_4', name: 'IV Year' }
];

export const DEFAULT_SECTIONS: Section[] = [
  { id: 'sec_a', name: 'Section A', departmentId: 'dept_cse', yearId: 'year_3' },
  { id: 'sec_b', name: 'Section B', departmentId: 'dept_cse', yearId: 'year_3' },
  { id: 'sec_c', name: 'Section C', departmentId: 'dept_cse', yearId: 'year_3' },
  { id: 'sec_d', name: 'Section D', departmentId: 'dept_cse', yearId: 'year_3' },
  
  { id: 'sec_it_a', name: 'Section A', departmentId: 'dept_it', yearId: 'year_3' },
  { id: 'sec_it_b', name: 'Section B', departmentId: 'dept_it', yearId: 'year_3' },

  { id: 'sec_ece_a', name: 'Section A', departmentId: 'dept_ece', yearId: 'year_3' },
  { id: 'sec_ece_b', name: 'Section B', departmentId: 'dept_ece', yearId: 'year_3' }
];

// Optional Demo Seed Data for instant testing when requested
export const DEMO_FACULTY: FacultyUser[] = [
  {
    id: 'fac_1',
    email: 'dr.sharma@gmail.com',
    fullName: 'Dr. Rajesh Sharma',
    role: 'Faculty',
    employeeId: 'EMP-2023-01',
    department: 'Computer Science & Engineering',
    createdAt: new Date().toISOString()
  },
  {
    id: 'fac_2',
    email: 'prof.ananya@gmail.com',
    fullName: 'Prof. Ananya Roy',
    role: 'Faculty',
    employeeId: 'EMP-2023-02',
    department: 'Computer Science & Engineering',
    createdAt: new Date().toISOString()
  }
];

export const DEMO_STUDENTS: StudentUser[] = [
  {
    id: 'std_1',
    email: 'student001@gmail.com',
    fullName: 'Arjun Kumar',
    role: 'Student',
    registerNumber: 'REG-2023-001',
    department: 'Computer Science & Engineering',
    year: 'III Year',
    section: 'Section A',
    createdAt: new Date().toISOString()
  },
  {
    id: 'std_2',
    email: 'student002@gmail.com',
    fullName: 'Priya Verma',
    role: 'Student',
    registerNumber: 'REG-2023-002',
    department: 'Computer Science & Engineering',
    year: 'III Year',
    section: 'Section A',
    createdAt: new Date().toISOString()
  },
  {
    id: 'std_3',
    email: 'student003@gmail.com',
    fullName: 'Rohan Mehta',
    role: 'Student',
    registerNumber: 'REG-2023-003',
    department: 'Computer Science & Engineering',
    year: 'III Year',
    section: 'Section A',
    createdAt: new Date().toISOString()
  },
  {
    id: 'std_4',
    email: 'student004@gmail.com',
    fullName: 'Sneha Patel',
    role: 'Student',
    registerNumber: 'REG-2023-004',
    department: 'Computer Science & Engineering',
    year: 'III Year',
    section: 'Section B',
    createdAt: new Date().toISOString()
  }
];

export const DEMO_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg_1',
    title: 'Cloud Computing Architecture Analysis',
    subject: 'Distributed Systems',
    description: 'Submit a detailed report analyzing microservices vs monolithic architectures in AWS/GCP.',
    deadline: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    priority: 'High',
    attachmentName: 'Assignment_Guide_Module_4.pdf',
    attachmentSize: '2.4 MB',
    attachmentType: 'pdf',
    department: 'Computer Science & Engineering',
    year: 'III Year',
    section: 'Section A',
    facultyId: 'fac_1',
    facultyName: 'Dr. Rajesh Sharma',
    createdAt: new Date().toISOString()
  },
  {
    id: 'asg_2',
    title: 'Database Normalization & BCNF Exercises',
    subject: 'Database Management Systems',
    description: 'Solve problem set 3 covering 3NF, BCNF, and multi-valued dependencies.',
    deadline: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    priority: 'Medium',
    attachmentName: 'DBMS_Problem_Set_3.docx',
    attachmentSize: '850 KB',
    attachmentType: 'docx',
    department: 'Computer Science & Engineering',
    year: 'III Year',
    section: 'Section A',
    facultyId: 'fac_2',
    facultyName: 'Prof. Ananya Roy',
    createdAt: new Date().toISOString()
  }
];

export const DEMO_ATTENDANCE: AttendanceSession[] = [
  {
    id: 'att_1',
    date: new Date().toISOString().split('T')[0],
    subject: 'Distributed Systems',
    department: 'Computer Science & Engineering',
    year: 'III Year',
    section: 'Section A',
    facultyId: 'fac_1',
    facultyName: 'Dr. Rajesh Sharma',
    records: [
      { studentId: 'std_1', studentName: 'Arjun Kumar', registerNumber: 'REG-2023-001', status: 'Present' },
      { studentId: 'std_2', studentName: 'Priya Verma', registerNumber: 'REG-2023-002', status: 'Present' },
      { studentId: 'std_3', studentName: 'Rohan Mehta', registerNumber: 'REG-2023-003', status: 'Absent' }
    ],
    totalStudents: 3,
    presentCount: 2,
    absentCount: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'att_2',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    subject: 'Database Management Systems',
    department: 'Computer Science & Engineering',
    year: 'III Year',
    section: 'Section A',
    facultyId: 'fac_2',
    facultyName: 'Prof. Ananya Roy',
    records: [
      { studentId: 'std_1', studentName: 'Arjun Kumar', registerNumber: 'REG-2023-001', status: 'Present' },
      { studentId: 'std_2', studentName: 'Priya Verma', registerNumber: 'REG-2023-002', status: 'Present' },
      { studentId: 'std_3', studentName: 'Rohan Mehta', registerNumber: 'REG-2023-003', status: 'Present' }
    ],
    totalStudents: 3,
    presentCount: 3,
    absentCount: 0,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

export const DEMO_NOTES: NoteItem[] = [
  {
    id: 'note_1',
    title: 'Unit 3: Kubernetes Container Orchestration',
    subject: 'Cloud Computing',
    description: 'Complete lecture slides detailing Pods, Services, Deployments, and Helm charts.',
    fileType: 'pdf',
    fileName: 'Unit3_Kubernetes_Lecture.pdf',
    fileSize: '4.8 MB',
    department: 'Computer Science & Engineering',
    year: 'III Year',
    section: 'Section A',
    facultyId: 'fac_1',
    facultyName: 'Dr. Rajesh Sharma',
    uploadedAt: new Date().toISOString(),
    bookmarkedBy: ['std_1']
  },
  {
    id: 'note_2',
    title: 'SQL Performance Tuning & Indexing Presentation',
    subject: 'DBMS',
    description: 'B-Trees, Hash Indexes, Query Optimization, and Execution Plans.',
    fileType: 'ppt',
    fileName: 'SQL_Indexing_Masterclass.ppt',
    fileSize: '12.1 MB',
    department: 'Computer Science & Engineering',
    year: 'III Year',
    section: 'Section A',
    facultyId: 'fac_2',
    facultyName: 'Prof. Ananya Roy',
    uploadedAt: new Date().toISOString(),
    bookmarkedBy: []
  }
];

export const DEMO_SESSIONS: StudySession[] = [
  {
    id: 'ses_1',
    topic: 'Exam Review: Mid-Term Revision on System Design',
    subject: 'Distributed Systems',
    description: 'Interactive Q&A session on CAP theorem, consistency models, and load balancing.',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    time: '15:30',
    durationMinutes: 60,
    department: 'Computer Science & Engineering',
    year: 'III Year',
    section: 'Section A',
    facultyId: 'fac_1',
    facultyName: 'Dr. Rajesh Sharma',
    meetingUrl: 'https://meet.google.com/cse-rsh-rev',
    createdAt: new Date().toISOString()
  }
];

export const DEMO_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'anc_1',
    title: 'Mid-Term Lab Examination Schedule Released',
    message: 'The Mid-term practical exams for III Year Section A will commence from next Monday. Ensure all lab records are signed.',
    priority: 'Urgent',
    department: 'Computer Science & Engineering',
    year: 'III Year',
    section: 'Section A',
    facultyId: 'fac_1',
    facultyName: 'Dr. Rajesh Sharma',
    postedAt: new Date().toISOString()
  },
  {
    id: 'anc_2',
    title: 'Guest Lecture on Generative AI & MLOps',
    message: 'Join us this Friday at 10 AM in Auditorium B for an industry keynote by Lead AI Engineers.',
    priority: 'Important',
    department: 'Computer Science & Engineering',
    year: 'III Year',
    section: 'Section A',
    facultyId: 'fac_2',
    facultyName: 'Prof. Ananya Roy',
    postedAt: new Date(Date.now() - 3600000 * 5).toISOString()
  }
];

export const DEMO_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    department: 'Computer Science & Engineering',
    year: 'III Year',
    section: 'Section A',
    title: 'New Assignment Uploaded',
    message: 'Dr. Rajesh Sharma published: Cloud Computing Architecture Analysis',
    type: 'Assignment',
    isReadBy: [],
    createdAt: new Date().toISOString()
  },
  {
    id: 'notif_2',
    department: 'Computer Science & Engineering',
    year: 'III Year',
    section: 'Section A',
    title: 'Study Session Scheduled',
    message: 'Mid-Term Revision scheduled for Thursday at 3:30 PM',
    type: 'Study Session',
    isReadBy: [],
    createdAt: new Date(Date.now() - 1800000).toISOString()
  }
];

export const DEMO_PLANNER: StudyPlannerTask[] = [
  {
    id: 'pln_1',
    studentId: 'std_1',
    title: 'Review Microservices Architecture Chapter 4',
    description: 'Focus on API Gateway patterns and Circuit Breaker pattern',
    dueDate: new Date().toISOString().split('T')[0],
    time: '18:00',
    priority: 'High',
    completed: false,
    category: 'Revision',
    createdAt: new Date().toISOString()
  },
  {
    id: 'pln_2',
    studentId: 'std_1',
    title: 'Complete DBMS Problem Set 3',
    description: 'Work through BCNF decomposition questions',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '20:00',
    priority: 'Medium',
    completed: true,
    category: 'Assignment',
    createdAt: new Date().toISOString()
  }
];

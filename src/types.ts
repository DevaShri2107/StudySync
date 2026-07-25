export type Role = 'Administrator' | 'Faculty' | 'Student';

export interface BaseUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  createdAt: string;
}

export interface AdminUser extends BaseUser {
  role: 'Administrator';
}

export interface FacultyUser extends BaseUser {
  role: 'Faculty';
  employeeId: string;
  department: string;
}

export interface StudentUser extends BaseUser {
  role: 'Student';
  registerNumber: string;
  department: string;
  year: string;
  section: string;
}

export type User = AdminUser | FacultyUser | StudentUser;

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface Year {
  id: string;
  name: string; // 'I Year', 'II Year', 'III Year', 'IV Year'
}

export interface Section {
  id: string;
  name: string; // 'Section A', 'Section B', etc.
  departmentId: string;
  yearId: string;
}

export interface FacultyClassMapping {
  id: string;
  facultyId: string;
  department: string;
  year: string;
  section: string;
  subject: string;
}

export interface AttendanceEntry {
  studentId: string;
  studentName: string;
  registerNumber: string;
  status: 'Present' | 'Absent';
}

export interface AttendanceSession {
  id: string;
  date: string;
  subject: string;
  department: string;
  year: string;
  section: string;
  facultyId: string;
  facultyName: string;
  records: AttendanceEntry[];
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  createdAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  description: string;
  deadline: string;
  priority: 'High' | 'Medium' | 'Low';
  attachmentName?: string;
  attachmentSize?: string;
  attachmentType?: string;
  attachmentUrl?: string;
  department: string;
  year: string;
  section: string;
  facultyId: string;
  facultyName: string;
  createdAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  registerNumber: string;
  driveFileUrl: string;
  fileName: string;
  fileSize?: string;
  notes?: string;
  submittedAt: string;
  status: 'Submitted' | 'Graded';
  grade?: string;
  feedback?: string;
}

export interface StudentAssignmentProgress {
  assignmentId: string;
  studentId: string;
  status: 'Pending' | 'Completed' | 'Overdue';
  completedAt?: string;
  submissionNote?: string;
}

export interface NoteItem {
  id: string;
  title: string;
  subject: string;
  description: string;
  fileType: 'pdf' | 'ppt' | 'docx' | 'image';
  fileName: string;
  fileSize: string;
  driveFileUrl?: string;
  department: string;
  year: string;
  section: string;
  facultyId: string;
  facultyName: string;
  uploadedAt: string;
  bookmarkedBy: string[]; // student IDs
}

export interface StudyPlannerTask {
  id: string;
  studentId: string;
  title: string;
  subject?: string;
  description?: string;
  dueDate: string;
  time?: string;
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
  category: 'Assignment' | 'Exam' | 'Revision' | 'Project' | 'Other';
  createdAt: string;
}

export interface StudySession {
  id: string;
  topic: string;
  subject: string;
  description: string;
  date: string;
  time: string;
  durationMinutes: number;
  department: string;
  year: string;
  section: string;
  facultyId: string;
  facultyName: string;
  meetingUrl?: string;
  calendarUrl?: string;
  attendedStudentIds?: string[]; // Student IDs who clicked "Join Live Session"
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: 'Normal' | 'Important' | 'Urgent';
  department: string;
  year: string;
  section: string;
  facultyId: string;
  facultyName: string;
  postedAt: string;
}

export interface AppNotification {
  id: string;
  recipientUserId?: string; // If null, target by dept/year/section or role
  targetRole?: Role;
  department?: string;
  year?: string;
  section?: string;
  title: string;
  message: string;
  type: 'Assignment' | 'Attendance' | 'Announcement' | 'Study Session' | 'General';
  isReadBy: string[]; // user IDs who read it
  createdAt: string;
}

export interface SystemReport {
  id: string;
  title: string;
  type: 'Attendance Summary' | 'Assignment Submissions' | 'Department Performance';
  generatedAt: string;
  description: string;
}

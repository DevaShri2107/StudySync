class AppConstants {
  static const String appName = 'StudySync';
  static const String appTagline = 'Smart Academic Management & Collaborative Learning';

  // Roles
  static const String roleAdmin = 'admin';
  static const String roleFaculty = 'faculty';
  static const String roleStudent = 'student';

  // Firestore Collections
  static const String colUsers = 'Users';
  static const String colStudents = 'Students';
  static const String colFaculty = 'Faculty';
  static const String colDepartments = 'Departments';
  static const String colYears = 'Years';
  static const String colSections = 'Sections';
  static const String colSubjects = 'Subjects';
  static const String colAttendance = 'Attendance';
  static const String colAssignments = 'Assignments';
  static const String colAssignmentSubmissions = 'AssignmentSubmissions';
  static const String colNotes = 'Notes';
  static const String colStudyPlanner = 'StudyPlanner';
  static const String colStudySessions = 'StudySessions';
  static const String colAnnouncements = 'Announcements';
  static const String colNotifications = 'Notifications';
  static const String colReports = 'Reports';
  static const String colSettings = 'Settings';
  static const String colGoogleIntegrations = 'GoogleIntegrations';

  // Attendance Statuses
  static const String statusPresent = 'Present';
  static const String statusAbsent = 'Absent';

  // Attendance Thresholds
  static const double attendanceGood = 75.0;
  static const double attendanceWarning = 60.0;

  // Assignment Statuses
  static const String assignmentPending = 'Pending';
  static const String assignmentSubmitted = 'Submitted';
  static const String assignmentOverdue = 'Overdue';
  static const String assignmentCompleted = 'Completed';

  // Email Validation Rule
  static const String requiredEmailDomain = '@gmail.com';
}

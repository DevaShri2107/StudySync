import 'package:cloud_firestore/cloud_firestore.dart';
import '../constants/app_constants.dart';
import '../../models/academic_models.dart';
import '../../models/attendance_model.dart';
import '../../models/assignment_model.dart';
import '../../models/submission_model.dart';
import '../../models/note_model.dart';
import '../../models/planner_task_model.dart';
import '../../models/study_session_model.dart';
import '../../models/announcement_model.dart';
import '../../models/notification_model.dart';
import '../../models/student_model.dart';
import '../../models/faculty_model.dart';

class FirestoreService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  // --- ACADEMIC STRUCTURE ---
  Stream<List<DepartmentModel>> getDepartments() {
    return _db.collection(AppConstants.colDepartments).snapshots().map(
      (snap) => snap.docs.map((d) => DepartmentModel.fromMap(d.data(), d.id)).toList(),
    );
  }

  Future<void> addDepartment(String name, String code) async {
    await _db.collection(AppConstants.colDepartments).add({'name': name.trim(), 'code': code.trim().toUpperCase()});
  }

  Stream<List<AcademicYearModel>> getYears(String departmentId) {
    return _db
        .collection(AppConstants.colYears)
        .where('departmentId', isEqualTo: departmentId)
        .snapshots()
        .map((snap) => snap.docs.map((d) => AcademicYearModel.fromMap(d.data(), d.id)).toList());
  }

  Future<void> addYear(String name, String departmentId) async {
    await _db.collection(AppConstants.colYears).add({'name': name.trim(), 'departmentId': departmentId});
  }

  Stream<List<SectionModel>> getSections(String departmentId, String yearId) {
    return _db
        .collection(AppConstants.colSections)
        .where('departmentId', isEqualTo: departmentId)
        .where('yearId', isEqualTo: yearId)
        .snapshots()
        .map((snap) => snap.docs.map((d) => SectionModel.fromMap(d.data(), d.id)).toList());
  }

  Future<void> addSection(String name, String departmentId, String yearId) async {
    await _db.collection(AppConstants.colSections).add({
      'name': name.trim(),
      'departmentId': departmentId,
      'yearId': yearId,
    });
  }

  Stream<List<SubjectModel>> getSubjects(String departmentId, String yearId) {
    return _db
        .collection(AppConstants.colSubjects)
        .where('departmentId', isEqualTo: departmentId)
        .where('yearId', isEqualTo: yearId)
        .snapshots()
        .map((snap) => snap.docs.map((d) => SubjectModel.fromMap(d.data(), d.id)).toList());
  }

  Future<void> addSubject(String name, String code, String departmentId, String yearId) async {
    await _db.collection(AppConstants.colSubjects).add({
      'name': name.trim(),
      'code': code.trim().toUpperCase(),
      'departmentId': departmentId,
      'yearId': yearId,
    });
  }

  // --- USERS & ROSTER ---
  Stream<List<StudentModel>> getStudentsForClass({
    required String departmentId,
    required String yearId,
    required String sectionId,
  }) {
    return _db
        .collection(AppConstants.colStudents)
        .where('departmentId', isEqualTo: departmentId)
        .where('yearId', isEqualTo: yearId)
        .where('sectionId', isEqualTo: sectionId)
        .snapshots()
        .map((snap) => snap.docs.map((d) => StudentModel.fromMap(d.data(), d.id)).toList());
  }

  Stream<List<StudentModel>> getAllStudents() {
    return _db.collection(AppConstants.colStudents).snapshots().map(
      (snap) => snap.docs.map((d) => StudentModel.fromMap(d.data(), d.id)).toList(),
    );
  }

  Stream<List<FacultyModel>> getAllFaculty() {
    return _db.collection(AppConstants.colFaculty).snapshots().map(
      (snap) => snap.docs.map((d) => FacultyModel.fromMap(d.data(), d.id)).toList(),
    );
  }

  // --- ATTENDANCE ---
  Future<void> saveAttendanceSession({
    required String date,
    required String subjectId,
    required String subjectName,
    required String departmentId,
    required String departmentName,
    required String yearId,
    required String yearName,
    required String sectionId,
    required String sectionName,
    required String facultyId,
    required String facultyName,
    required Map<String, String> studentStatuses, // studentId -> 'Present' / 'Absent'
    required List<StudentModel> students,
  }) async {
    final batch = _db.batch();
    final now = DateTime.now();

    for (final student in students) {
      final status = studentStatuses[student.uid] ?? AppConstants.statusPresent;
      // Deterministic document ID to prevent duplicates on the same date + subject + student
      final docId = '${date}_${subjectId}_${student.uid}';
      final ref = _db.collection(AppConstants.colAttendance).doc(docId);

      final record = AttendanceRecord(
        attendanceId: docId,
        date: date,
        subjectId: subjectId,
        subjectName: subjectName,
        departmentId: departmentId,
        departmentName: departmentName,
        yearId: yearId,
        yearName: yearName,
        sectionId: sectionId,
        sectionName: sectionName,
        studentId: student.uid,
        studentName: student.fullName,
        registerNumber: student.registerNumber,
        facultyId: facultyId,
        facultyName: facultyName,
        status: status,
        createdAt: now,
        updatedAt: now,
      );

      batch.set(ref, record.toMap());
    }

    await batch.commit();
  }

  Stream<List<AttendanceRecord>> getStudentAttendance(String studentId) {
    return _db
        .collection(AppConstants.colAttendance)
        .where('studentId', isEqualTo: studentId)
        .snapshots()
        .map((snap) => snap.docs.map((d) => AttendanceRecord.fromMap(d.data(), d.id)).toList());
  }

  // --- ASSIGNMENTS ---
  Stream<List<AssignmentModel>> getAssignmentsForClass({
    required String departmentId,
    required String yearId,
    required String sectionId,
  }) {
    return _db
        .collection(AppConstants.colAssignments)
        .where('departmentId', isEqualTo: departmentId)
        .where('yearId', isEqualTo: yearId)
        .where('sectionId', isEqualTo: sectionId)
        .snapshots()
        .map((snap) => snap.docs.map((d) => AssignmentModel.fromMap(d.data(), d.id)).toList());
  }

  Future<void> createAssignment(AssignmentModel assignment) async {
    await _db.collection(AppConstants.colAssignments).add(assignment.toMap());
  }

  Future<void> deleteAssignment(String assignmentId) async {
    await _db.collection(AppConstants.colAssignments).doc(assignmentId).delete();
  }

  // --- ASSIGNMENT SUBMISSIONS ---
  Future<void> submitAssignment(AssignmentSubmissionModel submission) async {
    await _db.collection(AppConstants.colAssignmentSubmissions).doc(submission.submissionId).set(submission.toMap());
  }

  Stream<List<AssignmentSubmissionModel>> getSubmissionsForAssignment(String assignmentId) {
    return _db
        .collection(AppConstants.colAssignmentSubmissions)
        .where('assignmentId', isEqualTo: assignmentId)
        .snapshots()
        .map((snap) => snap.docs.map((d) => AssignmentSubmissionModel.fromMap(d.data(), d.id)).toList());
  }

  Stream<List<AssignmentSubmissionModel>> getStudentSubmissions(String studentId) {
    return _db
        .collection(AppConstants.colAssignmentSubmissions)
        .where('studentId', isEqualTo: studentId)
        .snapshots()
        .map((snap) => snap.docs.map((d) => AssignmentSubmissionModel.fromMap(d.data(), d.id)).toList());
  }

  Future<void> gradeSubmission(String submissionId, String grade, String feedback) async {
    await _db.collection(AppConstants.colAssignmentSubmissions).doc(submissionId).update({
      'grade': grade,
      'feedback': feedback,
      'status': 'Graded',
    });
  }

  // --- NOTES ---
  Stream<List<NoteModel>> getNotesForClass({
    required String departmentId,
    required String yearId,
    required String sectionId,
  }) {
    return _db
        .collection(AppConstants.colNotes)
        .where('departmentId', isEqualTo: departmentId)
        .where('yearId', isEqualTo: yearId)
        .where('sectionId', isEqualTo: sectionId)
        .snapshots()
        .map((snap) => snap.docs.map((d) => NoteModel.fromMap(d.data(), d.id)).toList());
  }

  Future<void> uploadNote(NoteModel note) async {
    await _db.collection(AppConstants.colNotes).add(note.toMap());
  }

  // --- STUDY PLANNER ---
  Stream<List<PlannerTaskModel>> getStudentPlannerTasks(String studentId) {
    return _db
        .collection(AppConstants.colStudyPlanner)
        .where('studentId', isEqualTo: studentId)
        .snapshots()
        .map((snap) => snap.docs.map((d) => PlannerTaskModel.fromMap(d.data(), d.id)).toList());
  }

  Future<void> addPlannerTask(PlannerTaskModel task) async {
    await _db.collection(AppConstants.colStudyPlanner).add(task.toMap());
  }

  Future<void> togglePlannerTask(String taskId, bool completed) async {
    await _db.collection(AppConstants.colStudyPlanner).doc(taskId).update({
      'completed': completed,
      'updatedAt': DateTime.now().toIso8601String(),
    });
  }

  Future<void> deletePlannerTask(String taskId) async {
    await _db.collection(AppConstants.colStudyPlanner).doc(taskId).delete();
  }

  // --- STUDY SESSIONS ---
  Stream<List<StudySessionModel>> getStudySessionsForClass({
    required String departmentId,
    required String yearId,
    required String sectionId,
  }) {
    return _db
        .collection(AppConstants.colStudySessions)
        .where('departmentId', isEqualTo: departmentId)
        .where('yearId', isEqualTo: yearId)
        .where('sectionId', isEqualTo: sectionId)
        .snapshots()
        .map((snap) => snap.docs.map((d) => StudySessionModel.fromMap(d.data(), d.id)).toList());
  }

  Future<void> createStudySession(StudySessionModel session) async {
    await _db.collection(AppConstants.colStudySessions).add(session.toMap());
  }

  // --- ANNOUNCEMENTS ---
  Stream<List<AnnouncementModel>> getAnnouncementsForClass({
    required String departmentId,
    required String yearId,
    required String sectionId,
  }) {
    return _db
        .collection(AppConstants.colAnnouncements)
        .where('departmentId', isEqualTo: departmentId)
        .where('yearId', isEqualTo: yearId)
        .where('sectionId', isEqualTo: sectionId)
        .snapshots()
        .map((snap) => snap.docs.map((d) => AnnouncementModel.fromMap(d.data(), d.id)).toList());
  }

  Future<void> postAnnouncement(AnnouncementModel announcement) async {
    await _db.collection(AppConstants.colAnnouncements).add(announcement.toMap());
  }

  // --- NOTIFICATIONS ---
  Stream<List<AppNotificationModel>> getNotifications(String userId) {
    return _db
        .collection(AppConstants.colNotifications)
        .where('recipientId', whereIn: [userId, 'all'])
        .snapshots()
        .map((snap) => snap.docs.map((d) => AppNotificationModel.fromMap(d.data(), d.id)).toList());
  }

  Future<void> sendNotification(AppNotificationModel notification) async {
    await _db.collection(AppConstants.colNotifications).add(notification.toMap());
  }

  // --- LIVE STATISTICS FOR ADMIN DASHBOARD ---
  Future<Map<String, int>> getLiveAdminStats() async {
    final studentsSnap = await _db.collection(AppConstants.colStudents).count().get();
    final facultySnap = await _db.collection(AppConstants.colFaculty).count().get();
    final deptSnap = await _db.collection(AppConstants.colDepartments).count().get();
    final yearSnap = await _db.collection(AppConstants.colYears).count().get();
    final sectionSnap = await _db.collection(AppConstants.colSections).count().get();
    final assignmentSnap = await _db.collection(AppConstants.colAssignments).count().get();

    return {
      'totalStudents': studentsSnap.count ?? 0,
      'totalFaculty': facultySnap.count ?? 0,
      'totalDepartments': deptSnap.count ?? 0,
      'totalYears': yearSnap.count ?? 0,
      'totalSections': sectionSnap.count ?? 0,
      'totalAssignments': assignmentSnap.count ?? 0,
    };
  }
}

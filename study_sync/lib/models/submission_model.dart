class AssignmentSubmissionModel {
  final String submissionId;
  final String assignmentId;
  final String studentId;
  final String studentName;
  final String registerNumber;
  final String driveFileId;
  final String driveFileUrl;
  final String fileName;
  final DateTime submittedAt;
  final String status; // 'Submitted', 'Graded'
  final String? grade;
  final String? feedback;

  AssignmentSubmissionModel({
    required this.submissionId,
    required this.assignmentId,
    required this.studentId,
    required this.studentName,
    required this.registerNumber,
    required this.driveFileId,
    required this.driveFileUrl,
    required this.fileName,
    required this.submittedAt,
    required this.status,
    this.grade,
    this.feedback,
  });

  factory AssignmentSubmissionModel.fromMap(Map<String, dynamic> map, String id) {
    return AssignmentSubmissionModel(
      submissionId: id,
      assignmentId: map['assignmentId'] ?? '',
      studentId: map['studentId'] ?? '',
      studentName: map['studentName'] ?? '',
      registerNumber: map['registerNumber'] ?? '',
      driveFileId: map['driveFileId'] ?? '',
      driveFileUrl: map['driveFileUrl'] ?? '',
      fileName: map['fileName'] ?? '',
      submittedAt: map['submittedAt'] != null ? DateTime.tryParse(map['submittedAt'].toString()) ?? DateTime.now() : DateTime.now(),
      status: map['status'] ?? 'Submitted',
      grade: map['grade'],
      feedback: map['feedback'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'assignmentId': assignmentId,
      'studentId': studentId,
      'studentName': studentName,
      'registerNumber': registerNumber,
      'driveFileId': driveFileId,
      'driveFileUrl': driveFileUrl,
      'fileName': fileName,
      'submittedAt': submittedAt.toIso8601String(),
      'status': status,
      'grade': grade,
      'feedback': feedback,
    };
  }
}

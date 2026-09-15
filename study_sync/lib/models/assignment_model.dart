class AssignmentModel {
  final String id;
  final String title;
  final String subjectId;
  final String subjectName;
  final String description;
  final String deadline; // YYYY-MM-DD
  final String priority; // 'High', 'Medium', 'Low'
  final String departmentId;
  final String yearId;
  final String sectionId;
  final String facultyId;
  final String facultyName;
  final String? driveFileId;
  final String? driveFileUrl;
  final String? fileName;
  final String? fileType;
  final DateTime createdAt;

  AssignmentModel({
    required this.id,
    required this.title,
    required this.subjectId,
    required this.subjectName,
    required this.description,
    required this.deadline,
    required this.priority,
    required this.departmentId,
    required this.yearId,
    required this.sectionId,
    required this.facultyId,
    required this.facultyName,
    this.driveFileId,
    this.driveFileUrl,
    this.fileName,
    this.fileType,
    required this.createdAt,
  });

  factory AssignmentModel.fromMap(Map<String, dynamic> map, String id) {
    return AssignmentModel(
      id: id,
      title: map['title'] ?? '',
      subjectId: map['subjectId'] ?? '',
      subjectName: map['subjectName'] ?? '',
      description: map['description'] ?? '',
      deadline: map['deadline'] ?? '',
      priority: map['priority'] ?? 'Medium',
      departmentId: map['departmentId'] ?? '',
      yearId: map['yearId'] ?? '',
      sectionId: map['sectionId'] ?? '',
      facultyId: map['facultyId'] ?? '',
      facultyName: map['facultyName'] ?? '',
      driveFileId: map['driveFileId'],
      driveFileUrl: map['driveFileUrl'],
      fileName: map['fileName'],
      fileType: map['fileType'],
      createdAt: map['createdAt'] != null ? DateTime.tryParse(map['createdAt'].toString()) ?? DateTime.now() : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'title': title,
      'subjectId': subjectId,
      'subjectName': subjectName,
      'description': description,
      'deadline': deadline,
      'priority': priority,
      'departmentId': departmentId,
      'yearId': yearId,
      'sectionId': sectionId,
      'facultyId': facultyId,
      'facultyName': facultyName,
      'driveFileId': driveFileId,
      'driveFileUrl': driveFileUrl,
      'fileName': fileName,
      'fileType': fileType,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  bool isOverdue() {
    final parsedDate = DateTime.tryParse(deadline);
    if (parsedDate == null) return false;
    final now = DateTime.now();
    return DateTime(now.year, now.month, now.day).isAfter(parsedDate);
  }
}

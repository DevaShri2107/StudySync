class AttendanceRecord {
  final String attendanceId;
  final String date; // YYYY-MM-DD
  final String subjectId;
  final String subjectName;
  final String departmentId;
  final String departmentName;
  final String yearId;
  final String yearName;
  final String sectionId;
  final String sectionName;
  final String studentId;
  final String studentName;
  final String registerNumber;
  final String facultyId;
  final String facultyName;
  final String status; // 'Present' or 'Absent'
  final DateTime createdAt;
  final DateTime updatedAt;

  AttendanceRecord({
    required this.attendanceId,
    required this.date,
    required this.subjectId,
    required this.subjectName,
    required this.departmentId,
    required this.departmentName,
    required this.yearId,
    required this.yearName,
    required this.sectionId,
    required this.sectionName,
    required this.studentId,
    required this.studentName,
    required this.registerNumber,
    required this.facultyId,
    required this.facultyName,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
  });

  factory AttendanceRecord.fromMap(Map<String, dynamic> map, String id) {
    return AttendanceRecord(
      attendanceId: id,
      date: map['date'] ?? '',
      subjectId: map['subjectId'] ?? '',
      subjectName: map['subjectName'] ?? '',
      departmentId: map['departmentId'] ?? '',
      departmentName: map['departmentName'] ?? '',
      yearId: map['yearId'] ?? '',
      yearName: map['yearName'] ?? '',
      sectionId: map['sectionId'] ?? '',
      sectionName: map['sectionName'] ?? '',
      studentId: map['studentId'] ?? '',
      studentName: map['studentName'] ?? '',
      registerNumber: map['registerNumber'] ?? '',
      facultyId: map['facultyId'] ?? '',
      facultyName: map['facultyName'] ?? '',
      status: map['status'] ?? 'Present',
      createdAt: map['createdAt'] != null ? DateTime.tryParse(map['createdAt'].toString()) ?? DateTime.now() : DateTime.now(),
      updatedAt: map['updatedAt'] != null ? DateTime.tryParse(map['updatedAt'].toString()) ?? DateTime.now() : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'attendanceId': attendanceId,
      'date': date,
      'subjectId': subjectId,
      'subjectName': subjectName,
      'departmentId': departmentId,
      'departmentName': departmentName,
      'yearId': yearId,
      'yearName': yearName,
      'sectionId': sectionId,
      'sectionName': sectionName,
      'studentId': studentId,
      'studentName': studentName,
      'registerNumber': registerNumber,
      'facultyId': facultyId,
      'facultyName': facultyName,
      'status': status,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

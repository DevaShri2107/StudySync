class NoteModel {
  final String noteId;
  final String title;
  final String subjectId;
  final String subjectName;
  final String departmentId;
  final String yearId;
  final String sectionId;
  final String facultyId;
  final String facultyName;
  final String driveFileId;
  final String driveFileUrl;
  final String fileName;
  final String fileType;
  final DateTime createdAt;
  final DateTime updatedAt;

  NoteModel({
    required this.noteId,
    required this.title,
    required this.subjectId,
    required this.subjectName,
    required this.departmentId,
    required this.yearId,
    required this.sectionId,
    required this.facultyId,
    required this.facultyName,
    required this.driveFileId,
    required this.driveFileUrl,
    required this.fileName,
    required this.fileType,
    required this.createdAt,
    required this.updatedAt,
  });

  factory NoteModel.fromMap(Map<String, dynamic> map, String id) {
    return NoteModel(
      noteId: id,
      title: map['title'] ?? '',
      subjectId: map['subjectId'] ?? '',
      subjectName: map['subjectName'] ?? '',
      departmentId: map['departmentId'] ?? '',
      yearId: map['yearId'] ?? '',
      sectionId: map['sectionId'] ?? '',
      facultyId: map['facultyId'] ?? '',
      facultyName: map['facultyName'] ?? '',
      driveFileId: map['driveFileId'] ?? '',
      driveFileUrl: map['driveFileUrl'] ?? '',
      fileName: map['fileName'] ?? '',
      fileType: map['fileType'] ?? 'PDF',
      createdAt: map['createdAt'] != null ? DateTime.tryParse(map['createdAt'].toString()) ?? DateTime.now() : DateTime.now(),
      updatedAt: map['updatedAt'] != null ? DateTime.tryParse(map['updatedAt'].toString()) ?? DateTime.now() : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'title': title,
      'subjectId': subjectId,
      'subjectName': subjectName,
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
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

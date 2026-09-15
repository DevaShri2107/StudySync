class AnnouncementModel {
  final String id;
  final String title;
  final String message;
  final String departmentId;
  final String yearId;
  final String sectionId;
  final String facultyId;
  final String facultyName;
  final bool emailSent;
  final DateTime createdAt;

  AnnouncementModel({
    required this.id,
    required this.title,
    required this.message,
    required this.departmentId,
    required this.yearId,
    required this.sectionId,
    required this.facultyId,
    required this.facultyName,
    required this.emailSent,
    required this.createdAt,
  });

  factory AnnouncementModel.fromMap(Map<String, dynamic> map, String id) {
    return AnnouncementModel(
      id: id,
      title: map['title'] ?? '',
      message: map['message'] ?? '',
      departmentId: map['departmentId'] ?? '',
      yearId: map['yearId'] ?? '',
      sectionId: map['sectionId'] ?? '',
      facultyId: map['facultyId'] ?? '',
      facultyName: map['facultyName'] ?? '',
      emailSent: map['emailSent'] ?? false,
      createdAt: map['createdAt'] != null ? DateTime.tryParse(map['createdAt'].toString()) ?? DateTime.now() : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'title': title,
      'message': message,
      'departmentId': departmentId,
      'yearId': yearId,
      'sectionId': sectionId,
      'facultyId': facultyId,
      'facultyName': facultyName,
      'emailSent': emailSent,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}

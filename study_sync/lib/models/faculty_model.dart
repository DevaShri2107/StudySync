class FacultyModel {
  final String uid;
  final String employeeId;
  final String fullName;
  final String departmentId;
  final String departmentName;
  final String email;
  final DateTime createdAt;
  final DateTime updatedAt;

  FacultyModel({
    required this.uid,
    required this.employeeId,
    required this.fullName,
    required this.departmentId,
    required this.departmentName,
    required this.email,
    required this.createdAt,
    required this.updatedAt,
  });

  factory FacultyModel.fromMap(Map<String, dynamic> map, String id) {
    return FacultyModel(
      uid: id,
      employeeId: map['employeeId'] ?? '',
      fullName: map['fullName'] ?? '',
      departmentId: map['departmentId'] ?? '',
      departmentName: map['departmentName'] ?? '',
      email: map['email'] ?? '',
      createdAt: map['createdAt'] != null ? DateTime.tryParse(map['createdAt'].toString()) ?? DateTime.now() : DateTime.now(),
      updatedAt: map['updatedAt'] != null ? DateTime.tryParse(map['updatedAt'].toString()) ?? DateTime.now() : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'uid': uid,
      'employeeId': employeeId,
      'fullName': fullName,
      'departmentId': departmentId,
      'departmentName': departmentName,
      'email': email,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

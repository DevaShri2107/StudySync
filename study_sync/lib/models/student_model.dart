class StudentModel {
  final String uid;
  final String registerNumber;
  final String fullName;
  final String departmentId;
  final String departmentName;
  final String yearId;
  final String yearName;
  final String sectionId;
  final String sectionName;
  final String email;
  final DateTime createdAt;
  final DateTime updatedAt;

  StudentModel({
    required this.uid,
    required this.registerNumber,
    required this.fullName,
    required this.departmentId,
    required this.departmentName,
    required this.yearId,
    required this.yearName,
    required this.sectionId,
    required this.sectionName,
    required this.email,
    required this.createdAt,
    required this.updatedAt,
  });

  factory StudentModel.fromMap(Map<String, dynamic> map, String id) {
    return StudentModel(
      uid: id,
      registerNumber: map['registerNumber'] ?? '',
      fullName: map['fullName'] ?? '',
      departmentId: map['departmentId'] ?? '',
      departmentName: map['departmentName'] ?? '',
      yearId: map['yearId'] ?? '',
      yearName: map['yearName'] ?? '',
      sectionId: map['sectionId'] ?? '',
      sectionName: map['sectionName'] ?? '',
      email: map['email'] ?? '',
      createdAt: map['createdAt'] != null ? DateTime.tryParse(map['createdAt'].toString()) ?? DateTime.now() : DateTime.now(),
      updatedAt: map['updatedAt'] != null ? DateTime.tryParse(map['updatedAt'].toString()) ?? DateTime.now() : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'uid': uid,
      'registerNumber': registerNumber,
      'fullName': fullName,
      'departmentId': departmentId,
      'departmentName': departmentName,
      'yearId': yearId,
      'yearName': yearName,
      'sectionId': sectionId,
      'sectionName': sectionName,
      'email': email,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

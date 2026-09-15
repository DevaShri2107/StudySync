class DepartmentModel {
  final String id;
  final String name;
  final String code;

  DepartmentModel({required this.id, required this.name, required this.code});

  factory DepartmentModel.fromMap(Map<String, dynamic> map, String id) {
    return DepartmentModel(
      id: id,
      name: map['name'] ?? '',
      code: map['code'] ?? '',
    );
  }

  Map<String, dynamic> toMap() => {'name': name, 'code': code};
}

class AcademicYearModel {
  final String id;
  final String name; // e.g. "I Year", "II Year", "III Year", "IV Year"
  final String departmentId;

  AcademicYearModel({required this.id, required this.name, required this.departmentId});

  factory AcademicYearModel.fromMap(Map<String, dynamic> map, String id) {
    return AcademicYearModel(
      id: id,
      name: map['name'] ?? '',
      departmentId: map['departmentId'] ?? '',
    );
  }

  Map<String, dynamic> toMap() => {'name': name, 'departmentId': departmentId};
}

class SectionModel {
  final String id;
  final String name; // e.g. "Section A", "Section B"
  final String departmentId;
  final String yearId;

  SectionModel({required this.id, required this.name, required this.departmentId, required this.yearId});

  factory SectionModel.fromMap(Map<String, dynamic> map, String id) {
    return SectionModel(
      id: id,
      name: map['name'] ?? '',
      departmentId: map['departmentId'] ?? '',
      yearId: map['yearId'] ?? '',
    );
  }

  Map<String, dynamic> toMap() => {
    'name': name,
    'departmentId': departmentId,
    'yearId': yearId,
  };
}

class SubjectModel {
  final String id;
  final String name;
  final String code;
  final String departmentId;
  final String yearId;

  SubjectModel({
    required this.id,
    required this.name,
    required this.code,
    required this.departmentId,
    required this.yearId,
  });

  factory SubjectModel.fromMap(Map<String, dynamic> map, String id) {
    return SubjectModel(
      id: id,
      name: map['name'] ?? '',
      code: map['code'] ?? '',
      departmentId: map['departmentId'] ?? '',
      yearId: map['yearId'] ?? '',
    );
  }

  Map<String, dynamic> toMap() => {
    'name': name,
    'code': code,
    'departmentId': departmentId,
    'yearId': yearId,
  };
}

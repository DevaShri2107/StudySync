class StudySessionModel {
  final String sessionId;
  final String topic;
  final String description;
  final String subject;
  final String date; // YYYY-MM-DD
  final String startTime;
  final String endTime;
  final String departmentId;
  final String yearId;
  final String sectionId;
  final String facultyId;
  final String facultyName;
  final String meetLink;
  final String? meetingId;
  final String? calendarEventId;
  final DateTime createdAt;

  StudySessionModel({
    required this.sessionId,
    required this.topic,
    required this.description,
    required this.subject,
    required this.date,
    required this.startTime,
    required this.endTime,
    required this.departmentId,
    required this.yearId,
    required this.sectionId,
    required this.facultyId,
    required this.facultyName,
    required this.meetLink,
    this.meetingId,
    this.calendarEventId,
    required this.createdAt,
  });

  factory StudySessionModel.fromMap(Map<String, dynamic> map, String id) {
    return StudySessionModel(
      sessionId: id,
      topic: map['topic'] ?? '',
      description: map['description'] ?? '',
      subject: map['subject'] ?? '',
      date: map['date'] ?? '',
      startTime: map['startTime'] ?? '',
      endTime: map['endTime'] ?? '',
      departmentId: map['departmentId'] ?? '',
      yearId: map['yearId'] ?? '',
      sectionId: map['sectionId'] ?? '',
      facultyId: map['facultyId'] ?? '',
      facultyName: map['facultyName'] ?? '',
      meetLink: map['meetLink'] ?? '',
      meetingId: map['meetingId'],
      calendarEventId: map['calendarEventId'],
      createdAt: map['createdAt'] != null ? DateTime.tryParse(map['createdAt'].toString()) ?? DateTime.now() : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'topic': topic,
      'description': description,
      'subject': subject,
      'date': date,
      'startTime': startTime,
      'endTime': endTime,
      'departmentId': departmentId,
      'yearId': yearId,
      'sectionId': sectionId,
      'facultyId': facultyId,
      'facultyName': facultyName,
      'meetLink': meetLink,
      'meetingId': meetingId,
      'calendarEventId': calendarEventId,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}

class PlannerTaskModel {
  final String taskId;
  final String studentId;
  final String title;
  final String description;
  final String date; // YYYY-MM-DD
  final String startTime;
  final String endTime;
  final String priority; // 'High', 'Medium', 'Low'
  final bool completed;
  final String? calendarEventId;
  final DateTime createdAt;
  final DateTime updatedAt;

  PlannerTaskModel({
    required this.taskId,
    required this.studentId,
    required this.title,
    required this.description,
    required this.date,
    required this.startTime,
    required this.endTime,
    required this.priority,
    required this.completed,
    this.calendarEventId,
    required this.createdAt,
    required this.updatedAt,
  });

  factory PlannerTaskModel.fromMap(Map<String, dynamic> map, String id) {
    return PlannerTaskModel(
      taskId: id,
      studentId: map['studentId'] ?? '',
      title: map['title'] ?? '',
      description: map['description'] ?? '',
      date: map['date'] ?? '',
      startTime: map['startTime'] ?? '',
      endTime: map['endTime'] ?? '',
      priority: map['priority'] ?? 'Medium',
      completed: map['completed'] ?? false,
      calendarEventId: map['calendarEventId'],
      createdAt: map['createdAt'] != null ? DateTime.tryParse(map['createdAt'].toString()) ?? DateTime.now() : DateTime.now(),
      updatedAt: map['updatedAt'] != null ? DateTime.tryParse(map['updatedAt'].toString()) ?? DateTime.now() : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'studentId': studentId,
      'title': title,
      'description': description,
      'date': date,
      'startTime': startTime,
      'endTime': endTime,
      'priority': priority,
      'completed': completed,
      'calendarEventId': calendarEventId,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

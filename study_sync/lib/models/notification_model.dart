class AppNotificationModel {
  final String id;
  final String title;
  final String message;
  final String type; // 'Assignment', 'Attendance', 'Announcement', 'Study Session', 'General Updates'
  final String recipientId; // uid or 'all'
  final bool isRead;
  final DateTime createdAt;

  AppNotificationModel({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    required this.recipientId,
    required this.isRead,
    required this.createdAt,
  });

  factory AppNotificationModel.fromMap(Map<String, dynamic> map, String id) {
    return AppNotificationModel(
      id: id,
      title: map['title'] ?? '',
      message: map['message'] ?? '',
      type: map['type'] ?? 'General Updates',
      recipientId: map['recipientId'] ?? 'all',
      isRead: map['isRead'] ?? false,
      createdAt: map['createdAt'] != null ? DateTime.tryParse(map['createdAt'].toString()) ?? DateTime.now() : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'title': title,
      'message': message,
      'type': type,
      'recipientId': recipientId,
      'isRead': isRead,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}

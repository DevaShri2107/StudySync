import 'package:flutter/material.dart';
import '../../../core/services/firestore_service.dart';
import '../../../models/notification_model.dart';

class NotificationsScreen extends StatelessWidget {
  final String userId;

  const NotificationsScreen({super.key, required this.userId});

  @override
  Widget build(BuildContext context) {
    final firestoreService = FirestoreService();

    return Scaffold(
      appBar: AppBar(title: const Text('Notifications')),
      body: StreamBuilder<List<AppNotificationModel>>(
        stream: firestoreService.getNotifications(userId),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          final notifications = snapshot.data ?? [];
          if (notifications.isEmpty) {
            return const Center(
              child: Text('No new notifications.'),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(12),
            itemCount: notifications.length,
            itemBuilder: (ctx, i) {
              final n = notifications[i];
              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: Colors.indigo.shade50,
                    child: Icon(
                      n.type == 'Assignment'
                          ? Icons.assignment_outlined
                          : n.type == 'Attendance'
                              ? Icons.pie_chart_outline
                              : Icons.notifications_active_outlined,
                      color: Colors.indigo,
                      size: 20,
                    ),
                  ),
                  title: Text(n.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  subtitle: Text(n.message),
                  trailing: Text(
                    '${n.createdAt.day}/${n.createdAt.month}',
                    style: TextStyle(color: Colors.grey.shade600, fontSize: 11),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}

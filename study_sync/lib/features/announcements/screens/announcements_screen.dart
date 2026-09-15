import 'package:flutter/material.dart';
import '../../../core/services/firestore_service.dart';
import '../../../core/services/gmail_service.dart';
import '../../../models/faculty_model.dart';
import '../../../models/academic_models.dart';
import '../../../models/announcement_model.dart';
import '../../../models/notification_model.dart';

class AnnouncementsScreen extends StatefulWidget {
  final bool isFaculty;
  final FacultyModel? faculty;
  final AcademicYearModel? year;
  final SectionModel? section;
  final String? departmentId;
  final String? yearId;
  final String? sectionId;

  const AnnouncementsScreen({
    super.key,
    required this.isFaculty,
    this.faculty,
    this.year,
    this.section,
    this.departmentId,
    this.yearId,
    this.sectionId,
  });

  @override
  State<AnnouncementsScreen> createState() => _AnnouncementsScreenState();
}

class _AnnouncementsScreenState extends State<AnnouncementsScreen> {
  final _firestoreService = FirestoreService();

  String get _deptId => widget.isFaculty ? widget.faculty!.departmentId : widget.departmentId!;
  String get _yId => widget.isFaculty ? widget.year!.id : widget.yearId!;
  String get _secId => widget.isFaculty ? widget.section!.id : widget.sectionId!;

  void _showPostDialog() {
    final titleCtrl = TextEditingController();
    final messageCtrl = TextEditingController();
    bool sendEmail = false;
    bool isPosting = false;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Post Class Circular / Announcement'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(controller: titleCtrl, decoration: const InputDecoration(labelText: 'Title *')),
                const SizedBox(height: 12),
                TextField(controller: messageCtrl, maxLines: 4, decoration: const InputDecoration(labelText: 'Message Body *')),
                const SizedBox(height: 12),
                CheckboxListTile(
                  title: const Text('Send Alert via Gmail', style: TextStyle(fontSize: 13)),
                  subtitle: const Text('Dispatches email to students in class section', style: TextStyle(fontSize: 11)),
                  value: sendEmail,
                  contentPadding: EdgeInsets.zero,
                  onChanged: (val) => setDialogState(() => sendEmail = val ?? false),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: isPosting
                  ? null
                  : () async {
                      if (titleCtrl.text.isEmpty || messageCtrl.text.isEmpty) return;
                      setDialogState(() => isPosting = true);

                      try {
                        final announcement = AnnouncementModel(
                          id: '',
                          title: titleCtrl.text.trim(),
                          message: messageCtrl.text.trim(),
                          departmentId: _deptId,
                          yearId: _yId,
                          sectionId: _secId,
                          facultyId: widget.faculty!.uid,
                          facultyName: widget.faculty!.fullName,
                          emailSent: sendEmail,
                          createdAt: DateTime.now(),
                        );

                        await _firestoreService.postAnnouncement(announcement);

                        // Also send In-App Notification
                        await _firestoreService.sendNotification(
                          AppNotificationModel(
                            id: '',
                            title: 'Announcement: ${titleCtrl.text.trim()}',
                            message: messageCtrl.text.trim(),
                            type: 'Announcement',
                            recipientId: 'all',
                            isRead: false,
                            createdAt: DateTime.now(),
                          ),
                        );

                        // If Gmail requested, fetch students and dispatch
                        if (sendEmail) {
                          final studentsStream = _firestoreService.getStudentsForClass(
                            departmentId: _deptId,
                            yearId: _yId,
                            sectionId: _secId,
                          );
                          final students = await studentsStream.first;
                          for (final student in students) {
                            try {
                              await GmailService.sendEmail(
                                recipientEmail: student.email,
                                subject: 'StudySync Notice: ${titleCtrl.text.trim()}',
                                bodyText: '${messageCtrl.text.trim()}\n\n--\nPosted by ${widget.faculty!.fullName}',
                              );
                            } catch (_) {}
                          }
                        }

                        if (context.mounted) Navigator.pop(ctx);
                      } catch (e) {
                        setDialogState(() => isPosting = false);
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error posting: $e')));
                        }
                      }
                    },
              child: isPosting
                  ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Text('Publish Circular'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Announcements & Circulars')),
      body: StreamBuilder<List<AnnouncementModel>>(
        stream: _firestoreService.getAnnouncementsForClass(
          departmentId: _deptId,
          yearId: _yId,
          sectionId: _secId,
        ),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          final announcements = snapshot.data ?? [];
          if (announcements.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.campaign_outlined, size: 64, color: Colors.grey),
                  const SizedBox(height: 12),
                  const Text('No announcements posted for this class yet.'),
                  if (widget.isFaculty) ...[
                    const SizedBox(height: 12),
                    ElevatedButton.icon(
                      icon: const Icon(Icons.add),
                      label: const Text('Post First Announcement'),
                      onPressed: _showPostDialog,
                    ),
                  ],
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(12),
            itemCount: announcements.length,
            itemBuilder: (ctx, i) {
              final a = announcements[i];
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(a.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          if (a.emailSent)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(color: Colors.green.shade50, borderRadius: BorderRadius.circular(4)),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.mail_outline, size: 12, color: Colors.green.shade800),
                                  const SizedBox(width: 4),
                                  Text('Sent via Gmail', style: TextStyle(fontSize: 10, color: Colors.green.shade800, fontWeight: FontWeight.bold)),
                                ],
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(a.message, style: TextStyle(fontSize: 14, color: Colors.grey.shade800)),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('By: ${a.facultyName}', style: TextStyle(fontSize: 12, color: Colors.grey.shade600, fontStyle: FontStyle.italic)),
                          Text(
                            '${a.createdAt.day}/${a.createdAt.month}/${a.createdAt.year}',
                            style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
      floatingActionButton: widget.isFaculty
          ? FloatingActionButton.extended(
              onPressed: _showPostDialog,
              icon: const Icon(Icons.add_comment_outlined),
              label: const Text('New Notice'),
            )
          : null,
    );
  }
}

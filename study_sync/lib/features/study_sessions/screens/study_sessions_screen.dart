import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/services/firestore_service.dart';
import '../../../core/services/google_meet_service.dart';
import '../../../models/faculty_model.dart';
import '../../../models/academic_models.dart';
import '../../../models/study_session_model.dart';

class StudySessionsScreen extends StatefulWidget {
  final bool isFaculty;
  final FacultyModel? faculty;
  final AcademicYearModel? year;
  final SectionModel? section;
  final String? departmentId;
  final String? yearId;
  final String? sectionId;

  const StudySessionsScreen({
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
  State<StudySessionsScreen> createState() => _StudySessionsScreenState();
}

class _StudySessionsScreenState extends State<StudySessionsScreen> {
  final _firestoreService = FirestoreService();

  String get _deptId => widget.isFaculty ? widget.faculty!.departmentId : widget.departmentId!;
  String get _yId => widget.isFaculty ? widget.year!.id : widget.yearId!;
  String get _secId => widget.isFaculty ? widget.section!.id : widget.sectionId!;

  void _showCreateSessionDialog() {
    final topicCtrl = TextEditingController();
    final subjectCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    DateTime sessionDate = DateTime.now();
    TimeOfDay startTime = const TimeOfDay(hour: 14, minute: 0);
    TimeOfDay endTime = const TimeOfDay(hour: 15, minute: 0);
    bool isCreating = false;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Schedule Live Study Session'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(controller: topicCtrl, decoration: const InputDecoration(labelText: 'Topic / Agenda *')),
                const SizedBox(height: 12),
                TextField(controller: subjectCtrl, decoration: const InputDecoration(labelText: 'Subject *')),
                const SizedBox(height: 12),
                TextField(controller: descCtrl, maxLines: 2, decoration: const InputDecoration(labelText: 'Description')),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () async {
                          final picked = await showDatePicker(
                            context: context,
                            initialDate: sessionDate,
                            firstDate: DateTime.now(),
                            lastDate: DateTime(2030),
                          );
                          if (picked != null) setDialogState(() => sessionDate = picked);
                        },
                        child: Text('${sessionDate.day}/${sessionDate.month}/${sessionDate.year}'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: TextButton(
                        onPressed: () async {
                          final t = await showTimePicker(context: context, initialTime: startTime);
                          if (t != null) setDialogState(() => startTime = t);
                        },
                        child: Text('Start: ${startTime.format(context)}'),
                      ),
                    ),
                    Expanded(
                      child: TextButton(
                        onPressed: () async {
                          final t = await showTimePicker(context: context, initialTime: endTime);
                          if (t != null) setDialogState(() => endTime = t);
                        },
                        child: Text('End: ${endTime.format(context)}'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: isCreating
                  ? null
                  : () async {
                      if (topicCtrl.text.isEmpty || subjectCtrl.text.isEmpty) return;
                      setDialogState(() => isCreating = true);

                      try {
                        final startDt = DateTime(sessionDate.year, sessionDate.month, sessionDate.day, startTime.hour, startTime.minute);
                        final endDt = DateTime(sessionDate.year, sessionDate.month, sessionDate.day, endTime.hour, endTime.minute);

                        // Official Google Meet Creation via Google Calendar API
                        final meetData = await GoogleMeetService.createMeeting(
                          topic: topicCtrl.text.trim(),
                          description: descCtrl.text.trim(),
                          startDateTime: startDt,
                          endDateTime: endDt,
                        );

                        final session = StudySessionModel(
                          sessionId: '',
                          topic: topicCtrl.text.trim(),
                          description: descCtrl.text.trim(),
                          subject: subjectCtrl.text.trim(),
                          date: '${sessionDate.year}-${sessionDate.month.toString().padLeft(2, '0')}-${sessionDate.day.toString().padLeft(2, '0')}',
                          startTime: startTime.format(context),
                          endTime: endTime.format(context),
                          departmentId: _deptId,
                          yearId: _yId,
                          sectionId: _secId,
                          facultyId: widget.faculty!.uid,
                          facultyName: widget.faculty!.fullName,
                          meetLink: meetData['meetUrl'] ?? 'https://meet.google.com',
                          meetingId: meetData['meetingId'],
                          calendarEventId: meetData['calendarEventId'],
                          createdAt: DateTime.now(),
                        );

                        await _firestoreService.createStudySession(session);

                        if (context.mounted) Navigator.pop(ctx);
                      } catch (e) {
                        setDialogState(() => isCreating = false);
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Meet creation error: $e')));
                        }
                      }
                    },
              child: isCreating
                  ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Text('Generate Google Meet'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Live Study Sessions (Google Meet)')),
      body: StreamBuilder<List<StudySessionModel>>(
        stream: _firestoreService.getStudySessionsForClass(
          departmentId: _deptId,
          yearId: _yId,
          sectionId: _secId,
        ),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          final sessions = snapshot.data ?? [];
          if (sessions.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.video_call_outlined, size: 64, color: Colors.grey),
                  const SizedBox(height: 12),
                  const Text('No live virtual study sessions scheduled.'),
                  if (widget.isFaculty) ...[
                    const SizedBox(height: 12),
                    ElevatedButton.icon(
                      icon: const Icon(Icons.add),
                      label: const Text('Schedule Live Session'),
                      onPressed: _showCreateSessionDialog,
                    ),
                  ],
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(12),
            itemCount: sessions.length,
            itemBuilder: (ctx, i) {
              final s = sessions[i];
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
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(color: Colors.purple.shade50, borderRadius: BorderRadius.circular(4)),
                            child: Text(s.subject, style: const TextStyle(color: Colors.purple, fontWeight: FontWeight.bold, fontSize: 11)),
                          ),
                          Row(
                            children: [
                              const Icon(Icons.access_time, size: 14, color: Colors.grey),
                              const SizedBox(width: 4),
                              Text('${s.startTime} - ${s.endTime}', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(s.topic, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      if (s.description.isNotEmpty) ...[
                        const SizedBox(height: 4),
                        Text(s.description, style: TextStyle(fontSize: 13, color: Colors.grey.shade700)),
                      ],
                      const SizedBox(height: 8),
                      Text('Host: ${s.facultyName} • Date: ${s.date}', style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
                      const Divider(height: 20),
                      Align(
                        alignment: Alignment.centerRight,
                        child: ElevatedButton.icon(
                          icon: const Icon(Icons.video_camera_front_rounded, size: 18),
                          label: const Text('Join Google Meet'),
                          style: ElevatedButton.styleFrom(backgroundColor: Colors.purple),
                          onPressed: () async {
                            final uri = Uri.parse(s.meetLink);
                            if (await canLaunchUrl(uri)) {
                              await launchUrl(uri, mode: LaunchMode.externalApplication);
                            }
                          },
                        ),
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
              onPressed: _showCreateSessionDialog,
              icon: const Icon(Icons.video_call),
              label: const Text('Schedule Meet'),
            )
          : null,
    );
  }
}

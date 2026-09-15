import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/services/firestore_service.dart';
import '../../../core/services/google_drive_service.dart';
import '../../../models/student_model.dart';
import '../../../models/assignment_model.dart';
import '../../../models/submission_model.dart';

class StudentAssignmentsScreen extends StatefulWidget {
  final StudentModel student;

  const StudentAssignmentsScreen({super.key, required this.student});

  @override
  State<StudentAssignmentsScreen> createState() => _StudentAssignmentsScreenState();
}

class _StudentAssignmentsScreenState extends State<StudentAssignmentsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _firestoreService = FirestoreService();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _submitWork(AssignmentModel assignment) async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'doc', 'docx', 'zip', 'png', 'jpg'],
      withData: true,
    );

    if (result == null || result.files.isEmpty) return;
    final file = result.files.first;
    if (file.bytes == null) return;

    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Uploading ${file.name} to Google Drive...')),
    );

    try {
      final uploadResult = await GoogleDriveService.uploadFile(
        fileName: '${widget.student.registerNumber}_${assignment.title}_${file.name}',
        fileBytes: file.bytes!,
        mimeType: 'application/octet-stream',
        subFolderName: 'Submissions',
      );

      final submissionId = '${assignment.id}_${widget.student.uid}';
      final submission = AssignmentSubmissionModel(
        submissionId: submissionId,
        assignmentId: assignment.id,
        studentId: widget.student.uid,
        studentName: widget.student.fullName,
        registerNumber: widget.student.registerNumber,
        driveFileId: uploadResult['driveFileId'] ?? '',
        driveFileUrl: uploadResult['driveFileUrl'] ?? '',
        fileName: file.name,
        submittedAt: DateTime.now(),
        status: 'Submitted',
      );

      await _firestoreService.submitAssignment(submission);

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Assignment submitted successfully!'), backgroundColor: Colors.green),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Submission failed: $e'), backgroundColor: Colors.red),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Pending Tasks'),
            Tab(text: 'My Submissions'),
          ],
        ),
        Expanded(
          child: StreamBuilder<List<AssignmentModel>>(
            stream: _firestoreService.getAssignmentsForClass(
              departmentId: widget.student.departmentId,
              yearId: widget.student.yearId,
              sectionId: widget.student.sectionId,
            ),
            builder: (context, assignSnapshot) {
              if (assignSnapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              }

              final assignments = assignSnapshot.data ?? [];

              return StreamBuilder<List<AssignmentSubmissionModel>>(
                stream: _firestoreService.getStudentSubmissions(widget.student.uid),
                builder: (context, subSnapshot) {
                  final submissions = subSnapshot.data ?? [];
                  final submittedIds = submissions.map((s) => s.assignmentId).toSet();

                  final pendingList = assignments.where((a) => !submittedIds.contains(a.id)).toList();
                  final completedList = submissions;

                  return TabBarView(
                    controller: _tabController,
                    children: [
                      // Pending Tab
                      pendingList.isEmpty
                          ? const Center(child: Text('Great job! No pending assignments.'))
                          : ListView.builder(
                              padding: const EdgeInsets.all(12),
                              itemCount: pendingList.length,
                              itemBuilder: (ctx, i) {
                                final a = pendingList[i];
                                final isOverdue = a.isOverdue();

                                return Card(
                                  margin: const EdgeInsets.only(bottom: 12),
                                  child: Padding(
                                    padding: const EdgeInsets.all(14),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                          children: [
                                            Text(a.subjectName, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.indigo)),
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                              decoration: BoxDecoration(
                                                color: isOverdue ? Colors.red.shade100 : Colors.amber.shade100,
                                                borderRadius: BorderRadius.circular(4),
                                              ),
                                              child: Text(
                                                isOverdue ? 'Overdue' : 'Due: ${a.deadline}',
                                                style: TextStyle(
                                                  fontSize: 10,
                                                  fontWeight: FontWeight.bold,
                                                  color: isOverdue ? Colors.red.shade900 : Colors.amber.shade900,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 8),
                                        Text(a.title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                                        if (a.description.isNotEmpty) ...[
                                          const SizedBox(height: 4),
                                          Text(a.description, style: TextStyle(fontSize: 13, color: Colors.grey.shade700)),
                                        ],
                                        const SizedBox(height: 8),

                                        // Faculty Reference File if any
                                        if (a.driveFileUrl != null && a.driveFileUrl!.isNotEmpty) ...[
                                          InkWell(
                                            onTap: () async {
                                              final uri = Uri.parse(a.driveFileUrl!);
                                              if (await canLaunchUrl(uri)) launchUrl(uri, mode: LaunchMode.externalApplication);
                                            },
                                            child: Container(
                                              padding: const EdgeInsets.all(8),
                                              decoration: BoxDecoration(
                                                color: Colors.blue.shade50,
                                                borderRadius: BorderRadius.circular(6),
                                              ),
                                              child: Row(
                                                children: [
                                                  const Icon(Icons.file_present_rounded, color: Colors.blue, size: 18),
                                                  const SizedBox(width: 6),
                                                  Expanded(
                                                    child: Text(
                                                      a.fileName ?? 'Reference Material (Drive)',
                                                      style: const TextStyle(fontSize: 12, color: Colors.blue, fontWeight: FontWeight.bold),
                                                      overflow: TextOverflow.ellipsis,
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ),
                                          ),
                                          const SizedBox(height: 8),
                                        ],

                                        const Divider(height: 18),
                                        Align(
                                          alignment: Alignment.centerRight,
                                          child: ElevatedButton.icon(
                                            icon: const Icon(Icons.cloud_upload_outlined, size: 18),
                                            label: const Text('Submit Assignment'),
                                            onPressed: () => _submitWork(a),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                );
                              },
                            ),

                      // Submitted Tab
                      completedList.isEmpty
                          ? const Center(child: Text('No completed submissions yet.'))
                          : ListView.builder(
                              padding: const EdgeInsets.all(12),
                              itemCount: completedList.length,
                              itemBuilder: (ctx, i) {
                                final sub = completedList[i];
                                return Card(
                                  margin: const EdgeInsets.only(bottom: 10),
                                  child: ListTile(
                                    leading: const CircleAvatar(backgroundColor: Colors.teal, child: Icon(Icons.check, color: Colors.white)),
                                    title: Text(sub.fileName, style: const TextStyle(fontWeight: FontWeight.bold)),
                                    subtitle: Text(
                                      sub.status == 'Graded'
                                          ? 'Grade: ${sub.grade} • Feedback: ${sub.feedback ?? "None"}'
                                          : 'Status: Submitted • Awaiting evaluation',
                                    ),
                                    trailing: IconButton(
                                      icon: const Icon(Icons.open_in_new, color: Colors.blue),
                                      onPressed: () async {
                                        if (sub.driveFileUrl.isNotEmpty) {
                                          final uri = Uri.parse(sub.driveFileUrl);
                                          if (await canLaunchUrl(uri)) launchUrl(uri, mode: LaunchMode.externalApplication);
                                        }
                                      },
                                    ),
                                  ),
                                );
                              },
                            ),
                    ],
                  );
                },
              );
            },
          ),
        ),
      ],
    );
  }
}

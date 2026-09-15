import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/services/firestore_service.dart';
import '../../../models/assignment_model.dart';
import '../../../models/submission_model.dart';

class ViewSubmissionsScreen extends StatelessWidget {
  final AssignmentModel assignment;

  const ViewSubmissionsScreen({super.key, required this.assignment});

  void _openGradingDialog(BuildContext context, AssignmentSubmissionModel submission) {
    final gradeCtrl = TextEditingController(text: submission.grade ?? '');
    final feedbackCtrl = TextEditingController(text: submission.feedback ?? '');
    final firestoreService = FirestoreService();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Grade: ${submission.studentName}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: gradeCtrl, decoration: const InputDecoration(labelText: 'Grade / Score (e.g. A, 95/100)')),
            const SizedBox(height: 12),
            TextField(controller: feedbackCtrl, maxLines: 2, decoration: const InputDecoration(labelText: 'Feedback Comments')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              await firestoreService.gradeSubmission(
                submission.submissionId,
                gradeCtrl.text.trim(),
                feedbackCtrl.text.trim(),
              );
              if (context.mounted) Navigator.pop(ctx);
            },
            child: const Text('Submit Grade'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final firestoreService = FirestoreService();

    return Scaffold(
      appBar: AppBar(title: Text('Submissions: ${assignment.title}')),
      body: StreamBuilder<List<AssignmentSubmissionModel>>(
        stream: firestoreService.getSubmissionsForAssignment(assignment.id),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          final submissions = snapshot.data ?? [];
          if (submissions.isEmpty) {
            return const Center(
              child: Text('No submissions received yet for this assignment.'),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(12),
            itemCount: submissions.length,
            itemBuilder: (ctx, i) {
              final sub = submissions[i];
              return Card(
                margin: const EdgeInsets.only(bottom: 10),
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(sub.studentName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: sub.status == 'Graded' ? Colors.green.shade100 : Colors.blue.shade100,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              sub.status,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: sub.status == 'Graded' ? Colors.green.shade900 : Colors.blue.shade900,
                              ),
                            ),
                          ),
                        ],
                      ),
                      Text('Reg: ${sub.registerNumber}', style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
                      const SizedBox(height: 8),

                      // Google Drive File Attachment link
                      InkWell(
                        onTap: () async {
                          if (sub.driveFileUrl.isNotEmpty) {
                            final uri = Uri.parse(sub.driveFileUrl);
                            if (await canLaunchUrl(uri)) {
                              await launchUrl(uri, mode: LaunchMode.externalApplication);
                            }
                          }
                        },
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.grey.shade100,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.grey.shade300),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.cloud_download_outlined, color: Colors.blue, size: 20),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  sub.fileName.isNotEmpty ? sub.fileName : 'View Google Drive File',
                                  style: const TextStyle(color: Colors.blue, fontWeight: FontWeight.w600, fontSize: 12),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      if (sub.grade != null && sub.grade!.isNotEmpty) ...[
                        const SizedBox(height: 8),
                        Text('Grade: ${sub.grade} | Notes: ${sub.feedback ?? 'None'}',
                            style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.green)),
                      ],

                      const Divider(height: 18),
                      Align(
                        alignment: Alignment.centerRight,
                        child: ElevatedButton.icon(
                          icon: const Icon(Icons.rate_review_outlined, size: 16),
                          label: Text(sub.status == 'Graded' ? 'Edit Grade' : 'Grade Submission'),
                          onPressed: () => _openGradingDialog(context, sub),
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
    );
  }
}

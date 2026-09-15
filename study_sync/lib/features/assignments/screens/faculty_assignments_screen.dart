import 'package:flutter/material.dart';
import '../../../core/services/firestore_service.dart';
import '../../../models/faculty_model.dart';
import '../../../models/academic_models.dart';
import '../../../models/assignment_model.dart';
import 'create_assignment_dialog.dart';
import 'view_submissions_screen.dart';

class FacultyAssignmentsScreen extends StatefulWidget {
  final FacultyModel faculty;
  final AcademicYearModel year;
  final SectionModel section;

  const FacultyAssignmentsScreen({
    super.key,
    required this.faculty,
    required this.year,
    required this.section,
  });

  @override
  State<FacultyAssignmentsScreen> createState() => _FacultyAssignmentsScreenState();
}

class _FacultyAssignmentsScreenState extends State<FacultyAssignmentsScreen> {
  final _firestoreService = FirestoreService();

  void _openCreateDialog() async {
    final res = await showDialog(
      context: context,
      builder: (_) => CreateAssignmentDialog(
        faculty: widget.faculty,
        year: widget.year,
        section: widget.section,
      ),
    );
    if (res == true) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Assignment created successfully!'), backgroundColor: Colors.green),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: StreamBuilder<List<AssignmentModel>>(
        stream: _firestoreService.getAssignmentsForClass(
          departmentId: widget.faculty.departmentId,
          yearId: widget.year.id,
          sectionId: widget.section.id,
        ),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          final assignments = snapshot.data ?? [];
          if (assignments.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.assignment_late_outlined, size: 60, color: Colors.grey),
                  const SizedBox(height: 12),
                  const Text('No assignments posted for this class yet.'),
                  const SizedBox(height: 12),
                  ElevatedButton.icon(
                    icon: const Icon(Icons.add),
                    label: const Text('Create First Assignment'),
                    onPressed: _openCreateDialog,
                  ),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(12),
            itemCount: assignments.length,
            itemBuilder: (ctx, i) {
              final a = assignments[i];
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
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(color: Colors.indigo.shade50, borderRadius: BorderRadius.circular(4)),
                            child: Text(a.subjectName, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.indigo)),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: a.priority == 'High' ? Colors.red.shade100 : Colors.amber.shade100,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              '${a.priority} Priority',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: a.priority == 'High' ? Colors.red.shade900 : Colors.amber.shade900,
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
                      Row(
                        children: [
                          Icon(Icons.calendar_today, size: 14, color: Colors.grey.shade600),
                          const SizedBox(width: 4),
                          Text('Due Date: ${a.deadline}', style: TextStyle(fontSize: 12, color: Colors.grey.shade700)),
                        ],
                      ),
                      const Divider(height: 20),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          TextButton.icon(
                            icon: const Icon(Icons.people_outline, size: 18),
                            label: const Text('View Submissions'),
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (_) => ViewSubmissionsScreen(assignment: a)),
                              );
                            },
                          ),
                          IconButton(
                            icon: const Icon(Icons.delete_outline, color: Colors.red),
                            tooltip: 'Delete Assignment',
                            onPressed: () async {
                              final confirm = await showDialog<bool>(
                                context: context,
                                builder: (c) => AlertDialog(
                                  title: const Text('Delete Assignment'),
                                  content: const Text('Are you sure you want to remove this assignment?'),
                                  actions: [
                                    TextButton(onPressed: () => Navigator.pop(c, false), child: const Text('Cancel')),
                                    ElevatedButton(
                                      style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                                      onPressed: () => Navigator.pop(c, true),
                                      child: const Text('Delete'),
                                    ),
                                  ],
                                ),
                              );
                              if (confirm == true) {
                                await _firestoreService.deleteAssignment(a.id);
                              }
                            },
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
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openCreateDialog,
        icon: const Icon(Icons.add),
        label: const Text('New Assignment'),
      ),
    );
  }
}

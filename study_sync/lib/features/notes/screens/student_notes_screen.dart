import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/services/firestore_service.dart';
import '../../../models/student_model.dart';
import '../../../models/note_model.dart';

class StudentNotesScreen extends StatelessWidget {
  final StudentModel student;

  const StudentNotesScreen({super.key, required this.student});

  @override
  Widget build(BuildContext context) {
    final firestoreService = FirestoreService();

    return StreamBuilder<List<NoteModel>>(
      stream: firestoreService.getNotesForClass(
        departmentId: student.departmentId,
        yearId: student.yearId,
        sectionId: student.sectionId,
      ),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        final notes = snapshot.data ?? [];
        if (notes.isEmpty) {
          return const Center(
            child: Text('No class notes uploaded yet by your faculty.'),
          );
        }

        return ListView.builder(
          padding: const EdgeInsets.all(12),
          itemCount: notes.length,
          itemBuilder: (ctx, i) {
            final note = notes[i];
            return Card(
              margin: const EdgeInsets.only(bottom: 10),
              child: ListTile(
                leading: const CircleAvatar(
                  backgroundColor: Colors.blue,
                  child: Icon(Icons.description_outlined, color: Colors.white),
                ),
                title: Text(note.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                subtitle: Text('${note.subjectName}\nFaculty: ${note.facultyName} • File: ${note.fileName}'),
                isThreeLine: true,
                trailing: ElevatedButton.icon(
                  icon: const Icon(Icons.open_in_new, size: 16),
                  label: const Text('Read Note'),
                  onPressed: () async {
                    if (note.driveFileUrl.isNotEmpty) {
                      final uri = Uri.parse(note.driveFileUrl);
                      if (await canLaunchUrl(uri)) {
                        await launchUrl(uri, mode: LaunchMode.externalApplication);
                      }
                    }
                  },
                ),
              ),
            );
          },
        );
      },
    );
  }
}

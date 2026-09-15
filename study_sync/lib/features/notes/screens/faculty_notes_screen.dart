import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/services/firestore_service.dart';
import '../../../core/services/google_drive_service.dart';
import '../../../models/faculty_model.dart';
import '../../../models/academic_models.dart';
import '../../../models/note_model.dart';

class FacultyNotesScreen extends StatefulWidget {
  final FacultyModel faculty;
  final AcademicYearModel year;
  final SectionModel section;

  const FacultyNotesScreen({
    super.key,
    required this.faculty,
    required this.year,
    required this.section,
  });

  @override
  State<FacultyNotesScreen> createState() => _FacultyNotesScreenState();
}

class _FacultyNotesScreenState extends State<FacultyNotesScreen> {
  final _firestoreService = FirestoreService();

  void _showUploadNoteDialog() {
    final titleCtrl = TextEditingController();
    SubjectModel? selectedSubject;
    PlatformFile? pickedFile;
    bool isUploading = false;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Upload Lecture Notes'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                TextField(
                  controller: titleCtrl,
                  decoration: const InputDecoration(labelText: 'Note Title * (e.g. Unit 1 Operating Systems)'),
                ),
                const SizedBox(height: 12),
                StreamBuilder<List<SubjectModel>>(
                  stream: _firestoreService.getSubjects(widget.faculty.departmentId, widget.year.id),
                  builder: (context, snap) {
                    final subjects = snap.data ?? [];
                    return DropdownButtonFormField<SubjectModel>(
                      value: selectedSubject,
                      hint: const Text('Select Subject *'),
                      items: subjects.map((s) => DropdownMenuItem(value: s, child: Text(s.name))).toList(),
                      onChanged: (val) => setDialogState(() => selectedSubject = val),
                    );
                  },
                ),
                const SizedBox(height: 16),
                OutlinedButton.icon(
                  icon: const Icon(Icons.attach_file),
                  label: Text(pickedFile != null ? pickedFile!.name : 'Choose PDF/Doc from device'),
                  onPressed: () async {
                    final res = await FilePicker.platform.pickFiles(
                      type: FileType.custom,
                      allowedExtensions: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'zip'],
                      withData: true,
                    );
                    if (res != null && res.files.isNotEmpty) {
                      setDialogState(() => pickedFile = res.files.first);
                    }
                  },
                ),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: isUploading
                  ? null
                  : () async {
                      if (titleCtrl.text.isEmpty || selectedSubject == null || pickedFile == null || pickedFile!.bytes == null) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Please fill all fields and select a file.')),
                        );
                        return;
                      }

                      setDialogState(() => isUploading = true);

                      try {
                        final upload = await GoogleDriveService.uploadFile(
                          fileName: pickedFile!.name,
                          fileBytes: pickedFile!.bytes!,
                          mimeType: 'application/octet-stream',
                          subFolderName: 'Notes',
                        );

                        final note = NoteModel(
                          noteId: '',
                          title: titleCtrl.text.trim(),
                          subjectId: selectedSubject!.id,
                          subjectName: selectedSubject!.name,
                          departmentId: widget.faculty.departmentId,
                          yearId: widget.year.id,
                          sectionId: widget.section.id,
                          facultyId: widget.faculty.uid,
                          facultyName: widget.faculty.fullName,
                          driveFileId: upload['driveFileId'] ?? '',
                          driveFileUrl: upload['driveFileUrl'] ?? '',
                          fileName: pickedFile!.name,
                          fileType: pickedFile!.extension ?? 'PDF',
                          createdAt: DateTime.now(),
                          updatedAt: DateTime.now(),
                        );

                        await _firestoreService.uploadNote(note);

                        if (context.mounted) Navigator.pop(ctx);
                      } catch (e) {
                        setDialogState(() => isUploading = false);
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Upload failed: $e')));
                        }
                      }
                    },
              child: isUploading
                  ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Text('Upload to Google Drive'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: StreamBuilder<List<NoteModel>>(
        stream: _firestoreService.getNotesForClass(
          departmentId: widget.faculty.departmentId,
          yearId: widget.year.id,
          sectionId: widget.section.id,
        ),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          final notes = snapshot.data ?? [];
          if (notes.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.menu_book_outlined, size: 60, color: Colors.grey),
                  const SizedBox(height: 12),
                  const Text('No notes uploaded for this class section yet.'),
                  const SizedBox(height: 12),
                  ElevatedButton.icon(
                    icon: const Icon(Icons.cloud_upload_outlined),
                    label: const Text('Upload First Note to Drive'),
                    onPressed: _showUploadNoteDialog,
                  ),
                ],
              ),
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
                    child: Icon(Icons.picture_as_pdf_outlined, color: Colors.white),
                  ),
                  title: Text(note.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text('${note.subjectName} • ${note.fileName}'),
                  trailing: IconButton(
                    icon: const Icon(Icons.open_in_new, color: Colors.blue),
                    tooltip: 'Open in Google Drive',
                    onPressed: () async {
                      if (note.driveFileUrl.isNotEmpty) {
                        final uri = Uri.parse(note.driveFileUrl);
                        if (await canLaunchUrl(uri)) launchUrl(uri, mode: LaunchMode.externalApplication);
                      }
                    },
                  ),
                ),
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showUploadNoteDialog,
        icon: const Icon(Icons.cloud_upload_outlined),
        label: const Text('Upload Note'),
      ),
    );
  }
}

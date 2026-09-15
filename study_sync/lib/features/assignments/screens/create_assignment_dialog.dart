import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import '../../../core/services/firestore_service.dart';
import '../../../core/services/google_drive_service.dart';
import '../../../models/faculty_model.dart';
import '../../../models/academic_models.dart';
import '../../../models/assignment_model.dart';

class CreateAssignmentDialog extends StatefulWidget {
  final FacultyModel faculty;
  final AcademicYearModel year;
  final SectionModel section;

  const CreateAssignmentDialog({
    super.key,
    required this.faculty,
    required this.year,
    required this.section,
  });

  @override
  State<CreateAssignmentDialog> createState() => _CreateAssignmentDialogState();
}

class _CreateAssignmentDialogState extends State<CreateAssignmentDialog> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  final _firestoreService = FirestoreService();

  SubjectModel? _selectedSubject;
  DateTime _deadline = DateTime.now().add(const Duration(days: 7));
  String _priority = 'Medium';

  PlatformFile? _pickedFile;
  bool _isUploading = false;

  Future<void> _pickFile() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'doc', 'docx', 'zip', 'png', 'jpg'],
      withData: true,
    );
    if (result != null && result.files.isNotEmpty) {
      setState(() => _pickedFile = result.files.first);
    }
  }

  Future<void> _handleSave() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedSubject == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please select a subject.')));
      return;
    }

    setState(() => _isUploading = true);

    try {
      String? driveFileId;
      String? driveFileUrl;
      String? fileName;

      // Real Google Drive upload if file is attached
      if (_pickedFile != null && _pickedFile!.bytes != null) {
        final uploadResult = await GoogleDriveService.uploadFile(
          fileName: _pickedFile!.name,
          fileBytes: _pickedFile!.bytes!,
          mimeType: 'application/octet-stream',
          subFolderName: 'Assignments',
        );
        driveFileId = uploadResult['driveFileId'];
        driveFileUrl = uploadResult['driveFileUrl'];
        fileName = _pickedFile!.name;
      }

      final dateStr = '${_deadline.year}-${_deadline.month.toString().padLeft(2, '0')}-${_deadline.day.toString().padLeft(2, '0')}';

      final assignment = AssignmentModel(
        id: '',
        title: _titleController.text.trim(),
        subjectId: _selectedSubject!.id,
        subjectName: _selectedSubject!.name,
        description: _descController.text.trim(),
        deadline: dateStr,
        priority: _priority,
        departmentId: widget.faculty.departmentId,
        yearId: widget.year.id,
        sectionId: widget.section.id,
        facultyId: widget.faculty.uid,
        facultyName: widget.faculty.fullName,
        driveFileId: driveFileId,
        driveFileUrl: driveFileUrl,
        fileName: fileName,
        fileType: _pickedFile?.extension,
        createdAt: DateTime.now(),
      );

      await _firestoreService.createAssignment(assignment);

      if (!mounted) return;
      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
      );
    } finally {
      if (mounted) setState(() => _isUploading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('New Assignment'),
      content: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                controller: _titleController,
                decoration: const InputDecoration(labelText: 'Assignment Title *'),
                validator: (v) => v == null || v.trim().isEmpty ? 'Title is required' : null,
              ),
              const SizedBox(height: 12),

              // Subject Dropdown
              StreamBuilder<List<SubjectModel>>(
                stream: _firestoreService.getSubjects(widget.faculty.departmentId, widget.year.id),
                builder: (context, snapshot) {
                  final subjects = snapshot.data ?? [];
                  return DropdownButtonFormField<SubjectModel>(
                    value: _selectedSubject,
                    hint: const Text('Select Subject *'),
                    items: subjects.map((s) => DropdownMenuItem(value: s, child: Text(s.name))).toList(),
                    onChanged: (val) => setState(() => _selectedSubject = val),
                    validator: (v) => v == null ? 'Subject is required' : null,
                  );
                },
              ),
              const SizedBox(height: 12),

              TextFormField(
                controller: _descController,
                maxLines: 3,
                decoration: const InputDecoration(labelText: 'Description / Instructions'),
              ),
              const SizedBox(height: 12),

              // Priority and Deadline
              Row(
                children: [
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      value: _priority,
                      decoration: const InputDecoration(labelText: 'Priority'),
                      items: ['High', 'Medium', 'Low'].map((p) => DropdownMenuItem(value: p, child: Text(p))).toList(),
                      onChanged: (val) => setState(() => _priority = val!),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () async {
                        final picked = await showDatePicker(
                          context: context,
                          initialDate: _deadline,
                          firstDate: DateTime.now(),
                          lastDate: DateTime(2030),
                        );
                        if (picked != null) setState(() => _deadline = picked);
                      },
                      child: Text('Due: ${_deadline.day}/${_deadline.month}'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // File Attachment button (Google Drive)
              OutlinedButton.icon(
                icon: const Icon(Icons.attach_file),
                label: Text(_pickedFile != null ? _pickedFile!.name : 'Attach Reference File (Drive)'),
                onPressed: _pickFile,
              ),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
        ElevatedButton(
          onPressed: _isUploading ? null : _handleSave,
          child: _isUploading
              ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
              : const Text('Publish Assignment'),
        ),
      ],
    );
  }
}

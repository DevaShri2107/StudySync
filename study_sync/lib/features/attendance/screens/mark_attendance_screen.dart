import 'package:flutter/material.dart';
import '../../../core/services/firestore_service.dart';
import '../../../models/faculty_model.dart';
import '../../../models/academic_models.dart';
import '../../../models/student_model.dart';
import '../../../core/constants/app_constants.dart';

class MarkAttendanceScreen extends StatefulWidget {
  final FacultyModel faculty;
  final AcademicYearModel year;
  final SectionModel section;

  const MarkAttendanceScreen({
    super.key,
    required this.faculty,
    required this.year,
    required this.section,
  });

  @override
  State<MarkAttendanceScreen> createState() => _MarkAttendanceScreenState();
}

class _MarkAttendanceScreenState extends State<MarkAttendanceScreen> {
  final _firestoreService = FirestoreService();
  DateTime _selectedDate = DateTime.now();
  SubjectModel? _selectedSubject;
  final Map<String, String> _attendanceMap = {}; // studentId -> 'Present' / 'Absent'
  bool _isSaving = false;

  String _formatDate(DateTime dt) {
    return '${dt.year}-${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')}';
  }

  Future<void> _saveAttendance(List<StudentModel> students) async {
    if (_selectedSubject == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please select a subject first.')));
      return;
    }

    setState(() => _isSaving = true);

    try {
      final dateStr = _formatDate(_selectedDate);
      await _firestoreService.saveAttendanceSession(
        date: dateStr,
        subjectId: _selectedSubject!.id,
        subjectName: _selectedSubject!.name,
        departmentId: widget.faculty.departmentId,
        departmentName: widget.faculty.departmentName,
        yearId: widget.year.id,
        yearName: widget.year.name,
        sectionId: widget.section.id,
        sectionName: widget.section.name,
        facultyId: widget.faculty.uid,
        facultyName: widget.faculty.fullName,
        studentStatuses: _attendanceMap,
        students: students,
      );

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Attendance recorded for ${students.length} students.'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error saving attendance: $e'), backgroundColor: Colors.red),
      );
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          // Filter Header Card
          Card(
            margin: const EdgeInsets.all(12),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                children: [
                  Row(
                    children: [
                      // Date Picker Button
                      Expanded(
                        child: OutlinedButton.icon(
                          icon: const Icon(Icons.calendar_today, size: 18),
                          label: Text(_formatDate(_selectedDate)),
                          onPressed: () async {
                            final picked = await showDatePicker(
                              context: context,
                              initialDate: _selectedDate,
                              firstDate: DateTime(2023),
                              lastDate: DateTime(2030),
                            );
                            if (picked != null) setState(() => _selectedDate = picked);
                          },
                        ),
                      ),
                      const SizedBox(width: 12),
                      // Subject Picker
                      Expanded(
                        child: StreamBuilder<List<SubjectModel>>(
                          stream: _firestoreService.getSubjects(widget.faculty.departmentId, widget.year.id),
                          builder: (context, snapshot) {
                            final subjects = snapshot.data ?? [];
                            return DropdownButtonFormField<SubjectModel>(
                              value: _selectedSubject,
                              isExpanded: true,
                              hint: const Text('Subject'),
                              items: subjects.map((s) => DropdownMenuItem(value: s, child: Text(s.name, overflow: TextOverflow.ellipsis))).toList(),
                              onChanged: (val) => setState(() => _selectedSubject = val),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Class: ${widget.year.name} • ${widget.section.name}',
                    style: TextStyle(color: Colors.grey.shade700, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          ),

          // Students Roster
          Expanded(
            child: StreamBuilder<List<StudentModel>>(
              stream: _firestoreService.getStudentsForClass(
                departmentId: widget.faculty.departmentId,
                yearId: widget.year.id,
                sectionId: widget.section.id,
              ),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }

                final students = snapshot.data ?? [];
                if (students.isEmpty) {
                  return const Center(
                    child: Text('No students registered in this class section yet.'),
                  );
                }

                // Initialize map defaults to Present if not yet selected
                for (final s in students) {
                  _attendanceMap.putIfAbsent(s.uid, () => AppConstants.statusPresent);
                }

                return Column(
                  children: [
                    // Quick Action bar
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Enrolled: ${students.length}', style: const TextStyle(fontWeight: FontWeight.bold)),
                          Row(
                            children: [
                              TextButton(
                                onPressed: () {
                                  setState(() {
                                    for (var s in students) {
                                      _attendanceMap[s.uid] = AppConstants.statusPresent;
                                    }
                                  });
                                },
                                child: const Text('Mark All Present'),
                              ),
                              TextButton(
                                onPressed: () {
                                  setState(() {
                                    for (var s in students) {
                                      _attendanceMap[s.uid] = AppConstants.statusAbsent;
                                    }
                                  });
                                },
                                child: const Text('Mark All Absent'),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    Expanded(
                      child: ListView.builder(
                        itemCount: students.length,
                        itemBuilder: (ctx, i) {
                          final student = students[i];
                          final isPresent = (_attendanceMap[student.uid] ?? AppConstants.statusPresent) == AppConstants.statusPresent;

                          return Card(
                            margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                            child: ListTile(
                              leading: CircleAvatar(
                                backgroundColor: isPresent ? Colors.green.shade100 : Colors.red.shade100,
                                child: Text(
                                  student.registerNumber.length >= 3 ? student.registerNumber.substring(student.registerNumber.length - 3) : '#',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: isPresent ? Colors.green.shade800 : Colors.red.shade800,
                                  ),
                                ),
                              ),
                              title: Text(student.fullName, style: const TextStyle(fontWeight: FontWeight.w600)),
                              subtitle: Text('Reg: ${student.registerNumber}'),
                              trailing: SegmentedButton<String>(
                                segments: const [
                                  ButtonSegment(value: 'Present', label: Text('P', style: TextStyle(fontWeight: FontWeight.bold))),
                                  ButtonSegment(value: 'Absent', label: Text('A', style: TextStyle(fontWeight: FontWeight.bold))),
                                ],
                                selected: {isPresent ? 'Present' : 'Absent'},
                                onSelectionChanged: (val) {
                                  setState(() {
                                    _attendanceMap[student.uid] = val.first;
                                  });
                                },
                              ),
                            ),
                          );
                        },
                      ),
                    ),

                    // Save Attendance Button
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: ElevatedButton.icon(
                        onPressed: _isSaving ? null : () => _saveAttendance(students),
                        icon: _isSaving
                            ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                            : const Icon(Icons.check_circle_outline),
                        label: const Text('Save Attendance to Cloud Firestore'),
                        style: ElevatedButton.styleFrom(
                          minimumSize: const Size.fromHeight(50),
                          backgroundColor: Colors.teal,
                        ),
                      ),
                    ),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

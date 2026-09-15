import 'package:flutter/material.dart';
import '../../../core/services/firestore_service.dart';
import '../../../models/faculty_model.dart';
import '../../../models/academic_models.dart';

class FacultyClassSelectionScreen extends StatefulWidget {
  final FacultyModel faculty;
  final Function(AcademicYearModel year, SectionModel section) onSelected;

  const FacultyClassSelectionScreen({
    super.key,
    required this.faculty,
    required this.onSelected,
  });

  @override
  State<FacultyClassSelectionScreen> createState() => _FacultyClassSelectionScreenState();
}

class _FacultyClassSelectionScreenState extends State<FacultyClassSelectionScreen> {
  final _firestoreService = FirestoreService();
  AcademicYearModel? _selectedYear;
  SectionModel? _selectedSection;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Select Academic Class')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Card(
                color: Colors.indigo.shade50,
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      const Icon(Icons.apartment_rounded, color: Colors.indigo),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'Department: ${widget.faculty.departmentName}',
                          style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.indigo),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),

              const Text('1. Choose Academic Year', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              const SizedBox(height: 8),

              StreamBuilder<List<AcademicYearModel>>(
                stream: _firestoreService.getYears(widget.faculty.departmentId),
                builder: (context, snapshot) {
                  final years = snapshot.data ?? [];
                  if (years.isEmpty) {
                    return const Text('No academic years configured for this department yet. Please contact admin.');
                  }

                  return DropdownButtonFormField<AcademicYearModel>(
                    value: _selectedYear,
                    hint: const Text('Select Year'),
                    items: years.map((y) => DropdownMenuItem(value: y, child: Text(y.name))).toList(),
                    onChanged: (val) {
                      setState(() {
                        _selectedYear = val;
                        _selectedSection = null;
                      });
                    },
                  );
                },
              ),
              const SizedBox(height: 24),

              if (_selectedYear != null) ...[
                const Text('2. Choose Section', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                const SizedBox(height: 8),

                StreamBuilder<List<SectionModel>>(
                  stream: _firestoreService.getSections(widget.faculty.departmentId, _selectedYear!.id),
                  builder: (context, snapshot) {
                    final sections = snapshot.data ?? [];
                    if (sections.isEmpty) {
                      return const Text('No sections configured for this year.');
                    }

                    return DropdownButtonFormField<SectionModel>(
                      value: _selectedSection,
                      hint: const Text('Select Section'),
                      items: sections.map((s) => DropdownMenuItem(value: s, child: Text(s.name))).toList(),
                      onChanged: (val) => setState(() => _selectedSection = val),
                    );
                  },
                ),
                const SizedBox(height: 32),
              ],

              const Spacer(),

              ElevatedButton(
                onPressed: (_selectedYear != null && _selectedSection != null)
                    ? () => widget.onSelected(_selectedYear!, _selectedSection!)
                    : null,
                style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
                child: const Text('Confirm Class Selection'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

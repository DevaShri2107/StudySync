import 'package:flutter/material.dart';
import '../../../core/services/firestore_service.dart';
import '../../../models/academic_models.dart';

class AcademicStructureScreen extends StatefulWidget {
  const AcademicStructureScreen({super.key});

  @override
  State<AcademicStructureScreen> createState() => _AcademicStructureScreenState();
}

class _AcademicStructureScreenState extends State<AcademicStructureScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _firestoreService = FirestoreService();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _showAddDepartmentDialog() {
    final nameCtrl = TextEditingController();
    final codeCtrl = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Add Department'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Department Name (e.g. Computer Science)')),
            const SizedBox(height: 12),
            TextField(controller: codeCtrl, decoration: const InputDecoration(labelText: 'Department Code (e.g. CSE)')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              if (nameCtrl.text.isNotEmpty && codeCtrl.text.isNotEmpty) {
                await _firestoreService.addDepartment(nameCtrl.text, codeCtrl.text);
                if (mounted) Navigator.pop(ctx);
              }
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }

  void _showAddYearDialog(List<DepartmentModel> departments) {
    final nameCtrl = TextEditingController();
    DepartmentModel? selectedDept = departments.isNotEmpty ? departments.first : null;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Add Academic Year'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              DropdownButtonFormField<DepartmentModel>(
                value: selectedDept,
                decoration: const InputDecoration(labelText: 'Department'),
                items: departments.map((d) => DropdownMenuItem(value: d, child: Text(d.name))).toList(),
                onChanged: (val) => setDialogState(() => selectedDept = val),
              ),
              const SizedBox(height: 12),
              TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Year Name (e.g. III Year)')),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: () async {
                if (nameCtrl.text.isNotEmpty && selectedDept != null) {
                  await _firestoreService.addYear(nameCtrl.text, selectedDept!.id);
                  if (mounted) Navigator.pop(ctx);
                }
              },
              child: const Text('Add'),
            ),
          ],
        ),
      ),
    );
  }

  void _showAddSectionDialog(List<DepartmentModel> departments) {
    final nameCtrl = TextEditingController();
    DepartmentModel? selectedDept = departments.isNotEmpty ? departments.first : null;
    AcademicYearModel? selectedYear;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Add Class Section'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              DropdownButtonFormField<DepartmentModel>(
                value: selectedDept,
                decoration: const InputDecoration(labelText: 'Department'),
                items: departments.map((d) => DropdownMenuItem(value: d, child: Text(d.name))).toList(),
                onChanged: (val) {
                  setDialogState(() {
                    selectedDept = val;
                    selectedYear = null;
                  });
                },
              ),
              const SizedBox(height: 12),
              if (selectedDept != null)
                StreamBuilder<List<AcademicYearModel>>(
                  stream: _firestoreService.getYears(selectedDept!.id),
                  builder: (context, snap) {
                    final years = snap.data ?? [];
                    return DropdownButtonFormField<AcademicYearModel>(
                      value: selectedYear,
                      decoration: const InputDecoration(labelText: 'Academic Year'),
                      items: years.map((y) => DropdownMenuItem(value: y, child: Text(y.name))).toList(),
                      onChanged: (val) => setDialogState(() => selectedYear = val),
                    );
                  },
                ),
              const SizedBox(height: 12),
              TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Section Name (e.g. Section A)')),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: () async {
                if (nameCtrl.text.isNotEmpty && selectedDept != null && selectedYear != null) {
                  await _firestoreService.addSection(nameCtrl.text, selectedDept!.id, selectedYear!.id);
                  if (mounted) Navigator.pop(ctx);
                }
              },
              child: const Text('Add'),
            ),
          ],
        ),
      ),
    );
  }

  void _showAddSubjectDialog(List<DepartmentModel> departments) {
    final nameCtrl = TextEditingController();
    final codeCtrl = TextEditingController();
    DepartmentModel? selectedDept = departments.isNotEmpty ? departments.first : null;
    AcademicYearModel? selectedYear;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Add Subject'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              DropdownButtonFormField<DepartmentModel>(
                value: selectedDept,
                decoration: const InputDecoration(labelText: 'Department'),
                items: departments.map((d) => DropdownMenuItem(value: d, child: Text(d.name))).toList(),
                onChanged: (val) {
                  setDialogState(() {
                    selectedDept = val;
                    selectedYear = null;
                  });
                },
              ),
              const SizedBox(height: 12),
              if (selectedDept != null)
                StreamBuilder<List<AcademicYearModel>>(
                  stream: _firestoreService.getYears(selectedDept!.id),
                  builder: (context, snap) {
                    final years = snap.data ?? [];
                    return DropdownButtonFormField<AcademicYearModel>(
                      value: selectedYear,
                      decoration: const InputDecoration(labelText: 'Academic Year'),
                      items: years.map((y) => DropdownMenuItem(value: y, child: Text(y.name))).toList(),
                      onChanged: (val) => setDialogState(() => selectedYear = val),
                    );
                  },
                ),
              const SizedBox(height: 12),
              TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Subject Name')),
              const SizedBox(height: 12),
              TextField(controller: codeCtrl, decoration: const InputDecoration(labelText: 'Subject Code (e.g. CS8591)')),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: () async {
                if (nameCtrl.text.isNotEmpty && codeCtrl.text.isNotEmpty && selectedDept != null && selectedYear != null) {
                  await _firestoreService.addSubject(nameCtrl.text, codeCtrl.text, selectedDept!.id, selectedYear!.id);
                  if (mounted) Navigator.pop(ctx);
                }
              },
              child: const Text('Add'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        TabBar(
          controller: _tabController,
          labelColor: Theme.of(context).colorScheme.primary,
          tabs: const [
            Tab(text: 'Departments'),
            Tab(text: 'Years'),
            Tab(text: 'Sections'),
            Tab(text: 'Subjects'),
          ],
        ),
        Expanded(
          child: StreamBuilder<List<DepartmentModel>>(
            stream: _firestoreService.getDepartments(),
            builder: (context, deptSnapshot) {
              final departments = deptSnapshot.data ?? [];

              return TabBarView(
                controller: _tabController,
                children: [
                  // Tab 1: Departments
                  Scaffold(
                    body: departments.isEmpty
                        ? const Center(child: Text('No departments configured yet. Click + to add.'))
                        : ListView.builder(
                            padding: const EdgeInsets.all(12),
                            itemCount: departments.length,
                            itemBuilder: (ctx, i) => Card(
                              child: ListTile(
                                leading: const CircleAvatar(child: Icon(Icons.apartment)),
                                title: Text(departments[i].name),
                                subtitle: Text('Code: ${departments[i].code}'),
                              ),
                            ),
                          ),
                    floatingActionButton: FloatingActionButton.extended(
                      onPressed: _showAddDepartmentDialog,
                      icon: const Icon(Icons.add),
                      label: const Text('Department'),
                    ),
                  ),

                  // Tab 2: Years
                  Scaffold(
                    body: departments.isEmpty
                        ? const Center(child: Text('Please add at least one department first.'))
                        : ListView(
                            padding: const EdgeInsets.all(12),
                            children: departments.map((dept) {
                              return StreamBuilder<List<AcademicYearModel>>(
                                stream: _firestoreService.getYears(dept.id),
                                builder: (ctx, snap) {
                                  final years = snap.data ?? [];
                                  return Card(
                                    child: ExpansionTile(
                                      title: Text('${dept.name} (${dept.code})'),
                                      subtitle: Text('${years.length} Academic Years'),
                                      children: years.map((y) => ListTile(
                                        leading: const Icon(Icons.date_range, size: 20),
                                        title: Text(y.name),
                                      )).toList(),
                                    ),
                                  );
                                },
                              );
                            }).toList(),
                          ),
                    floatingActionButton: FloatingActionButton.extended(
                      onPressed: departments.isEmpty ? null : () => _showAddYearDialog(departments),
                      icon: const Icon(Icons.add),
                      label: const Text('Year'),
                    ),
                  ),

                  // Tab 3: Sections
                  Scaffold(
                    body: departments.isEmpty
                        ? const Center(child: Text('Please configure departments and years first.'))
                        : ListView(
                            padding: const EdgeInsets.all(12),
                            children: departments.map((dept) {
                              return StreamBuilder<List<AcademicYearModel>>(
                                stream: _firestoreService.getYears(dept.id),
                                builder: (ctx, ySnap) {
                                  final years = ySnap.data ?? [];
                                  return Column(
                                    children: years.map((year) {
                                      return StreamBuilder<List<SectionModel>>(
                                        stream: _firestoreService.getSections(dept.id, year.id),
                                        builder: (ctx, sSnap) {
                                          final sections = sSnap.data ?? [];
                                          return Card(
                                            child: ExpansionTile(
                                              title: Text('${dept.code} • ${year.name}'),
                                              subtitle: Text('${sections.length} Sections'),
                                              children: sections.map((sec) => ListTile(
                                                leading: const Icon(Icons.group, size: 20),
                                                title: Text(sec.name),
                                              )).toList(),
                                            ),
                                          );
                                        },
                                      );
                                    }).toList(),
                                  );
                                },
                              );
                            }).toList(),
                          ),
                    floatingActionButton: FloatingActionButton.extended(
                      onPressed: departments.isEmpty ? null : () => _showAddSectionDialog(departments),
                      icon: const Icon(Icons.add),
                      label: const Text('Section'),
                    ),
                  ),

                  // Tab 4: Subjects
                  Scaffold(
                    body: departments.isEmpty
                        ? const Center(child: Text('Please configure departments and years first.'))
                        : ListView(
                            padding: const EdgeInsets.all(12),
                            children: departments.map((dept) {
                              return StreamBuilder<List<AcademicYearModel>>(
                                stream: _firestoreService.getYears(dept.id),
                                builder: (ctx, ySnap) {
                                  final years = ySnap.data ?? [];
                                  return Column(
                                    children: years.map((year) {
                                      return StreamBuilder<List<SubjectModel>>(
                                        stream: _firestoreService.getSubjects(dept.id, year.id),
                                        builder: (ctx, subSnap) {
                                          final subjects = subSnap.data ?? [];
                                          return Card(
                                            child: ExpansionTile(
                                              title: Text('${dept.code} • ${year.name}'),
                                              subtitle: Text('${subjects.length} Subjects'),
                                              children: subjects.map((sub) => ListTile(
                                                leading: const Icon(Icons.menu_book, size: 20),
                                                title: Text(sub.name),
                                                subtitle: Text('Code: ${sub.code}'),
                                              )).toList(),
                                            ),
                                          );
                                        },
                                      );
                                    }).toList(),
                                  );
                                },
                              );
                            }).toList(),
                          ),
                    floatingActionButton: FloatingActionButton.extended(
                      onPressed: departments.isEmpty ? null : () => _showAddSubjectDialog(departments),
                      icon: const Icon(Icons.add),
                      label: const Text('Subject'),
                    ),
                  ),
                ],
              );
            },
          ),
        ),
      ],
    );
  }
}

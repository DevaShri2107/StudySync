import 'package:flutter/material.dart';
import '../../../core/services/firestore_service.dart';
import '../../../models/faculty_model.dart';
import '../../../models/student_model.dart';

class UserManagementScreen extends StatefulWidget {
  const UserManagementScreen({super.key});

  @override
  State<UserManagementScreen> createState() => _UserManagementScreenState();
}

class _UserManagementScreenState extends State<UserManagementScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _firestoreService = FirestoreService();
  String _searchQuery = '';

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

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: TextField(
            decoration: InputDecoration(
              hintText: 'Search by name, ID or reg number...',
              prefixIcon: const Icon(Icons.search),
              contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(30)),
            ),
            onChanged: (val) => setState(() => _searchQuery = val.trim().toLowerCase()),
          ),
        ),
        TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Faculty Members', icon: Icon(Icons.badge_outlined)),
            Tab(text: 'Enrolled Students', icon: Icon(Icons.school_outlined)),
          ],
        ),
        Expanded(
          child: TabBarView(
            controller: _tabController,
            children: [
              // Faculty Tab
              StreamBuilder<List<FacultyModel>>(
                stream: _firestoreService.getAllFaculty(),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  }
                  final allFaculty = snapshot.data ?? [];
                  final filtered = allFaculty.where((f) {
                    return f.fullName.toLowerCase().contains(_searchQuery) ||
                        f.employeeId.toLowerCase().contains(_searchQuery) ||
                        f.email.toLowerCase().contains(_searchQuery);
                  }).toList();

                  if (filtered.isEmpty) {
                    return const Center(child: Text('No faculty members found.'));
                  }

                  return ListView.builder(
                    padding: const EdgeInsets.all(12),
                    itemCount: filtered.length,
                    itemBuilder: (ctx, i) {
                      final f = filtered[i];
                      return Card(
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: Colors.indigo,
                            child: Text(f.fullName.isNotEmpty ? f.fullName[0].toUpperCase() : 'F', style: const TextStyle(color: Colors.white)),
                          ),
                          title: Text(f.fullName, style: const TextStyle(fontWeight: FontWeight.bold)),
                          subtitle: Text('ID: ${f.employeeId} • Dept: ${f.departmentName}\n${f.email}'),
                          isThreeLine: true,
                        ),
                      );
                    },
                  );
                },
              ),

              // Students Tab
              StreamBuilder<List<StudentModel>>(
                stream: _firestoreService.getAllStudents(),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  }
                  final allStudents = snapshot.data ?? [];
                  final filtered = allStudents.where((s) {
                    return s.fullName.toLowerCase().contains(_searchQuery) ||
                        s.registerNumber.toLowerCase().contains(_searchQuery) ||
                        s.email.toLowerCase().contains(_searchQuery);
                  }).toList();

                  if (filtered.isEmpty) {
                    return const Center(child: Text('No students registered yet.'));
                  }

                  return ListView.builder(
                    padding: const EdgeInsets.all(12),
                    itemCount: filtered.length,
                    itemBuilder: (ctx, i) {
                      final s = filtered[i];
                      return Card(
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: Colors.emerald,
                            child: Text(s.fullName.isNotEmpty ? s.fullName[0].toUpperCase() : 'S', style: const TextStyle(color: Colors.white)),
                          ),
                          title: Text(s.fullName, style: const TextStyle(fontWeight: FontWeight.bold)),
                          subtitle: Text('Reg: ${s.registerNumber} • ${s.departmentName}\n${s.yearName} - ${s.sectionName} • ${s.email}'),
                          isThreeLine: true,
                        ),
                      );
                    },
                  );
                },
              ),
            ],
          ),
        ),
      ],
    );
  }
}

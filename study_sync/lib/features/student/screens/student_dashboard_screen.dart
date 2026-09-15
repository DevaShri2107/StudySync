import 'package:flutter/material.dart';
import '../../../core/services/auth_service.dart';
import '../../../models/student_model.dart';
import '../../attendance/screens/student_attendance_screen.dart';
import '../../assignments/screens/student_assignments_screen.dart';
import '../../notes/screens/student_notes_screen.dart';
import '../../planner/screens/study_planner_screen.dart';
import '../../study_sessions/screens/study_sessions_screen.dart';
import '../../announcements/screens/announcements_screen.dart';
import '../../notifications/screens/notifications_screen.dart';
import '../../google_integrations/screens/connected_services_screen.dart';
import '../../settings/screens/settings_screen.dart';
import '../../profile/screens/profile_screen.dart';
import '../../authentication/screens/login_screen.dart';

class StudentDashboardScreen extends StatefulWidget {
  const StudentDashboardScreen({super.key});

  @override
  State<StudentDashboardScreen> createState() => _StudentDashboardScreenState();
}

class _StudentDashboardScreenState extends State<StudentDashboardScreen> {
  final _authService = AuthService();
  StudentModel? _studentProfile;
  bool _isLoading = true;
  int _selectedIndex = 0;

  @override
  void initState() {
    super.initState();
    _loadStudentProfile();
  }

  Future<void> _loadStudentProfile() async {
    final user = _authService.currentUser;
    if (user != null) {
      final profile = await _authService.getStudentProfile(user.uid);
      setState(() {
        _studentProfile = profile;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (_studentProfile == null) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Student profile not found.'),
              ElevatedButton(
                onPressed: () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LoginScreen())),
                child: const Text('Back to Login'),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(_studentProfile!.fullName),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none_rounded),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => NotificationsScreen(userId: _studentProfile!.uid)),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.cloud_sync_outlined),
            tooltip: 'Connected Google Services',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const ConnectedServicesScreen()),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const SettingsScreen()),
              );
            },
          ),
        ],
      ),
      body: _buildSelectedTab(),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (idx) => setState(() => _selectedIndex = idx),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.pie_chart_outline), selectedIcon: Icon(Icons.pie_chart), label: 'Attendance'),
          NavigationDestination(icon: Icon(Icons.assignment_outlined), selectedIcon: Icon(Icons.assignment), label: 'Assignments'),
          NavigationDestination(icon: Icon(Icons.menu_book_outlined), selectedIcon: Icon(Icons.menu_book), label: 'Notes'),
          NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }

  Widget _buildSelectedTab() {
    switch (_selectedIndex) {
      case 0:
        return _buildHomeTab();
      case 1:
        return StudentAttendanceScreen(student: _studentProfile!);
      case 2:
        return StudentAssignmentsScreen(student: _studentProfile!);
      case 3:
        return StudentNotesScreen(student: _studentProfile!);
      case 4:
        return ProfileScreen(role: 'Student', fullName: _studentProfile!.fullName, email: _studentProfile!.email);
      default:
        return _buildHomeTab();
    }
  }

  Widget _buildHomeTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Student ID Card
          Card(
            color: Colors.teal.shade50,
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        _studentProfile!.fullName,
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.teal),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(color: Colors.teal.shade100, borderRadius: BorderRadius.circular(20)),
                        child: Text(
                          _studentProfile!.registerNumber,
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.teal),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    '${_studentProfile!.departmentName} • ${_studentProfile!.yearName} (${_studentProfile!.sectionName})',
                    style: TextStyle(color: Colors.grey.shade800, fontSize: 13),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Core Features Grid
          const Text('Academic Dashboard', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),

          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.35,
            children: [
              _buildFeatureTile(
                title: 'Attendance Tracker',
                subtitle: '75% mandatory check',
                icon: Icons.pie_chart,
                color: Colors.teal,
                onTap: () => setState(() => _selectedIndex = 1),
              ),
              _buildFeatureTile(
                title: 'Assignments',
                subtitle: 'Submit files & check marks',
                icon: Icons.assignment_outlined,
                color: Colors.indigo,
                onTap: () => setState(() => _selectedIndex = 2),
              ),
              _buildFeatureTile(
                title: 'Class Notes',
                subtitle: 'Google Drive courseware',
                icon: Icons.menu_book,
                color: Colors.blue,
                onTap: () => setState(() => _selectedIndex = 3),
              ),
              _buildFeatureTile(
                title: 'Study Planner',
                subtitle: 'Tasks & Calendar sync',
                icon: Icons.checklist_rtl_rounded,
                color: Colors.deepOrange,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => StudyPlannerScreen(student: _studentProfile!)),
                  );
                },
              ),
              _buildFeatureTile(
                title: 'Live Study Sessions',
                subtitle: 'Google Meet classrooms',
                icon: Icons.video_camera_front_outlined,
                color: Colors.purple,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => StudySessionsScreen(
                        isFaculty: false,
                        departmentId: _studentProfile!.departmentId,
                        yearId: _studentProfile!.yearId,
                        sectionId: _studentProfile!.sectionId,
                      ),
                    ),
                  );
                },
              ),
              _buildFeatureTile(
                title: 'Announcements',
                subtitle: 'Circulars from faculty',
                icon: Icons.campaign_outlined,
                color: Colors.amber,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => AnnouncementsScreen(
                        isFaculty: false,
                        departmentId: _studentProfile!.departmentId,
                        yearId: _studentProfile!.yearId,
                        sectionId: _studentProfile!.sectionId,
                      ),
                    ),
                  );
                },
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureTile({
    required String title,
    required String subtitle,
    required IconData icon,
    required MaterialColor color,
    required VoidCallback onTap,
  }) {
    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              CircleAvatar(backgroundColor: color.shade50, child: Icon(icon, color: color.shade700)),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 2),
                  Text(subtitle, style: TextStyle(color: Colors.grey.shade600, fontSize: 10), maxLines: 1, overflow: TextOverflow.ellipsis),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

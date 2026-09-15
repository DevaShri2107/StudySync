import 'package:flutter/material.dart';
import '../../../core/services/auth_service.dart';
import '../../../models/faculty_model.dart';
import '../../../models/academic_models.dart';
import 'faculty_class_selection_screen.dart';
import '../../attendance/screens/mark_attendance_screen.dart';
import '../../assignments/screens/faculty_assignments_screen.dart';
import '../../notes/screens/faculty_notes_screen.dart';
import '../../study_sessions/screens/study_sessions_screen.dart';
import '../../announcements/screens/announcements_screen.dart';
import '../../google_integrations/screens/connected_services_screen.dart';
import '../../settings/screens/settings_screen.dart';
import '../../profile/screens/profile_screen.dart';
import '../../authentication/screens/login_screen.dart';

class FacultyDashboardScreen extends StatefulWidget {
  const FacultyDashboardScreen({super.key});

  @override
  State<FacultyDashboardScreen> createState() => _FacultyDashboardScreenState();
}

class _FacultyDashboardScreenState extends State<FacultyDashboardScreen> {
  final _authService = AuthService();
  FacultyModel? _facultyProfile;
  bool _isLoading = true;
  int _selectedIndex = 0;

  // Active Selected Class Context
  AcademicYearModel? _selectedYear;
  SectionModel? _selectedSection;

  @override
  void initState() {
    super.initState();
    _loadFacultyProfile();
  }

  Future<void> _loadFacultyProfile() async {
    final user = _authService.currentUser;
    if (user != null) {
      final profile = await _authService.getFacultyProfile(user.uid);
      setState(() {
        _facultyProfile = profile;
        _isLoading = false;
      });
    }
  }

  void _onClassSelected(AcademicYearModel year, SectionModel section) {
    setState(() {
      _selectedYear = year;
      _selectedSection = section;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (_facultyProfile == null) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Faculty profile not found.'),
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
        title: Text('Faculty: ${_facultyProfile!.fullName}'),
        actions: [
          IconButton(
            icon: const Icon(Icons.cloud_sync_outlined),
            tooltip: 'Connected Google Services',
            onPressed: () {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const ConnectedServicesScreen()));
            },
          ),
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const SettingsScreen()));
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
          NavigationDestination(icon: Icon(Icons.how_to_reg_outlined), selectedIcon: Icon(Icons.how_to_reg), label: 'Attendance'),
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
        return _selectedYear == null || _selectedSection == null
            ? _buildClassRequiredPrompt('take Attendance')
            : MarkAttendanceScreen(
                faculty: _facultyProfile!,
                year: _selectedYear!,
                section: _selectedSection!,
              );
      case 2:
        return _selectedYear == null || _selectedSection == null
            ? _buildClassRequiredPrompt('manage Assignments')
            : FacultyAssignmentsScreen(
                faculty: _facultyProfile!,
                year: _selectedYear!,
                section: _selectedSection!,
              );
      case 3:
        return _selectedYear == null || _selectedSection == null
            ? _buildClassRequiredPrompt('manage Notes')
            : FacultyNotesScreen(
                faculty: _facultyProfile!,
                year: _selectedYear!,
                section: _selectedSection!,
              );
      case 4:
        return ProfileScreen(role: 'Faculty', fullName: _facultyProfile!.fullName, email: _facultyProfile!.email);
      default:
        return _buildHomeTab();
    }
  }

  Widget _buildClassRequiredPrompt(String action) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.meeting_room_outlined, size: 64, color: Colors.indigo),
            const SizedBox(height: 16),
            Text(
              'Select an Academic Class',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              'Please choose an Academic Year and Section to $action.',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              icon: const Icon(Icons.tune_rounded),
              label: const Text('Choose Class Now'),
              onPressed: () => _openClassSelector(),
            ),
          ],
        ),
      ),
    );
  }

  void _openClassSelector() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => FacultyClassSelectionScreen(
          faculty: _facultyProfile!,
          onSelected: (y, s) {
            _onClassSelected(y, s);
            Navigator.pop(context);
          },
        ),
      ),
    );
  }

  Widget _buildHomeTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Faculty Info Banner
          Card(
            color: Colors.indigo.shade50,
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        _facultyProfile!.fullName,
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.indigo),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(color: Colors.indigo.shade100, borderRadius: BorderRadius.circular(20)),
                        child: Text(_facultyProfile!.employeeId, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.indigo)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text('Department: ${_facultyProfile!.departmentName}', style: TextStyle(color: Colors.grey.shade800, fontSize: 13)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Active Class Selector Banner
          Card(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: BorderSide(color: _selectedYear != null ? Colors.teal : Colors.amber.shade400, width: 1.5),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Icon(
                    _selectedYear != null ? Icons.check_circle_outline : Icons.info_outline,
                    color: _selectedYear != null ? Colors.teal : Colors.amber.shade800,
                    size: 28,
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Active Class Selection', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                        const SizedBox(height: 2),
                        Text(
                          _selectedYear != null && _selectedSection != null
                              ? '${_selectedYear!.name} • ${_selectedSection!.name}'
                              : 'No class chosen yet. Tap button to select.',
                          style: TextStyle(color: Colors.grey.shade700, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                  ElevatedButton(
                    onPressed: _openClassSelector,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      backgroundColor: Colors.indigo,
                    ),
                    child: Text(_selectedYear != null ? 'Change' : 'Select'),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Academic Action Modules
          const Text('Academic Modules', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
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
                title: 'Mark Attendance',
                subtitle: 'Present / Absent roster',
                icon: Icons.how_to_reg,
                color: Colors.teal,
                onTap: () => setState(() => _selectedIndex = 1),
              ),
              _buildFeatureTile(
                title: 'Assignments',
                subtitle: 'Post & grade homework',
                icon: Icons.assignment_outlined,
                color: Colors.indigo,
                onTap: () => setState(() => _selectedIndex = 2),
              ),
              _buildFeatureTile(
                title: 'Lecture Notes',
                subtitle: 'Upload to Google Drive',
                icon: Icons.menu_book,
                color: Colors.blue,
                onTap: () => setState(() => _selectedIndex = 3),
              ),
              _buildFeatureTile(
                title: 'Study Sessions',
                subtitle: 'Google Meet + Calendar',
                icon: Icons.video_camera_front_outlined,
                color: Colors.purple,
                onTap: () {
                  if (_selectedYear == null || _selectedSection == null) {
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please select a class first.')));
                    _openClassSelector();
                    return;
                  }
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => StudySessionsScreen(
                        isFaculty: true,
                        faculty: _facultyProfile,
                        departmentId: _facultyProfile!.departmentId,
                        year: _selectedYear!,
                        section: _selectedSection!,
                      ),
                    ),
                  );
                },
              ),
              _buildFeatureTile(
                title: 'Announcements',
                subtitle: 'Post & send Gmail alert',
                icon: Icons.campaign_outlined,
                color: Colors.orange,
                onTap: () {
                  if (_selectedYear == null || _selectedSection == null) {
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please select a class first.')));
                    _openClassSelector();
                    return;
                  }
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => AnnouncementsScreen(
                        isFaculty: true,
                        faculty: _facultyProfile,
                        departmentId: _facultyProfile!.departmentId,
                        year: _selectedYear!,
                        section: _selectedSection!,
                      ),
                    ),
                  );
                },
              ),
              _buildFeatureTile(
                title: 'Connected Services',
                subtitle: 'Drive, Calendar, Gmail',
                icon: Icons.cloud_done_outlined,
                color: Colors.deepPurple,
                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ConnectedServicesScreen())),
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

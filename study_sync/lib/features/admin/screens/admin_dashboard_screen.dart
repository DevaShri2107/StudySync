import 'package:flutter/material.dart';
import '../../../core/services/auth_service.dart';
import '../../../core/services/firestore_service.dart';
import 'academic_structure_screen.dart';
import 'user_management_screen.dart';
import '../../reports/screens/reports_screen.dart';
import '../../settings/screens/settings_screen.dart';
import '../../google_integrations/screens/connected_services_screen.dart';
import '../../authentication/screens/login_screen.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  final _firestoreService = FirestoreService();
  final _authService = AuthService();
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin Console'),
        actions: [
          IconButton(
            icon: const Icon(Icons.cloud_sync_outlined),
            tooltip: 'Connected Services',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const ConnectedServicesScreen()),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.logout_rounded),
            tooltip: 'Sign Out',
            onPressed: () async {
              await _authService.signOut();
              if (!mounted) return;
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (_) => const LoginScreen()),
              );
            },
          ),
        ],
      ),
      body: _buildSelectedView(),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (idx) => setState(() => _selectedIndex = idx),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard_outlined), selectedIcon: Icon(Icons.dashboard), label: 'Dashboard'),
          NavigationDestination(icon: Icon(Icons.account_tree_outlined), selectedIcon: Icon(Icons.account_tree), label: 'Academics'),
          NavigationDestination(icon: Icon(Icons.people_outline), selectedIcon: Icon(Icons.people), label: 'Users'),
          NavigationDestination(icon: Icon(Icons.bar_chart_outlined), selectedIcon: Icon(Icons.bar_chart), label: 'Reports'),
          NavigationDestination(icon: Icon(Icons.settings_outlined), selectedIcon: Icon(Icons.settings), label: 'Settings'),
        ],
      ),
    );
  }

  Widget _buildSelectedView() {
    switch (_selectedIndex) {
      case 0:
        return _buildDashboardHome();
      case 1:
        return const AcademicStructureScreen();
      case 2:
        return const UserManagementScreen();
      case 3:
        return const ReportsScreen();
      case 4:
        return const SettingsScreen();
      default:
        return _buildDashboardHome();
    }
  }

  Widget _buildDashboardHome() {
    return FutureBuilder<Map<String, int>>(
      future: _firestoreService.getLiveAdminStats(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        final stats = snapshot.data ?? {};
        final totalStudents = stats['totalStudents'] ?? 0;
        final totalFaculty = stats['totalFaculty'] ?? 0;
        final totalDepartments = stats['totalDepartments'] ?? 0;
        final totalYears = stats['totalYears'] ?? 0;
        final totalSections = stats['totalSections'] ?? 0;
        final totalAssignments = stats['totalAssignments'] ?? 0;

        return RefreshIndicator(
          onRefresh: () async => setState(() {}),
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            physics: const AlwaysScrollableScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Welcome Banner
                Card(
                  color: Theme.of(context).colorScheme.primaryContainer,
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Row(
                      children: [
                        Icon(Icons.admin_panel_settings_rounded, size: 48, color: Theme.of(context).colorScheme.onPrimaryContainer),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'System Administrator',
                                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                      fontWeight: FontWeight.bold,
                                      color: Theme.of(context).colorScheme.onPrimaryContainer,
                                    ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Institutional Management & Academic Oversight',
                                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                      color: Theme.of(context).colorScheme.onPrimaryContainer.withOpacity(0.8),
                                    ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Statistics Grid (Live Firestore Counts)
                Text('Live Institution Overview', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),

                GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 1.5,
                  children: [
                    _buildStatCard('Enrolled Students', totalStudents.toString(), Icons.school_outlined, Colors.emerald),
                    _buildStatCard('Faculty Members', totalFaculty.toString(), Icons.badge_outlined, Colors.indigo),
                    _buildStatCard('Departments', totalDepartments.toString(), Icons.apartment_outlined, Colors.teal),
                    _buildStatCard('Academic Years', totalYears.toString(), Icons.calendar_today_outlined, Colors.purple),
                    _buildStatCard('Class Sections', totalSections.toString(), Icons.meeting_room_outlined, Colors.amber),
                    _buildStatCard('Assignments', totalAssignments.toString(), Icons.assignment_outlined, Colors.blue),
                  ],
                ),
                const SizedBox(height: 20),

                // Quick Management Cards
                Text('Quick Setup & Configuration', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),

                ListTile(
                  tileColor: Theme.of(context).colorScheme.surface,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  leading: const CircleAvatar(backgroundColor: Colors.teal, child: Icon(Icons.account_tree, color: Colors.white)),
                  title: const Text('Configure Academic Structure'),
                  subtitle: const Text('Add departments, academic years, sections & subjects'),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  onTap: () => setState(() => _selectedIndex = 1),
                ),
                const SizedBox(height: 8),

                ListTile(
                  tileColor: Theme.of(context).colorScheme.surface,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  leading: const CircleAvatar(backgroundColor: Colors.indigo, child: Icon(Icons.manage_accounts, color: Colors.white)),
                  title: const Text('Manage Registered Users'),
                  subtitle: const Text('View verified students and faculty rosters'),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  onTap: () => setState(() => _selectedIndex = 2),
                ),
                const SizedBox(height: 8),

                ListTile(
                  tileColor: Theme.of(context).colorScheme.surface,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  leading: const CircleAvatar(backgroundColor: Colors.blueAccent, child: Icon(Icons.cloud_done_rounded, color: Colors.white)),
                  title: const Text('Connected Google Services'),
                  subtitle: const Text('Manage Google Drive, Calendar, Gmail & Meet OAuth status'),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const ConnectedServicesScreen()),
                    );
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, MaterialColor color) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.grey)),
                Icon(icon, size: 20, color: color),
              ],
            ),
            Text(
              value,
              style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: color[800]),
            ),
          ],
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'core/theme/app_theme.dart';
import 'core/constants/app_constants.dart';
import 'core/services/auth_service.dart';
import 'core/services/notification_service.dart';
import 'features/authentication/screens/login_screen.dart';
import 'features/admin/screens/admin_dashboard_screen.dart';
import 'features/faculty/screens/faculty_dashboard_screen.dart';
import 'features/student/screens/student_dashboard_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Firebase Cloud Services
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  // Initialize Notifications
  try {
    await NotificationService.initialize();
  } catch (_) {}

  runApp(const StudySyncApp());
}

class StudySyncApp extends StatelessWidget {
  const StudySyncApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppConstants.appName,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      home: const AuthWrapper(),
    );
  }
}

class AuthWrapper extends StatelessWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    final authService = AuthService();

    return StreamBuilder(
      stream: authService.authStateChanges,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }

        final user = snapshot.data;
        if (user == null) {
          return const LoginScreen();
        }

        // Resolve user role
        return FutureBuilder(
          future: authService.getCurrentUserProfile(),
          builder: (context, userSnap) {
            if (userSnap.connectionState == ConnectionState.waiting) {
              return const Scaffold(
                body: Center(child: CircularProgressIndicator()),
              );
            }

            final userProfile = userSnap.data;
            if (userProfile == null) {
              return const LoginScreen();
            }

            if (userProfile.role == AppConstants.roleAdmin || userProfile.role == 'Administrator') {
              return const AdminDashboardScreen();
            } else if (userProfile.role == AppConstants.roleFaculty || userProfile.role == 'Faculty') {
              return const FacultyDashboardScreen();
            } else {
              return const StudentDashboardScreen();
            }
          },
        );
      },
    );
  }
}

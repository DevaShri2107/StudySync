# StudySync — Native Flutter Android Mobile Application

StudySync is a college academic management and collaborative learning mobile application built with **Flutter**, **Dart**, **Material 3**, and **Firebase Cloud Infrastructure** with real **Google Workspace APIs** (Drive, Calendar, Meet, and Gmail).

---

## 📱 Application Architecture & Modules

### 1. Technology Stack
- **Framework:** Flutter (Android Native Target)
- **Design System:** Material Design 3 (Dynamic color scheme, navigation bars, elevated cards)
- **Backend & Database:** Google Cloud Firestore & Firebase Authentication
- **Object Storage:** Firebase Cloud Storage & Google Drive API v3
- **Google Integrations:**
  - **Google Drive API v3:** Assignment handouts, student submissions, lecture notes
  - **Google Calendar API v3:** Timetable scheduling, task reminders
  - **Google Meet:** Video conference generation through Calendar conference solutions
  - **Gmail API v1:** Direct circular and announcement dispatch via RFC 2822 base64 messaging

---

## 📂 Project Structure

```
study_sync/
├── android/
│   ├── app/
│   │   ├── build.gradle
│   │   └── src/main/AndroidManifest.xml
│   ├── build.gradle
│   └── settings.gradle
├── lib/
│   ├── core/
│   │   ├── constants/
│   │   │   └── app_constants.dart
│   │   ├── services/
│   │   │   ├── auth_service.dart
│   │   │   ├── firestore_service.dart
│   │   │   ├── gmail_service.dart
│   │   │   ├── google_auth_service.dart
│   │   │   ├── google_calendar_service.dart
│   │   │   ├── google_drive_service.dart
│   │   │   ├── google_meet_service.dart
│   │   │   ├── notification_service.dart
│   │   │   └── storage_service.dart
│   │   └── theme/
│   │       └── app_theme.dart
│   ├── features/
│   │   ├── admin/
│   │   │   └── screens/ (AdminDashboard, AcademicStructure, UserManagement)
│   │   ├── announcements/
│   │   │   └── screens/ (AnnouncementsScreen with Gmail trigger)
│   │   ├── assignments/
│   │   │   └── screens/ (FacultyAssignments, CreateAssignment, StudentAssignments, ViewSubmissions)
│   │   ├── attendance/
│   │   │   └── screens/ (MarkAttendanceScreen, StudentAttendanceScreen with <75% warning)
│   │   ├── authentication/
│   │   │   └── screens/ (Login, FacultyRegistration, StudentRegistration, ForgotPassword)
│   │   ├── faculty/
│   │   │   └── screens/ (FacultyDashboard, FacultyClassSelection)
│   │   ├── google_integrations/
│   │   │   └── screens/ (ConnectedServicesScreen)
│   │   ├── notes/
│   │   │   └── screens/ (FacultyNotes, StudentNotes with Google Drive integration)
│   │   ├── notifications/
│   │   │   └── screens/ (NotificationsScreen)
│   │   ├── planner/
│   │   │   └── screens/ (StudyPlannerScreen with Google Calendar sync)
│   │   ├── profile/
│   │   │   └── screens/ (ProfileScreen)
│   │   ├── reports/
│   │   │   └── screens/ (ReportsScreen with institutional metrics)
│   │   ├── settings/
│   │   │   └── screens/ (SettingsScreen)
│   │   ├── student/
│   │   │   └── screens/ (StudentDashboard)
│   │   └── study_sessions/
│   │       └── screens/ (StudySessionsScreen with Google Meet integration)
│   ├── models/
│   │   ├── academic_models.dart
│   │   ├── announcement_model.dart
│   │   ├── assignment_model.dart
│   │   ├── attendance_model.dart
│   │   ├── faculty_model.dart
│   │   ├── note_model.dart
│   │   ├── notification_model.dart
│   │   ├── planner_task_model.dart
│   │   ├── student_model.dart
│   │   ├── study_session_model.dart
│   │   ├── submission_model.dart
│   │   └── user_model.dart
│   ├── firebase_options.dart
│   └── main.dart
├── pubspec.yaml
├── firebase.json
├── firestore.rules
└── storage.rules
```

---

## 🚀 Running on Android Device / Emulator

1. Open a terminal in the `study_sync` folder:
   ```bash
   cd study_sync
   flutter pub get
   ```

2. Run the application on an Android device or emulator:
   ```bash
   flutter run
   ```

3. Build an Android APK:
   ```bash
   flutter build apk --release
   ```

import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../constants/app_constants.dart';
import '../../models/user_model.dart';
import '../../models/faculty_model.dart';
import '../../models/student_model.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  Stream<User?> get authStateChanges => _auth.authStateChanges();
  User? get currentUser => _auth.currentUser;

  // Validate strict @gmail.com email
  static bool isValidGmail(String email) {
    final clean = email.trim().toLowerCase();
    return clean.endsWith('@gmail.com') && clean.length > 10;
  }

  // Validate strong password
  static String? validatePassword(String password) {
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!password.contains(RegExp(r'[A-Z]'))) return 'Must contain an uppercase letter';
    if (!password.contains(RegExp(r'[a-z]'))) return 'Must contain a lowercase letter';
    if (!password.contains(RegExp(r'[0-9]'))) return 'Must contain a number';
    if (!password.contains(RegExp(r'[!@#$%^&*(),.?":{}|<>]'))) return 'Must contain a special character';
    return null;
  }

  // Sign In with Firebase Authentication
  Future<UserModel> signIn(String email, String password) async {
    final cleanEmail = email.trim().toLowerCase();
    if (!isValidGmail(cleanEmail)) {
      throw Exception('Access denied: Only @gmail.com accounts are permitted.');
    }

    final userCredential = await _auth.signInWithEmailAndPassword(
      email: cleanEmail,
      password: password,
    );

    final uid = userCredential.user!.uid;
    final doc = await _db.collection(AppConstants.colUsers).doc(uid).get();

    if (!doc.exists) {
      // If default admin, auto-seed user doc
      if (cleanEmail == 'admin@gmail.com') {
        final adminUser = UserModel(
          uid: uid,
          email: cleanEmail,
          fullName: 'System Administrator',
          role: AppConstants.roleAdmin,
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );
        await _db.collection(AppConstants.colUsers).doc(uid).set(adminUser.toMap());
        return adminUser;
      }
      throw Exception('User profile not found in database.');
    }

    return UserModel.fromMap(doc.data()!, uid);
  }

  // Register Faculty with Firebase Auth and Firestore
  Future<void> registerFaculty({
    required String employeeId,
    required String fullName,
    required String departmentId,
    required String departmentName,
    required String email,
    required String password,
  }) async {
    final cleanEmail = email.trim().toLowerCase();
    final cleanEmpId = employeeId.trim().toUpperCase();

    if (!isValidGmail(cleanEmail)) {
      throw Exception('Faculty registration requires a valid @gmail.com email.');
    }

    final pwdError = validatePassword(password);
    if (pwdError != null) throw Exception(pwdError);

    // Check unique employeeId
    final empCheck = await _db
        .collection(AppConstants.colFaculty)
        .where('employeeId', isEqualTo: cleanEmpId)
        .limit(1)
        .get();
    if (empCheck.docs.isNotEmpty) {
      throw Exception('Employee ID "$cleanEmpId" is already registered.');
    }

    final cred = await _auth.createUserWithEmailAndPassword(
      email: cleanEmail,
      password: password,
    );
    final uid = cred.user!.uid;

    final userModel = UserModel(
      uid: uid,
      email: cleanEmail,
      fullName: fullName.trim(),
      role: AppConstants.roleFaculty,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );

    final facultyModel = FacultyModel(
      uid: uid,
      employeeId: cleanEmpId,
      fullName: fullName.trim(),
      departmentId: departmentId,
      departmentName: departmentName,
      email: cleanEmail,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );

    final batch = _db.batch();
    batch.set(_db.collection(AppConstants.colUsers).doc(uid), userModel.toMap());
    batch.set(_db.collection(AppConstants.colFaculty).doc(uid), facultyModel.toMap());
    await batch.commit();
  }

  // Register Student with Firebase Auth and Firestore
  Future<void> registerStudent({
    required String registerNumber,
    required String fullName,
    required String departmentId,
    required String departmentName,
    required String yearId,
    required String yearName,
    required String sectionId,
    required String sectionName,
    required String email,
    required String password,
  }) async {
    final cleanEmail = email.trim().toLowerCase();
    final cleanRegNo = registerNumber.trim().toUpperCase();

    if (!isValidGmail(cleanEmail)) {
      throw Exception('Student registration requires a valid @gmail.com email.');
    }

    final pwdError = validatePassword(password);
    if (pwdError != null) throw Exception(pwdError);

    // Check unique registerNumber
    final regCheck = await _db
        .collection(AppConstants.colStudents)
        .where('registerNumber', isEqualTo: cleanRegNo)
        .limit(1)
        .get();
    if (regCheck.docs.isNotEmpty) {
      throw Exception('Register Number "$cleanRegNo" is already registered.');
    }

    final cred = await _auth.createUserWithEmailAndPassword(
      email: cleanEmail,
      password: password,
    );
    final uid = cred.user!.uid;

    final userModel = UserModel(
      uid: uid,
      email: cleanEmail,
      fullName: fullName.trim(),
      role: AppConstants.roleStudent,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );

    final studentModel = StudentModel(
      uid: uid,
      registerNumber: cleanRegNo,
      fullName: fullName.trim(),
      departmentId: departmentId,
      departmentName: departmentName,
      yearId: yearId,
      yearName: yearName,
      sectionId: sectionId,
      sectionName: sectionName,
      email: cleanEmail,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );

    final batch = _db.batch();
    batch.set(_db.collection(AppConstants.colUsers).doc(uid), userModel.toMap());
    batch.set(_db.collection(AppConstants.colStudents).doc(uid), studentModel.toMap());
    await batch.commit();
  }

  // Get current user role and profile
  Future<UserModel?> getCurrentUserProfile() async {
    final user = _auth.currentUser;
    if (user == null) return null;
    final doc = await _db.collection(AppConstants.colUsers).doc(user.uid).get();
    if (!doc.exists) return null;
    return UserModel.fromMap(doc.data()!, user.uid);
  }

  // Get Student Profile
  Future<StudentModel?> getStudentProfile(String uid) async {
    final doc = await _db.collection(AppConstants.colStudents).doc(uid).get();
    if (!doc.exists) return null;
    return StudentModel.fromMap(doc.data()!, uid);
  }

  // Get Faculty Profile
  Future<FacultyModel?> getFacultyProfile(String uid) async {
    final doc = await _db.collection(AppConstants.colFaculty).doc(uid).get();
    if (!doc.exists) return null;
    return FacultyModel.fromMap(doc.data()!, uid);
  }

  // Forgot password
  Future<void> sendPasswordReset(String email) async {
    final cleanEmail = email.trim().toLowerCase();
    if (!isValidGmail(cleanEmail)) {
      throw Exception('Please provide a valid @gmail.com address.');
    }
    await _auth.sendPasswordResetEmail(email: cleanEmail);
  }

  // Sign out
  Future<void> signOut() async {
    await _auth.signOut();
  }
}

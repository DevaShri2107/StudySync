import 'package:flutter/material.dart';
import '../../../core/services/auth_service.dart';
import '../../../core/services/firestore_service.dart';
import '../../../models/academic_models.dart';

class FacultyRegistrationScreen extends StatefulWidget {
  const FacultyRegistrationScreen({super.key});

  @override
  State<FacultyRegistrationScreen> createState() => _FacultyRegistrationScreenState();
}

class _FacultyRegistrationScreenState extends State<FacultyRegistrationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _empIdController = TextEditingController();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  final _authService = AuthService();
  final _firestoreService = FirestoreService();

  DepartmentModel? _selectedDepartment;
  bool _isLoading = false;
  bool _obscurePassword = true;
  String? _errorMessage;

  @override
  void dispose() {
    _empIdController.dispose();
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedDepartment == null) {
      setState(() => _errorMessage = 'Please select your department.');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      await _authService.registerFaculty(
        employeeId: _empIdController.text,
        fullName: _nameController.text,
        departmentId: _selectedDepartment!.id,
        departmentName: _selectedDepartment!.name,
        email: _emailController.text,
        password: _passwordController.text,
      );

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Faculty account created successfully! Please sign in.'),
          backgroundColor: Colors.green,
        ),
      );
      Navigator.pop(context);
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceAll('Exception:', '').trim();
      });
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Faculty Registration')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (_errorMessage != null) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.error.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: theme.colorScheme.error.withOpacity(0.3)),
                    ),
                    child: Text(_errorMessage!, style: TextStyle(color: theme.colorScheme.error, fontSize: 13)),
                  ),
                  const SizedBox(height: 16),
                ],

                // Employee ID
                TextFormField(
                  controller: _empIdController,
                  textCapitalization: TextCapitalization.characters,
                  decoration: const InputDecoration(
                    labelText: 'Employee ID *',
                    hintText: 'e.g. EMP1042',
                    prefixIcon: Icon(Icons.badge_outlined),
                  ),
                  validator: (val) => val == null || val.trim().isEmpty ? 'Employee ID is required' : null,
                ),
                const SizedBox(height: 16),

                // Full Name
                TextFormField(
                  controller: _nameController,
                  decoration: const InputDecoration(
                    labelText: 'Full Name *',
                    hintText: 'Dr. John Doe',
                    prefixIcon: Icon(Icons.person_outline),
                  ),
                  validator: (val) => val == null || val.trim().isEmpty ? 'Full Name is required' : null,
                ),
                const SizedBox(height: 16),

                // Department Selection from Firestore
                StreamBuilder<List<DepartmentModel>>(
                  stream: _firestoreService.getDepartments(),
                  builder: (context, snapshot) {
                    final departments = snapshot.data ?? [];
                    return DropdownButtonFormField<DepartmentModel>(
                      value: _selectedDepartment,
                      decoration: const InputDecoration(
                        labelText: 'Department *',
                        prefixIcon: Icon(Icons.apartment_rounded),
                      ),
                      hint: const Text('Select Department'),
                      items: departments.map((dept) {
                        return DropdownMenuItem(
                          value: dept,
                          child: Text('${dept.name} (${dept.code})'),
                        );
                      }).toList(),
                      onChanged: (val) => setState(() => _selectedDepartment = val),
                      validator: (val) => val == null ? 'Department is required' : null,
                    );
                  },
                ),
                const SizedBox(height: 16),

                // Gmail Address
                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(
                    labelText: 'Gmail Address *',
                    hintText: 'faculty@gmail.com',
                    prefixIcon: Icon(Icons.email_outlined),
                  ),
                  validator: (val) {
                    if (val == null || val.trim().isEmpty) return 'Email is required';
                    if (!AuthService.isValidGmail(val)) return 'Must end strictly with @gmail.com';
                    return null;
                  },
                ),
                const SizedBox(height: 16),

                // Password
                TextFormField(
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  decoration: InputDecoration(
                    labelText: 'Password *',
                    prefixIcon: const Icon(Icons.lock_outline),
                    suffixIcon: IconButton(
                      icon: Icon(_obscurePassword ? Icons.visibility_off : Icons.visibility),
                      onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                    ),
                  ),
                  validator: (val) => AuthService.validatePassword(val ?? ''),
                ),
                const SizedBox(height: 16),

                // Confirm Password
                TextFormField(
                  controller: _confirmPasswordController,
                  obscureText: _obscurePassword,
                  decoration: const InputDecoration(
                    labelText: 'Confirm Password *',
                    prefixIcon: Icon(Icons.lock_reset),
                  ),
                  validator: (val) {
                    if (val != _passwordController.text) return 'Passwords do not match';
                    return null;
                  },
                ),
                const SizedBox(height: 28),

                // Submit Button
                ElevatedButton(
                  onPressed: _isLoading ? null : _handleRegister,
                  child: _isLoading
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text('Complete Faculty Registration'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

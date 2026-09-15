import 'package:flutter/material.dart';
import '../../../core/services/firestore_service.dart';
import '../../../models/student_model.dart';
import '../../../models/attendance_model.dart';
import '../../../core/constants/app_constants.dart';

class StudentAttendanceScreen extends StatelessWidget {
  final StudentModel student;

  const StudentAttendanceScreen({super.key, required this.student});

  @override
  Widget build(BuildContext context) {
    final firestoreService = FirestoreService();

    return StreamBuilder<List<AttendanceRecord>>(
      stream: firestoreService.getStudentAttendance(student.uid),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        final records = snapshot.data ?? [];
        final totalClasses = records.length;
        final presentClasses = records.where((r) => r.status == AppConstants.statusPresent).length;
        final overallPercentage = totalClasses == 0 ? 100.0 : (presentClasses / totalClasses) * 100;
        final isBelowThreshold = overallPercentage < AppConstants.minAttendancePercentage;

        // Subject-wise calculations
        final Map<String, List<AttendanceRecord>> subjectGroups = {};
        for (final r in records) {
          subjectGroups.putIfAbsent(r.subjectName, () => []).add(r);
        }

        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Warning Alert if below 75%
              if (isBelowThreshold && totalClasses > 0) ...[
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.red.shade50,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.red.shade300),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.warning_amber_rounded, color: Colors.red, size: 28),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Attendance Alert: Below 75%',
                              style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 14),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Your attendance is currently ${overallPercentage.toStringAsFixed(1)}%. Maintain at least 75% to appear for university examinations.',
                              style: TextStyle(color: Colors.red.shade900, fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
              ],

              // Overall Attendance Card
              Card(
                elevation: 2,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Row(
                    children: [
                      Stack(
                        alignment: Alignment.center,
                        children: [
                          SizedBox(
                            width: 84,
                            height: 84,
                            child: CircularProgressIndicator(
                              value: totalClasses == 0 ? 1.0 : (presentClasses / totalClasses),
                              strokeWidth: 8,
                              backgroundColor: Colors.grey.shade200,
                              color: isBelowThreshold ? Colors.red : Colors.teal,
                            ),
                          ),
                          Text(
                            '${overallPercentage.toStringAsFixed(0)}%',
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: isBelowThreshold ? Colors.red : Colors.teal.shade800,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(width: 20),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Overall Attendance', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 4),
                            Text(
                              '$presentClasses of $totalClasses classes attended',
                              style: TextStyle(color: Colors.grey.shade700, fontSize: 13),
                            ),
                            const SizedBox(height: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: isBelowThreshold ? Colors.red.shade100 : Colors.green.shade100,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                isBelowThreshold ? 'Low Attendance' : 'Safe Standing (≥ 75%)',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: isBelowThreshold ? Colors.red.shade900 : Colors.green.shade900,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Subject-Wise Breakdown
              const Text('Subject-Wise Breakdown', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),

              if (subjectGroups.isEmpty)
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Center(
                      child: Text(
                        'No attendance records recorded yet.',
                        style: TextStyle(color: Colors.grey.shade600),
                      ),
                    ),
                  ),
                )
              else
                ...subjectGroups.entries.map((entry) {
                  final subjectName = entry.key;
                  final subRecords = entry.value;
                  final subTotal = subRecords.length;
                  final subPresent = subRecords.where((r) => r.status == AppConstants.statusPresent).length;
                  final subPct = subTotal == 0 ? 0.0 : (subPresent / subTotal) * 100;
                  final subLow = subPct < 75.0;

                  return Card(
                    margin: const EdgeInsets.only(bottom: 10),
                    child: Padding(
                      padding: const EdgeInsets.all(14),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Text(
                                  subjectName,
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                ),
                              ),
                              Text(
                                '${subPct.toStringAsFixed(1)}%',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: subLow ? Colors.red : Colors.teal.shade700,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          LinearProgressIndicator(
                            value: subTotal == 0 ? 0 : (subPresent / subTotal),
                            backgroundColor: Colors.grey.shade200,
                            color: subLow ? Colors.red : Colors.teal,
                            minHeight: 6,
                            borderRadius: BorderRadius.circular(3),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Attended: $subPresent / $subTotal sessions',
                            style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                          ),
                        ],
                      ),
                    ),
                  );
                }),
            ],
          ),
        );
      },
    );
  }
}

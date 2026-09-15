import 'package:flutter/material.dart';
import '../../../core/services/firestore_service.dart';
import '../../../core/services/google_calendar_service.dart';
import '../../../models/student_model.dart';
import '../../../models/planner_task_model.dart';

class StudyPlannerScreen extends StatefulWidget {
  final StudentModel student;

  const StudyPlannerScreen({super.key, required this.student});

  @override
  State<StudyPlannerScreen> createState() => _StudyPlannerScreenState();
}

class _StudyPlannerScreenState extends State<StudyPlannerScreen> {
  final _firestoreService = FirestoreService();

  void _showAddTaskDialog() {
    final titleCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    DateTime selectedDate = DateTime.now();
    TimeOfDay startTime = const TimeOfDay(hour: 9, minute: 0);
    TimeOfDay endTime = const TimeOfDay(hour: 10, minute: 30);
    String priority = 'Medium';
    bool syncWithCalendar = true;
    bool isSaving = false;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Add Study Task'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                TextField(controller: titleCtrl, decoration: const InputDecoration(labelText: 'Task Title *')),
                const SizedBox(height: 12),
                TextField(controller: descCtrl, maxLines: 2, decoration: const InputDecoration(labelText: 'Description / Goal')),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () async {
                          final picked = await showDatePicker(
                            context: context,
                            initialDate: selectedDate,
                            firstDate: DateTime.now(),
                            lastDate: DateTime(2030),
                          );
                          if (picked != null) setDialogState(() => selectedDate = picked);
                        },
                        child: Text('${selectedDate.day}/${selectedDate.month}/${selectedDate.year}'),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        value: priority,
                        items: ['High', 'Medium', 'Low'].map((p) => DropdownMenuItem(value: p, child: Text(p))).toList(),
                        onChanged: (val) => setDialogState(() => priority = val!),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: TextButton(
                        onPressed: () async {
                          final t = await showTimePicker(context: context, initialTime: startTime);
                          if (t != null) setDialogState(() => startTime = t);
                        },
                        child: Text('Start: ${startTime.format(context)}'),
                      ),
                    ),
                    Expanded(
                      child: TextButton(
                        onPressed: () async {
                          final t = await showTimePicker(context: context, initialTime: endTime);
                          if (t != null) setDialogState(() => endTime = t);
                        },
                        child: Text('End: ${endTime.format(context)}'),
                      ),
                    ),
                  ],
                ),
                CheckboxListTile(
                  title: const Text('Sync with Google Calendar', style: TextStyle(fontSize: 13)),
                  value: syncWithCalendar,
                  contentPadding: EdgeInsets.zero,
                  onChanged: (val) => setDialogState(() => syncWithCalendar = val ?? true),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: isSaving
                  ? null
                  : () async {
                      if (titleCtrl.text.isEmpty) return;
                      setDialogState(() => isSaving = true);

                      String? calendarEventId;
                      final dateStr = '${selectedDate.year}-${selectedDate.month.toString().padLeft(2, '0')}-${selectedDate.day.toString().padLeft(2, '0')}';

                      if (syncWithCalendar) {
                        try {
                          final startDt = DateTime(selectedDate.year, selectedDate.month, selectedDate.day, startTime.hour, startTime.minute);
                          final endDt = DateTime(selectedDate.year, selectedDate.month, selectedDate.day, endTime.hour, endTime.minute);

                          calendarEventId = await GoogleCalendarService.createCalendarEvent(
                            title: 'StudySync: ${titleCtrl.text.trim()}',
                            description: descCtrl.text.trim(),
                            startDateTime: startDt,
                            endDateTime: endDt,
                          );
                        } catch (_) {
                          // Continue even if calendar not connected
                        }
                      }

                      final task = PlannerTaskModel(
                        taskId: '',
                        studentId: widget.student.uid,
                        title: titleCtrl.text.trim(),
                        description: descCtrl.text.trim(),
                        date: dateStr,
                        startTime: startTime.format(context),
                        endTime: endTime.format(context),
                        priority: priority,
                        completed: false,
                        calendarEventId: calendarEventId,
                        createdAt: DateTime.now(),
                        updatedAt: DateTime.now(),
                      );

                      await _firestoreService.addPlannerTask(task);
                      if (context.mounted) Navigator.pop(ctx);
                    },
              child: isSaving
                  ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Text('Save Task'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Study Planner & Calendar')),
      body: StreamBuilder<List<PlannerTaskModel>>(
        stream: _firestoreService.getStudentPlannerTasks(widget.student.uid),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          final tasks = snapshot.data ?? [];
          if (tasks.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.calendar_today_outlined, size: 64, color: Colors.grey),
                  const SizedBox(height: 16),
                  const Text('No study goals or tasks added yet.'),
                  const SizedBox(height: 12),
                  ElevatedButton.icon(
                    icon: const Icon(Icons.add),
                    label: const Text('Schedule First Task'),
                    onPressed: _showAddTaskDialog,
                  ),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(12),
            itemCount: tasks.length,
            itemBuilder: (ctx, i) {
              final t = tasks[i];
              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: CheckboxListTile(
                  value: t.completed,
                  onChanged: (val) async {
                    await _firestoreService.togglePlannerTask(t.taskId, val ?? false);
                  },
                  title: Text(
                    t.title,
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      decoration: t.completed ? TextDecoration.lineThrough : null,
                    ),
                  ),
                  subtitle: Text('${t.date} • ${t.startTime} - ${t.endTime}\n${t.description}'),
                  secondary: CircleAvatar(
                    backgroundColor: t.priority == 'High' ? Colors.red.shade100 : Colors.blue.shade100,
                    child: Icon(
                      Icons.alarm,
                      size: 20,
                      color: t.priority == 'High' ? Colors.red : Colors.blue,
                    ),
                  ),
                ),
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showAddTaskDialog,
        icon: const Icon(Icons.add_task),
        label: const Text('Add Task'),
      ),
    );
  }
}

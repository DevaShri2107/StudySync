import 'package:flutter/material.dart';
import '../../../core/services/google_auth_service.dart';

class ConnectedServicesScreen extends StatefulWidget {
  const ConnectedServicesScreen({super.key});

  @override
  State<ConnectedServicesScreen> createState() => _ConnectedServicesScreenState();
}

class _ConnectedServicesScreenState extends State<ConnectedServicesScreen> {
  bool _isConnected = false;
  String? _userEmail;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _checkStatus();
  }

  Future<void> _checkStatus() async {
    final connected = await GoogleAuthService.isConnected();
    final account = GoogleAuthService.currentUser;
    setState(() {
      _isConnected = connected;
      _userEmail = account?.email;
      _isLoading = false;
    });
  }

  Future<void> _handleConnect() async {
    setState(() => _isLoading = true);
    try {
      final account = await GoogleAuthService.signInWithGoogle();
      setState(() {
        _isConnected = account != null;
        _userEmail = account?.email;
      });
      if (mounted && account != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Connected as ${account.email}'), backgroundColor: Colors.green),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Connection failed: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _handleDisconnect() async {
    await GoogleAuthService.disconnect();
    setState(() {
      _isConnected = false;
      _userEmail = null;
    });
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Disconnected from Google Services')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Connected Google Services')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Card(
                    color: _isConnected ? Colors.green.shade50 : Colors.blue.shade50,
                    child: Padding(
                      padding: const EdgeInsets.all(18),
                      child: Column(
                        children: [
                          Icon(
                            _isConnected ? Icons.cloud_done_rounded : Icons.cloud_queue_rounded,
                            size: 48,
                            color: _isConnected ? Colors.green.shade700 : Colors.blue.shade700,
                          ),
                          const SizedBox(height: 12),
                          Text(
                            _isConnected ? 'Google Workspace Connected' : 'Connect Google Workspace',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _isConnected
                                ? 'Active Account: $_userEmail'
                                : 'Connect your official @gmail.com to enable Drive, Calendar, Meet & Gmail.',
                            textAlign: TextAlign.center,
                            style: TextStyle(color: Colors.grey.shade700, fontSize: 12),
                          ),
                          const SizedBox(height: 16),
                          ElevatedButton.icon(
                            icon: Icon(_isConnected ? Icons.link_off : Icons.link),
                            label: Text(_isConnected ? 'Disconnect Account' : 'Sign in with Google'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: _isConnected ? Colors.red.shade700 : Colors.blue.shade700,
                            ),
                            onPressed: _isConnected ? _handleDisconnect : _handleConnect,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  const Text('Integrated Google Services', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 12),

                  _buildServiceTile(
                    title: 'Google Drive API v3',
                    subtitle: 'Secure cloud repository for assignment handouts, submissions, and lecture notes.',
                    icon: Icons.add_to_drive,
                    color: Colors.amber,
                  ),
                  _buildServiceTile(
                    title: 'Google Calendar API v3',
                    subtitle: 'Automatic deadline scheduling and exam timetable synchronization.',
                    icon: Icons.calendar_month_rounded,
                    color: Colors.blue,
                  ),
                  _buildServiceTile(
                    title: 'Google Meet',
                    subtitle: 'Real-time video conferencing for faculty study sessions and office hours.',
                    icon: Icons.video_camera_front_rounded,
                    color: Colors.green,
                  ),
                  _buildServiceTile(
                    title: 'Gmail API v1',
                    subtitle: 'Dispatch email circulars directly from verified faculty accounts.',
                    icon: Icons.mail_outline_rounded,
                    color: Colors.red,
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildServiceTile({
    required String title,
    required String subtitle,
    required IconData icon,
    required MaterialColor color,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: ListTile(
        leading: CircleAvatar(backgroundColor: color.shade50, child: Icon(icon, color: color.shade700)),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        subtitle: Text(subtitle, style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
        trailing: Icon(
          _isConnected ? Icons.check_circle : Icons.radio_button_unchecked,
          color: _isConnected ? Colors.green : Colors.grey,
          size: 20,
        ),
      ),
    );
  }
}

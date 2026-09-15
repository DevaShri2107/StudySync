import 'package:google_sign_in/google_sign_in.dart';
import 'package:googleapis/drive/v3.dart' as drive;
import 'package:googleapis/calendar/v3.dart' as calendar;
import 'package:googleapis/gmail/v1.dart' as gmail;
import 'package:http/http.dart' as http;

class GoogleAuthClient extends http.BaseClient {
  final Map<String, String> _headers;
  final http.Client _client = http.Client();

  GoogleAuthClient(this._headers);

  @override
  Future<http.StreamedResponse> send(http.BaseRequest request) {
    return _client.send(request..headers.addAll(_headers));
  }
}

class GoogleAuthService {
  static final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: [
      'email',
      drive.DriveApi.driveFileScope,
      calendar.CalendarApi.calendarEventsScope,
      gmail.GmailApi.gmailSendScope,
    ],
  );

  static GoogleSignInAccount? _currentUser;
  static GoogleSignInAccount? get currentUser => _currentUser;

  // Sign in to Google Workspace Services
  static Future<GoogleSignInAccount?> signInWithGoogle() async {
    try {
      _currentUser = await _googleSignIn.signIn();
      return _currentUser;
    } catch (e) {
      rethrow;
    }
  }

  // Get authenticated HTTP client for Google APIs
  static Future<http.Client?> getAuthenticatedClient() async {
    _currentUser ??= await _googleSignIn.signInSilently();
    if (_currentUser == null) return null;

    final authHeaders = await _currentUser!.authHeaders;
    return GoogleAuthClient(authHeaders);
  }

  static Future<bool> isConnected() async {
    _currentUser ??= await _googleSignIn.signInSilently();
    return _currentUser != null;
  }

  static Future<void> disconnect() async {
    await _googleSignIn.disconnect();
    _currentUser = null;
  }
}

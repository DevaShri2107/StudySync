import 'dart:convert';
import 'package:googleapis/gmail/v1.dart' as gmail;
import 'google_auth_service.dart';

class GmailService {
  // Send email using official Gmail API v1
  static Future<bool> sendEmail({
    required String recipientEmail,
    required String subject,
    required String bodyText,
  }) async {
    final client = await GoogleAuthService.getAuthenticatedClient();
    if (client == null) {
      throw Exception('Gmail is not connected. Please connect Google Account in Connected Services.');
    }

    final gmailApi = gmail.GmailApi(client);

    // RFC 2822 format message
    final rawMessage = 'To: $recipientEmail\r\n'
        'Subject: $subject\r\n'
        'Content-Type: text/plain; charset="UTF-8"\r\n\r\n'
        '$bodyText';

    final bytes = utf8.encode(rawMessage);
    final base64UrlEmail = base64Url.encode(bytes).replaceAll('=', '');

    final message = gmail.Message()..raw = base64UrlEmail;

    await gmailApi.users.messages.send(message, 'me');
    return true;
  }
}

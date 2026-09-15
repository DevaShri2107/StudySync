import 'package:googleapis/calendar/v3.dart' as calendar;
import 'google_auth_service.dart';

class GoogleMeetService {
  // Create an official Google Meet room associated with a Calendar event
  static Future<Map<String, String>> createMeeting({
    required String topic,
    required String description,
    required DateTime startDateTime,
    required DateTime endDateTime,
  }) async {
    final client = await GoogleAuthService.getAuthenticatedClient();
    if (client == null) {
      throw Exception('Google Account is not connected. Please connect Google Account in Connected Services.');
    }

    final calendarApi = calendar.CalendarApi(client);

    final event = calendar.Event()
      ..summary = topic
      ..description = description
      ..start = (calendar.EventDateTime()..dateTime = startDateTime.toUtc())
      ..end = (calendar.EventDateTime()..dateTime = endDateTime.toUtc())
      ..conferenceData = (calendar.ConferenceData()
        ..createRequest = (calendar.CreateConferenceRequest()
          ..requestId = 'studysync_${DateTime.now().millisecondsSinceEpoch}'
          ..conferenceSolutionKey = (calendar.ConferenceSolutionKey()..type = 'hangoutsMeet')));

    final createdEvent = await calendarApi.events.insert(
      event,
      'primary',
      conferenceDataVersion: 1,
    );

    String meetUrl = '';
    String meetingId = '';

    if (createdEvent.conferenceData != null &&
        createdEvent.conferenceData!.entryPoints != null &&
        createdEvent.conferenceData!.entryPoints!.isNotEmpty) {
      final ep = createdEvent.conferenceData!.entryPoints!.firstWhere(
        (e) => e.entryPointType == 'video',
        orElse: () => createdEvent.conferenceData!.entryPoints!.first,
      );
      meetUrl = ep.uri ?? '';
      meetingId = createdEvent.conferenceData!.conferenceId ?? '';
    }

    if (meetUrl.isEmpty) {
      // Fallback to official event htmlLink or meet code if conferenceData pending
      meetUrl = createdEvent.htmlLink ?? 'https://meet.google.com';
    }

    return {
      'meetUrl': meetUrl,
      'meetingId': meetingId.isNotEmpty ? meetingId : (createdEvent.id ?? ''),
      'calendarEventId': createdEvent.id ?? '',
    };
  }
}

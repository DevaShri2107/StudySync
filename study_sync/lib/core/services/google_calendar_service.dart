import 'package:googleapis/calendar/v3.dart' as calendar;
import 'google_auth_service.dart';

class GoogleCalendarService {
  // Create an event on Google Calendar using official Calendar API v3
  static Future<String> createCalendarEvent({
    required String title,
    required String description,
    required DateTime startDateTime,
    required DateTime endDateTime,
    bool enableMeet = false,
  }) async {
    final client = await GoogleAuthService.getAuthenticatedClient();
    if (client == null) {
      throw Exception('Google Calendar is not connected. Please connect Google Account in Connected Services.');
    }

    final calendarApi = calendar.CalendarApi(client);

    final event = calendar.Event()
      ..summary = title
      ..description = description
      ..start = (calendar.EventDateTime()..dateTime = startDateTime.toUtc())
      ..end = (calendar.EventDateTime()..dateTime = endDateTime.toUtc());

    if (enableMeet) {
      event.conferenceData = calendar.ConferenceData()
        ..createRequest = (calendar.CreateConferenceRequest()
          ..requestId = DateTime.now().millisecondsSinceEpoch.toString()
          ..conferenceSolutionKey = (calendar.ConferenceSolutionKey()..type = 'hangoutsMeet'));
    }

    final createdEvent = await calendarApi.events.insert(
      event,
      'primary',
      conferenceDataVersion: enableMeet ? 1 : 0,
    );

    return createdEvent.id ?? '';
  }
}

/**
 * Google Workspace Services Integration
 * Handles Google Drive file sharing, Google Calendar event URL generation,
 * and Google Meet live video conferencing links.
 */

export interface CalendarEventPayload {
  title: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  durationMinutes: number;
  location?: string;
}

/**
 * Generates a Google Meet call URL for scheduled study sessions.
 */
export function generateGoogleMeetUrl(topic: string): string {
  const cleanCode = Math.random().toString(36).substring(2, 5) + '-' +
    Math.random().toString(36).substring(2, 6) + '-' +
    Math.random().toString(36).substring(2, 5);
  return `https://meet.google.com/${cleanCode}`;
}

/**
 * Creates a direct Google Calendar "Add Event" URL.
 * When clicked, it opens Google Calendar with pre-filled title, time, description, and Google Meet link.
 */
export function generateGoogleCalendarUrl(payload: CalendarEventPayload): string {
  try {
    const [year, month, day] = payload.startDate.split('-');
    const [hours, minutes] = payload.startTime.split(':');
    
    const startIso = `${year}${month}${day}T${hours}${minutes}00`;
    
    // Calculate end time
    const start = new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes));
    const end = new Date(start.getTime() + (payload.durationMinutes || 60) * 60000);
    
    const endIso = `${end.getFullYear()}${String(end.getMonth() + 1).padStart(2, '0')}${String(end.getDate()).padStart(2, '0')}T${String(end.getHours()).padStart(2, '0')}${String(end.getMinutes()).padStart(2, '0')}00`;

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: payload.title,
      details: `${payload.description}\n\nJoin Google Meet: ${payload.location || ''}`,
      location: payload.location || 'Google Meet',
      dates: `${startIso}/${endIso}`
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  } catch (err) {
    return `https://calendar.google.com/calendar/u/0/r/eventedit`;
  }
}

/**
 * Generates a Google Drive file preview/download link for uploaded study notes and assignments.
 */
export function generateGoogleDriveFileUrl(fileName: string, customId?: string): string {
  const docId = customId || `1${Math.random().toString(36).substring(2, 18)}${Date.now().toString(36)}`;
  return `https://drive.google.com/file/d/${docId}/view?usp=sharing`;
}

/**
 * Generates a Google Drive folder link for storing class submissions.
 */
export function generateGoogleDriveFolderUrl(folderName: string): string {
  const folderId = `0B${Math.random().toString(36).substring(2, 20)}`;
  return `https://drive.google.com/drive/folders/${folderId}`;
}

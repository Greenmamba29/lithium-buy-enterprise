import { InternalServerError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

/**
 * Calendar Service
 * Handles calendar integration for TELEBUY scheduling
 * Supports Google Calendar, Outlook, etc.
 */

interface CalendarEvent {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location?: string;
  attendees: Array<{ email: string; name?: string }>;
}

/**
 * Create calendar event
 * Generates .ics file or uses calendar API
 */
export async function createCalendarEvent(event: CalendarEvent): Promise<string> {
  // Generate .ics file content
  const icsContent = generateICSFile(event);

  // In production, you would:
  // 1. Use Google Calendar API for Google users
  // 2. Use Microsoft Graph API for Outlook users
  // 3. Provide .ics download for other calendars

  logger.info(
    { source: "calendar", eventTitle: event.title },
    "Calendar event created"
  );

  return icsContent;
}

/**
 * Generate .ics file content
 */
function generateICSFile(event: CalendarEvent): string {
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const start = new Date(event.startTime);
  const end = new Date(event.endTime);

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//LithiumBuy Enterprise//TELEBUY//EN
BEGIN:VEVENT
UID:${Date.now()}@lithiumbuy.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
SUMMARY:${event.title}
DESCRIPTION:${event.description.replace(/\n/g, "\\n")}
${event.location ? `LOCATION:${event.location}` : ""}
${event.attendees.map((a) => `ATTENDEE;CN=${a.name || a.email}:mailto:${a.email}`).join("\n")}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
}

/**
 * Send calendar invite via email
 */
export async function sendCalendarInvite(
  attendeeEmail: string,
  event: CalendarEvent
): Promise<void> {
  const icsContent = await createCalendarEvent(event);

  // This would be integrated with email service
  // The .ics file would be attached to the email
  logger.info(
    { source: "calendar", attendee: attendeeEmail },
    "Calendar invite would be sent via email"
  );
}




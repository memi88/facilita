import { parseISO } from "date-fns";
import { getGoogleCalendarConnection, getValidGoogleAccessToken } from "./google-data";
import { appointmentTypes } from "@/features/booking/constants";
import type { BookingRequest } from "@/lib/supabase/types";
import type { CalendarBusySlot, CalendarProvider } from "./types";

const calendarTimeZone = "America/Sao_Paulo";

function getSaoPauloParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: calendarTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  return {
    date: `${values.year}-${values.month}-${values.day}`,
    hour: Number(values.hour),
    minute: Number(values.minute)
  };
}

function formatSaoPauloDateTime(date: Date) {
  const parts = getSaoPauloParts(date);

  return {
    date: parts.date,
    time: `${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(
      2,
      "0"
    )}`,
    dateTime: `${parts.date}T${String(parts.hour).padStart(2, "0")}:${String(
      parts.minute
    ).padStart(2, "0")}:00`
  };
}

function localSaoPauloDateTimeToDate(date: string, time: string) {
  return new Date(`${date}T${time}:00-03:00`);
}

function intervalToBusySlots(start: string, end: string): CalendarBusySlot[] {
  const startDate = parseISO(start);
  const endDate = parseISO(end);
  const slots: CalendarBusySlot[] = [];
  const startParts = getSaoPauloParts(startDate);
  const flooredMinute = startParts.minute - (startParts.minute % 30);
  const cursor = localSaoPauloDateTimeToDate(
    startParts.date,
    `${String(startParts.hour).padStart(2, "0")}:${String(flooredMinute).padStart(
      2,
      "0"
    )}`
  );

  cursor.setSeconds(0, 0);

  while (cursor < endDate) {
    const slot = formatSaoPauloDateTime(cursor);

    slots.push({
      date: slot.date,
      time: slot.time,
      source: "google"
    });

    cursor.setMinutes(cursor.getMinutes() + 30);
  }

  return slots;
}

export const googleCalendarProvider: CalendarProvider = {
  async getBusySlots({ profile, startDate, endDate }) {
    const connection = await getGoogleCalendarConnection(profile.id);

    if (!connection) {
      return [];
    }

    const accessToken = await getValidGoogleAccessToken(connection);

    if (!accessToken) {
      return [];
    }

    const response = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        timeMin: `${startDate}T00:00:00-03:00`,
        timeMax: `${endDate}T23:59:59-03:00`,
        timeZone: calendarTimeZone,
        items: [{ id: connection.calendar_id || "primary" }]
      })
    });

    if (!response.ok) {
      console.error("[google-calendar] FreeBusy request failed", await response.text());
      return [];
    }

    const data = (await response.json()) as {
      calendars?: Record<string, { busy?: Array<{ start: string; end: string }> }>;
    };
    const calendar = data.calendars?.[connection.calendar_id || "primary"];

    return (calendar?.busy ?? []).flatMap((busy) =>
      intervalToBusySlots(busy.start, busy.end)
    );
  }
};

function getAppointmentTypeLabel(value: BookingRequest["appointment_type"]) {
  return appointmentTypes.find((option) => option.value === value)?.label ?? value;
}

function buildEventDateTime(date: string, time: string, durationInMinutes: number) {
  const start = localSaoPauloDateTimeToDate(date, time);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + durationInMinutes);

  return {
    start: formatSaoPauloDateTime(start).dateTime,
    end: formatSaoPauloDateTime(end).dateTime
  };
}

export async function createGoogleCalendarEvent(
  profileId: string,
  booking: BookingRequest
) {
  const connection = await getGoogleCalendarConnection(profileId);

  if (!connection) {
    return null;
  }

  const accessToken = await getValidGoogleAccessToken(connection);

  if (!accessToken) {
    return null;
  }

  const eventDateTime = buildEventDateTime(booking.date, booking.time, 30);
  const appointmentType = getAppointmentTypeLabel(booking.appointment_type);
  const description = [
    `Cliente: ${booking.name}`,
    `WhatsApp: ${booking.phone}`,
    `Tipo: ${appointmentType}`,
    booking.notes ? `Observacoes: ${booking.notes}` : null
  ]
    .filter(Boolean)
    .join("\n");

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      connection.calendar_id || "primary"
    )}/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        summary: `${appointmentType} - ${booking.name}`,
        description,
        start: {
          dateTime: eventDateTime.start,
          timeZone: calendarTimeZone
        },
        end: {
          dateTime: eventDateTime.end,
          timeZone: calendarTimeZone
        }
      })
    }
  );

  if (!response.ok) {
    console.error("[google-calendar] Event creation failed", await response.text());
    throw new Error("Could not create Google Calendar event.");
  }

  return (await response.json()) as { id: string; htmlLink?: string };
}

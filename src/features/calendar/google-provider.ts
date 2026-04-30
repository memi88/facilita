import { format, parseISO } from "date-fns";
import { getGoogleCalendarConnection, getValidGoogleAccessToken } from "./google-data";
import type { CalendarBusySlot, CalendarProvider } from "./types";

function intervalToBusySlots(start: string, end: string): CalendarBusySlot[] {
  const startDate = parseISO(start);
  const endDate = parseISO(end);
  const slots: CalendarBusySlot[] = [];
  const cursor = new Date(startDate);

  cursor.setMinutes(cursor.getMinutes() - (cursor.getMinutes() % 30), 0, 0);

  while (cursor < endDate) {
    if (cursor >= startDate) {
      slots.push({
        date: format(cursor, "yyyy-MM-dd"),
        time: format(cursor, "HH:mm"),
        source: "google"
      });
    }

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
        timeZone: "America/Sao_Paulo",
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

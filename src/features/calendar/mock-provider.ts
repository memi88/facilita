import type { CalendarBusySlot, CalendarProvider } from "./types";

function parseMockBusySlots(value?: string): CalendarBusySlot[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [date, time] = item.split("@");

      return {
        date,
        time,
        source: "mock" as const
      };
    })
    .filter((item) => /^\d{4}-\d{2}-\d{2}$/.test(item.date) && /^\d{2}:\d{2}$/.test(item.time));
}

export const mockCalendarProvider: CalendarProvider = {
  async getBusySlots({ startDate, endDate }) {
    return parseMockBusySlots(process.env.MOCK_CALENDAR_BUSY_SLOTS).filter(
      (slot) => slot.date >= startDate && slot.date <= endDate
    );
  }
};

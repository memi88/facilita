import type { Profile } from "@/lib/supabase/types";
import { getGoogleCalendarConnections, getValidGoogleAccessToken } from "./google-data";
import { googleCalendarProvider } from "./google-provider";
import { mockCalendarProvider } from "./mock-provider";
import type { CalendarBusySlot } from "./types";

export async function getCalendarBusySlots(
  profile: Profile,
  startDate: string,
  endDate: string
): Promise<CalendarBusySlot[]> {
  if (profile.calendar_connected) {
    const connections = await getGoogleCalendarConnections(profile.id);
    if (!connections.length) {
      return googleCalendarProvider.getBusySlots({
        profile,
        startDate,
        endDate
      });
    }

    const busySlots = await Promise.all(
      connections.map(async (connection) => {
        const accessToken = await getValidGoogleAccessToken(connection);

        if (!accessToken) {
          return [];
        }

        return googleCalendarProvider.getBusySlots({
          profile,
          startDate,
          endDate,
          connection,
          accessToken
        });
      })
    );

    return busySlots.flat();
  }

  return mockCalendarProvider.getBusySlots({
    profile,
    startDate,
    endDate
  });
}

export function groupBusySlotsByDate(slots: CalendarBusySlot[]) {
  return slots.reduce<Record<string, string[]>>((accumulator, slot) => {
    accumulator[slot.date] = [...(accumulator[slot.date] ?? []), slot.time];
    return accumulator;
  }, {});
}

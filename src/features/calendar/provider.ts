import type { Profile } from "@/lib/supabase/types";
import { mockCalendarProvider } from "./mock-provider";
import type { CalendarBusySlot } from "./types";

export async function getCalendarBusySlots(
  profile: Profile,
  startDate: string,
  endDate: string
): Promise<CalendarBusySlot[]> {
  // Future providers can branch on profile.calendar_connected/provider fields.
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

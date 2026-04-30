import type { Profile } from "@/lib/supabase/types";

export type CalendarBusySlot = {
  date: string;
  time: string;
  source: "mock" | "google";
};

export type CalendarProvider = {
  getBusySlots(params: {
    profile: Profile;
    startDate: string;
    endDate: string;
  }): Promise<CalendarBusySlot[]>;
};

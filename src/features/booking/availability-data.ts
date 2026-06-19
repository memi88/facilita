import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  AvailabilityDateBlock,
  AvailabilityRule
} from "@/lib/supabase/types";
import { addMinutes, format, getDay, parseISO } from "date-fns";
import type { TimeSlot } from "./types";

export type BlockedSlotsByDate = Record<string, string[]>;
export type AvailabilityByDate = Record<string, TimeSlot[]>;

export function getDefaultAvailabilityRules(profileId: string): AvailabilityRule[] {
  return [
    {
      id: "",
      profile_id: profileId,
      day_of_week: 0,
      enabled: false,
      slots: [],
      created_at: "",
      updated_at: ""
    },
    ...[1, 2, 3, 4, 5].map((dayOfWeek) => ({
      id: "",
      profile_id: profileId,
      day_of_week: dayOfWeek,
      enabled: true,
      slots: ["09:00", "10:30", "14:00", "15:30", "17:00"],
      created_at: "",
      updated_at: ""
    })),
    {
      id: "",
      profile_id: profileId,
      day_of_week: 6,
      enabled: true,
      slots: ["09:00", "10:30", "12:00"],
      created_at: "",
      updated_at: ""
    }
  ];
}

function normalizeTime(time: string) {
  return time.slice(0, 5);
}

export function buildOccupiedSlotTimes(
  date: string,
  time: string,
  durationMinutes: number
) {
  const start = parseISO(`${date}T${normalizeTime(time)}:00`);
  const end = addMinutes(start, durationMinutes);
  const slots: string[] = [];
  let cursor = start;

  while (cursor < end) {
    slots.push(format(cursor, "HH:mm"));
    cursor = addMinutes(cursor, 30);
  }

  return slots;
}

export async function getAvailabilityRules(profileId: string): Promise<AvailabilityRule[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("availability_rules")
    .select("*")
    .eq("profile_id", profileId)
    .order("day_of_week", { ascending: true });

  if (error || !data.length) {
    return getDefaultAvailabilityRules(profileId);
  }

  return data.map((rule) => ({
    ...rule,
    slots: rule.slots.map(normalizeTime)
  }));
}

export async function getAvailabilityDateBlocks(
  profileId: string
): Promise<AvailabilityDateBlock[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("availability_date_blocks")
    .select("*")
    .eq("profile_id", profileId)
    .order("date", { ascending: true });

  if (error) {
    throw new Error("Could not load availability date blocks.");
  }

  return data;
}

export async function getBlockedDatesBetween(
  profileId: string,
  startDate: string,
  endDate: string
) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("availability_date_blocks")
    .select("date")
    .eq("profile_id", profileId)
    .gte("date", startDate)
    .lte("date", endDate);

  if (error) {
    throw new Error("Could not load blocked dates.");
  }

  return new Set(data.map((block) => block.date));
}

export function getConfiguredSlotsForDate(
  date: string,
  rules: AvailabilityRule[],
  blockedDates = new Set<string>(),
  blockedTimes: string[] = []
): TimeSlot[] {
  if (blockedDates.has(date)) {
    return [];
  }

  const dayOfWeek = getDay(parseISO(date));
  const rule = rules.find((item) => item.day_of_week === dayOfWeek);

  if (!rule?.enabled) {
    return [];
  }

  const blocked = new Set(blockedTimes.map(normalizeTime));

  return rule.slots.map((time) => ({
    time: normalizeTime(time),
    label: normalizeTime(time),
    available: !blocked.has(normalizeTime(time))
  }));
}

export function getAvailabilityByDate(
  dates: string[],
  rules: AvailabilityRule[],
  blockedDates: Set<string>,
  blockedSlots: BlockedSlotsByDate,
  calendarBusySlots: BlockedSlotsByDate = {}
): AvailabilityByDate {
  return Object.fromEntries(
    dates.map((date) => [
      date,
      getConfiguredSlotsForDate(
        date,
        rules,
        blockedDates,
        [...(blockedSlots[date] ?? []), ...(calendarBusySlots[date] ?? [])]
      )
    ])
  );
}

export async function getBlockedSlotsByDate(
  profileId: string,
  startDate: string,
  endDate: string
): Promise<BlockedSlotsByDate> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("booking_requests")
    .select("date,time,service_type_duration_minutes")
    .eq("profile_id", profileId)
    .in("status", ["pending", "approved"])
    .gte("date", startDate)
    .lte("date", endDate);

  if (error) {
    throw new Error("Could not load blocked booking slots.");
  }

  return data.reduce<BlockedSlotsByDate>((accumulator, booking) => {
    const occupiedTimes = buildOccupiedSlotTimes(
      booking.date,
      booking.time,
      booking.service_type_duration_minutes ?? 30
    );
    accumulator[booking.date] = [...(accumulator[booking.date] ?? []), ...occupiedTimes];
    return accumulator;
  }, {});
}

export async function isDateBlocked(profileId: string, date: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("availability_date_blocks")
    .select("id")
    .eq("profile_id", profileId)
    .eq("date", date)
    .limit(1);

  if (error) {
    throw new Error("Could not verify blocked date.");
  }

  return data.length > 0;
}

export async function isSlotBlocked(
  profileId: string,
  date: string,
  time: string,
  durationMinutes = 30
) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("booking_requests")
    .select("time,service_type_duration_minutes")
    .eq("profile_id", profileId)
    .in("status", ["pending", "approved"])
    .eq("date", date);

  if (error) {
    throw new Error("Could not verify booking slot.");
  }

  const requestedTimes = new Set(buildOccupiedSlotTimes(date, time, durationMinutes));

  return data.some((booking) => {
    const occupiedTimes = buildOccupiedSlotTimes(
      date,
      booking.time,
      booking.service_type_duration_minutes ?? 30
    );

    return occupiedTimes.some((slot) => requestedTimes.has(slot));
  });
}

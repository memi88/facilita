import type { AppointmentType, BookingStatus, ServiceTypeRow } from "@/lib/supabase/types";

export type CalendarDay = {
  date: string;
  dayNumber: number;
  weekday: string;
  isToday: boolean;
  isPast: boolean;
};

export type TimeSlot = {
  time: string;
  label: string;
  available: boolean;
};

export type BookingActionState = {
  ok: boolean;
  message: string;
  bookingId?: string;
};

export type StatusActionState = {
  ok: boolean;
  message: string;
};

export type BookingStatusOption = Exclude<BookingStatus, "pending">;

export type AppointmentTypeOption = {
  value: AppointmentType;
  label: string;
};

export type BookingServiceType = Pick<
  ServiceTypeRow,
  "id" | "name" | "description" | "duration_minutes" | "sort_order"
>;

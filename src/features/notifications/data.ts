import { unstable_noStore as noStore } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { BookingNotification } from "@/lib/supabase/types";

export type BookingNotificationWithBooking = BookingNotification & {
  booking_requests: {
    name: string;
    date: string;
    time: string;
  } | null;
};

export async function getRecentNotifications(
  profileId: string,
  limit = 12
): Promise<BookingNotificationWithBooking[]> {
  noStore();

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("booking_notifications")
    .select("*, booking_requests(name,date,time)")
    .eq("booking_requests.profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return [];
  }

  return data as BookingNotificationWithBooking[];
}

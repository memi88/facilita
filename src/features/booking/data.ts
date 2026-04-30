import { unstable_noStore as noStore } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { BookingRequest } from "@/lib/supabase/types";

export async function getBookingRequests(profileId: string): Promise<BookingRequest[]> {
  noStore();

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("booking_requests")
    .select("*")
    .eq("profile_id", profileId)
    .order("date", { ascending: true })
    .order("time", { ascending: true });

  if (error) {
    throw new Error("Could not load booking requests.");
  }

  return data;
}

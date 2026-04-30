import { unstable_noStore as noStore } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { BookingRequest } from "@/lib/supabase/types";

export async function getBookingRequestById(
  id: string,
  profileId?: string
): Promise<BookingRequest | null> {
  noStore();

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return null;
  }

  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("booking_requests")
    .select("*")
    .eq("id", id);

  if (profileId) {
    query = query.eq("profile_id", profileId);
  }

  const { data, error } = await query.single();

  if (error) {
    return null;
  }

  return data;
}

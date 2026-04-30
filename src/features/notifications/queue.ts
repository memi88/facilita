import { addHours, formatISO, parseISO, subHours } from "date-fns";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  BookingNotification,
  BookingRequest,
  NotificationType
} from "@/lib/supabase/types";
import {
  formatBookingDate,
  getAppointmentTypeLabel
} from "@/features/booking/formatters";
import { sendWhatsAppNotificationMock } from "./provider";

function getBookingDateTime(booking: Pick<BookingRequest, "date" | "time">) {
  return parseISO(`${booking.date}T${booking.time}`);
}

function getScheduledFor(
  type: NotificationType,
  booking: Pick<BookingRequest, "date" | "time">
) {
  if (type === "booking_reminder_24h") {
    const reminderAt = subHours(getBookingDateTime(booking), 24);
    const minimumSchedule = addHours(new Date(), 1);
    return formatISO(reminderAt > minimumSchedule ? reminderAt : minimumSchedule);
  }

  return new Date().toISOString();
}

function buildPayload(type: NotificationType, booking: BookingRequest) {
  const basePayload = {
    name: booking.name,
    date: formatBookingDate(booking.date),
    time: booking.time,
    appointmentType: getAppointmentTypeLabel(booking.appointment_type)
  };

  if (type === "booking_rejected") {
    return {
      ...basePayload,
      rejectionReason: booking.rejection_reason
    };
  }

  return basePayload;
}

export async function enqueueBookingNotification(
  type: NotificationType,
  booking: BookingRequest
) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("booking_notifications").upsert(
    {
      booking_request_id: booking.id,
      channel: "whatsapp",
      type,
      status: "pending",
      recipient_phone: booking.phone,
      scheduled_for: getScheduledFor(type, booking),
      payload: buildPayload(type, booking),
      error_message: null,
      sent_at: null,
      provider_message_id: null
    },
    { onConflict: "booking_request_id,type" }
  );

  if (error && error.code !== "23505") {
    throw new Error("Could not enqueue notification.");
  }
}

export async function enqueueBookingReviewNotifications(booking: BookingRequest) {
  if (booking.status === "approved") {
    await enqueueBookingNotification("booking_approved", booking);
    await enqueueBookingNotification("booking_reminder_24h", booking);
    return;
  }

  if (booking.status === "rejected") {
    await enqueueBookingNotification("booking_rejected", booking);
  }
}

export async function sendDueMockNotifications(limit = 10) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("booking_notifications")
    .select("*")
    .eq("status", "pending")
    .lte("scheduled_for", new Date().toISOString())
    .order("scheduled_for", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error("Could not load due notifications.");
  }

  for (const notification of data as BookingNotification[]) {
    const result = await sendWhatsAppNotificationMock(notification);

    await supabase
      .from("booking_notifications")
      .update({
        status: result.ok ? "sent" : "failed",
        sent_at: result.ok ? new Date().toISOString() : null,
        provider_message_id: result.providerMessageId ?? null,
        error_message: result.errorMessage ?? null
      })
      .eq("id", notification.id);
  }
}

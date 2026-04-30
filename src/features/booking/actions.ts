"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAllowedAdminEmail } from "@/features/auth/permissions";
import { getCalendarBusySlots } from "@/features/calendar/provider";
import {
  enqueueBookingNotification,
  enqueueBookingReviewNotifications
} from "@/features/notifications/queue";
import { getProfileBySlug } from "@/features/profiles/data";
import type { BookingActionState, StatusActionState } from "./types";
import {
  getAvailabilityRules,
  getConfiguredSlotsForDate,
  isDateBlocked,
  isSlotBlocked
} from "./availability-data";
import { bookingRequestSchema, statusUpdateSchema } from "./validation";

export async function createBookingRequest(
  _previousState: BookingActionState,
  formData: FormData
): Promise<BookingActionState> {
  const profileId = String(formData.get("profileId") || "").trim();
  const profileSlug = String(formData.get("profileSlug") || "").trim();

  if (!profileId) {
    return {
      ok: false,
      message: "Agenda nao encontrada."
    };
  }

  const parsed = bookingRequestSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    appointmentType: formData.get("appointmentType"),
    notes: formData.get("notes") || undefined,
    selectedDate: formData.get("selectedDate"),
    selectedTime: formData.get("selectedTime")
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Revise os dados informados."
    };
  }

  const booking = parsed.data;
  const profile = profileSlug ? await getProfileBySlug(profileSlug) : null;

  if (!profile || profile.id !== profileId) {
    return {
      ok: false,
      message: "Agenda nao encontrada."
    };
  }

  const [rules, dateBlocked, calendarBusySlots] = await Promise.all([
    getAvailabilityRules(profileId),
    isDateBlocked(profileId, booking.selectedDate),
    getCalendarBusySlots(profile, booking.selectedDate, booking.selectedDate)
  ]);
  const baseSlots = getConfiguredSlotsForDate(
    booking.selectedDate,
    rules,
    dateBlocked ? new Set([booking.selectedDate]) : new Set()
  );
  const baseSlotAvailable = baseSlots.some(
    (slot) => slot.time === booking.selectedTime && slot.available
  );

  if (!baseSlotAvailable) {
    return {
      ok: false,
      message: "O horario selecionado nao esta disponivel."
    };
  }

  const calendarSlotBlocked = calendarBusySlots.some(
    (slot) => slot.date === booking.selectedDate && slot.time === booking.selectedTime
  );

  if (calendarSlotBlocked) {
    return {
      ok: false,
      message: "Este horario esta ocupado no calendario. Escolha outro horario."
    };
  }

  const supabase = createSupabaseAdminClient();
  const slotBlocked = await isSlotBlocked(
    profileId,
    booking.selectedDate,
    booking.selectedTime
  );

  if (slotBlocked) {
    return {
      ok: false,
      message: "Este horario acabou de ser reservado. Escolha outro horario."
    };
  }

  const { data, error } = await supabase
    .from("booking_requests")
    .insert({
      profile_id: profileId,
      name: booking.name,
      phone: booking.phone,
      appointment_type: booking.appointmentType,
      notes: booking.notes || null,
      date: booking.selectedDate,
      time: booking.selectedTime,
      status: "pending"
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        message: "Este horario acabou de ser reservado. Escolha outro horario."
      };
    }

    return {
      ok: false,
      message: "Nao foi possivel salvar a solicitacao agora."
    };
  }

  revalidatePath("/admin");
  revalidatePath("/agendar");

  await enqueueBookingNotification("booking_created", data);

  return {
    ok: true,
    message: "Solicitacao enviada. Voce recebera a confirmacao pelo WhatsApp.",
    bookingId: data.id
  };
}

export async function updateBookingStatus(
  _previousState: StatusActionState,
  formData: FormData
): Promise<StatusActionState> {
  const parsed = statusUpdateSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    rejectionReason: formData.get("rejectionReason") || undefined
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Nao foi possivel atualizar esta solicitacao."
    };
  }

  const serverSupabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await serverSupabase.auth.getUser();

  if (!user || !isAllowedAdminEmail(user.email)) {
    return {
      ok: false,
      message: "Voce nao tem permissao para atualizar esta solicitacao."
    };
  }

  const adminSupabase = createSupabaseAdminClient();
  const reviewedAt = new Date().toISOString();
  const { data: updatedBooking, error } = await adminSupabase
    .from("booking_requests")
    .update({
      status: parsed.data.status,
      reviewed_at: reviewedAt,
      reviewed_by: user?.email ?? null,
      rejection_reason:
        parsed.data.status === "rejected"
          ? parsed.data.rejectionReason ?? null
          : null,
      updated_at: reviewedAt
    })
    .eq("id", parsed.data.id)
    .select("*")
    .single();

  if (error) {
    return {
      ok: false,
      message: "Erro ao atualizar status."
    };
  }

  await enqueueBookingReviewNotifications(updatedBooking);

  revalidatePath("/admin");
  revalidatePath("/agendar");

  return {
    ok: true,
    message: "Status atualizado."
  };
}

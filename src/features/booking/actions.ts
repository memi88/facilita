"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { BookingRequest, Profile } from "@/lib/supabase/types";
import { getCalendarBusySlots } from "@/features/calendar/provider";
import { createGoogleCalendarEvent } from "@/features/calendar/google-provider";
import { isLikelyAutomatedSubmission } from "@/lib/form-security";
import {
  enqueueBookingNotification,
  enqueueBookingReviewNotifications
} from "@/features/notifications/queue";
import {
  getProfileBySlug,
  getProfileByUserId,
  getServiceTypeById,
  getServiceTypesByProfileId
} from "@/features/profiles/data";
import type { BookingActionState, StatusActionState } from "./types";
import {
  getAvailabilityRules,
  getBlockedSlotsByDate,
  getConfiguredSlotsForDate,
  isDateBlocked,
  buildOccupiedSlotTimes
} from "./availability-data";
import { bookingRequestSchema, statusUpdateSchema } from "./validation";
export async function saveGoogleCalendarEvent(booking: BookingRequest) {
  if (booking.google_event_id) {
    return true;
  }

  const googleEvent = await createGoogleCalendarEvent(booking.profile_id, booking);

  if (!googleEvent?.id) {
    return false;
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("booking_requests")
    .update({
      google_event_id: googleEvent.id,
      google_event_link: googleEvent.htmlLink ?? null,
      updated_at: new Date().toISOString()
    })
    .eq("id", booking.id);

  return !error;
}

async function assertBookingSlotIsAvailable(
  profile: Profile,
  date: string,
  time: string,
  durationMinutes: number
) {
  const profileId = profile.id;

  const [rules, dateBlocked, calendarBusySlots, blockedSlots] = await Promise.all([
    getAvailabilityRules(profileId),
    isDateBlocked(profileId, date),
    getCalendarBusySlots(profile, date, date),
    getBlockedSlotsByDate(profileId, date, date)
  ]);

  const baseSlots = getConfiguredSlotsForDate(
    date,
    rules,
    dateBlocked ? new Set([date]) : new Set()
  );
  const baseSlotAvailable = baseSlots.some((slot) => slot.time === time && slot.available);

  if (!baseSlotAvailable) {
    throw new Error("O horario selecionado nao esta disponivel.");
  }

  const calendarSlotBlocked = calendarBusySlots.some(
    (slot) => slot.date === date && slot.time === time
  );

  if (calendarSlotBlocked) {
    throw new Error("Este horario esta ocupado no calendario. Escolha outro horario.");
  }

  const occupiedTimes = new Set([
    ...(blockedSlots?.[date] ?? []),
    ...calendarBusySlots.filter((slot) => slot.date === date).map((slot) => slot.time)
  ]);
  const requestedTimes = buildOccupiedSlotTimes(date, time, durationMinutes);
  const slotBlocked = requestedTimes.some((slot) => occupiedTimes.has(slot));

  if (slotBlocked) {
    throw new Error("Este horario acabou de ser reservado. Escolha outro horario.");
  }
}

export async function createBookingRequest(
  _previousState: BookingActionState,
  formData: FormData
): Promise<BookingActionState> {
  if (
    isLikelyAutomatedSubmission({
      honeypot: formData.get("website"),
      submittedAt: formData.get("formStartedAt")
    })
  ) {
    return {
      ok: false,
      message: "Nao foi possivel processar sua solicitacao."
    };
  }

  const profileId = String(formData.get("profileId") || "").trim();
  const profileSlug = String(formData.get("profileSlug") || "").trim();
  const serviceTypeId = String(formData.get("serviceTypeId") || "").trim();

  if (!profileId) {
    return {
      ok: false,
      message: "Agenda nao encontrada."
    };
  }

  const parsed = bookingRequestSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    serviceTypeId,
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

  const serviceType = await getServiceTypeById(profileId, serviceTypeId);
  const availableServiceTypes = await getServiceTypesByProfileId(profileId);

  if (!serviceType && availableServiceTypes.length) {
    return {
      ok: false,
      message: "Selecione um serviço valido."
    };
  }

  const resolvedServiceType =
    serviceType ??
    ({
      id: null,
      name: "Consulta inicial",
      description: "Atendimento padrão criado automaticamente para a agenda.",
      duration_minutes: 60,
      sort_order: 0
    } as const);

  let rules;
  let dateBlocked;
  let calendarBusySlots;
  let blockedSlots;

  try {
    [rules, dateBlocked, calendarBusySlots, blockedSlots] = await Promise.all([
      getAvailabilityRules(profileId),
      isDateBlocked(profileId, booking.selectedDate),
      getCalendarBusySlots(profile, booking.selectedDate, booking.selectedDate),
      getBlockedSlotsByDate(profileId, booking.selectedDate, booking.selectedDate)
    ]);
  } catch (error) {
    console.error("[booking] Availability check failed", error);
    return {
      ok: false,
      message: "Nao foi possivel verificar a disponibilidade agora."
    };
  }
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

  const occupiedTimes = new Set([
    ...(blockedSlots?.[booking.selectedDate] ?? []),
    ...calendarBusySlots
      .filter((slot) => slot.date === booking.selectedDate)
      .map((slot) => slot.time)
  ]);
  const requestedTimes = buildOccupiedSlotTimes(
    booking.selectedDate,
    booking.selectedTime,
    resolvedServiceType.duration_minutes
  );
  const slotBlocked = requestedTimes.some((slot) => occupiedTimes.has(slot));

  if (slotBlocked) {
    return {
      ok: false,
      message: "Este horario acabou de ser reservado. Escolha outro horario."
    };
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("booking_requests")
    .insert({
      profile_id: profileId,
      name: booking.name,
      phone: booking.phone,
      notes: booking.notes || null,
      date: booking.selectedDate,
      time: booking.selectedTime,
      status: "pending",
      service_type_id: resolvedServiceType.id,
      service_type_name: resolvedServiceType.name,
      service_type_duration_minutes: resolvedServiceType.duration_minutes,
      appointment_type: null
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
    message:
      "Sua solicitacao foi enviada. Em breve voce recebera a confirmacao pelo WhatsApp.",
    bookingId: data.id
  };
}

export async function createManualBookingRequest(
  _previousState: BookingActionState,
  formData: FormData
): Promise<BookingActionState> {
  const profileId = String(formData.get("profileId") || "").trim();
  const serviceTypeId = String(formData.get("serviceTypeId") || "").trim();

  if (!profileId) {
    return {
      ok: false,
      message: "Perfil nao encontrado."
    };
  }

  const parsed = bookingRequestSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    serviceTypeId,
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

  const serverSupabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await serverSupabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      message: "Voce nao tem permissao para criar este agendamento."
    };
  }

  const profile = await getProfileByUserId(user.id);

  if (!profile || profile.id !== profileId) {
    return {
      ok: false,
      message: "Perfil nao encontrado."
    };
  }

  const serviceType = await getServiceTypeById(profileId, serviceTypeId);
  const availableServiceTypes = await getServiceTypesByProfileId(profileId);

  if (!serviceType && availableServiceTypes.length) {
    return {
      ok: false,
      message: "Selecione um serviço valido."
    };
  }

  const resolvedServiceType =
    serviceType ??
    ({
      id: null,
      name: "Consulta inicial",
      description: "Atendimento padrão criado automaticamente para a agenda.",
      duration_minutes: 60,
      sort_order: 0
    } as const);

  try {
    await assertBookingSlotIsAvailable(
      profile,
      parsed.data.selectedDate,
      parsed.data.selectedTime,
      resolvedServiceType.duration_minutes
    );
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Nao foi possivel verificar a disponibilidade."
    };
  }

  const reviewedAt = new Date().toISOString();
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("booking_requests")
    .insert({
      profile_id: profileId,
      name: parsed.data.name,
      phone: parsed.data.phone,
      notes: parsed.data.notes || null,
      date: parsed.data.selectedDate,
      time: parsed.data.selectedTime,
      status: "approved",
      reviewed_at: reviewedAt,
      reviewed_by: user.email ?? null,
      service_type_id: resolvedServiceType.id,
      service_type_name: resolvedServiceType.name,
      service_type_duration_minutes: resolvedServiceType.duration_minutes,
      appointment_type: null
    })
    .select("*")
    .single();

  if (error || !data) {
    if (error?.code === "23505") {
      return {
        ok: false,
        message: "Este horario acabou de ser reservado. Escolha outro horario."
      };
    }

    return {
      ok: false,
      message: "Nao foi possivel criar o agendamento agora."
    };
  }

  let calendarCreated = false;

  try {
    calendarCreated = await saveGoogleCalendarEvent(data);
  } catch (eventError) {
    console.error("[booking] Google Calendar event creation failed", eventError);
  }

  await enqueueBookingReviewNotifications(data);

  revalidatePath("/admin");
  revalidatePath("/admin/pedidos");
  revalidatePath("/agendar");

  return {
    ok: true,
    message: calendarCreated
      ? "Agendamento criado com sucesso."
      : "Agendamento criado. Conecte o Google Calendar para sincronizar o evento.",
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

  if (!user) {
    return {
      ok: false,
      message: "Voce nao tem permissao para atualizar esta solicitacao."
    };
  }

  const profile = await getProfileByUserId(user.id);

  if (!profile) {
    return {
      ok: false,
      message: "Perfil nao encontrado."
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
    .eq("profile_id", profile.id)
    .select("*")
    .single();

  if (error) {
    return {
      ok: false,
      message: "Erro ao atualizar status."
    };
  }

  if (updatedBooking.status === "approved" && !updatedBooking.google_event_id) {
    try {
      await saveGoogleCalendarEvent(updatedBooking);
    } catch (eventError) {
      console.error("[booking] Google Calendar event creation failed", eventError);
      revalidatePath("/admin");
      revalidatePath("/agendar");

      return {
        ok: false,
        message:
          "Status aprovado, mas nao foi possivel criar o evento no Google Calendar."
      };
    }
  }

  await enqueueBookingReviewNotifications(updatedBooking);

  revalidatePath("/admin");
  revalidatePath("/agendar");

  return {
    ok: true,
    message: "Status atualizado."
  };
}

export async function createCalendarEventForBooking(
  _previousState: StatusActionState,
  formData: FormData
): Promise<StatusActionState> {
  const bookingId = String(formData.get("id") || "").trim();

  if (!bookingId) {
    return {
      ok: false,
      message: "Agendamento nao encontrado."
    };
  }

  const serverSupabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await serverSupabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      message: "Voce nao tem permissao para criar este evento."
    };
  }

  const profile = await getProfileByUserId(user.id);

  if (!profile) {
    return {
      ok: false,
      message: "Perfil nao encontrado."
    };
  }

  const adminSupabase = createSupabaseAdminClient();
  const { data: booking, error } = await adminSupabase
    .from("booking_requests")
    .select("*")
    .eq("id", bookingId)
    .eq("profile_id", profile.id)
    .single();

  if (error || !booking) {
    return {
      ok: false,
      message: "Agendamento nao encontrado."
    };
  }

  if (booking.status !== "approved") {
    return {
      ok: false,
      message: "Aprove o agendamento antes de criar o evento."
    };
  }

  try {
    const created = await saveGoogleCalendarEvent(booking);

    if (!created) {
      return {
        ok: false,
        message: "Conecte o Google Calendar antes de criar o evento."
      };
    }
  } catch (eventError) {
    console.error("[booking] Google Calendar event creation failed", eventError);
    return {
      ok: false,
      message: "Nao foi possivel criar o evento no Google Calendar."
    };
  }

  revalidatePath("/admin");
  revalidatePath("/agendar");

  return {
    ok: true,
    message: "Evento criado no Google Calendar."
  };
}

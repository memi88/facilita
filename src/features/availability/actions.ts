"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProfileByUserId } from "@/features/profiles/data";
import { weekDays } from "./constants";

export type AvailabilityActionState = {
  ok: boolean;
  message: string;
};

async function getAuthorizedProfileId() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const profile = await getProfileByUserId(user.id);
  return profile?.id ?? null;
}

function parseSlots(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return [];
  }

  const slots = value
    .split(",")
    .map((slot) => slot.trim())
    .filter(Boolean);

  const invalidSlot = slots.find((slot) => !/^\d{2}:\d{2}$/.test(slot));

  if (invalidSlot) {
    throw new Error(`Horario invalido: ${invalidSlot}`);
  }

  return Array.from(new Set(slots)).sort();
}

export async function saveAvailabilityRules(
  _previousState: AvailabilityActionState,
  formData: FormData
): Promise<AvailabilityActionState> {
  const profileId = await getAuthorizedProfileId();

  if (!profileId) {
    return { ok: false, message: "Voce nao tem permissao para salvar." };
  }

  let rows;

  try {
    rows = weekDays.map((day) => ({
      profile_id: profileId,
      day_of_week: day.value,
      enabled: formData.get(`enabled_${day.value}`) === "on",
      slots: parseSlots(formData.get(`slots_${day.value}`)),
      updated_at: new Date().toISOString()
    }));
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Revise os horarios."
    };
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("availability_rules")
    .upsert(rows, { onConflict: "profile_id,day_of_week" });

  if (error) {
    return { ok: false, message: "Nao foi possivel salvar a disponibilidade." };
  }

  revalidatePath("/admin");
  revalidatePath("/agendar");

  return { ok: true, message: "Disponibilidade atualizada." };
}

export async function addDateBlock(
  _previousState: AvailabilityActionState,
  formData: FormData
): Promise<AvailabilityActionState> {
  const profileId = await getAuthorizedProfileId();

  if (!profileId) {
    return { ok: false, message: "Voce nao tem permissao para salvar." };
  }

  const date = String(formData.get("date") || "").trim();
  const reason = String(formData.get("reason") || "").trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { ok: false, message: "Informe uma data valida." };
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("availability_date_blocks").upsert(
    {
      profile_id: profileId,
      date,
      reason: reason || null
    },
    { onConflict: "profile_id,date" }
  );

  if (error) {
    return { ok: false, message: "Nao foi possivel bloquear a data." };
  }

  revalidatePath("/admin");
  revalidatePath("/agendar");

  return { ok: true, message: "Data bloqueada." };
}

export async function removeDateBlock(formData: FormData) {
  const profileId = await getAuthorizedProfileId();

  if (!profileId) {
    return;
  }

  const id = String(formData.get("id") || "");

  if (!id) {
    return;
  }

  const supabase = createSupabaseAdminClient();
  await supabase
    .from("availability_date_blocks")
    .delete()
    .eq("id", id)
    .eq("profile_id", profileId);

  revalidatePath("/admin");
  revalidatePath("/agendar");
}

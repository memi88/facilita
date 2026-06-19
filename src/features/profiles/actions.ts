"use server";

import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSafeInternalPath } from "@/lib/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProfileByUserId } from "./data";
import { normalizeSlug } from "./utils";

export type SignUpState = {
  message: string;
};

export type ProfileSetupState = {
  message: string;
};

export type ServiceTypeFormState = {
  ok: boolean;
  message: string;
};

export type GoogleCalendarConnectionActionState = {
  ok: boolean;
  message: string;
};

function normalizeOptionalEmail(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const email = value.trim().toLowerCase();
  return email || null;
}

function getSafeReturnToPath(value: FormDataEntryValue | null, fallback: string) {
  return getSafeInternalPath(typeof value === "string" ? value : null, fallback);
}

async function buildUniqueSlug(baseValue: string) {
  const adminSupabase = createSupabaseAdminClient();
  const baseSlug = normalizeSlug(baseValue) || "agenda";
  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const { data } = await adminSupabase
      .from("profiles")
      .select("id")
      .eq("slug", candidate)
      .limit(1);

    if (!data?.length) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

export async function signUpProfessional(
  _previousState: SignUpState,
  formData: FormData
): Promise<SignUpState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!name || !email || password.length < 6) {
    return {
      message: "Informe nome, e-mail e senha com pelo menos 6 caracteres."
    };
  }

  const adminSupabase = createSupabaseAdminClient();

  const authResult = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (authResult.error || !authResult.data.user) {
    return {
      message: authResult.error?.message ?? "Nao foi possivel criar o usuario."
    };
  }

  const slug = await buildUniqueSlug(`${name} ${email.split("@")[0]}`);
  const { data: createdProfile, error: profileError } = await adminSupabase
    .from("profiles")
    .insert({
    user_id: authResult.data.user.id,
    name,
    public_name: name,
    profession: null,
    phone: null,
    slug,
    calendar_email: email,
    google_calendar_id: null,
    calendar_connected: false,
    calendar_email_is_account_email: true
    })
    .select("*")
    .single();

  if (profileError || !createdProfile) {
    await adminSupabase.auth.admin.deleteUser(authResult.data.user.id);
    return { message: "Nao foi possivel criar o perfil." };
  }

  const serviceTypeResult = await adminSupabase.from("service_types").insert({
    profile_id: createdProfile.id,
    name: "Consulta inicial",
    description: "Atendimento padrão criado automaticamente para a agenda.",
    duration_minutes: 60,
    sort_order: 0
  });

  if (serviceTypeResult.error) {
    console.error("[profiles] default service type creation failed", serviceTypeResult.error);
  }

  const serverSupabase = createSupabaseServerClient();
  const signInResult = await serverSupabase.auth.signInWithPassword({
    email,
    password
  });

  if (signInResult.error) {
    redirect("/login?next=/admin/perfil");
  }

  redirect("/admin/perfil");
}

export async function saveCurrentUserProfile(
  _previousState: ProfileSetupState,
  formData: FormData
): Promise<ProfileSetupState> {
  const publicName = String(formData.get("publicName") || "").trim();
  const name = String(formData.get("name") || publicName).trim();
  const profession = String(formData.get("profession") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const calendarEmail = normalizeOptionalEmail(formData.get("calendarEmail"));
  const calendarEmailIsAccountEmail = formData.get("calendarEmailIsAccountEmail") === "on";
  const googleCalendarId = String(formData.get("googleCalendarId") || "").trim();
  const slug = normalizeSlug(String(formData.get("slug") || publicName || name));
  const returnTo = getSafeReturnToPath(formData.get("returnTo"), "/admin/perfil?tab=perfil");

  if (!name || !publicName || !slug) {
    return { message: "Informe nome publico e link da agenda." };
  }

  const serverSupabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await serverSupabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin/perfil");
  }

  const adminSupabase = createSupabaseAdminClient();
  const currentProfile = await getProfileByUserId(user.id);
  const existingSlug = await adminSupabase
    .from("profiles")
    .select("id,user_id")
    .eq("slug", slug)
    .limit(1);
  const slugOwner = existingSlug.data?.[0];

  if (slugOwner && slugOwner.user_id !== user.id) {
    return { message: "Este link publico ja esta em uso." };
  }

  const { error } = await adminSupabase.from("profiles").upsert(
    {
      user_id: user.id,
      name,
      public_name: publicName,
      profession: profession || null,
      phone: phone || null,
      slug,
      calendar_email: calendarEmailIsAccountEmail ? user.email : calendarEmail,
      google_calendar_id: googleCalendarId || null,
      calendar_connected: currentProfile?.calendar_connected ?? false,
      calendar_email_is_account_email: calendarEmailIsAccountEmail
    },
    { onConflict: "user_id" }
  );

  if (error) {
    return { message: "Nao foi possivel salvar o perfil." };
  }

  redirect(returnTo);
}

export async function saveServiceType(
  _previousState: ServiceTypeFormState,
  formData: FormData
): Promise<ServiceTypeFormState> {
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const durationMinutes = Number.parseInt(String(formData.get("durationMinutes") || ""), 10);
  const id = String(formData.get("id") || "").trim();
  const returnTo = getSafeReturnToPath(formData.get("returnTo"), "/admin/perfil?tab=tipos");

  if (!name || Number.isNaN(durationMinutes) || durationMinutes <= 0) {
    return {
      ok: false,
      message: "Informe nome e duração válidos."
    };
  }

  const serverSupabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await serverSupabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      message: "Voce nao tem permissao para salvar."
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

  if (id) {
    const { error } = await adminSupabase
      .from("service_types")
      .update({
        name,
        description: description || null,
        duration_minutes: durationMinutes
      })
      .eq("id", id)
      .eq("profile_id", profile.id);

    if (error) {
      return {
        ok: false,
        message: "Nao foi possivel atualizar o atendimento."
      };
    }
  } else {
    const { data: existingRows } = await adminSupabase
      .from("service_types")
      .select("sort_order")
      .eq("profile_id", profile.id)
      .order("sort_order", { ascending: false })
      .limit(1);

    const nextSortOrder = (existingRows?.[0]?.sort_order ?? -1) + 1;
    const { error } = await adminSupabase.from("service_types").insert({
      profile_id: profile.id,
      name,
      description: description || null,
      duration_minutes: durationMinutes,
      sort_order: nextSortOrder
    });

    if (error) {
      return {
        ok: false,
        message: "Nao foi possivel criar o atendimento."
      };
    }
  }

  redirect(returnTo);
}

export async function deleteServiceType(formData: FormData) {
  const id = String(formData.get("id") || "").trim();
  const returnTo = getSafeReturnToPath(formData.get("returnTo"), "/admin/perfil?tab=tipos");

  if (!id) {
    return;
  }

  const serverSupabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await serverSupabase.auth.getUser();

  if (!user) {
    return;
  }

  const profile = await getProfileByUserId(user.id);

  if (!profile) {
    return;
  }

  const adminSupabase = createSupabaseAdminClient();
  await adminSupabase.from("service_types").delete().eq("id", id).eq("profile_id", profile.id);
  redirect(returnTo);
}

export async function setPrimaryCalendarConnection(formData: FormData) {
  const id = String(formData.get("id") || "").trim();
  const returnTo = getSafeReturnToPath(formData.get("returnTo"), "/admin/perfil?tab=agendas");

  if (!id) {
    return;
  }

  const serverSupabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await serverSupabase.auth.getUser();

  if (!user) {
    return;
  }

  const profile = await getProfileByUserId(user.id);

  if (!profile) {
    return;
  }

  const adminSupabase = createSupabaseAdminClient();
  const { data: targetConnection } = await adminSupabase
    .from("google_calendar_connections")
    .select("*")
    .eq("id", id)
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (!targetConnection) {
    return;
  }

  await adminSupabase
    .from("google_calendar_connections")
    .update({ is_primary: false })
    .eq("profile_id", profile.id);

  await adminSupabase
    .from("google_calendar_connections")
    .update({ is_primary: true })
    .eq("id", id)
    .eq("profile_id", profile.id);

  await adminSupabase
    .from("profiles")
    .update({
      calendar_connected: true,
      calendar_email: targetConnection.google_email ?? profile.calendar_email,
      google_calendar_id: targetConnection.calendar_id
    })
    .eq("id", profile.id);

  redirect(returnTo);
}

export async function deleteCalendarConnection(formData: FormData) {
  const id = String(formData.get("id") || "").trim();
  const returnTo = getSafeReturnToPath(formData.get("returnTo"), "/admin/perfil?tab=agendas");

  if (!id) {
    return;
  }

  const serverSupabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await serverSupabase.auth.getUser();

  if (!user) {
    return;
  }

  const profile = await getProfileByUserId(user.id);

  if (!profile) {
    return;
  }

  const adminSupabase = createSupabaseAdminClient();
  const { data: targetConnection } = await adminSupabase
    .from("google_calendar_connections")
    .select("*")
    .eq("id", id)
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (!targetConnection) {
    return;
  }

  await adminSupabase
    .from("google_calendar_connections")
    .delete()
    .eq("id", id)
    .eq("profile_id", profile.id);

  const { data: remainingConnections } = await adminSupabase
    .from("google_calendar_connections")
    .select("*")
    .eq("profile_id", profile.id)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: true });

  const nextPrimary = remainingConnections?.[0] ?? null;

  if (nextPrimary) {
    await adminSupabase
      .from("google_calendar_connections")
      .update({ is_primary: true })
      .eq("id", nextPrimary.id);

    await adminSupabase
      .from("profiles")
      .update({
        calendar_connected: true,
        calendar_email: nextPrimary.google_email ?? profile.calendar_email,
        google_calendar_id: nextPrimary.calendar_id
      })
      .eq("id", profile.id);
  } else {
    await adminSupabase
      .from("profiles")
      .update({
        calendar_connected: false
      })
      .eq("id", profile.id);
  }

  redirect(returnTo);
}

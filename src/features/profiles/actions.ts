"use server";

import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeSlug } from "./utils";

export type SignUpState = {
  message: string;
};

export type ProfileSetupState = {
  message: string;
};

export async function signUpProfessional(
  _previousState: SignUpState,
  formData: FormData
): Promise<SignUpState> {
  const name = String(formData.get("name") || "").trim();
  const publicName = String(formData.get("publicName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const calendarEmail = String(formData.get("calendarEmail") || "").trim();
  const slug = normalizeSlug(String(formData.get("slug") || publicName || name));

  if (!name || !publicName || !email || password.length < 6) {
    return {
      message: "Informe nome, nome publico, e-mail e senha com pelo menos 6 caracteres."
    };
  }

  const adminSupabase = createSupabaseAdminClient();
  const existingSlug = await adminSupabase
    .from("profiles")
    .select("id")
    .eq("slug", slug)
    .limit(1);

  if (existingSlug.data?.length) {
    return { message: "Este link publico ja esta em uso." };
  }

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

  const profileResult = await adminSupabase.from("profiles").insert({
    user_id: authResult.data.user.id,
    name,
    public_name: publicName,
    phone: phone || null,
    slug,
    calendar_email: calendarEmail || null,
    google_calendar_id: null,
    calendar_connected: false
  });

  if (profileResult.error) {
    await adminSupabase.auth.admin.deleteUser(authResult.data.user.id);
    return { message: "Nao foi possivel criar o perfil." };
  }

  const serverSupabase = createSupabaseServerClient();
  const signInResult = await serverSupabase.auth.signInWithPassword({
    email,
    password
  });

  if (signInResult.error) {
    redirect("/login?next=/admin");
  }

  redirect("/admin");
}

export async function saveCurrentUserProfile(
  _previousState: ProfileSetupState,
  formData: FormData
): Promise<ProfileSetupState> {
  const publicName = String(formData.get("publicName") || "").trim();
  const name = String(formData.get("name") || publicName).trim();
  const phone = String(formData.get("phone") || "").trim();
  const calendarEmail = String(formData.get("calendarEmail") || "").trim();
  const googleCalendarId = String(formData.get("googleCalendarId") || "").trim();
  const slug = normalizeSlug(String(formData.get("slug") || publicName || name));

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
      phone: phone || null,
      slug,
      calendar_email: calendarEmail || null,
      google_calendar_id: googleCalendarId || null,
      calendar_connected: false
    },
    { onConflict: "user_id" }
  );

  if (error) {
    return { message: "Nao foi possivel salvar o perfil." };
  }

  redirect("/admin");
}

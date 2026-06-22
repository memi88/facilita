"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type LoginActionState = {
  message: string;
};

function getSafeNextPath(value: FormDataEntryValue | null) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return "/admin";
  }

  return value;
}

export async function signInWithEmail(
  _previousState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  if (typeof formData.get("hp_contact_field") === "string" && String(formData.get("hp_contact_field")).trim()) {
    return { message: "Nao foi possivel processar sua solicitacao." };
  }

  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const nextPath = getSafeNextPath(formData.get("next"));

  if (!email || !password) {
    return { message: "Informe e-mail e senha." };
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return { message: "E-mail ou senha invalidos." };
  }

  redirect(nextPath);
}

export async function signOut() {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

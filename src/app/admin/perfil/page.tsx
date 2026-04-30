import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, UserRoundCog } from "lucide-react";
import { ProfileForm } from "@/features/profiles/components/profile-form";
import { CopyLink } from "@/components/ui/copy-link";
import { GoogleCalendarCard } from "@/features/calendar/components/google-calendar-card";
import { getProfileByUserId } from "@/features/profiles/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicBookingUrl } from "@/lib/site-url";

export default async function AdminProfileSetupPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin/perfil");
  }

  const profile = await getProfileByUserId(user.id);

  return (
    <main className="min-h-screen px-4 py-6 md:px-8">
      <section className="mx-auto max-w-3xl rounded-lg border border-border bg-white p-6 shadow-soft">
        <Link
          href={profile ? "/admin" : "/"}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {profile ? "Voltar ao admin" : "Inicio"}
        </Link>
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
            <UserRoundCog className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold">Perfil da agenda</h1>
            <p className="text-sm text-muted-foreground">
              Configure o nome publico, link de compartilhamento e dados de calendario.
            </p>
          </div>
        </div>
        {profile ? (
          <div className="mb-6">
            <p className="mb-2 text-sm font-semibold">Link publico atual</p>
            <CopyLink value={getPublicBookingUrl(profile.slug)} />
          </div>
        ) : null}
        <GoogleCalendarCard profile={profile} />
        <ProfileForm profile={profile} email={user.email} />
      </section>
    </main>
  );
}

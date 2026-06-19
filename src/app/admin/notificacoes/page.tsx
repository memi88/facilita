import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell, UserRoundCog } from "lucide-react";
import { AppTopBar, Eyebrow, IconBadge, PageCard, ShellBackground } from "@/components/ui/scheduler-shell";
import { AdminSidebar } from "@/components/ui/admin-sidebar";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { NotificationsPanel } from "@/features/notifications/components/notifications-panel";
import { getRecentNotifications } from "@/features/notifications/data";
import { getProfileByUserId, getServiceTypesByProfileId } from "@/features/profiles/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicBookingUrl } from "@/lib/site-url";

export default async function NotificationsPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin/notificacoes");
  }

  const profile = await getProfileByUserId(user.id);

  if (!profile) {
    redirect("/admin/perfil");
  }

  const notifications = await getRecentNotifications(profile.id);
  const serviceTypes = await getServiceTypesByProfileId(profile.id);
  const publicBookingUrl = getPublicBookingUrl(profile.slug);

  return (
    <ShellBackground>
      <AppTopBar
        actions={
          <>
            <Link
              href="/admin"
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted"
            >
              <UserRoundCog className="h-4 w-4" />
              Dashboard
            </Link>
            <LogoutButton />
          </>
        }
      />

      <main className="px-4 pb-8 pt-4 md:px-8 md:pb-10 md:pt-6">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[320px_1fr]">
          <AdminSidebar
            current="dashboard"
            profile={profile}
            serviceTypes={serviceTypes}
            publicBookingUrl={publicBookingUrl}
          />

          <section className="space-y-6">
            <PageCard className="p-6 md:p-8">
              <div className="flex items-start gap-3">
                <IconBadge icon={Bell} />
                <div>
                  <Eyebrow>Notificações</Eyebrow>
                  <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                    Fila de envio
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                    Veja o que já foi enfileirado, enviado ou falhou.
                  </p>
                </div>
              </div>
            </PageCard>

            <NotificationsPanel notifications={notifications} />
          </section>
        </div>
      </main>
    </ShellBackground>
  );
}

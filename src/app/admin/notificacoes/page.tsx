import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell } from "lucide-react";
import { Eyebrow, IconBadge, PageCard } from "@/components/ui/scheduler-shell";
import { WorkspaceSidebar } from "@/components/ui/workspace-sidebar";
import { WorkspaceTopNav } from "@/components/ui/workspace-top-nav";
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
    <div className="min-h-screen">
      <WorkspaceTopNav
        profile={profile}
        activeHref="/admin/notificacoes"
        publicBookingUrl={publicBookingUrl}
      />

      <main className="mx-auto flex max-w-[1360px] gap-6 px-4 py-6 md:px-10">
        <WorkspaceSidebar profile={profile} activeHref="/admin/notificacoes" />

        <section className="min-w-0 flex-1 space-y-6">
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
      </main>
    </div>
  );
}

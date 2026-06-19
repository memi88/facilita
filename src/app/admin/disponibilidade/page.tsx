import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarCog, UserRoundCog } from "lucide-react";
import { AppTopBar, Eyebrow, IconBadge, PageCard, ShellBackground } from "@/components/ui/scheduler-shell";
import { AdminSidebar } from "@/components/ui/admin-sidebar";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { AvailabilitySettings } from "@/features/availability/components/availability-settings";
import { getAvailabilityDateBlocks, getAvailabilityRules } from "@/features/booking/availability-data";
import { getProfileByUserId, getServiceTypesByProfileId } from "@/features/profiles/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicBookingUrl } from "@/lib/site-url";

export default async function AvailabilityPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin/disponibilidade");
  }

  const profile = await getProfileByUserId(user.id);

  if (!profile) {
    redirect("/admin/perfil");
  }

  const [rules, dateBlocks] = await Promise.all([
    getAvailabilityRules(profile.id),
    getAvailabilityDateBlocks(profile.id)
  ]);
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
                <IconBadge icon={CalendarCog} />
                <div>
                  <Eyebrow>Disponibilidade</Eyebrow>
                  <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                    Configuração da agenda
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                    Defina dias ativos, horários, blocos manuais e exceções.
                  </p>
                </div>
              </div>
            </PageCard>

            <AvailabilitySettings rules={rules} dateBlocks={dateBlocks} />
          </section>
        </div>
      </main>
    </ShellBackground>
  );
}

import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { WorkspaceTopNav } from "@/components/ui/workspace-top-nav";
import { WorkspaceSidebar } from "@/components/ui/workspace-sidebar";
import { PageCard } from "@/components/ui/scheduler-shell";
import { getCalendarDays } from "@/features/booking/availability";
import {
  getAvailabilityByDate,
  getAvailabilityRules,
  getBlockedDatesBetween,
  getBlockedSlotsByDate
} from "@/features/booking/availability-data";
import { ManualBookingForm } from "@/features/booking/components/manual-booking-form";
import { getCalendarBusySlots, groupBusySlotsByDate } from "@/features/calendar/provider";
import { getProfileByUserId, getServiceTypesByProfileId } from "@/features/profiles/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicBookingUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export default async function NewManualBookingPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin/pedidos/novo");
  }

  const profile = await getProfileByUserId(user.id);

  if (!profile) {
    redirect("/admin/perfil");
  }

  const days = getCalendarDays();
  const startDate = days[0]?.date;
  const endDate = days[days.length - 1]?.date;
  const serviceTypes = await getServiceTypesByProfileId(profile.id);
  const publicBookingUrl = getPublicBookingUrl(profile.slug);
  const [rules, blockedSlots, blockedDates, calendarBusySlots] =
    startDate && endDate
      ? await Promise.all([
          getAvailabilityRules(profile.id),
          getBlockedSlotsByDate(profile.id, startDate, endDate),
          getBlockedDatesBetween(profile.id, startDate, endDate),
          getCalendarBusySlots(profile, startDate, endDate)
        ])
      : [[], {}, new Set<string>(), []];
  const availabilityByDate = getAvailabilityByDate(
    days.map((day) => day.date),
    rules,
    blockedDates,
    blockedSlots,
    groupBusySlotsByDate(calendarBusySlots)
  );

  return (
    <div className="min-h-screen">
      <WorkspaceTopNav
        profile={profile}
        activeHref="/admin/pedidos"
      />

      <main className="mx-auto flex max-w-[1360px] gap-6 px-4 py-6 md:px-10">
        <WorkspaceSidebar profile={profile} activeHref="/admin/pedidos" />

        <div className="min-w-0 flex-1">
          <PageCard className="mb-6 p-6 md:p-8">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ArrowLeft className="h-6 w-6 rotate-180" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Novo Agendamento
                </p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                  Crie um agendamento manual
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                  Use esta tela quando o cliente não conseguir concluir pelo link público.
                </p>
              </div>
            </div>
          </PageCard>

          <ManualBookingForm
            days={days}
            availabilityByDate={availabilityByDate}
            profileId={profile.id}
            serviceTypes={serviceTypes}
            profileName={profile.public_name}
            profession={profile.profession}
          />
        </div>
      </main>
    </div>
  );
}

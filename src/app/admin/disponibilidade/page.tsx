import { redirect } from "next/navigation";
import { CalendarCog, History, Settings2 } from "lucide-react";
import { WorkspaceSidebar } from "@/components/ui/workspace-sidebar";
import { WorkspaceTopNav } from "@/components/ui/workspace-top-nav";
import { Button } from "@/components/ui/button";
import { AvailabilitySettings } from "@/features/availability/components/availability-settings";
import { getAvailabilityDateBlocks, getAvailabilityRules } from "@/features/booking/availability-data";
import { getCalendarBusySlots } from "@/features/calendar/provider";
import { getProfileByUserId, getServiceTypesByProfileId } from "@/features/profiles/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicBookingUrl } from "@/lib/site-url";

function getLocalDateString(date: Date) {
  return date.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}

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
  const busySlots = await getCalendarBusySlots(
    profile,
    getLocalDateString(new Date()),
    getLocalDateString(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000))
  );
  const publicBookingUrl = getPublicBookingUrl(profile.slug);

  return (
    <div className="min-h-screen">
      <WorkspaceTopNav
        profile={profile}
        activeHref="/admin/disponibilidade"
        publicBookingUrl={publicBookingUrl}
      />

      <main className="mx-auto flex max-w-[1360px] gap-6 px-4 py-6 md:px-10">
        <WorkspaceSidebar profile={profile} activeHref="/admin/disponibilidade" />

        <div className="min-w-0 flex-1">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">Gestão de Disponibilidade</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-[44px]">
                Configure seus horários de serviço e sincronize com agendas externas.
              </h1>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="gap-2">
                <History className="h-4 w-4" />
                Histórico
              </Button>
              <Button className="gap-2">
                <Settings2 className="h-4 w-4" />
                Salvar Alterações
              </Button>
            </div>
          </div>

          <div className="mb-6 rounded-[1.5rem] border border-border bg-white p-6 shadow-soft">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-white">
                  <CalendarCog className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Google Agenda Conectado</h2>
                  <p className="text-sm text-muted-foreground">
                    Sincronizado pela última vez há 5 minutos
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Ativo
                  </p>
                  <p className="text-xs text-muted-foreground">{profile.calendar_email || user.email}</p>
                </div>
              </div>
            </div>
          </div>

          <AvailabilitySettings rules={rules} dateBlocks={dateBlocks} busySlots={busySlots} />

          <div className="mt-6 rounded-[1.5rem] border border-border bg-white p-6 shadow-soft">
            <h2 className="text-xl font-semibold tracking-tight">Preferências de Agendamento</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Os serviços configurados aparecem no fluxo público e ajudam a bloquear a agenda corretamente.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {serviceTypes.length ? (
                serviceTypes.map((serviceType) => (
                  <span
                    key={serviceType.id}
                    className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                  >
                    {serviceType.name}
                  </span>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">Nenhum serviço cadastrado.</span>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

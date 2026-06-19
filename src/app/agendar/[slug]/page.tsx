import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarCheck2, ShieldCheck } from "lucide-react";
import { BookingForm } from "@/features/booking/components/booking-form";
import { getCalendarDays } from "@/features/booking/availability";
import {
  getAvailabilityByDate,
  getAvailabilityRules,
  getBlockedDatesBetween,
  getBlockedSlotsByDate
} from "@/features/booking/availability-data";
import {
  getCalendarBusySlots,
  groupBusySlotsByDate
} from "@/features/calendar/provider";
import { getProfileBySlug, getServiceTypesByProfileId } from "@/features/profiles/data";
import type { BookingServiceType } from "@/features/booking/types";
import { AppTopBar, Eyebrow, PageCard, ProgressBar, ShellBackground } from "@/components/ui/scheduler-shell";

export const dynamic = "force-dynamic";

export default async function PublicBookingPage({
  params,
  searchParams
}: {
  params: { slug: string };
  searchParams?: { serviceTypeId?: string };
}) {
  const profile = await getProfileBySlug(params.slug);

  if (!profile) {
    notFound();
  }

  const days = getCalendarDays();
  const startDate = days[0]?.date;
  const endDate = days[days.length - 1]?.date;
  const serviceTypes = await getServiceTypesByProfileId(profile.id);
  const bookingServiceTypes: BookingServiceType[] = serviceTypes.length
    ? serviceTypes
    : [
        {
          id: `${profile.id}-default-service`,
          name: "Consulta inicial",
          description: "Atendimento padrão da agenda.",
          duration_minutes: 60,
          sort_order: 0
        }
      ];
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
    <ShellBackground>
      <AppTopBar
        actions={
          <Link
            href="/"
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            Início
          </Link>
        }
      />

      <main className="px-4 pb-8 pt-4 md:px-8 md:pb-10 md:pt-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4">
            <ProgressBar value={62} />
          </div>

          <PageCard className="mb-6 p-6 md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="max-w-3xl">
                <Eyebrow>Agenda pública</Eyebrow>
                <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-6xl">
                  {profile.public_name}
                </h1>
                <p className="mt-3 text-base leading-7 text-muted-foreground">
                  {profile.profession
                    ? `${profile.profession}. Escolha um horário e envie sua solicitação.`
                    : "Escolha um horário e envie sua solicitação."}
                </p>
              </div>
              <div className="grid gap-2 rounded-2xl border border-border/80 bg-[rgba(37,99,235,0.04)] p-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CalendarCheck2 className="h-4 w-4 text-primary" />
                  Solicitação pendente até aprovação
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Horários ocupados ficam indisponíveis
                </div>
              </div>
            </div>
          </PageCard>

          <BookingForm
            days={days}
            availabilityByDate={availabilityByDate}
          profileId={profile.id}
          profileSlug={profile.slug}
          serviceTypes={bookingServiceTypes}
          profileName={profile.public_name}
          profession={profile.profession}
          initialServiceTypeId={searchParams?.serviceTypeId}
        />
        </div>
      </main>
    </ShellBackground>
  );
}

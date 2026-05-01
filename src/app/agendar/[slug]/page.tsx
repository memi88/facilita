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
import { getProfileBySlug } from "@/features/profiles/data";

export const dynamic = "force-dynamic";

export default async function PublicBookingPage({
  params
}: {
  params: { slug: string };
}) {
  const profile = await getProfileBySlug(params.slug);

  if (!profile) {
    notFound();
  }

  const days = getCalendarDays();
  const startDate = days[0]?.date;
  const endDate = days[days.length - 1]?.date;
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
    <main className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Inicio
        </Link>
        <header className="mb-7 rounded-xl border border-border bg-white p-5 shadow-soft md:p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                Agenda publica
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-normal md:text-5xl">
                {profile.public_name}
              </h1>
              <p className="mt-2 text-muted-foreground">
                {profile.profession
                  ? `${profile.profession}. Escolha um horario e envie sua solicitacao.`
                  : "Escolha um horario e envie sua solicitacao."}
              </p>
            </div>
            <div className="grid gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CalendarCheck2 className="h-4 w-4 text-primary" />
                Solicitacao pendente ate aprovacao
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Horarios ocupados ficam indisponiveis
              </div>
            </div>
          </div>
        </header>
        <BookingForm
          days={days}
          availabilityByDate={availabilityByDate}
          profileId={profile.id}
          profileSlug={profile.slug}
        />
      </div>
    </main>
  );
}

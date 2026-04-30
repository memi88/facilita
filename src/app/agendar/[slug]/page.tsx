import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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
        <header className="mb-7">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
            {profile.public_name}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal md:text-5xl">
            Escolha um horario e envie sua solicitacao.
          </h1>
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

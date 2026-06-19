import Link from "next/link";
import { notFound } from "next/navigation";
import { HelpCircle } from "lucide-react";
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
import { BrandLogo } from "@/components/ui/brand-logo";

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
    <div className="min-h-screen">
      <div className="fixed left-0 top-0 z-50 h-1 w-full bg-[rgba(37,99,235,0.12)]">
        <div className="h-full w-1/3 bg-primary" />
      </div>

      <header className="mx-auto flex max-w-[1360px] items-center justify-between px-4 py-6 md:px-10">
        <Link href="/" className="shrink-0">
          <BrandLogo />
        </Link>
        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm font-medium text-secondary transition hover:text-primary"
        >
          Precisa de ajuda?
          <HelpCircle className="h-5 w-5" />
        </button>
      </header>

      <main className="mx-auto flex max-w-[1360px] flex-1 items-start px-4 pb-12 pt-4 md:px-10">
        <div className="w-full">
          <div className="mb-10">
            <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-[56px] md:leading-[1.05]">
              Agendar Consulta
            </h1>
            <p className="mt-3 text-base text-muted-foreground">
              Selecione a data e o horário mais conveniente para você.
            </p>
          </div>

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
    </div>
  );
}

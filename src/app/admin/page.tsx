import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, RefreshCw, UserRoundCog } from "lucide-react";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { CopyLink } from "@/components/ui/copy-link";
import { isAllowedAdminEmail } from "@/features/auth/permissions";
import { AvailabilitySettings } from "@/features/availability/components/availability-settings";
import {
  getAvailabilityDateBlocks,
  getAvailabilityRules
} from "@/features/booking/availability-data";
import {
  AdminBookingFilters,
  type BookingCounters,
  type DateFilter,
  type StatusFilter
} from "@/features/booking/components/admin-booking-filters";
import { AdminBookingList } from "@/features/booking/components/admin-booking-list";
import { getBookingRequests } from "@/features/booking/data";
import { NotificationsPanel } from "@/features/notifications/components/notifications-panel";
import { getRecentNotifications } from "@/features/notifications/data";
import { getProfileByUserId } from "@/features/profiles/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicBookingUrl } from "@/lib/site-url";
import type { BookingRequest } from "@/lib/supabase/types";

function normalizeStatusFilter(value?: string): StatusFilter {
  if (value === "pending" || value === "approved" || value === "rejected") {
    return value;
  }

  return "all";
}

function normalizeDateFilter(value?: string): DateFilter {
  if (value === "today" || value === "next7") {
    return value;
  }

  return "all";
}

function getLocalDateString(date: Date) {
  return date.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function getCounters(bookings: BookingRequest[]): BookingCounters {
  return bookings.reduce<BookingCounters>(
    (accumulator, booking) => ({
      ...accumulator,
      total: accumulator.total + 1,
      [booking.status]: accumulator[booking.status] + 1
    }),
    { total: 0, pending: 0, approved: 0, rejected: 0 }
  );
}

function filterBookings(
  bookings: BookingRequest[],
  status: StatusFilter,
  date: DateFilter
) {
  const today = getLocalDateString(new Date());
  const nextSevenDays = getLocalDateString(addDays(new Date(), 7));

  return bookings.filter((booking) => {
    const statusMatches = status === "all" || booking.status === status;
    const dateMatches =
      date === "all" ||
      (date === "today" && booking.date === today) ||
      (date === "next7" && booking.date >= today && booking.date <= nextSevenDays);

    return statusMatches && dateMatches;
  });
}

function sortBookings(bookings: BookingRequest[]) {
  const statusWeight = {
    pending: 0,
    approved: 1,
    rejected: 2
  };

  return [...bookings].sort((a, b) => {
    const statusDiff = statusWeight[a.status] - statusWeight[b.status];

    if (statusDiff !== 0) {
      return statusDiff;
    }

    const dateTimeA = `${a.date}T${a.time}`;
    const dateTimeB = `${b.date}T${b.time}`;
    return dateTimeA.localeCompare(dateTimeB);
  });
}

export default async function AdminPage({
  searchParams
}: {
  searchParams: { status?: string; date?: string };
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  if (!isAllowedAdminEmail(user.email)) {
    redirect("/login?error=unauthorized");
  }

  const profile = await getProfileByUserId(user.id);

  if (!profile) {
    redirect("/admin/perfil");
  }

  const [bookings, availabilityRules, dateBlocks, notifications] = await Promise.all([
    getBookingRequests(profile.id),
    getAvailabilityRules(profile.id),
    getAvailabilityDateBlocks(profile.id),
    getRecentNotifications(profile.id)
  ]);
  const currentStatus = normalizeStatusFilter(searchParams.status);
  const currentDate = normalizeDateFilter(searchParams.date);
  const counters = getCounters(bookings);
  const filteredBookings = sortBookings(
    filterBookings(bookings, currentStatus, currentDate)
  );
  const publicBookingUrl = getPublicBookingUrl(profile.slug);

  return (
    <main className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Inicio
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold hover:bg-muted"
            >
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Link>
            <Link
              href="/admin/perfil"
              className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold hover:bg-muted"
            >
              <UserRoundCog className="h-4 w-4" />
              Perfil
            </Link>
            <LogoutButton />
          </div>
        </div>
        <header className="mb-7">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
            Admin
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal md:text-5xl">
            Solicitações de agendamento
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Aprove ou rejeite solicitacoes pendentes. A integracao com calendario
            pode ser adicionada depois deste ponto de aprovacao.
          </p>
          <div className="mt-5 max-w-2xl">
            <CopyLink value={publicBookingUrl} />
          </div>
        </header>
        <AvailabilitySettings
          rules={availabilityRules}
          dateBlocks={dateBlocks}
        />
        <AdminBookingFilters
          counters={counters}
          currentStatus={currentStatus}
          currentDate={currentDate}
          visibleCount={filteredBookings.length}
        />
        <NotificationsPanel notifications={notifications} />
        <AdminBookingList bookings={filteredBookings} />
      </div>
    </main>
  );
}

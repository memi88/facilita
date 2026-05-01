import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarCog,
  ClipboardList,
  Home,
  Link2,
  RefreshCw,
  UserRoundCog
} from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { CopyLink } from "@/components/ui/copy-link";
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
import { CurrentUserCard } from "@/features/profiles/components/current-user-card";
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
  const summaryCards = [
    { label: "Total", value: counters.total, tone: "bg-white", icon: ClipboardList },
    { label: "Pendentes", value: counters.pending, tone: "bg-accent/15", icon: CalendarCog },
    { label: "Aprovados", value: counters.approved, tone: "bg-primary/10", icon: Link2 },
    { label: "Rejeitados", value: counters.rejected, tone: "bg-red-50", icon: UserRoundCog }
  ];

  return (
    <main className="min-h-screen md:grid md:grid-cols-[260px_1fr]">
      <aside className="border-b border-border bg-white px-4 py-4 md:min-h-screen md:border-b-0 md:border-r md:px-5 md:py-6">
        <div className="flex items-center justify-between gap-3 md:block">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <BrandLogo className="max-w-40" />
          </Link>
          <div className="md:hidden">
            <LogoutButton />
          </div>
        </div>
        <div className="mt-6 hidden md:block">
          <CurrentUserCard profile={profile} email={user.email} compact />
        </div>
        <nav className="mt-5 flex gap-2 overflow-x-auto md:grid md:gap-2">
          {[
            { href: "/admin", label: "Dashboard", icon: ClipboardList },
            { href: "/admin/perfil", label: "Perfil", icon: UserRoundCog },
            { href: "/", label: "Inicio", icon: Home }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-6 hidden md:block">
          <LogoutButton />
        </div>
      </aside>

      <div className="px-4 py-6 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <header>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                Dashboard
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-normal md:text-5xl">
                Sua agenda, com tudo no lugar
              </h1>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Veja pedidos de horario, ajuste sua disponibilidade e compartilhe
                seu link com tranquilidade.
              </p>
            </header>
            <Link
              href="/admin"
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm font-semibold hover:bg-muted"
            >
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Link>
          </div>

          <div className="mb-6 md:hidden">
            <CurrentUserCard profile={profile} email={user.email} />
          </div>

          <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {summaryCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className={`rounded-xl border border-border p-4 shadow-soft ${card.tone}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="mt-3 text-3xl font-semibold">{card.value}</p>
                </div>
              );
            })}
          </section>

          <section className="mb-6 rounded-xl border border-border bg-white p-5 shadow-soft">
            <div className="mb-3 flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Link publico de agendamento</h2>
            </div>
            <CopyLink value={publicBookingUrl} />
          </section>

          <AvailabilitySettings rules={availabilityRules} dateBlocks={dateBlocks} />
          <AdminBookingFilters
            currentStatus={currentStatus}
            currentDate={currentDate}
            visibleCount={filteredBookings.length}
          />
          <NotificationsPanel notifications={notifications} />
          <AdminBookingList bookings={filteredBookings} />
        </div>
      </div>
    </main>
  );
}

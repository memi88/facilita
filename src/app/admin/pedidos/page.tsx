import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { Eyebrow, IconBadge, PageCard } from "@/components/ui/scheduler-shell";
import { WorkspaceSidebar } from "@/components/ui/workspace-sidebar";
import { WorkspaceTopNav } from "@/components/ui/workspace-top-nav";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { AdminBookingFilters } from "@/features/booking/components/admin-booking-filters";
import { AdminBookingList } from "@/features/booking/components/admin-booking-list";
import { getBookingRequests } from "@/features/booking/data";
import { getProfileByUserId, getServiceTypesByProfileId } from "@/features/profiles/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicBookingUrl } from "@/lib/site-url";
import type { BookingRequest } from "@/lib/supabase/types";

type StatusFilter = "all" | BookingRequest["status"];
type DateFilter = "all" | "today" | "next7";

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
  const statusWeight = { pending: 0, approved: 1, rejected: 2 };

  return [...bookings].sort((a, b) => {
    const statusDiff = statusWeight[a.status] - statusWeight[b.status];
    if (statusDiff !== 0) return statusDiff;
    return `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`);
  });
}

export default async function RequestsPage({
  searchParams
}: {
  searchParams: { status?: string; date?: string };
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin/pedidos");
  }

  const profile = await getProfileByUserId(user.id);

  if (!profile) {
    redirect("/admin/perfil");
  }

  const bookings = await getBookingRequests(profile.id);
  const serviceTypes = await getServiceTypesByProfileId(profile.id);
  const currentStatus = normalizeStatusFilter(searchParams.status);
  const currentDate = normalizeDateFilter(searchParams.date);
  const filteredBookings = sortBookings(
    filterBookings(bookings, currentStatus, currentDate)
  );
  const publicBookingUrl = getPublicBookingUrl(profile.slug);

  return (
    <div className="min-h-screen">
      <WorkspaceTopNav
        profile={profile}
        activeHref="/admin/pedidos"
        publicBookingUrl={publicBookingUrl}
      />

      <main className="mx-auto flex max-w-[1360px] gap-6 px-4 py-6 md:px-10">
        <WorkspaceSidebar profile={profile} activeHref="/admin/pedidos" />

        <section className="min-w-0 flex-1 space-y-6">
          <PageCard className="p-6 md:p-8">
            <div className="flex items-start gap-3">
              <IconBadge icon={ClipboardList} />
              <div>
                <Eyebrow>Pedidos</Eyebrow>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                  Solicitações de horário
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                  Acompanhe os pedidos enviados pela agenda pública.
                </p>
              </div>
            </div>
          </PageCard>

          <AdminBookingFilters
            currentStatus={currentStatus}
            currentDate={currentDate}
            visibleCount={filteredBookings.length}
          />

          <AdminBookingList bookings={filteredBookings} />
        </section>
      </main>
    </div>
  );
}

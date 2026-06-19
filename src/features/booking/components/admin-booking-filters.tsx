import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/lib/supabase/types";
import { bookingStatusLabels } from "../constants";

type StatusFilter = BookingStatus | "all";
type DateFilter = "all" | "today" | "next7";

type BookingCounters = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
};

const statusOptions: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "pending", label: bookingStatusLabels.pending },
  { value: "approved", label: bookingStatusLabels.approved },
  { value: "rejected", label: bookingStatusLabels.rejected }
];

const dateOptions: Array<{ value: DateFilter; label: string }> = [
  { value: "all", label: "Todas as datas" },
  { value: "today", label: "Hoje" },
  { value: "next7", label: "Proximos 7 dias" }
];

function buildAdminHref(status: StatusFilter, date: DateFilter) {
  const params = new URLSearchParams();

  if (status !== "all") {
    params.set("status", status);
  }

  if (date !== "all") {
    params.set("date", date);
  }

  const query = params.toString();
  return query ? `/admin?${query}` : "/admin";
}

export function AdminBookingFilters({
  currentStatus,
  currentDate,
  visibleCount
}: {
  currentStatus: StatusFilter;
  currentDate: DateFilter;
  visibleCount: number;
}) {
  return (
    <section className="grid gap-4">
      <div className="rounded-[1.25rem] border border-border/80 bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Filtros</h2>
            <p className="text-sm text-muted-foreground">
              Mostrando {visibleCount} solicitacoes.
            </p>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <Link
                key={option.value}
                href={buildAdminHref(option.value, currentDate)}
                className={cn(
                    "inline-flex min-h-10 items-center justify-center rounded-xl border px-3 py-2 text-sm font-semibold transition",
                    currentStatus === option.value
                      ? "border-primary bg-primary text-primary-foreground shadow-soft"
                      : "border-border bg-white hover:bg-muted"
                  )}
                >
                  {option.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {dateOptions.map((option) => (
                <Link
                key={option.value}
                href={buildAdminHref(currentStatus, option.value)}
                className={cn(
                    "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition",
                    currentDate === option.value
                      ? "border-primary bg-primary text-primary-foreground shadow-soft"
                      : "border-border bg-white hover:bg-muted"
                  )}
                >
                  <CalendarDays className="h-4 w-4" />
                  {option.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export type { DateFilter, StatusFilter, BookingCounters };

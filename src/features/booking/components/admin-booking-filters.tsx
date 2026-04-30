import Link from "next/link";
import { CalendarDays, CheckCircle2, Clock3, ListFilter, XCircle } from "lucide-react";
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

function CounterCard({
  label,
  value,
  tone,
  icon
}: {
  label: string;
  value: number;
  tone: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-md", tone)}>
          {icon}
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </div>
  );
}

export function AdminBookingFilters({
  counters,
  currentStatus,
  currentDate,
  visibleCount
}: {
  counters: BookingCounters;
  currentStatus: StatusFilter;
  currentDate: DateFilter;
  visibleCount: number;
}) {
  return (
    <section className="mb-7 grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <CounterCard
          label="Total"
          value={counters.total}
          tone="bg-muted text-muted-foreground"
          icon={<ListFilter className="h-5 w-5" />}
        />
        <CounterCard
          label="Pendentes"
          value={counters.pending}
          tone="bg-accent/15 text-accent-foreground"
          icon={<Clock3 className="h-5 w-5" />}
        />
        <CounterCard
          label="Aprovados"
          value={counters.approved}
          tone="bg-primary/10 text-primary"
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <CounterCard
          label="Rejeitados"
          value={counters.rejected}
          tone="bg-red-50 text-red-700"
          icon={<XCircle className="h-5 w-5" />}
        />
      </div>

      <div className="rounded-lg border border-border bg-white p-4 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold">Filtros</h2>
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
                    "inline-flex min-h-10 items-center justify-center rounded-md border px-3 py-2 text-sm font-semibold transition",
                    currentStatus === option.value
                      ? "border-primary bg-primary text-primary-foreground"
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
                    "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition",
                    currentDate === option.value
                      ? "border-primary bg-primary text-primary-foreground"
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

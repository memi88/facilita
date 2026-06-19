import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarCheck2 } from "lucide-react";
import type { BookingRequest } from "@/lib/supabase/types";
import { bookingStatusLabels } from "../constants";
import { CalendarEventActionForm } from "./calendar-event-action-form";
import { StatusActionForm } from "./status-action-form";

function getStatusClass(status: BookingRequest["status"]) {
  if (status === "approved") {
    return "bg-primary/10 text-primary";
  }

  if (status === "rejected") {
    return "bg-red-50 text-red-700";
  }

  return "bg-accent/15 text-accent-foreground";
}

function formatDateTime(value: string) {
  return format(parseISO(value), "dd MMM yyyy, HH:mm", { locale: ptBR });
}

export function AdminBookingList({ bookings }: { bookings: BookingRequest[] }) {
  if (!bookings.length) {
    return (
      <div className="rounded-[1.25rem] border border-border/80 bg-white p-8 text-center shadow-soft">
        <h2 className="text-lg font-semibold tracking-tight">Nenhuma solicitação encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Novas solicitações enviadas em /agendar aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {bookings.map((booking) => {
        const isReviewed = booking.status !== "pending";

        return (
          <article
            key={booking.id}
            className="rounded-[1.25rem] border border-border/80 bg-white p-5 shadow-soft"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold tracking-tight">{booking.name}</h2>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                      booking.status
                    )}`}
                  >
                    {bookingStatusLabels[booking.status]}
                  </span>
                </div>
                <dl className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <dt className="font-semibold text-foreground">Data</dt>
                    <dd>
                      {format(parseISO(booking.date), "dd MMM yyyy", {
                        locale: ptBR
                      })}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-foreground">Horario</dt>
                    <dd>{booking.time}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-foreground">WhatsApp</dt>
                    <dd>{booking.phone}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-foreground">Tipo</dt>
                    <dd>{booking.service_type_name}</dd>
                  </div>
                </dl>
                {booking.notes ? (
                  <p className="mt-4 rounded-2xl bg-[rgba(37,99,235,0.04)] p-3 text-sm leading-6 text-muted-foreground">
                    {booking.notes}
                  </p>
                ) : null}
                {booking.rejection_reason ? (
                  <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-3">
                    <p className="text-xs font-semibold uppercase text-red-700">
                      Motivo da rejeição
                    </p>
                    <p className="mt-1 text-sm leading-6 text-red-800">
                      {booking.rejection_reason}
                    </p>
                  </div>
                ) : null}
                {booking.reviewed_at ? (
                  <p className="mt-4 text-xs text-muted-foreground">
                    Revisado em {formatDateTime(booking.reviewed_at)}
                    {booking.reviewed_by ? ` por ${booking.reviewed_by}` : ""}
                  </p>
                ) : null}
                {booking.google_event_link ? (
                  <a
                    href={booking.google_event_link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                  >
                    <CalendarCheck2 className="h-4 w-4" />
                    Abrir evento no Google Calendar
                  </a>
                ) : null}
              </div>
              <div className="grid min-w-56 gap-2 sm:grid-cols-2 lg:grid-cols-1">
                <StatusActionForm
                  id={booking.id}
                  status="approved"
                  disabled={isReviewed}
                />
                <StatusActionForm
                  id={booking.id}
                  status="rejected"
                  disabled={isReviewed}
                />
                {booking.status === "approved" && !booking.google_event_id ? (
                  <CalendarEventActionForm id={booking.id} />
                ) : null}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

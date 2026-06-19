import { format, parseISO } from "date-fns";
import { Bell, Clock, MessageCircle } from "lucide-react";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { BookingNotificationWithBooking } from "../data";
import {
  notificationStatusLabels,
  notificationTypeLabels
} from "../constants";

function getStatusClass(status: BookingNotificationWithBooking["status"]) {
  if (status === "sent") {
    return "bg-primary/10 text-primary";
  }

  if (status === "failed") {
    return "bg-red-50 text-red-700";
  }

  if (status === "cancelled") {
    return "bg-muted text-muted-foreground";
  }

  return "bg-accent/15 text-accent-foreground";
}

function formatDateTime(value: string) {
  return format(parseISO(value), "dd MMM yyyy, HH:mm", { locale: ptBR });
}

export function NotificationsPanel({
  notifications
}: {
  notifications: BookingNotificationWithBooking[];
}) {
  return (
    <section className="rounded-[1.25rem] border border-border/80 bg-white p-5 shadow-soft">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Bell className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Fila de notificações</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Preparada para WhatsApp. O envio real ainda está em modo mock.
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        {notifications.length ? (
          notifications.map((notification) => (
            <article
              key={notification.id}
              className="rounded-2xl border border-border/80 p-3"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold">
                      <MessageCircle className="h-4 w-4 text-primary" />
                      {notificationTypeLabels[notification.type]}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-semibold",
                        getStatusClass(notification.status)
                      )}
                    >
                      {notificationStatusLabels[notification.status]}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {notification.booking_requests?.name ?? "Solicitacao removida"} -{" "}
                    {notification.recipient_phone}
                  </p>
                  {notification.booking_requests ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {notification.booking_requests.date} as{" "}
                      {notification.booking_requests.time}
                    </p>
                  ) : null}
                  {notification.error_message ? (
                    <p className="mt-2 text-xs text-red-700">
                      {notification.error_message}
                    </p>
                  ) : null}
                </div>
                <div className="text-sm text-muted-foreground">
                  <p className="inline-flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {formatDateTime(notification.scheduled_for)}
                  </p>
                  {notification.sent_at ? (
                    <p className="mt-1 text-xs">
                      Enviada em {formatDateTime(notification.sent_at)}
                    </p>
                  ) : null}
                </div>
              </div>
            </article>
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-border bg-[rgba(37,99,235,0.04)] px-3 py-3 text-sm text-muted-foreground">
            Nenhuma notificação enfileirada.
          </p>
        )}
      </div>
    </section>
  );
}

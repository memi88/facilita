import Link from "next/link";
import { CalendarPlus, Check, Link2, Trash2 } from "lucide-react";
import type { GoogleCalendarConnection } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { deleteCalendarConnection, setPrimaryCalendarConnection } from "../actions";

function ConnectionBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
      {label}
    </span>
  );
}

function ConnectForm({
  defaultPrimary,
  returnTo
}: {
  defaultPrimary: boolean;
  returnTo: string;
}) {
  return (
    <form action="/api/google-calendar/connect" method="get" className="grid gap-4">
      <input type="hidden" name="returnTo" value={returnTo} />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nome da agenda">
          <Input name="label" placeholder="Google Pessoal" />
        </Field>
        <Field label="E-mail da agenda">
          <Input name="email" type="email" placeholder="contato@dominio.com" />
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <Field label="ID do calendário">
          <Input name="calendarId" defaultValue="primary" placeholder="primary" />
        </Field>
        <label className="flex items-center gap-2 self-end rounded-xl border border-border bg-white px-3 py-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            name="primary"
            defaultChecked={defaultPrimary}
            className="h-4 w-4 rounded border-border"
          />
          Agenda principal
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" className="gap-2">
          <CalendarPlus className="h-4 w-4" />
          Conectar Google
        </Button>
        <p className="text-xs text-muted-foreground">
          Cada agenda conectada também bloqueia horários ocupados automaticamente.
        </p>
      </div>
    </form>
  );
}

function CalendarConnectionCard({
  connection,
  returnTo
}: {
  connection: GoogleCalendarConnection;
  returnTo: string;
}) {
  const connectHref =
    `/api/google-calendar/connect?label=${encodeURIComponent(connection.label)}` +
    `&email=${encodeURIComponent(connection.google_email ?? "")}` +
    `&calendarId=${encodeURIComponent(connection.calendar_id)}` +
    `&primary=${connection.is_primary ? "1" : "0"}` +
    `&returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <article className="grid gap-3 rounded-[1.25rem] border border-border/80 bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-foreground">
              {connection.label || connection.google_email || connection.calendar_id}
            </h3>
            {connection.is_primary ? <ConnectionBadge label="Principal" /> : null}
          </div>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {connection.google_email || "E-mail indisponível"} • {connection.calendar_id}
          </p>
        </div>
        <a
          href={connectHref}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted"
        >
          <Link2 className="h-4 w-4" />
          Reconectar
        </a>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {!connection.is_primary ? (
          <form action={setPrimaryCalendarConnection}>
            <input type="hidden" name="id" value={connection.id} />
            <input type="hidden" name="returnTo" value={returnTo} />
            <Button type="submit" variant="secondary" className="gap-2">
              <Check className="h-4 w-4" />
              Tornar principal
            </Button>
          </form>
        ) : null}
        <form action={deleteCalendarConnection}>
          <input type="hidden" name="id" value={connection.id} />
          <input type="hidden" name="returnTo" value={returnTo} />
          <Button type="submit" variant="danger" className="gap-2">
            <Trash2 className="h-4 w-4" />
            Remover
          </Button>
        </form>
      </div>
    </article>
  );
}

export function CalendarConnectionsManager({
  connections,
  returnTo = "/admin/perfil?tab=agendas"
}: {
  connections: GoogleCalendarConnection[];
  returnTo?: string;
}) {
  return (
    <section className="grid gap-4 rounded-[1.25rem] border border-border/80 bg-white p-6 shadow-soft">
      <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Agendas conectadas</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Conecte quantas agendas precisar. Todas bloqueiam horários na disponibilidade.
          </p>
        </div>
      </div>

      <ConnectForm defaultPrimary={connections.length === 0} returnTo={returnTo} />

      <div className="grid gap-3">
        {connections.length ? (
          connections.map((connection) => (
            <CalendarConnectionCard
              key={connection.id}
              connection={connection}
              returnTo={returnTo}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-[rgba(37,99,235,0.04)] p-4 text-sm text-muted-foreground">
            Nenhuma agenda conectada ainda.
          </div>
        )}
      </div>
    </section>
  );
}

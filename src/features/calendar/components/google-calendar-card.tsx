import Link from "next/link";
import { CalendarCheck2, Unplug } from "lucide-react";
import type { Profile } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

export function GoogleCalendarCard({ profile }: { profile: Profile | null }) {
  const connected = Boolean(profile?.calendar_connected);

  return (
    <section className="mb-6 rounded-lg border border-border bg-white p-5 shadow-soft">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck2 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Google Calendar</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {connected
              ? `Conectado${profile?.calendar_email ? ` em ${profile.calendar_email}` : ""}.`
              : "Conecte sua conta Google para bloquear horarios ocupados automaticamente."}
          </p>
          {profile?.google_calendar_id ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Calendario: {profile.google_calendar_id}
            </p>
          ) : null}
        </div>
        <Link
          href="/api/google-calendar/connect"
          className={cn(
            "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition",
            connected
              ? "border border-border bg-white text-foreground hover:bg-muted"
              : "bg-primary text-primary-foreground shadow-soft hover:brightness-95"
          )}
        >
            {connected ? <Unplug className="h-4 w-4" /> : <CalendarCheck2 className="h-4 w-4" />}
            {connected ? "Reconectar" : "Conectar Google"}
        </Link>
      </div>
    </section>
  );
}

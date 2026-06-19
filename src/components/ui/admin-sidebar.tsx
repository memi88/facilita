import Link from "next/link";
import { ClipboardList, Link2, UserRoundCog } from "lucide-react";
import type { BookingServiceType } from "@/features/booking/types";
import type { Profile } from "@/lib/supabase/types";
import { CopyLink } from "./copy-link";
import { PageCard } from "./scheduler-shell";

type AdminSection = "dashboard" | "profile";

const sectionItems: Array<{
  section: AdminSection;
  label: string;
  href: string;
  icon: typeof ClipboardList;
}> = [
  { section: "dashboard", label: "Dashboard", href: "/admin", icon: ClipboardList },
  { section: "profile", label: "Perfil", href: "/admin/perfil", icon: UserRoundCog }
];

export function AdminSidebar({
  current,
  profile,
  serviceTypes,
  publicBookingUrl,
  showLink = true
}: {
  current: AdminSection;
  profile: Profile | null;
  serviceTypes?: BookingServiceType[];
  publicBookingUrl?: string | null;
  showLink?: boolean;
}) {
  return (
    <aside className="space-y-6 lg:sticky lg:top-4 lg:self-start">
      <PageCard className="p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ClipboardList className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Agenda
            </p>
            <h1 className="mt-1 text-lg font-semibold tracking-tight">
              Organização do profissional
            </h1>
          </div>
        </div>
      </PageCard>

      <PageCard className="p-5">
        <nav className="grid gap-2">
          {sectionItems.map((item) => {
            const Icon = item.icon;
            const active = item.section === current;

            return (
              <Link
                key={item.section}
                href={item.href}
                className={[
                  "inline-flex min-h-11 items-center gap-3 rounded-2xl border px-3 py-2 text-sm font-semibold transition",
                  active
                    ? "border-primary bg-[rgba(37,99,235,0.08)] text-primary"
                    : "border-border bg-white text-foreground hover:bg-muted"
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </PageCard>

      {showLink && publicBookingUrl ? (
        <PageCard className="p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Link2 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Link público</p>
              <p className="text-sm text-muted-foreground">
                Compartilhe a URL com clientes e pacientes.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <CopyLink value={publicBookingUrl} serviceTypes={serviceTypes} />
          </div>
        </PageCard>
      ) : null}
    </aside>
  );
}

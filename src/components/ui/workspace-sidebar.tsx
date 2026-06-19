import Link from "next/link";
import { CalendarDays, CirclePlus, LayoutGrid, Settings2, Users } from "lucide-react";
import type { Profile } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/features/auth/components/logout-button";

const items = [
  { href: "/admin", label: "Home", icon: LayoutGrid },
  { href: "/admin/disponibilidade", label: "Calendário", icon: CalendarDays },
  { href: "/admin/pedidos", label: "Agendamentos", icon: Users },
  { href: "/admin/perfil", label: "Configurações", icon: Settings2 }
];

export function WorkspaceSidebar({
  profile,
  activeHref,
  ctaHref = "/admin/pedidos/novo",
  ctaLabel = "Novo Agendamento"
}: {
  profile: Profile | null;
  activeHref: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  const initials = (profile?.public_name || profile?.name || "P")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <aside className="hidden h-[calc(100vh-73px)] w-64 shrink-0 border-r border-border bg-[hsl(var(--background))] px-4 py-5 lg:flex lg:flex-col">
      <div className="mb-5 flex items-center gap-3 px-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-soft">
          {initials}
        </div>
        <div>
          <h3 className="text-sm font-semibold">{profile?.public_name || "Meu Consultório"}</h3>
          <p className="text-xs text-secondary">Plano Profissional</p>
        </div>
      </div>

      <nav className="grid gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeHref === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                active
                  ? "bg-secondary-container text-secondary shadow-soft"
                  : "text-secondary hover:bg-surface-container"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6">
        <Link
          href={ctaHref}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:brightness-95"
        >
          <CirclePlus className="h-4 w-4" />
          {ctaLabel}
        </Link>
      </div>

      <div className="mt-auto border-t border-border pt-4">
        <LogoutButton className="w-full justify-start" />
      </div>
    </aside>
  );
}

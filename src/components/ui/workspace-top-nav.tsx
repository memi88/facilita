import Link from "next/link";
import { Bell, HelpCircle } from "lucide-react";
import type { Profile } from "@/lib/supabase/types";
import { BrandLogo } from "./brand-logo";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/disponibilidade", label: "Disponibilidade" },
  { href: "/admin/pedidos", label: "Agendamentos" },
  { href: "/admin/perfil", label: "Configurações" }
];

function ProfileAvatar({ profile }: { profile: Profile | null }) {
  const initial = (profile?.public_name || profile?.name || "P").trim().charAt(0).toUpperCase();

  return (
    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border bg-[linear-gradient(135deg,rgba(37,99,235,0.2),rgba(255,255,255,1))] text-sm font-semibold text-primary">
      {initial}
    </div>
  );
}

export function WorkspaceTopNav({
  profile,
  activeHref = "/admin"
}: {
  profile: Profile | null;
  activeHref?: string;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/95 shadow-soft backdrop-blur">
      <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-4 px-4 py-4 md:px-10">
        <Link href="/admin" className="shrink-0">
          <BrandLogo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => {
            const active = activeHref === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "pb-1 text-[15px] font-medium transition",
                  active
                    ? "border-b-2 border-primary text-primary"
                    : "text-secondary hover:text-primary"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            type="button"
            className="hidden rounded-full p-2 text-secondary transition hover:bg-muted md:inline-flex"
            aria-label="Ajuda"
          >
            <HelpCircle className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="hidden rounded-full p-2 text-secondary transition hover:bg-muted md:inline-flex"
            aria-label="Notificações"
          >
            <Bell className="h-5 w-5" />
          </button>
          <ProfileAvatar profile={profile} />
        </div>
      </div>
    </header>
  );
}

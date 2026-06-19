import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import Link from "next/link";
import { BrandLogo } from "./brand-logo";
import { cn } from "@/lib/utils";

export function ShellBackground({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.16),transparent_42%),radial-gradient(circle_at_85%_0,rgba(80,95,118,0.12),transparent_34%)]" />
      <div className="relative">{children}</div>
    </div>
  );
}

export function AppTopBar({
  homeHref = "/",
  actions,
  compact = false
}: {
  homeHref?: string;
  actions?: ReactNode;
  compact?: boolean;
}) {
  return (
    <header className="px-4 pt-4 md:px-8 md:pt-6">
      <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-4 rounded-[1.25rem] border border-border/80 bg-white/90 px-4 py-3 shadow-soft backdrop-blur md:px-5">
        <Link href={homeHref} className="flex items-center gap-3">
          <BrandLogo compact={compact} />
        </Link>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[rgba(37,99,235,0.12)]">
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
      {children}
    </p>
  );
}

export function PageCard({
  className,
  children
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-[1.25rem] border border-border/80 bg-white shadow-soft",
        className
      )}
    >
      {children}
    </section>
  );
}

export function IconBadge({
  icon: Icon,
  tone = "primary"
}: {
  icon: LucideIcon;
  tone?: "primary" | "slate" | "soft";
}) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    slate: "bg-[rgba(80,95,118,0.09)] text-muted-foreground",
    soft: "bg-[rgba(37,99,235,0.08)] text-[rgb(37,99,235)]"
  } as const;

  return (
    <span
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-xl",
        tones[tone]
      )}
    >
      <Icon className="h-5 w-5" />
    </span>
  );
}

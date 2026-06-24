import Link from "next/link";
import { cn } from "@/lib/utils";

export function PublicFooter({
  className
}: {
  className?: string;
}) {
  return (
    <footer className={cn("px-4 pb-8 pt-2 md:px-8 md:pb-10", className)}>
      <div className="mx-auto flex max-w-[1360px] flex-col gap-3 border-t border-border/80 pt-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>Facilita © {new Date().getFullYear()} Idealogic.</p>
        <nav className="flex flex-wrap gap-4 font-medium">
          <Link href="/privacidade" className="transition hover:text-primary">
            Privacidade
          </Link>
          <Link href="/termos" className="transition hover:text-primary">
            Termos
          </Link>
        </nav>
      </div>
    </footer>
  );
}

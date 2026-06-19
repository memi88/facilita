import { Mail, UserRound } from "lucide-react";
import type { Profile } from "@/lib/supabase/types";
import { PageCard } from "@/components/ui/scheduler-shell";

export function CurrentUserCard({
  profile,
  email,
  compact = false
}: {
  profile: Profile | null;
  email?: string | null;
  compact?: boolean;
}) {
  const displayName = profile?.public_name || profile?.name || "Profissional";

  return (
    <PageCard className="p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <UserRound className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Conta conectada
          </p>
          <p className="mt-1 truncate font-semibold">{displayName}</p>
          {profile?.profession ? (
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {profile.profession}
            </p>
          ) : null}
          {profile?.calendar_email_is_account_email ? (
            <p className="mt-1 text-xs text-muted-foreground">
              E-mail principal igual ao da conta
            </p>
          ) : null}
          {!compact && email ? (
            <p className="mt-2 flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 shrink-0" />
              <span className="truncate">{email}</span>
            </p>
          ) : null}
        </div>
      </div>
    </PageCard>
  );
}

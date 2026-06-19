import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarCog, ClipboardList, Link2, UserRoundCog } from "lucide-react";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { getBookingRequests } from "@/features/booking/data";
import { getProfileByUserId, getServiceTypesByProfileId } from "@/features/profiles/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicBookingUrl } from "@/lib/site-url";
import type { BookingRequest } from "@/lib/supabase/types";
import { AppTopBar, Eyebrow, IconBadge, PageCard, ShellBackground } from "@/components/ui/scheduler-shell";
import { AdminSidebar } from "@/components/ui/admin-sidebar";

function getCounters(bookings: BookingRequest[]) {
  return bookings.reduce(
    (accumulator, booking) => {
      accumulator.total += 1;
      accumulator[booking.status] += 1;
      return accumulator;
    },
    { total: 0, pending: 0, approved: 0, rejected: 0 }
  );
}

export default async function AdminPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  const profile = await getProfileByUserId(user.id);

  if (!profile) {
    redirect("/admin/perfil");
  }

  const serviceTypes = await getServiceTypesByProfileId(profile.id);
  const bookings = await getBookingRequests(profile.id);
  const counters = getCounters(bookings);
  const publicBookingUrl = getPublicBookingUrl(profile.slug);

  const summaryCards = [
    { label: "Total", value: counters.total, tone: "bg-white" },
    { label: "Pendentes", value: counters.pending, tone: "bg-accent/15" },
    { label: "Aprovados", value: counters.approved, tone: "bg-primary/10" },
    { label: "Rejeitados", value: counters.rejected, tone: "bg-red-50" }
  ];

  const shortcuts = [
    {
      href: "/admin/disponibilidade",
      label: "Disponibilidade",
      description: "Configure dias, horários e bloqueios.",
      icon: CalendarCog
    },
    {
      href: "/admin/notificacoes",
      label: "Notificações",
      description: "Acompanhe a fila e o status dos envios.",
      icon: Link2
    },
    {
      href: "/admin/pedidos",
      label: "Pedidos",
      description: "Revise solicitações e aprove o que fizer sentido.",
      icon: ClipboardList
    }
  ];
  const submenuItems = [
    { href: "/admin/disponibilidade", label: "Disponibilidade", active: false },
    { href: "/admin/notificacoes", label: "Notificações", active: false },
    { href: "/admin/pedidos", label: "Pedidos", active: false }
  ];

  return (
    <ShellBackground>
      <AppTopBar actions={<LogoutButton />} />

      <main className="px-4 pb-8 pt-4 md:px-8 md:pb-10 md:pt-6">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[320px_1fr]">
          <AdminSidebar
            current="dashboard"
            profile={profile}
            serviceTypes={serviceTypes}
            publicBookingUrl={publicBookingUrl}
          />

          <div className="space-y-6">
            <PageCard className="p-3">
              <nav className="grid gap-2 md:grid-cols-3">
                {submenuItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="inline-flex min-h-11 items-center gap-3 rounded-2xl border border-border bg-white px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-muted"
                  >
                    <IconBadge icon={item.label === "Disponibilidade" ? CalendarCog : item.label === "Notificações" ? Link2 : ClipboardList} tone="soft" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </PageCard>

            <section className="rounded-[1.5rem] border border-border/80 bg-white p-6 shadow-soft md:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="max-w-3xl">
                  <Eyebrow>Dashboard</Eyebrow>
                  <h2 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">
                    Escolha uma área para configurar.
                  </h2>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
                    Cada bloco operacional virou uma página própria para reduzir rolagem e
                    deixar a navegação mais direta.
                  </p>
                </div>
                <Link
                  href="/admin/perfil"
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
                >
                  <UserRoundCog className="h-4 w-4" />
                  Ir para perfil
                </Link>
              </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((card) => (
                <div
                  key={card.label}
                  className={`rounded-[1.25rem] border border-border/80 p-4 shadow-soft ${card.tone}`}
                >
                  <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                  <p className="mt-3 text-3xl font-semibold tracking-tight">{card.value}</p>
                </div>
              ))}
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              {shortcuts.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="rounded-[1.25rem] border border-border/80 bg-white p-5 shadow-soft transition hover:border-primary hover:bg-[rgba(37,99,235,0.04)]"
                  >
                    <div className="flex items-start gap-3">
                      <IconBadge icon={Icon} tone="soft" />
                      <div>
                        <h3 className="text-lg font-semibold tracking-tight">{item.label}</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </section>
          </div>
        </div>
      </main>
    </ShellBackground>
  );
}

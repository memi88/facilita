import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  ExternalLink,
  Link2,
  MessageCircle,
  Share2,
  UserRoundCog
} from "lucide-react";
import { CopyLink } from "@/components/ui/copy-link";
import { PageCard } from "@/components/ui/scheduler-shell";
import { WorkspaceSidebar } from "@/components/ui/workspace-sidebar";
import { WorkspaceTopNav } from "@/components/ui/workspace-top-nav";
import { getBookingRequests } from "@/features/booking/data";
import { getProfileByUserId, getServiceTypesByProfileId } from "@/features/profiles/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicBookingUrl } from "@/lib/site-url";
import type { BookingRequest } from "@/lib/supabase/types";

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

  const nextDays = ["Amanhã", "Quarta", "Quinta"];
  const nextDayCounts = [
    Math.max(0, bookings.length - 1),
    Math.max(0, bookings.length - 4),
    Math.max(0, bookings.length - 2)
  ];

  const summaryCards = [
    { label: "Total", value: counters.total },
    { label: "Pendentes", value: counters.pending },
    { label: "Aprovados", value: counters.approved },
    { label: "Rejeitados", value: counters.rejected }
  ];

  return (
    <div className="min-h-screen">
      <WorkspaceTopNav
        profile={profile}
        activeHref="/admin"
        publicBookingUrl={publicBookingUrl}
      />

      <main className="mx-auto flex max-w-[1360px] gap-6 px-4 py-6 md:px-10">
        <WorkspaceSidebar profile={profile} activeHref="/admin" />

        <div className="min-w-0 flex-1">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">Painel do profissional</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-[44px]">
                Dashboard
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
                Acompanhe o resumo da agenda, compartilhe seu link público e veja uma prévia da página de agendamento.
              </p>
            </div>

            <Link
              href="/admin/perfil?tab=perfil"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground shadow-soft hover:bg-muted"
            >
              <UserRoundCog className="h-4 w-4" />
              Configurações
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            <section className="lg:col-span-5">
              <PageCard className="p-6 md:p-7">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Link2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">Seu Link Público</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Compartilhe o endereço com clientes e escolha o tipo de agendamento.
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <CopyLink value={publicBookingUrl} serviceTypes={serviceTypes} />
                </div>
              </PageCard>
            </section>

            <aside className="lg:col-span-7">
              <PageCard className="p-6 md:p-8">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-2xl font-semibold tracking-tight">Resumo da Agenda</h2>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                    Ativo
                  </span>
                </div>

                <div className="mt-6 grid gap-4">
                  <div className="flex items-center justify-between rounded-2xl border border-border bg-white px-4 py-3 shadow-soft">
                    <div className="flex items-center gap-3">
                      <CalendarDays className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">Segunda a Sexta</span>
                    </div>
                    <span className="text-sm font-semibold">09:00 - 18:00</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-border bg-white px-4 py-3 opacity-60">
                    <div className="flex items-center gap-3">
                      <CalendarDays className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium">Sábado e Domingo</span>
                    </div>
                    <span className="text-sm font-semibold">Fechado</span>
                  </div>
                </div>

                <div className="mt-8 border-t border-border pt-6">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    Próximos 3 dias
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {nextDays.map((label, index) => (
                      <div
                        key={label}
                        className={[
                          "rounded-2xl p-3 text-center",
                          index === 0 ? "bg-primary/10" : "border border-border bg-white"
                        ].join(" ")}
                      >
                        <p className={`text-xs font-semibold ${index === 0 ? "text-primary" : "text-muted-foreground"}`}>
                          {label}
                        </p>
                        <p className="mt-1 text-lg font-semibold">{nextDayCounts[index]} vagas</p>
                      </div>
                    ))}
                  </div>
                </div>
              </PageCard>
            </aside>

            <section className="lg:col-span-12">
              <PageCard className="p-6 md:p-8">
                <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <UserRoundCog className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                        Pré-visualização da sua página
                      </p>
                      <h3 className="mt-1 text-2xl font-semibold tracking-tight">
                        {profile.public_name}
                      </h3>
                    </div>
                  </div>
                  <Link
                    href={`/agendar/${profile.slug}`}
                    className="hidden items-center gap-2 text-sm font-semibold text-primary hover:underline md:inline-flex"
                  >
                    Ver página completa
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-[0.85fr_1.15fr]">
                  <div className="text-center md:text-left">
                    <div className="mx-auto mb-5 h-24 w-24 rounded-full bg-[linear-gradient(135deg,rgba(37,99,235,0.18),rgba(255,255,255,1))] md:mx-0" />
                    <h4 className="text-2xl font-semibold tracking-tight">{profile.public_name}</h4>
                    <p className="mt-2 text-base text-muted-foreground">
                      {profile.profession || "Consultoria Estratégica"}
                    </p>
                    <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                        Presencial
                      </span>
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                        Online
                      </span>
                    </div>
                  </div>

                  <div className="rounded-[1.25rem] border border-border bg-white p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="text-lg font-semibold">Selecione um horário</h4>
                      <div className="flex gap-1">
                        <button type="button" className="rounded-xl border border-border px-3 py-2 text-sm">
                          {"<"}
                        </button>
                        <button type="button" className="rounded-xl border border-border px-3 py-2 text-sm">
                          {">"}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {["SEG 12", "TER 13", "QUA 14", "QUI 15", "SEX 16"].map((day, index) => (
                        <button
                          key={day}
                          type="button"
                          className={[
                            "rounded-xl px-3 py-4 text-center text-sm font-semibold transition",
                            index === 1
                              ? "bg-primary text-primary-foreground shadow-soft"
                              : "border border-border bg-muted/40 text-foreground"
                          ].join(" ")}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {["09:00", "10:30", "14:00", "15:30"].map((time, index) => (
                        <div
                          key={time}
                          className={[
                            "rounded-xl border px-3 py-2 text-center text-sm font-semibold",
                            index === 1
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-white"
                          ].join(" ")}
                        >
                          {time}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </PageCard>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

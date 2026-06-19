import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarCheck2,
  CheckCircle2,
  Clock,
  MessageCircle,
  Sparkles,
  UserRound
} from "lucide-react";
import { getBookingRequestById } from "@/features/booking/confirmation-data";
import { formatBookingDate } from "@/features/booking/formatters";
import { getProfileBySlug } from "@/features/profiles/data";
import { AppTopBar, Eyebrow, IconBadge, PageCard, ProgressBar, ShellBackground } from "@/components/ui/scheduler-shell";

export const dynamic = "force-dynamic";

export default async function BookingConfirmationPage({
  params,
  searchParams
}: {
  params: { slug: string };
  searchParams: { id?: string };
}) {
  const profile = await getProfileBySlug(params.slug);

  if (!profile) {
    notFound();
  }

  const booking = searchParams.id
    ? await getBookingRequestById(searchParams.id, profile.id)
    : null;

  if (!booking) {
    notFound();
  }

  return (
    <ShellBackground>
      <AppTopBar
        actions={
          <Link
            href={`/agendar/${profile.slug}`}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            Novo agendamento
          </Link>
        }
      />

      <main className="px-4 pb-8 pt-4 md:px-8 md:pb-10 md:pt-6">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <PageCard className="p-6 md:p-8">
            <div className="flex flex-col gap-5">
              <div className="flex items-start gap-3">
                <IconBadge icon={CalendarCheck2} />
                <div>
                  <Eyebrow>Agendamento solicitado</Eyebrow>
                  <h1 className="mt-1 text-4xl font-semibold tracking-tight md:text-6xl">
                    Sua solicitação foi enviada.
                  </h1>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
                    Em breve você receberá a confirmação pelo WhatsApp.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    icon: UserRound,
                    label: "Nome",
                    value: booking.name
                  },
                  {
                    icon: MessageCircle,
                    label: "WhatsApp",
                    value: booking.phone
                  },
                  {
                    icon: CalendarCheck2,
                    label: "Data",
                    value: formatBookingDate(booking.date)
                  },
                  {
                    icon: Clock,
                    label: "Horário",
                    value: booking.time
                  }
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-border/80 bg-[rgba(37,99,235,0.04)] p-4"
                    >
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Icon className="h-4 w-4 text-primary" />
                        {item.label}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{item.value}</p>
                    </div>
                  );
                })}
              </div>

              <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-2xl border border-border/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    Tipo de atendimento
                  </p>
                  <p className="mt-2 text-sm font-semibold">{booking.service_type_name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Duração prevista: {booking.service_type_duration_minutes} minutos
                  </p>
                </div>
                {booking.notes ? (
                  <div className="rounded-2xl border border-border/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                      Observações
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {booking.notes}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-border/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                      Status
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      A solicitação segue pendente até a confirmação.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </PageCard>

          <div className="grid gap-6 self-start">
            <PageCard className="p-6">
              <div className="flex items-start gap-3">
                <IconBadge icon={Sparkles} tone="soft" />
                <div>
                  <Eyebrow>Próximo passo</Eyebrow>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                    Aguarde a confirmação
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Assim que a profissional aprovar, você recebe a confirmação.
                  </p>
                </div>
              </div>
              <div className="mt-5 grid gap-3">
                {[
                  "O horário escolhido foi reservado como solicitação.",
                  "Se houver conflito, a agenda mostra apenas opções livres.",
                  "Você pode voltar e fazer uma nova solicitação quando quiser."
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 rounded-2xl border border-border/80 bg-[rgba(37,99,235,0.04)] px-3 py-3 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </PageCard>

            <PageCard className="overflow-hidden p-0">
              <div className="border-b border-border/80 bg-[linear-gradient(180deg,rgba(37,99,235,0.08),rgba(255,255,255,1))] p-6">
                <Eyebrow>Profissional</Eyebrow>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  {profile.public_name}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {profile.profession ?? "Agenda pública com confirmação manual."}
                </p>
              </div>
              <div className="p-6">
                <p className="text-sm font-semibold">Agendamento no dia</p>
                <p className="mt-2 text-sm text-muted-foreground">{formatBookingDate(booking.date)}</p>
                <p className="mt-1 text-sm text-muted-foreground">{booking.time}</p>
              </div>
            </PageCard>
          </div>
        </div>
      </main>
    </ShellBackground>
  );
}

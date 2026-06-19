import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  UserPlus,
  UserRoundCog
} from "lucide-react";
import { AppTopBar, Eyebrow, PageCard, ShellBackground } from "@/components/ui/scheduler-shell";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const steps = [
  {
    title: "Configure seus horarios",
    description: "Escolha os dias e horarios em que voce quer receber solicitacoes."
  },
  {
    title: "Compartilhe seu link publico",
    description: "Envie um link simples para clientes, pacientes ou alunos."
  },
  {
    title: "Confirme com tranquilidade",
    description: "Receba tudo organizado e aprove apenas o que fizer sentido."
  }
];

export default async function HomePage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <ShellBackground>
      <AppTopBar
        actions={
          user ? (
            <>
              <Link
                href="/admin"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm font-semibold hover:bg-muted"
              >
                <ClipboardList className="h-4 w-4" />
                Painel
              </Link>
              <Link
                href="/admin/perfil"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm font-semibold hover:bg-muted"
              >
                <UserRoundCog className="h-4 w-4" />
                Perfil
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login?next=/admin"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm font-semibold hover:bg-muted"
              >
                <ClipboardList className="h-4 w-4" />
                Login
              </Link>
              <Link
                href="/cadastro"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:brightness-95"
              >
                <UserPlus className="h-4 w-4" />
                Cadastrar
              </Link>
            </>
          )
        }
      />

      <main className="px-4 pb-16 pt-8 md:px-8 md:pb-20 md:pt-12">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="max-w-3xl">
            <Eyebrow>Organização com leveza para quem cuida de pessoas</Eyebrow>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight md:text-7xl">
              Uma agenda organizada, sem complicação.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              Receba solicitações de horário de forma simples, evite conflitos e pare de
              perder tempo no WhatsApp.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/cadastro"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:brightness-95"
              >
                Cadastrar
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#como-funciona"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-white px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
              >
                <Sparkles className="h-4 w-4" />
                Ver como funciona
              </Link>
            </div>
          </div>

          <PageCard className="overflow-hidden p-4">
            <div className="rounded-[1.25rem] bg-[linear-gradient(180deg,rgba(37,99,235,0.08),rgba(255,255,255,1))] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">Dra. Ana Moreira</p>
                  <p className="text-xs text-muted-foreground">agendaleve.com/agendar/ana</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Agenda inteligente
                </span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2">
                {["Hoje", "Amanhã", "Sex"].map((day, index) => (
                  <div key={day} className="rounded-2xl border border-border/80 bg-white p-3 text-center">
                    <p className="text-xs text-muted-foreground">{day}</p>
                    <p className="mt-1 text-xl font-semibold">{12 + index}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {["09:00", "10:30", "14:00", "15:30"].map((time, index) => (
                  <div
                    key={time}
                    className={`rounded-2xl border p-3 text-center text-sm font-semibold ${
                      index === 1
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-white"
                    }`}
                  >
                    {time}
                  </div>
                ))}
              </div>
            </div>
          </PageCard>
        </div>

        <section className="mt-12 border-y border-border/80 bg-white/80 px-0 py-14">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Se sua agenda depende de mensagens, ela está te atrasando.
              </h2>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-4">
              {[
                "Você precisa abrir várias agendas para responder um horário",
                "Já ficou com medo de marcar dois atendimentos no mesmo horário",
                "A sala nem sempre está disponível",
                "O WhatsApp vira uma bagunça"
              ].map((item) => (
                <div key={item} className="rounded-[1.25rem] border border-border/80 bg-[rgba(37,99,235,0.04)] p-5">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="como-funciona" className="mx-auto mt-12 max-w-7xl">
          <div className="max-w-2xl">
            <Eyebrow>Um jeito mais leve de organizar seu tempo</Eyebrow>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Você cuida do atendimento. A gente organiza o seu tempo.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-[1.25rem] border border-border/80 bg-white p-5 shadow-soft">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-12 grid max-w-7xl gap-4 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <PageCard className="p-6">
            <Clock className="h-6 w-6 text-primary" />
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">
              Mais tempo para o que realmente importa.
            </h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              Menos tempo organizando agenda. Mais tempo atendendo, estudando ou descansando.
            </p>
          </PageCard>
          <div className="grid gap-3 sm:grid-cols-2">
            {["Neuropsicopedagogas", "Psicólogas", "Terapeutas", "Profissionais autônomos"].map((item) => (
              <div key={item} className="rounded-[1.25rem] border border-border/80 bg-white p-4 text-sm font-semibold shadow-soft">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-12 max-w-7xl">
          <div className="flex flex-col gap-5 rounded-[1.5rem] border border-border/80 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(37,99,235,0.9))] p-6 text-white shadow-soft md:flex-row md:items-center md:justify-between">
            <div>
              <ShieldCheck className="h-6 w-6 text-[rgba(180,197,255,1)]" />
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                Comece com uma agenda mais leve hoje.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
                Pare de cruzar agendas e responder horários manualmente.
              </p>
            </div>
            <Link
              href="/cadastro"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              <MessageCircle className="h-4 w-4" />
              Cadastrar
            </Link>
          </div>
        </section>
      </main>
    </ShellBackground>
  );
}

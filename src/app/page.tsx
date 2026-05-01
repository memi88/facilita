import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  UserPlus
} from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";

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

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-border bg-white/75 px-4 py-4 backdrop-blur md:px-8">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <BrandLogo />
          </Link>
          <div className="flex items-center gap-2">
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
              Criar minha agenda
            </Link>
          </div>
        </nav>
      </header>

      <section className="px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              Organizacao com leveza para quem cuida de pessoas
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-normal md:text-6xl">
              Uma agenda organizada, sem complicacao.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              Receba solicitacoes de horario de forma simples, evite conflitos
              e pare de perder tempo no WhatsApp.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/cadastro"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:brightness-95"
              >
                Criar minha agenda
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

          <div className="rounded-xl border border-border bg-white p-4 shadow-soft">
            <div className="rounded-xl bg-muted p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">Dra. Ana Moreira</p>
                  <p className="text-xs text-muted-foreground">agendaleve.com/agendar/ana</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Agenda leve
                </span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2">
                {["Hoje", "Amanha", "Sex"].map((day, index) => (
                  <div
                    key={day}
                    className="rounded-xl border border-border bg-white p-3 text-center"
                  >
                    <p className="text-xs text-muted-foreground">{day}</p>
                    <p className="mt-1 text-xl font-semibold">{12 + index}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {["09:00", "10:30", "14:00", "15:30"].map((time, index) => (
                  <div
                    key={time}
                    className={`rounded-xl border p-3 text-center text-sm font-semibold ${
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
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-white px-4 py-14 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold">Se sua agenda depende de mensagens, ela esta te atrasando.</h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {[
              "Voce precisa abrir varias agendas para responder um horario",
              "Ja ficou com medo de marcar dois atendimentos no mesmo horario",
              "A sala nem sempre esta disponivel",
              "O WhatsApp vira uma bagunca"
            ].map((item) => (
              <div key={item} className="rounded-xl border border-border bg-background p-5">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="px-4 py-14 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
              Um jeito mais leve de organizar seu tempo
            </p>
            <h2 className="mt-3 text-3xl font-semibold">Voce cuida do atendimento. A gente organiza o seu tempo.</h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-xl border border-border bg-white p-5 shadow-soft">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
                  {index + 1}
                </span>
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-14 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div className="rounded-xl border border-border bg-white p-6 shadow-soft">
            <Clock className="h-6 w-6 text-primary" />
            <h2 className="mt-4 text-3xl font-semibold">Mais tempo para o que realmente importa.</h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              Menos tempo organizando agenda. Mais tempo atendendo, estudando ou descansando.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {["Neuropsicopedagogas", "Psicologas", "Terapeutas", "Profissionais autonomos"].map((item) => (
              <div key={item} className="rounded-xl border border-border bg-white p-4 text-sm font-semibold shadow-soft">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 rounded-xl border border-border bg-foreground p-6 text-white shadow-soft md:flex-row md:items-center md:justify-between">
          <div>
            <ShieldCheck className="h-6 w-6 text-accent" />
            <h2 className="mt-3 text-2xl font-semibold">Comece com uma agenda mais leve hoje.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
              Pare de cruzar agendas e responder horarios manualmente.
            </p>
          </div>
          <Link
            href="/cadastro"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            <MessageCircle className="h-4 w-4" />
            Criar minha agenda
          </Link>
        </div>
      </section>
    </main>
  );
}

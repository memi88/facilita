import Link from "next/link";
import { CalendarDays, ClipboardList, UserPlus } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-center">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <section>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
              Agenda Inteligente
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-normal text-foreground md:text-6xl">
              Uma agenda simples para profissionais testarem agendamentos online.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              Cada profissional cria seu link publico, configura dias e horarios,
              aprova solicitacoes e prepara notificacoes por WhatsApp.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/cadastro"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:brightness-95"
              >
                <UserPlus className="h-4 w-4" />
                Criar agenda
              </Link>
              <Link
                href="/login?next=/admin"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
              >
                <ClipboardList className="h-4 w-4" />
                Entrar no admin
              </Link>
              <Link
                href="/agendar/agenda-principal"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
              >
                <CalendarDays className="h-4 w-4" />
                Ver exemplo
              </Link>
            </div>
          </section>
          <section className="rounded-lg border border-border bg-white p-5 shadow-soft">
            <h2 className="text-lg font-semibold">Fluxo do teste</h2>
            <div className="mt-5 grid gap-3">
              {[
                "Crie uma conta com e-mail e senha.",
                "Configure seus dias, horarios e bloqueios.",
                "Compartilhe seu link /agendar/seu-nome.",
                "Aprove ou rejeite solicitacoes no admin."
              ].map((item, index) => (
                <div key={item} className="flex gap-3 rounded-md bg-muted p-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { LoginForm } from "@/features/auth/components/login-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getSafeNextPath(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/admin";
  }

  return value;
}

export default async function LoginPage({
  searchParams
}: {
  searchParams: { next?: string };
}) {
  const nextPath = getSafeNextPath(searchParams.next);
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    redirect(nextPath);
  }

  return (
    <main className="min-h-screen px-4 py-6 md:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-xl border border-border bg-white shadow-soft lg:grid-cols-[0.95fr_1.05fr]">
        <div className="bg-foreground p-6 text-white md:p-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/75 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Inicio
          </Link>
          <div className="mt-16 max-w-md">
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-white">
              <BrandLogo compact />
            </span>
            <h1 className="mt-5 text-3xl font-semibold tracking-normal md:text-5xl">
              Sua agenda organizada, sem pressa.
            </h1>
            <p className="mt-4 leading-7 text-white/75">
              Acompanhe pedidos de horario, confirme com tranquilidade e mantenha
              seu tempo sob controle.
            </p>
          </div>
          <div className="mt-10 grid gap-3 text-sm text-white/80">
            {[
              "Pedidos pendentes em destaque",
              "Link publico simples para compartilhar",
              "Disponibilidade organizada em poucos passos"
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-accent" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-md">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <LockKeyhole className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-semibold">Entrar na Agenda Leve</h2>
                <p className="text-sm text-muted-foreground">
                  Entre com e-mail e senha da sua conta.
                </p>
              </div>
            </div>
            <LoginForm nextPath={nextPath} />
            <p className="mt-5 text-center text-sm text-muted-foreground">
              Ainda nao tem conta?{" "}
              <Link href="/cadastro" className="font-semibold text-primary hover:underline">
                Criar minha agenda
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

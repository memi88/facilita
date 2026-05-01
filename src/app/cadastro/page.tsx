import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { SignUpForm } from "@/features/profiles/components/signup-form";
import { getCurrentUserProfile } from "@/features/profiles/data";

export default async function SignUpPage() {
  const profile = await getCurrentUserProfile();

  if (profile) {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen px-4 py-6 md:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-xl border border-border bg-white shadow-soft lg:grid-cols-[0.9fr_1.1fr]">
        <div className="bg-muted p-6 md:p-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Inicio
          </Link>
          <div className="mt-14 max-w-md">
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-white">
              <BrandLogo compact />
            </span>
            <h1 className="mt-5 text-3xl font-semibold tracking-normal md:text-5xl">
              Comece com uma agenda mais leve hoje.
            </h1>
            <p className="mt-4 leading-7 text-muted-foreground">
              Configure seu perfil, escolha seu link e receba solicitacoes de
              horario sem depender de mensagens soltas.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-xl">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-semibold">Criar minha agenda</h2>
                <p className="text-sm text-muted-foreground">
                  Dados simples para publicar seu link.
                </p>
              </div>
            </div>
            <SignUpForm />
            <p className="mt-5 text-center text-sm text-muted-foreground">
              Ja tem conta?{" "}
              <Link href="/login?next=/admin" className="font-semibold text-primary hover:underline">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

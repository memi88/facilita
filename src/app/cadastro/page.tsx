import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { SignUpForm } from "@/features/profiles/components/signup-form";
import { getCurrentUserProfile } from "@/features/profiles/data";

export default async function SignUpPage() {
  const profile = await getCurrentUserProfile();

  if (profile) {
    redirect("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <section className="w-full max-w-xl rounded-lg border border-border bg-white p-6 shadow-soft">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Inicio
        </Link>
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold">Criar agenda</h1>
            <p className="text-sm text-muted-foreground">
              Cadastre uma conta para testar a agenda com um link publico proprio.
            </p>
          </div>
        </div>
        <SignUpForm />
      </section>
    </main>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { LoginForm } from "@/features/auth/components/login-form";
import { isAllowedAdminEmail } from "@/features/auth/permissions";
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
  searchParams: { next?: string; error?: string };
}) {
  const nextPath = getSafeNextPath(searchParams.next);
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user && isAllowedAdminEmail(user.email)) {
    redirect(nextPath);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <section className="w-full max-w-md rounded-lg border border-border bg-white p-6 shadow-soft">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Inicio
        </Link>
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
            <LockKeyhole className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold">Acesso administrativo</h1>
            <p className="text-sm text-muted-foreground">
              Entre com o e-mail cadastrado no Supabase.
            </p>
          </div>
        </div>
        {searchParams.error === "unauthorized" ? (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            Este e-mail nao tem permissao para acessar o admin.
          </p>
        ) : null}
        <LoginForm nextPath={nextPath} />
      </section>
    </main>
  );
}

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { AppTopBar, Eyebrow, PageCard, ShellBackground } from "./scheduler-shell";

export type LegalSection = {
  id: string;
  title: string;
  children: ReactNode;
};

export function LegalPageLayout({
  title,
  description,
  updatedAt,
  sections
}: {
  title: string;
  description: string;
  updatedAt: string;
  sections: LegalSection[];
}) {
  return (
    <ShellBackground>
      <AppTopBar
        actions={
          <Link
            href="/"
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        }
      />

      <main className="px-4 pb-16 pt-6 md:px-8 md:pb-20 md:pt-8">
        <div className="mx-auto max-w-[1360px]">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <Eyebrow>Documentos legais</Eyebrow>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                {description}
              </p>
            </div>
            <div className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-secondary shadow-soft">
              Última atualização: {updatedAt}
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.28fr_0.72fr]">
            <PageCard className="self-start p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                Sumário
              </p>
              <nav className="mt-4 grid gap-2">
                {sections.map((section, index) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center justify-between rounded-2xl border border-border bg-white px-4 py-3 text-sm font-medium transition hover:border-primary hover:bg-primary/5"
                  >
                    <span className="min-w-0 truncate">
                      <span className="mr-3 text-xs font-semibold text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {section.title}
                    </span>
                  </a>
                ))}
              </nav>
            </PageCard>

            <div className="grid gap-4">
              {sections.map((section) => (
                <PageCard key={section.id} className="p-6 md:p-8">
                  <article id={section.id} className="scroll-mt-24">
                    <Eyebrow>{section.title}</Eyebrow>
                    <div className="mt-3 grid gap-4 text-sm leading-7 text-muted-foreground [&_a]:font-semibold [&_a]:text-primary [&_ul]:grid [&_ul]:gap-2 [&_ul]:pl-5 [&_ul]:list-disc [&_li]:pl-1">
                      {section.children}
                    </div>
                  </article>
                </PageCard>
              ))}
            </div>
          </div>
        </div>
      </main>
    </ShellBackground>
  );
}

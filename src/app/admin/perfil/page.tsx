import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, SlidersHorizontal, UserRoundCog } from "lucide-react";
import { AppTopBar, Eyebrow, IconBadge, PageCard, ShellBackground } from "@/components/ui/scheduler-shell";
import { AdminSidebar } from "@/components/ui/admin-sidebar";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { CalendarConnectionsManager } from "@/features/profiles/components/calendar-connections-manager";
import { ProfileForm } from "@/features/profiles/components/profile-form";
import { ServiceTypesManager } from "@/features/profiles/components/service-types-manager";
import { getGoogleCalendarConnections } from "@/features/calendar/google-data";
import { getProfileByUserId, getServiceTypesByProfileId } from "@/features/profiles/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ProfileTab = "perfil" | "agendas" | "tipos";

function normalizeTab(value?: string): ProfileTab {
  if (value === "agendas" || value === "tipos") {
    return value;
  }

  return "perfil";
}

export default async function AdminProfileSetupPage({
  searchParams
}: {
  searchParams: { tab?: string };
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin/perfil");
  }

  const profile = await getProfileByUserId(user.id);
  const serviceTypes = profile ? await getServiceTypesByProfileId(profile.id) : [];
  const calendarConnections = profile ? await getGoogleCalendarConnections(profile.id) : [];
  const currentTab = normalizeTab(searchParams.tab);

  return (
    <ShellBackground>
      <AppTopBar
        actions={
          <>
            <Link
              href="/admin"
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted"
            >
              <UserRoundCog className="h-4 w-4" />
              Dashboard
            </Link>
            <LogoutButton />
          </>
        }
      />

      <main className="px-4 pb-8 pt-4 md:px-8 md:pb-10 md:pt-6">
        <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[320px_1fr]">
          <AdminSidebar
            current="profile"
            profile={profile}
            serviceTypes={serviceTypes}
          />

          <section className="space-y-6">
            <PageCard className="p-3">
              <nav className="grid gap-2 md:grid-cols-3">
                {[
                  {
                    href: "/admin/perfil?tab=perfil",
                    label: "Perfil",
                    icon: UserRoundCog,
                    active: currentTab === "perfil"
                  },
                  {
                    href: "/admin/perfil?tab=agendas",
                    label: "Agendas",
                    icon: CalendarDays,
                    active: currentTab === "agendas"
                  },
                  {
                    href: "/admin/perfil?tab=tipos",
                    label: "Tipos de atendimentos",
                    icon: SlidersHorizontal,
                    active: currentTab === "tipos"
                  }
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={[
                        "inline-flex min-h-11 items-center gap-3 rounded-2xl border px-3 py-2 text-sm font-semibold transition",
                        item.active
                          ? "border-primary bg-[rgba(37,99,235,0.08)] text-primary"
                          : "border-border bg-white text-foreground hover:bg-muted"
                      ].join(" ")}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </PageCard>

            {currentTab === "perfil" ? (
              <PageCard className="p-6 md:p-8">
                <div className="mb-6 flex items-start gap-3">
                  <IconBadge icon={UserRoundCog} />
                  <div>
                    <Eyebrow>Perfil</Eyebrow>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                      Dados principais
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                      Configure nome, e-mail principal, link público e dados do Google.
                    </p>
                  </div>
                </div>

                <ProfileForm
                  profile={profile}
                  email={user.email}
                  returnTo="/admin/perfil?tab=perfil"
                />
              </PageCard>
            ) : null}

            {currentTab === "agendas" ? (
              <PageCard className="p-6 md:p-8">
                <div className="mb-6 flex items-start gap-3">
                  <IconBadge icon={CalendarDays} />
                  <div>
                    <Eyebrow>Agendas</Eyebrow>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                      Conexões do Google Calendar
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                      Cada agenda conectada bloqueia horários ocupados automaticamente.
                    </p>
                  </div>
                </div>

                {profile ? (
                  <CalendarConnectionsManager
                    connections={calendarConnections}
                    returnTo="/admin/perfil?tab=agendas"
                  />
                ) : (
                  <p className="rounded-2xl border border-dashed border-border bg-[rgba(37,99,235,0.04)] p-4 text-sm text-muted-foreground">
                    Salve o perfil primeiro para conectar agendas.
                  </p>
                )}
              </PageCard>
            ) : null}

            {currentTab === "tipos" ? (
              <PageCard className="p-6 md:p-8">
                <div className="mb-6 flex items-start gap-3">
                  <IconBadge icon={SlidersHorizontal} tone="soft" />
                  <div>
                    <Eyebrow>Tipos de atendimentos</Eyebrow>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                      Serviços e duração
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                      Cadastre os atendimentos exibidos no agendamento público.
                    </p>
                  </div>
                </div>

                {profile ? (
                  <ServiceTypesManager
                    serviceTypes={serviceTypes}
                    returnTo="/admin/perfil?tab=tipos"
                  />
                ) : (
                  <p className="rounded-2xl border border-dashed border-border bg-[rgba(37,99,235,0.04)] p-4 text-sm text-muted-foreground">
                    Salve o perfil primeiro para cadastrar atendimentos.
                  </p>
                )}
              </PageCard>
            ) : null}
          </section>
        </div>
      </main>
    </ShellBackground>
  );
}

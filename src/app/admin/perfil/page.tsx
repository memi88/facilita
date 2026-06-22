import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, SlidersHorizontal, UserRoundCog } from "lucide-react";
import { Eyebrow, IconBadge, PageCard } from "@/components/ui/scheduler-shell";
import { CalendarConnectionsManager } from "@/features/profiles/components/calendar-connections-manager";
import { ProfileForm } from "@/features/profiles/components/profile-form";
import { ServiceTypesManager } from "@/features/profiles/components/service-types-manager";
import { getGoogleCalendarConnections } from "@/features/calendar/google-data";
import { getProfileByUserId, getServiceTypesByProfileId } from "@/features/profiles/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { WorkspaceTopNav } from "@/components/ui/workspace-top-nav";
import { WorkspaceSidebar } from "@/components/ui/workspace-sidebar";
import { getPublicBookingUrl } from "@/lib/site-url";

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
  const publicBookingUrl = profile ? getPublicBookingUrl(profile.slug) : null;

  return (
    <div className="min-h-screen">
      <WorkspaceTopNav
        profile={profile}
        activeHref="/admin/perfil"
      />

      <main className="mx-auto flex max-w-[1360px] gap-6 px-4 py-6 md:px-10">
        <WorkspaceSidebar profile={profile} activeHref="/admin/perfil" />

        <section className="min-w-0 flex-1 space-y-6">
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
                  label: "Serviços",
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
                    <Eyebrow>Serviços</Eyebrow>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                      Serviços e duração
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                      Cadastre os serviços exibidos no agendamento público.
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
                    Salve o perfil primeiro para cadastrar serviços.
                  </p>
                )}
              </PageCard>
            ) : null}
          </section>
      </main>
    </div>
  );
}

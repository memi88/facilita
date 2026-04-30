import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarCheck2, Clock, MessageCircle, UserRound } from "lucide-react";
import { getBookingRequestById } from "@/features/booking/confirmation-data";
import {
  formatBookingDate,
  getAppointmentTypeLabel
} from "@/features/booking/formatters";
import { getProfileBySlug } from "@/features/profiles/data";

export const dynamic = "force-dynamic";

export default async function BookingConfirmationPage({
  params,
  searchParams
}: {
  params: { slug: string };
  searchParams: { id?: string };
}) {
  const profile = await getProfileBySlug(params.slug);

  if (!profile) {
    notFound();
  }

  const booking = searchParams.id
    ? await getBookingRequestById(searchParams.id, profile.id)
    : null;

  if (!booking) {
    notFound();
  }

  return (
    <main className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href={`/agendar/${profile.slug}`}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Novo agendamento
        </Link>

        <section className="rounded-lg border border-border bg-white p-6 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <CalendarCheck2 className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                {profile.public_name}
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-normal">
                Seu pedido de agendamento está pendente.
              </h1>
              <p className="mt-3 leading-7 text-muted-foreground">
                A solicitação foi enviada para análise. A confirmação final será
                enviada pelo WhatsApp informado.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md bg-muted p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <UserRound className="h-4 w-4 text-primary" />
                Nome
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{booking.name}</p>
            </div>
            <div className="rounded-md bg-muted p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <MessageCircle className="h-4 w-4 text-primary" />
                WhatsApp
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{booking.phone}</p>
            </div>
            <div className="rounded-md bg-muted p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <CalendarCheck2 className="h-4 w-4 text-primary" />
                Data
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {formatBookingDate(booking.date)}
              </p>
            </div>
            <div className="rounded-md bg-muted p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Clock className="h-4 w-4 text-primary" />
                Horário
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{booking.time}</p>
            </div>
          </div>

          <div className="mt-4 rounded-md border border-border p-4">
            <p className="text-sm font-semibold">Tipo de atendimento</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {getAppointmentTypeLabel(booking.appointment_type)}
            </p>
          </div>

          {booking.notes ? (
            <div className="mt-4 rounded-md border border-border p-4">
              <p className="text-sm font-semibold">Observações</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {booking.notes}
              </p>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

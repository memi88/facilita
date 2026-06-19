"use client";

import { useEffect } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  MessageSquareText,
  Sparkles
} from "lucide-react";
import { useFormState } from "react-dom";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { createBookingRequest } from "../actions";
import type { CalendarDay, TimeSlot } from "../types";
import type { BookingServiceType } from "../types";
import { SubmitButton } from "./submit-button";
import { Eyebrow, IconBadge, PageCard } from "@/components/ui/scheduler-shell";

type AvailabilityByDate = Record<string, TimeSlot[]>;

function getFirstAvailableTime(slots: TimeSlot[]) {
  return slots.find((slot) => slot.available)?.time ?? "";
}

export function BookingForm({
  days,
  availabilityByDate,
  profileId,
  profileSlug,
  serviceTypes,
  profileName,
  profession,
  initialServiceTypeId
}: {
  days: CalendarDay[];
  availabilityByDate: AvailabilityByDate;
  profileId: string;
  profileSlug: string;
  serviceTypes: BookingServiceType[];
  profileName: string;
  profession?: string | null;
  initialServiceTypeId?: string;
}) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(days[0]?.date ?? "");
  const slots = availabilityByDate[selectedDate] ?? [];
  const [selectedTime, setSelectedTime] = useState(getFirstAvailableTime(slots));
  const initialSelectedServiceTypeId =
    initialServiceTypeId && serviceTypes.some((serviceType) => serviceType.id === initialServiceTypeId)
      ? initialServiceTypeId
      : serviceTypes[0]?.id ?? "";
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState(
    initialSelectedServiceTypeId
  );
  const [state, formAction] = useFormState(createBookingRequest, {
    ok: false,
    message: "",
    bookingId: undefined
  });
  const selectedServiceType =
    serviceTypes.find((serviceType) => serviceType.id === selectedServiceTypeId) ??
    serviceTypes[0] ??
    null;

  useEffect(() => {
    if (state.ok && state.bookingId) {
      router.push(`/agendar/${profileSlug}/confirmacao?id=${state.bookingId}`);
    }
  }, [profileSlug, router, state.bookingId, state.ok]);

  useEffect(() => {
    if (!selectedServiceTypeId && serviceTypes[0]) {
      setSelectedServiceTypeId(serviceTypes[0].id);
    }
  }, [selectedServiceTypeId, serviceTypes]);

  function handleDateChange(date: string) {
    const nextSlots = availabilityByDate[date] ?? [];
    setSelectedDate(date);
    setSelectedTime(getFirstAvailableTime(nextSlots));
  }

  function getServiceTypeLabel(serviceType: BookingServiceType) {
    return `${serviceType.name} • ${serviceType.duration_minutes} min`;
  }

  return (
    <form action={formAction} className="grid gap-6 xl:grid-cols-[0.88fr_1.08fr_0.92fr]">
      <input type="hidden" name="profileId" value={profileId} />
      <input type="hidden" name="profileSlug" value={profileSlug} />
      <input type="hidden" name="selectedDate" value={selectedDate} />
      <input type="hidden" name="selectedTime" value={selectedTime} />
      <input type="hidden" name="serviceTypeId" value={selectedServiceTypeId} />

      <aside className="grid gap-6 self-start">
        <PageCard className="overflow-hidden p-6">
          <div className="flex items-start gap-3">
            <IconBadge icon={Sparkles} />
            <div>
              <Eyebrow>Agendamento público</Eyebrow>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">{profileName}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {profession
                  ? `${profession}. Escolha um horário e envie a solicitação.`
                  : "Escolha um horário e envie a solicitação."}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {[
              "Mostramos apenas horários livres.",
              "Tipos de atendimento bloqueiam a agenda conforme a duração.",
              "A solicitação fica pendente até a confirmação."
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 rounded-2xl border border-border/70 bg-[rgba(37,99,235,0.04)] px-3 py-3 text-sm text-muted-foreground"
              >
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          {selectedServiceType ? (
            <div className="mt-5 rounded-2xl border border-border/70 bg-[rgba(37,99,235,0.04)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Serviço selecionado
              </p>
              <p className="mt-2 text-sm font-semibold">{selectedServiceType.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedServiceType.duration_minutes} minutos
                {selectedServiceType.description ? ` • ${selectedServiceType.description}` : ""}
              </p>
            </div>
          ) : null}
        </PageCard>

        <PageCard className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <IconBadge icon={CalendarDays} tone="soft" />
            <div>
              <Eyebrow>Tipo de atendimento</Eyebrow>
              <h3 className="mt-1 text-xl font-semibold tracking-tight">Escolha o formato</h3>
            </div>
          </div>

          <div className="grid gap-2">
            {serviceTypes.length ? (
              serviceTypes.map((serviceType) => {
                const selected = selectedServiceTypeId === serviceType.id;

                return (
                  <button
                    key={serviceType.id}
                    type="button"
                    onClick={() => setSelectedServiceTypeId(serviceType.id)}
                    className={cn(
                      "flex min-h-18 items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition",
                      selected
                        ? "border-primary bg-[rgba(37,99,235,0.08)] text-primary"
                        : "border-border bg-white text-foreground hover:bg-muted"
                    )}
                  >
                    <span className="grid gap-1">
                      <span className="font-semibold">{getServiceTypeLabel(serviceType)}</span>
                      {serviceType.description ? (
                        <span className="text-xs leading-5 text-muted-foreground">
                          {serviceType.description}
                        </span>
                      ) : null}
                    </span>
                    {selected ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : null}
                  </button>
                );
              })
            ) : (
              <p className="rounded-2xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                Nenhum tipo de atendimento foi cadastrado ainda.
              </p>
            )}
          </div>
        </PageCard>
      </aside>

      <section className="grid gap-6 self-start">
        <PageCard className="p-6 md:p-7">
          <div className="mb-5 flex items-center gap-3">
            <IconBadge icon={CalendarDays} />
            <div>
              <Eyebrow>Escolha o dia</Eyebrow>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                Selecione a data disponível
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Apenas horários livres aparecem nessa visão.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-5">
            {days.map((day) => (
              <Button
                key={day.date}
                type="button"
                variant={selectedDate === day.date ? "primary" : "secondary"}
                className="h-20 flex-col gap-1 px-2"
                onClick={() => handleDateChange(day.date)}
              >
                <span className="text-xs uppercase">{day.isToday ? "Hoje" : day.weekday}</span>
                <span className="text-xl font-semibold">{day.dayNumber}</span>
              </Button>
            ))}
          </div>
        </PageCard>

        <PageCard className="p-6 md:p-7">
          <div className="mb-5 flex items-center gap-3">
            <IconBadge icon={Clock} tone="soft" />
            <div>
              <Eyebrow>Horários</Eyebrow>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                Selecione um horário
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                O sistema já considera a duração do atendimento.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {slots.length ? (
              slots.map((slot) => (
                <Button
                  key={slot.time}
                  type="button"
                  variant={selectedTime === slot.time ? "primary" : "secondary"}
                  disabled={!slot.available}
                  onClick={() => setSelectedTime(slot.time)}
                  className={cn("h-12", !slot.available && "line-through")}
                  title={!slot.available ? "Horário indisponível" : undefined}
                >
                  {slot.label}
                </Button>
              ))
            ) : (
              <p className="col-span-full rounded-2xl border border-border bg-muted p-4 text-sm text-muted-foreground">
                Não há horários disponíveis para essa data.
              </p>
            )}
          </div>
        </PageCard>
      </section>

      <section className="grid gap-6 self-start">
        <PageCard className="p-6 md:p-7">
          <div className="mb-5 flex items-center gap-3">
            <IconBadge icon={MessageSquareText} />
            <div>
              <Eyebrow>Seus dados</Eyebrow>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                Envie a solicitação
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                A profissional confirma o horário depois.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <Field label="Nome">
              <Input name="name" required placeholder="Seu nome completo" />
            </Field>
            <Field label="WhatsApp">
              <Input
                name="phone"
                required
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="5511999999999"
              />
            </Field>
            <Field label="Observações">
              <Textarea name="notes" placeholder="Contexto, objetivo ou preferência." />
            </Field>
            <SubmitButton label="Enviar solicitação" />
            {state.message ? (
              <p
                className={cn(
                  "rounded-2xl px-3 py-2 text-sm",
                  state.ok ? "bg-primary/10 text-primary" : "bg-red-50 text-red-700"
                )}
              >
                {state.message}
              </p>
            ) : null}
          </div>
        </PageCard>
      </section>
    </form>
  );
}

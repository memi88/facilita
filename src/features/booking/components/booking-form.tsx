"use client";

import { useEffect } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, CheckCircle2, Clock, MessageSquareText } from "lucide-react";
import { useFormState } from "react-dom";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { createBookingRequest } from "../actions";
import { appointmentTypes } from "../constants";
import type { CalendarDay, TimeSlot } from "../types";
import { SubmitButton } from "./submit-button";

type AvailabilityByDate = Record<string, TimeSlot[]>;

function getFirstAvailableTime(slots: TimeSlot[]) {
  return slots.find((slot) => slot.available)?.time ?? "";
}

export function BookingForm({
  days,
  availabilityByDate,
  profileId,
  profileSlug
}: {
  days: CalendarDay[];
  availabilityByDate: AvailabilityByDate;
  profileId: string;
  profileSlug: string;
}) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(days[0]?.date ?? "");
  const slots = availabilityByDate[selectedDate] ?? [];
  const [selectedTime, setSelectedTime] = useState(getFirstAvailableTime(slots));
  const [appointmentType, setAppointmentType] = useState(appointmentTypes[0].value);
  const [state, formAction] = useFormState(createBookingRequest, {
    ok: false,
    message: "",
    bookingId: undefined
  });

  useEffect(() => {
    if (state.ok && state.bookingId) {
      router.push(`/agendar/${profileSlug}/confirmacao?id=${state.bookingId}`);
    }
  }, [profileSlug, router, state.bookingId, state.ok]);

  function handleDateChange(date: string) {
    const nextSlots = availabilityByDate[date] ?? [];
    setSelectedDate(date);
    setSelectedTime(getFirstAvailableTime(nextSlots));
  }

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <input type="hidden" name="profileId" value={profileId} />
      <input type="hidden" name="profileSlug" value={profileSlug} />
      <input type="hidden" name="selectedDate" value={selectedDate} />
      <input type="hidden" name="selectedTime" value={selectedTime} />
      <input type="hidden" name="appointmentType" value={appointmentType} />

      <section className="rounded-xl border border-border bg-white p-5 shadow-soft md:p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarDays className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold">Escolha um dia</h2>
            <p className="text-sm text-muted-foreground">
              Mostramos apenas horarios livres na agenda.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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

        <div className="mt-7 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent-foreground">
            <Clock className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold">Horarios disponiveis</h2>
            <p className="text-sm text-muted-foreground">Selecione o melhor horario para voce.</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {slots.length ? (
            slots.map((slot) => (
              <Button
                key={slot.time}
                type="button"
                variant={selectedTime === slot.time ? "primary" : "secondary"}
                disabled={!slot.available}
                onClick={() => setSelectedTime(slot.time)}
                className={cn("h-12", !slot.available && "line-through")}
                title={!slot.available ? "Horario indisponivel" : undefined}
              >
                {slot.label}
              </Button>
            ))
          ) : (
            <p className="col-span-full rounded-xl border border-border bg-muted p-4 text-sm text-muted-foreground">
              Nao ha horarios mockados para esta data.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-white p-5 shadow-soft md:p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MessageSquareText className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold">Seus dados</h2>
            <p className="text-sm text-muted-foreground">A profissional confirma o horario depois.</p>
          </div>
        </div>

        <div className="grid gap-4">
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Tipo de atendimento</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {appointmentTypes.map((type) => {
                const selected = appointmentType === type.value;

                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setAppointmentType(type.value)}
                    className={cn(
                      "flex min-h-16 items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left text-sm font-semibold transition",
                      selected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-white text-foreground hover:bg-muted"
                    )}
                  >
                    {type.label}
                    {selected ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : null}
                  </button>
                );
              })}
            </div>
          </div>
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
          <Field label="Observacoes">
            <Textarea name="notes" placeholder="Contexto, objetivo ou preferencia." />
          </Field>
          <SubmitButton label="Enviar solicitacao" />
          {state.message ? (
            <p
              className={cn(
                "rounded-xl px-3 py-2 text-sm",
                state.ok
                  ? "bg-primary/10 text-primary"
                  : "bg-red-50 text-red-700"
              )}
            >
              {state.message}
            </p>
          ) : null}
        </div>
      </section>
    </form>
  );
}

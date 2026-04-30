"use client";

import { useEffect } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock, MessageSquareText } from "lucide-react";
import { useFormState } from "react-dom";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
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

      <section className="rounded-lg border border-border bg-white p-5 shadow-soft">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
            <CalendarDays className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold">Escolha a data</h2>
            <p className="text-sm text-muted-foreground">
              Horarios pendentes ou aprovados ja ficam bloqueados.
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
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/15 text-accent-foreground">
            <Clock className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold">Horarios disponiveis</h2>
            <p className="text-sm text-muted-foreground">Selecione um horario para enviar.</p>
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
            <p className="col-span-full rounded-md border border-border bg-muted p-4 text-sm text-muted-foreground">
              Nao ha horarios mockados para esta data.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-white p-5 shadow-soft">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
            <MessageSquareText className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold">Dados do agendamento</h2>
            <p className="text-sm text-muted-foreground">A solicitacao fica pendente.</p>
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
          <Field label="Tipo de atendimento">
            <Select name="appointmentType" required defaultValue={appointmentTypes[0].value}>
              {appointmentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Observacoes">
            <Textarea name="notes" placeholder="Contexto, objetivo ou preferencia." />
          </Field>
          <SubmitButton label="Enviar solicitacao" />
          {state.message ? (
            <p
              className={cn(
                "rounded-md px-3 py-2 text-sm",
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

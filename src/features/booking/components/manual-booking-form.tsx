"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, MessageSquareText, Sparkles } from "lucide-react";
import { useFormState } from "react-dom";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { createManualBookingRequest } from "../actions";
import { getSlotsForDuration } from "../availability";
import type { CalendarDay, TimeSlot } from "../types";
import type { BookingServiceType } from "../types";
import { Eyebrow, IconBadge, PageCard } from "@/components/ui/scheduler-shell";

type AvailabilityByDate = Record<string, TimeSlot[]>;

function getFirstAvailableTime(slots: TimeSlot[]) {
  return slots.find((slot) => slot.available)?.time ?? "";
}

function formatCalendarLabel(date: string) {
  return format(parseISO(date), "EEEE, dd 'de' MMM", { locale: ptBR });
}

export function ManualBookingForm({
  days,
  availabilityByDate,
  profileId,
  serviceTypes,
  profileName,
  profession
}: {
  days: CalendarDay[];
  availabilityByDate: AvailabilityByDate;
  profileId: string;
  serviceTypes: BookingServiceType[];
  profileName: string;
  profession?: string | null;
}) {
  const router = useRouter();
  const [visibleMonthDate, setVisibleMonthDate] = useState(() =>
    startOfMonth(parseISO(days[0]?.date ?? new Date().toISOString()))
  );
  const [selectedDate, setSelectedDate] = useState(days[0]?.date ?? "");
  const slots = useMemo(
    () => availabilityByDate[selectedDate] ?? [],
    [availabilityByDate, selectedDate]
  );
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState(
    serviceTypes[0]?.id ?? ""
  );
  const [state, formAction] = useFormState(createManualBookingRequest, {
    ok: false,
    message: "",
    bookingId: undefined
  });
  const selectedServiceType =
    serviceTypes.find((serviceType) => serviceType.id === selectedServiceTypeId) ??
    serviceTypes[0] ??
    null;
  const serviceDurationMinutes = selectedServiceType?.duration_minutes ?? 30;
  const visibleSlots = useMemo(
    () => getSlotsForDuration(slots, serviceDurationMinutes),
    [serviceDurationMinutes, slots]
  );
  const [selectedTime, setSelectedTime] = useState(getFirstAvailableTime(visibleSlots));
  const minMonthDate = useMemo(
    () => startOfMonth(parseISO(days[0]?.date ?? new Date().toISOString())),
    [days]
  );
  const maxMonthDate = useMemo(
    () =>
      startOfMonth(
        parseISO(days[days.length - 1]?.date ?? days[0]?.date ?? new Date().toISOString())
      ),
    [days]
  );
  const calendarMonthLabel = useMemo(
    () => format(visibleMonthDate, "MMMM yyyy", { locale: ptBR }),
    [visibleMonthDate]
  );
  const weekdayLabels = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
  const selectedDateLabel = selectedDate ? formatCalendarLabel(selectedDate) : "";
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(visibleMonthDate);
    const monthEnd = endOfMonth(monthStart);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: gridStart, end: gridEnd }).map((date) => {
      const dateKey = format(date, "yyyy-MM-dd");
      const day = days.find((item) => item.date === dateKey);
      const available = getSlotsForDuration(
        availabilityByDate[dateKey] ?? [],
        serviceDurationMinutes
      ).some((slot) => slot.available);

      return {
        date: dateKey,
        dayNumber: format(date, "d"),
        weekdayLabel: format(date, "EEE", { locale: ptBR })
          .replace(/\./g, "")
          .slice(0, 3)
          .toUpperCase(),
        inMonth: isSameMonth(date, monthStart),
        isPast: day?.isPast ?? date < new Date(new Date().setHours(0, 0, 0, 0)),
        isToday: day?.isToday ?? false,
        available
      };
    });
  }, [availabilityByDate, days, serviceDurationMinutes, visibleMonthDate]);

  function getAvailableSlotsForDate(date: string) {
    return getSlotsForDuration(availabilityByDate[date] ?? [], serviceDurationMinutes);
  }

  function getDefaultDateForMonth(monthDate: Date) {
    const monthKey = format(monthDate, "yyyy-MM");
    const monthCandidates = days.filter((day) => day.date.startsWith(monthKey));

    return (
      monthCandidates.find(
        (day) => !day.isPast && getAvailableSlotsForDate(day.date).some((slot) => slot.available)
      )?.date ??
      monthCandidates.find((day) => !day.isPast)?.date ??
      monthCandidates[0]?.date ??
      selectedDate
    );
  }

  function shiftMonth(direction: -1 | 1) {
    const nextMonth = startOfMonth(addMonths(visibleMonthDate, direction));
    setVisibleMonthDate(nextMonth);

    const nextDate = getDefaultDateForMonth(nextMonth);
    if (nextDate) {
      setSelectedDate(nextDate);
    }
  }

  useEffect(() => {
    if (state.ok && state.bookingId) {
      router.push(`/admin/pedidos?status=approved`);
    }
  }, [router, state.bookingId, state.ok]);

  useEffect(() => {
    if (!selectedServiceTypeId && serviceTypes[0]) {
      setSelectedServiceTypeId(serviceTypes[0].id);
    }
  }, [selectedServiceTypeId, serviceTypes]);

  useEffect(() => {
    if (!visibleSlots.some((slot) => slot.time === selectedTime && slot.available)) {
      setSelectedTime(getFirstAvailableTime(visibleSlots));
    }
  }, [selectedDate, selectedTime, visibleSlots]);

  function handleDateChange(date: string) {
    const nextSlots = getAvailableSlotsForDate(date);
    setSelectedDate(date);
    setSelectedTime(getFirstAvailableTime(nextSlots));
    setVisibleMonthDate(startOfMonth(parseISO(date)));
  }

  return (
    <form action={formAction} className="grid gap-6 xl:grid-cols-[0.86fr_1.38fr_0.66fr]">
      <input type="hidden" name="profileId" value={profileId} />
      <input type="hidden" name="selectedDate" value={selectedDate} />
      <input type="hidden" name="selectedTime" value={selectedTime} />
      <input type="hidden" name="serviceTypeId" value={selectedServiceTypeId} />

      <aside className="grid gap-6 self-start">
        <PageCard className="overflow-hidden p-6 md:p-7">
          <div className="flex items-start gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-[linear-gradient(135deg,rgba(37,99,235,0.25),rgba(255,255,255,1))] shadow-soft">
              <div className="h-14 w-14 rounded-full bg-[linear-gradient(135deg,rgba(15,23,42,0.72),rgba(37,99,235,0.68))]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-semibold tracking-tight">{profileName}</h2>
              <p className="mt-1 text-base text-muted-foreground">
                {profession || "Consultoria Estratégica"}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                  Manual
                </span>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                  Confirmado
                </span>
              </div>
            </div>
          </div>

          {selectedServiceType ? (
            <div className="mt-6 rounded-2xl border border-border bg-[rgba(37,99,235,0.04)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Serviço
              </p>
              <p className="mt-2 text-sm font-semibold">{selectedServiceType.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedServiceType.duration_minutes} minutos
              </p>
            </div>
          ) : null}

          <div className="mt-6 grid gap-4">
            <Field label="Nome do cliente">
              <Input name="name" required placeholder="Nome do cliente" />
            </Field>
            <Field label="WhatsApp do cliente">
              <Input
                name="phone"
                required
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="5511999999999"
              />
            </Field>
            <Field label="Observações">
              <Textarea name="notes" placeholder="Motivo, contexto ou observações." />
            </Field>
          </div>
        </PageCard>

        <PageCard className="p-6 md:p-7">
          <div className="flex items-start gap-3">
            <IconBadge icon={Sparkles} tone="soft" />
            <div>
              <Eyebrow>Atalho</Eyebrow>
              <h3 className="mt-1 text-xl font-semibold tracking-tight">
                Criação direta
              </h3>
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            {[
              "Cria o agendamento já aprovado.",
              "Bloqueia o horário na disponibilidade.",
              "Pode sincronizar com Google Calendar."
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-2 rounded-2xl border border-border bg-[rgba(37,99,235,0.04)] px-3 py-3 text-sm text-muted-foreground"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </PageCard>
      </aside>

      <section className="grid gap-6 self-start">
        <PageCard className="p-6 md:p-8">
          <div className="mb-5 flex items-start gap-3">
            <IconBadge icon={CalendarDays} />
            <div>
              <Eyebrow>Calendário</Eyebrow>
              <h2 className="mt-1 text-3xl font-semibold tracking-tight">Novo Agendamento</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Selecione a data e o horário para um cliente que não conseguiu agendar pelo link.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-[2rem] font-semibold tracking-tight capitalize leading-none">
                {calendarMonthLabel}
              </h3>
              <div className="flex gap-1">
                <button
                  type="button"
                  className="rounded-full p-2 text-secondary transition hover:bg-muted"
                  aria-label="Mês anterior"
                  disabled={isSameMonth(visibleMonthDate, minMonthDate)}
                  onClick={() => shiftMonth(-1)}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="rounded-full p-2 text-secondary transition hover:bg-muted"
                  aria-label="Próximo mês"
                  disabled={isSameMonth(visibleMonthDate, maxMonthDate)}
                  onClick={() => shiftMonth(1)}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-3 text-center">
              {weekdayLabels.map((label) => (
                <div
                  key={label}
                  className="pb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground"
                >
                  {label}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-3">
              {calendarDays.map((day) => {
                const selected = selectedDate === day.date;
                const isEmptyCell = !day.inMonth;

                if (isEmptyCell) {
                  return <div key={day.date} aria-hidden="true" className="min-h-24 md:min-h-28" />;
                }

                return (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => handleDateChange(day.date)}
                    className={cn(
                      "flex min-h-24 flex-col items-center justify-center gap-1 rounded-[1.35rem] border px-2 py-3 text-sm font-medium transition md:min-h-28",
                      day.isPast && !selected
                        ? "cursor-not-allowed border-border bg-muted/40 text-muted-foreground"
                        : selected
                          ? "border-primary bg-primary text-primary-foreground shadow-soft"
                          : "border-border bg-white text-foreground hover:bg-muted"
                    )}
                    disabled={day.isPast && !selected}
                    aria-pressed={selected}
                  >
                    <span className="truncate text-[11px] font-semibold uppercase tracking-[0.18em] leading-none">
                      {day.isToday ? "Hoje" : day.weekdayLabel}
                    </span>
                    <span className="text-[2rem] font-semibold leading-none">{day.dayNumber}</span>
                    {day.available ? (
                      <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-current" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </PageCard>

        <PageCard className="p-6 md:p-8">
          <div className="mb-5 flex items-start gap-3">
            <IconBadge icon={MessageSquareText} />
            <div>
              <Eyebrow>Selecionado</Eyebrow>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                {selectedDateLabel}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                O sistema já considera bloqueios, disponibilidade e calendário conectado.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {serviceTypes.map((serviceType) => {
                const selected = selectedServiceTypeId === serviceType.id;

                return (
                  <button
                    key={serviceType.id}
                    type="button"
                    onClick={() => setSelectedServiceTypeId(serviceType.id)}
                    className={cn(
                      "rounded-2xl border px-4 py-3 text-left text-sm transition",
                      selected
                        ? "border-primary bg-primary/10 text-primary shadow-soft"
                        : "border-border bg-white text-foreground hover:bg-muted"
                    )}
                  >
                    <div className="font-semibold">{serviceType.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {serviceType.duration_minutes} min
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" className="min-w-44">
                Criar agendamento
              </Button>
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
          </div>
        </PageCard>
      </section>

      <aside className="grid gap-6 self-start">
        <PageCard className="overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-border bg-[rgba(37,99,235,0.04)] px-5 py-4">
            <div>
              <p className="text-base font-semibold">{selectedDateLabel}</p>
              <p className="text-sm text-muted-foreground">Fuso horário: São Paulo (GMT-3)</p>
            </div>
              <div className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              {visibleSlots.length} horários
            </div>
          </div>
          <div className="max-h-[420px] space-y-3 overflow-auto p-5">
            {visibleSlots.length ? (
              visibleSlots.map((slot) => (
                <button
                  key={slot.time}
                  type="button"
                  disabled={!slot.available}
                  onClick={() => setSelectedTime(slot.time)}
                  className={cn(
                    "w-full rounded-2xl border px-4 py-3.5 text-center text-base font-semibold transition",
                    selectedTime === slot.time
                      ? "border-primary bg-primary text-primary-foreground shadow-soft"
                      : slot.available
                        ? "border-border bg-white text-foreground hover:bg-muted"
                        : "cursor-not-allowed border-border bg-muted/40 text-muted-foreground line-through"
                  )}
                >
                  {slot.label}
                </button>
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                Não há horários disponíveis para essa data.
              </p>
            )}
          </div>
        </PageCard>
      </aside>
    </form>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MessageSquareText,
  Sparkles
} from "lucide-react";
import { useFormState } from "react-dom";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek
} from "date-fns";
import { ptBR } from "date-fns/locale";
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

function formatCalendarLabel(date: string) {
  return format(parseISO(date), "EEEE, dd 'de' MMM", { locale: ptBR });
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
  const [formStartedAt] = useState(() => new Date().toISOString());
  const [step, setStep] = useState<1 | 2>(1);
  const [visibleMonthDate, setVisibleMonthDate] = useState(() =>
    startOfMonth(parseISO(days[0]?.date ?? new Date().toISOString()))
  );
  const [selectedDate, setSelectedDate] = useState(days[0]?.date ?? "");
  const slots = availabilityByDate[selectedDate] ?? [];
  const [selectedTime, setSelectedTime] = useState(getFirstAvailableTime(slots));
  const selectedServiceTypeId =
    initialServiceTypeId && serviceTypes.some((serviceType) => serviceType.id === initialServiceTypeId)
      ? initialServiceTypeId
      : serviceTypes[0]?.id ?? "";
  const [state, formAction] = useFormState(createBookingRequest, {
    ok: false,
    message: "",
    bookingId: undefined
  });

  const selectedServiceType =
    serviceTypes.find((serviceType) => serviceType.id === selectedServiceTypeId) ??
    serviceTypes[0] ??
    null;
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
  const selectedTimeLabel = selectedTime || "Selecione um horário";

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(visibleMonthDate);
    const monthEnd = endOfMonth(monthStart);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const today = startOfDay(new Date());

    return eachDayOfInterval({ start: gridStart, end: gridEnd }).map((date) => {
      const dateKey = format(date, "yyyy-MM-dd");
      const day = days.find((item) => item.date === dateKey);
      const available = (availabilityByDate[dateKey] ?? []).some((slot) => slot.available);

      return {
        date: dateKey,
        dayNumber: format(date, "d"),
        weekdayLabel: format(date, "EEE", { locale: ptBR })
          .replace(/\./g, "")
          .slice(0, 3)
          .toUpperCase(),
        inMonth: isSameMonth(date, monthStart),
        isPast: day?.isPast ?? date < today,
        isToday: day?.isToday ?? false,
        available
      };
    });
  }, [availabilityByDate, days, visibleMonthDate]);

  useEffect(() => {
    if (state.ok && state.bookingId) {
      router.push(`/agendar/${profileSlug}/confirmacao?id=${state.bookingId}`);
    }
  }, [profileSlug, router, state.bookingId, state.ok]);

  useEffect(() => {
    const nextSlots = availabilityByDate[selectedDate] ?? [];
    if (!nextSlots.some((slot) => slot.time === selectedTime && slot.available)) {
      setSelectedTime(getFirstAvailableTime(nextSlots));
    }
  }, [availabilityByDate, selectedDate, selectedTime]);

  function handleDateChange(date: string) {
    const nextSlots = availabilityByDate[date] ?? [];
    setSelectedDate(date);
    setSelectedTime(getFirstAvailableTime(nextSlots));
    setVisibleMonthDate(startOfMonth(parseISO(date)));
    setStep(1);
  }

  function shiftMonth(direction: -1 | 1) {
    const nextMonth = startOfMonth(addMonths(visibleMonthDate, direction));
    setVisibleMonthDate(nextMonth);

    const monthKey = format(nextMonth, "yyyy-MM");
    const monthCandidates = days.filter((day) => day.date.startsWith(monthKey));
    const nextDate =
      monthCandidates.find(
        (day) => !day.isPast && (availabilityByDate[day.date] ?? []).some((slot) => slot.available)
      )?.date ??
      monthCandidates.find((day) => !day.isPast)?.date ??
      monthCandidates[0]?.date ??
      selectedDate;

    if (nextDate) {
      setSelectedDate(nextDate);
      setSelectedTime(getFirstAvailableTime(availabilityByDate[nextDate] ?? []));
    }
  }

  function goToStepTwo() {
    if (!selectedDate || !selectedTime || !selectedServiceTypeId) {
      return;
    }

    setStep(2);
  }

  function goToStepOne() {
    setStep(1);
  }

  return (
    <form
      action={formAction}
      className={cn(
        "grid gap-6",
        step === 1 ? "xl:grid-cols-[0.9fr_1.12fr_0.78fr]" : "xl:grid-cols-1"
      )}
    >
      <input type="hidden" name="profileId" value={profileId} />
      <input type="hidden" name="profileSlug" value={profileSlug} />
      <input type="hidden" name="selectedDate" value={selectedDate} />
      <input type="hidden" name="selectedTime" value={selectedTime} />
      <input type="hidden" name="serviceTypeId" value={selectedServiceTypeId} />
      <input type="hidden" name="formStartedAt" value={formStartedAt} />
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="sr-only"
      />

      {step === 1 ? (
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
                    Presencial
                  </span>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                    Online
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
                  {selectedServiceType.description ? ` • ${selectedServiceType.description}` : ""}
                </p>
              </div>
            ) : null}
          </PageCard>

          <PageCard className="p-6 md:p-7">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <Eyebrow>Etapas</Eyebrow>
                <h3 className="mt-1 text-xl font-semibold tracking-tight">Escolha o horário</h3>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              {[
                "Passo 1: selecione data e horário.",
                "Passo 2: preencha seus dados.",
                "Passo 3: veja o agendamento pendente."
              ].map((item, index) => (
                <div
                  key={item}
                  className={cn(
                    "flex items-start gap-2 rounded-2xl border px-3 py-3 text-sm",
                    step === index + 1
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-white text-muted-foreground"
                  )}
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </PageCard>
        </aside>
      ) : null}

      <section className="grid gap-6 self-start">
        {step === 1 ? (
          <PageCard className="overflow-hidden p-0">
            <div className="border-b border-border/80 bg-[linear-gradient(180deg,rgba(37,99,235,0.08),rgba(255,255,255,1))] px-6 py-5">
              <div className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 h-6 w-6 text-primary" />
                <div>
                  <Eyebrow>Calendário</Eyebrow>
                  <h2 className="mt-1 text-3xl font-semibold tracking-tight">Agendar Consulta</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Passo 1 de 3: selecione a data e o horário
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 p-6 md:p-8">
              <div className="grid gap-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-[2rem] font-semibold tracking-tight capitalize leading-none">
                    {calendarMonthLabel}
                  </h3>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="rounded-full p-2 text-secondary transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Mês anterior"
                      disabled={isSameMonth(visibleMonthDate, minMonthDate)}
                      onClick={() => shiftMonth(-1)}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      className="rounded-full p-2 text-secondary transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
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

                    if (!day.inMonth) {
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

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-[rgba(37,99,235,0.04)] px-4 py-4">
                <div>
                  <p className="text-sm font-semibold">{selectedDateLabel || "Selecione uma data"}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedTime ? `Horário escolhido: ${selectedTime}` : "Escolha um horário na lista ao lado"}
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={goToStepTwo}
                  className="min-w-44"
                  disabled={!selectedDate || !selectedTime || !selectedServiceTypeId}
                >
                  Continuar
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </PageCard>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
            <PageCard className="overflow-hidden p-0">
              <div className="border-b border-border/80 bg-[rgba(37,99,235,0.04)] px-6 py-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <Eyebrow>Resumo</Eyebrow>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                      Revise antes de enviar
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Passo 2 de 3: preencha seus dados para gerar o agendamento pendente.
                    </p>
                  </div>
                  <div className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    Passo 2 de 3
                  </div>
                </div>
              </div>

              <div className="grid gap-4 p-6 md:p-8">
                <div className="rounded-2xl border border-border bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    Horário escolhido
                  </p>
                  <p className="mt-2 text-sm font-semibold">{selectedDateLabel}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedTimeLabel}</p>
                </div>
              </div>
            </PageCard>

            <PageCard className="p-6 md:p-8">
              <div className="mb-5 flex items-start gap-3">
                <IconBadge icon={MessageSquareText} />
                <div>
                  <Eyebrow>Seus dados</Eyebrow>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                    Envie a solicitação
                  </h2>
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
                <div className="flex flex-wrap items-center gap-3">
                  <Button type="button" variant="secondary" onClick={goToStepOne}>
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                  </Button>
                  <SubmitButton label="Enviar solicitação" />
                </div>
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
          </div>
        )}
      </section>

      {step === 1 ? (
        <aside className="grid gap-6 self-start">
          <PageCard className="overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-border bg-[rgba(37,99,235,0.04)] px-5 py-4">
              <div>
                <p className="text-base font-semibold">{selectedDateLabel}</p>
                <p className="text-sm text-muted-foreground">Fuso horário: São Paulo (GMT-3)</p>
              </div>
              <div className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                {slots.length} horários
              </div>
            </div>
            <div className="max-h-[420px] space-y-3 overflow-auto p-5">
              {slots.length ? (
                slots.map((slot) => (
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
      ) : null}
    </form>
  );
}

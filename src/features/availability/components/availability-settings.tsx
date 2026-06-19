"use client";

import { useMemo, useState } from "react";
import { Ban, CalendarCog, Clock, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import type {
  AvailabilityDateBlock,
  AvailabilityRule
} from "@/lib/supabase/types";
import {
  addDateBlock,
  removeDateBlock,
  saveAvailabilityRules
} from "../actions";
import { weekDays } from "../constants";

const commonSlots = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00"
];

const presetSlots = {
  commercial: ["09:00", "10:30", "14:00", "15:30", "17:00"],
  morning: ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00"],
  afternoon: ["13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"]
};

function SubmitRuleButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      Salvar horarios
    </Button>
  );
}

function SubmitBlockButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="secondary" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
      Bloquear data
    </Button>
  );
}

function normalizeSlots(slots: string[]) {
  return Array.from(new Set(slots)).sort();
}

function DaySlotSelector({
  dayValue,
  dayLabel,
  enabled,
  slots,
  onEnabledChange,
  onSlotsChange
}: {
  dayValue: number;
  dayLabel: string;
  enabled: boolean;
  slots: string[];
  onEnabledChange: (enabled: boolean) => void;
  onSlotsChange: (slots: string[]) => void;
}) {
  const [customSlot, setCustomSlot] = useState("");
  const selectedSlots = new Set(slots);

  function toggleSlot(slot: string) {
    onSlotsChange(
      selectedSlots.has(slot)
        ? slots.filter((item) => item !== slot)
        : normalizeSlots([...slots, slot])
    );
  }

  function addCustomSlot() {
    if (!/^\d{2}:\d{2}$/.test(customSlot)) {
      return;
    }

    onSlotsChange(normalizeSlots([...slots, customSlot]));
    setCustomSlot("");
  }

  return (
    <div className="grid gap-3 rounded-2xl border border-border/80 bg-white p-5">
      <input type="hidden" name={`slots_${dayValue}`} value={slots.join(",")} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            name={`enabled_${dayValue}`}
            checked={enabled}
            onChange={(event) => onEnabledChange(event.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          {dayLabel}
        </label>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
          {slots.length} horarios
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          className="min-h-8 px-3 py-1 text-xs"
          onClick={() => onSlotsChange(presetSlots.commercial)}
        >
          Comercial
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="min-h-8 px-3 py-1 text-xs"
          onClick={() => onSlotsChange(presetSlots.morning)}
        >
          Manha
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="min-h-8 px-3 py-1 text-xs"
          onClick={() => onSlotsChange(presetSlots.afternoon)}
        >
          Tarde
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="min-h-8 px-3 py-1 text-xs"
          onClick={() => onSlotsChange([])}
        >
          Limpar
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-10">
        {commonSlots.map((slot) => {
          const selected = selectedSlots.has(slot);

          return (
            <button
              key={slot}
              type="button"
              disabled={!enabled}
              onClick={() => toggleSlot(slot)}
              className={cn(
                "flex h-10 items-center justify-center rounded-md border text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-white text-foreground hover:bg-muted"
              )}
            >
              {slot}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <Field label="Horario customizado">
          <Input
            type="time"
            value={customSlot}
            disabled={!enabled}
            onChange={(event) => setCustomSlot(event.target.value)}
            className="w-40"
          />
        </Field>
        <Button
          type="button"
          variant="secondary"
          disabled={!enabled || !customSlot}
          onClick={addCustomSlot}
        >
          <Plus className="h-4 w-4" />
          Adicionar
        </Button>
      </div>

      {slots.length ? (
        <div className="flex flex-wrap gap-2">
          {slots.map((slot) => (
            <span
              key={slot}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-semibold"
            >
              <Clock className="h-3 w-3" />
              {slot}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function AvailabilitySettings({
  rules,
  dateBlocks
}: {
  rules: AvailabilityRule[];
  dateBlocks: AvailabilityDateBlock[];
}) {
  const [rulesState, rulesAction] = useFormState(saveAvailabilityRules, {
    ok: false,
    message: ""
  });
  const [blockState, blockAction] = useFormState(addDateBlock, {
    ok: false,
    message: ""
  });
  const initialRuleState = useMemo(
    () =>
      Object.fromEntries(
        weekDays.map((day) => {
          const rule = rules.find((item) => item.day_of_week === day.value);

          return [
            day.value,
            {
              enabled: rule?.enabled ?? false,
              slots: rule?.slots ?? []
            }
          ];
        })
      ) as Record<number, { enabled: boolean; slots: string[] }>,
    [rules]
  );
  const [ruleState, setRuleState] = useState(initialRuleState);

  function updateDay(
    dayValue: number,
    nextState: Partial<{ enabled: boolean; slots: string[] }>
  ) {
    setRuleState((current) => ({
      ...current,
      [dayValue]: {
        ...current[dayValue],
        ...nextState
      }
    }));
  }

  return (
    <section className="grid gap-5 rounded-[1.25rem] border border-border/80 bg-white p-6 shadow-soft">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <CalendarCog className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Configuração de agenda</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Defina dias ativos, horarios e restricoes manuais.
          </p>
        </div>
      </div>

      <form action={rulesAction} className="grid gap-4">
        {weekDays.map((day) => {
          const dayState = ruleState[day.value] ?? {
            enabled: false,
            slots: []
          };

          return (
            <DaySlotSelector
              key={day.value}
              dayValue={day.value}
              dayLabel={day.label}
              enabled={dayState.enabled}
              slots={dayState.slots}
              onEnabledChange={(enabled) => updateDay(day.value, { enabled })}
              onSlotsChange={(slots) => updateDay(day.value, { slots })}
            />
          );
        })}
        <div className="flex flex-wrap items-center gap-3">
          <SubmitRuleButton />
          {rulesState.message ? (
            <p className={rulesState.ok ? "text-sm text-primary" : "text-sm text-red-700"}>
              {rulesState.message}
            </p>
          ) : null}
        </div>
      </form>

      <div className="border-t border-border/80 pt-5">
        <h3 className="text-base font-semibold tracking-tight">Bloqueios por data</h3>
        <form action={blockAction} className="mt-4 grid gap-3 md:grid-cols-[180px_1fr_auto]">
          <Field label="Data">
            <Input name="date" type="date" required />
          </Field>
          <Field label="Motivo">
            <Input name="reason" placeholder="Feriado, compromisso externo..." />
          </Field>
          <div className="flex items-end">
            <SubmitBlockButton />
          </div>
        </form>
        {blockState.message ? (
          <p className={blockState.ok ? "mt-3 text-sm text-primary" : "mt-3 text-sm text-red-700"}>
            {blockState.message}
          </p>
        ) : null}

        <div className="mt-4 grid gap-2">
          {dateBlocks.length ? (
            dateBlocks.map((block) => (
              <div
                key={block.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-[rgba(37,99,235,0.04)] px-3 py-3 text-sm"
              >
                <span>
                  <strong>{block.date}</strong>
                  {block.reason ? ` - ${block.reason}` : ""}
                </span>
                <form action={removeDateBlock}>
                  <input type="hidden" name="id" value={block.id} />
                  <Button type="submit" variant="ghost" className="min-h-8 px-2 py-1">
                    <Trash2 className="h-4 w-4" />
                    Remover
                  </Button>
                </form>
              </div>
            ))
          ) : (
            <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
              Nenhuma data bloqueada.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

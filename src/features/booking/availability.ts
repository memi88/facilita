import {
  addDays,
  format,
  isBefore,
  isSameDay,
  startOfDay
} from "date-fns";
import { ptBR } from "date-fns/locale";
import type { TimeSlot } from "./types";
import type { CalendarDay } from "./types";

function timeToMinutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);

  return hour * 60 + minute;
}

export function getSlotsForDuration(slots: TimeSlot[], durationMinutes: number) {
  const requiredBlocks = Math.max(1, Math.ceil(durationMinutes / 30));

  return slots.filter((slot, index) => {
    if (!slot.available) {
      return false;
    }

    const startMinutes = timeToMinutes(slot.time);
    const hasEnoughConsecutiveBlocks = Array.from({ length: requiredBlocks }, (_, blockIndex) => {
      const nextSlot = slots[index + blockIndex];
      const expectedMinutes = startMinutes + blockIndex * 30;

      return Boolean(
        nextSlot?.available && timeToMinutes(nextSlot.time) === expectedMinutes
      );
    }).every(Boolean);

    return hasEnoughConsecutiveBlocks;
  });
}

export function getCalendarDays(count = 120): CalendarDay[] {
  const today = startOfDay(new Date());

  return Array.from({ length: count }, (_, index) => {
    const day = addDays(today, index);

    return {
      date: format(day, "yyyy-MM-dd"),
      dayNumber: Number(format(day, "d")),
      weekday: format(day, "EEE", { locale: ptBR }),
      isToday: isSameDay(day, today),
      isPast: isBefore(day, today)
    };
  });
}

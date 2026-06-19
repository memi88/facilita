import {
  addDays,
  format,
  isBefore,
  isSameDay,
  startOfDay
} from "date-fns";
import { ptBR } from "date-fns/locale";
import type { CalendarDay } from "./types";

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

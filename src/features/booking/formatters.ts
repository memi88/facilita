import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { AppointmentType } from "@/lib/supabase/types";
import { appointmentTypes } from "./constants";

export function getAppointmentTypeLabel(value: AppointmentType) {
  return appointmentTypes.find((type) => type.value === value)?.label ?? value;
}

export function formatBookingDate(date: string) {
  return format(parseISO(date), "EEEE, dd 'de' MMMM 'de' yyyy", {
    locale: ptBR
  });
}

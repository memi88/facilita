import type { AppointmentTypeOption } from "./types";

export const appointmentTypes: AppointmentTypeOption[] = [
  { value: "initial_consultation", label: "Consulta inicial" },
  { value: "follow_up", label: "Retorno" },
  { value: "strategy_session", label: "Sessao estrategica" },
  { value: "support", label: "Suporte" }
];

export const bookingStatusLabels = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Rejeitado"
} as const;

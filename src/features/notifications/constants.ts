import type { NotificationStatus, NotificationType } from "@/lib/supabase/types";

export const notificationTypeLabels: Record<NotificationType, string> = {
  booking_created: "Solicitacao recebida",
  booking_approved: "Agendamento aprovado",
  booking_rejected: "Agendamento rejeitado",
  booking_reminder_24h: "Lembrete 24h"
};

export const notificationStatusLabels: Record<NotificationStatus, string> = {
  pending: "Pendente",
  sent: "Enviada",
  failed: "Falhou",
  cancelled: "Cancelada"
};

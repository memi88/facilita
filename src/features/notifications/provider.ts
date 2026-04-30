import type { BookingNotification } from "@/lib/supabase/types";

export type WhatsAppProviderResult = {
  ok: boolean;
  providerMessageId?: string;
  errorMessage?: string;
};

export async function sendWhatsAppNotificationMock(
  notification: BookingNotification
): Promise<WhatsAppProviderResult> {
  console.info("[whatsapp:mock]", {
    id: notification.id,
    type: notification.type,
    recipientPhone: notification.recipient_phone,
    payload: notification.payload
  });

  return {
    ok: true,
    providerMessageId: `mock_${notification.id}`
  };
}

import { z } from "zod";

export const appointmentTypeValues = [
  "initial_consultation",
  "follow_up",
  "strategy_session",
  "support"
] as const;

function normalizePhone(value: unknown) {
  return String(value ?? "").replace(/\D/g, "");
}

export const bookingRequestSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome."),
  phone: z
    .preprocess(normalizePhone, z.string())
    .pipe(
      z
        .string()
        .min(10, "Informe um WhatsApp com DDD.")
        .max(13, "Informe um WhatsApp valido.")
        .regex(/^\d+$/, "Use somente numeros no WhatsApp.")
    ),
  appointmentType: z.enum(appointmentTypeValues),
  notes: z.string().trim().max(700, "Use no maximo 700 caracteres.").optional(),
  selectedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  selectedTime: z.string().regex(/^\d{2}:\d{2}$/)
});

export const statusUpdateSchema = z
  .object({
    id: z.string().uuid(),
    status: z.enum(["approved", "rejected"]),
    rejectionReason: z
      .string()
      .trim()
      .max(500, "Use no maximo 500 caracteres.")
      .optional()
  })
  .superRefine((value, context) => {
    if (value.status === "rejected" && !value.rejectionReason) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe o motivo da rejeicao.",
        path: ["rejectionReason"]
      });
    }
  });

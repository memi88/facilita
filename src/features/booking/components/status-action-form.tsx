"use client";

import { Check, Loader2, X } from "lucide-react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { updateBookingStatus } from "../actions";
import type { BookingStatusOption } from "../types";

function ActionButton({
  status,
  disabled
}: {
  status: BookingStatusOption;
  disabled: boolean;
}) {
  const { pending } = useFormStatus();
  const isApprove = status === "approved";

  return (
    <Button
      type="submit"
      disabled={pending || disabled}
      variant={isApprove ? "primary" : "danger"}
      className="flex-1"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isApprove ? (
        <Check className="h-4 w-4" />
      ) : (
        <X className="h-4 w-4" />
      )}
      {isApprove ? "Aprovar" : "Rejeitar"}
    </Button>
  );
}

export function StatusActionForm({
  id,
  status,
  disabled
}: {
  id: string;
  status: BookingStatusOption;
  disabled: boolean;
}) {
  const [state, formAction] = useFormState(updateBookingStatus, {
    ok: false,
    message: ""
  });

  return (
    <form action={formAction} className="grid gap-2">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      {status === "rejected" ? (
        <Textarea
          name="rejectionReason"
          placeholder="Motivo da rejeicao"
          disabled={disabled}
          className="min-h-20 text-xs"
        />
      ) : null}
      <ActionButton status={status} disabled={disabled} />
      {state.message ? (
        <p className={state.ok ? "text-xs text-primary" : "text-xs text-red-600"}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

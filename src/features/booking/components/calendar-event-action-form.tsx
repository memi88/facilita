"use client";

import { CalendarPlus, Loader2 } from "lucide-react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { createCalendarEventForBooking } from "../actions";

function CalendarEventButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} variant="secondary" className="flex-1">
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <CalendarPlus className="h-4 w-4" />
      )}
      Criar evento
    </Button>
  );
}

export function CalendarEventActionForm({ id }: { id: string }) {
  const [state, formAction] = useFormState(createCalendarEventForBooking, {
    ok: false,
    message: ""
  });

  return (
    <form action={formAction} className="grid gap-2">
      <input type="hidden" name="id" value={id} />
      <CalendarEventButton />
      {state.message ? (
        <p className={state.ok ? "text-xs text-primary" : "text-xs text-red-600"}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

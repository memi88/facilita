"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "./button";
import type { BookingServiceType } from "@/features/booking/types";

export function CopyLink({
  value,
  serviceTypes = []
}: {
  value: string;
  serviceTypes?: BookingServiceType[];
}) {
  const [copied, setCopied] = useState(false);
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState(
    serviceTypes[0]?.id ?? ""
  );

  const copyValue = useMemo(() => {
    if (!selectedServiceTypeId) {
      return value;
    }

    const url = new URL(value);
    url.searchParams.set("serviceTypeId", selectedServiceTypeId);
    return url.toString();
  }, [selectedServiceTypeId, value]);

  async function copy() {
    await navigator.clipboard.writeText(copyValue);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="grid gap-3 rounded-2xl border border-border/80 bg-[rgba(37,99,235,0.04)] p-4">
      {serviceTypes.length ? (
        <label className="grid gap-2 text-sm font-medium text-foreground">
          Tipo de atendimento
          <select
            value={selectedServiceTypeId}
            onChange={(event) => setSelectedServiceTypeId(event.target.value)}
            className="min-h-11 rounded-xl border border-border bg-white px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
          >
            {serviceTypes.map((serviceType) => (
              <option key={serviceType.id} value={serviceType.id}>
                {serviceType.name} • {serviceType.duration_minutes} min
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <code className="break-all text-sm text-foreground">{copyValue}</code>
        <Button type="button" variant="secondary" onClick={copy} className="shrink-0">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copiado" : "Copiar"}
        </Button>
      </div>
    </div>
  );
}

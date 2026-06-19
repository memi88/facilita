"use client";

import { ChevronDown, PencilLine, Plus, Trash2 } from "lucide-react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import type { ServiceTypeRow } from "@/lib/supabase/types";
import { deleteServiceType, saveServiceType } from "../actions";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : label}
    </Button>
  );
}

function ServiceTypeEditor({
  serviceType,
  isCreate = false,
  returnTo
}: {
  serviceType?: ServiceTypeRow;
  isCreate?: boolean;
  returnTo: string;
}) {
  const [state, formAction] = useFormState(saveServiceType, {
    ok: false,
    message: ""
  });

  return (
    <div className="grid gap-4 rounded-[1.25rem] border border-border/80 bg-white p-4 shadow-soft">
      <form action={formAction} className="grid gap-4">
        <input type="hidden" name="returnTo" value={returnTo} />
        {serviceType ? <input type="hidden" name="id" value={serviceType.id} /> : null}
        <div className="grid gap-4 md:grid-cols-[1.2fr_0.6fr]">
          <Field label="Texto">
            <Input
              name="name"
              required
              defaultValue={serviceType?.name ?? ""}
              placeholder="Consulta inicial"
            />
          </Field>
          <Field label="Duração (min)">
            <Input
              name="durationMinutes"
              type="number"
              min={1}
              required
              defaultValue={serviceType?.duration_minutes ?? 60}
              placeholder="60"
            />
          </Field>
        </div>
        <Field label="Observação">
          <Textarea
            name="description"
            defaultValue={serviceType?.description ?? ""}
            placeholder="Contexto, escopo ou observação do atendimento."
          />
        </Field>
        <div className="flex flex-wrap items-center gap-3">
          <SubmitButton label={isCreate ? "Adicionar atendimento" : "Salvar atendimento"} />
        </div>
        {state?.message ? (
          <p className={state.ok ? "text-sm text-primary" : "text-sm text-red-700"}>
            {state.message}
          </p>
        ) : null}
      </form>

      {serviceType ? (
        <form action={deleteServiceType}>
          <input type="hidden" name="id" value={serviceType.id} />
          <input type="hidden" name="returnTo" value={returnTo} />
          <Button type="submit" variant="danger" className="gap-2">
            <Trash2 className="h-4 w-4" />
            Excluir
          </Button>
        </form>
      ) : null}
    </div>
  );
}

export function ServiceTypesManager({
  serviceTypes,
  returnTo = "/admin/perfil?tab=tipos"
}: {
  serviceTypes: ServiceTypeRow[];
  returnTo?: string;
}) {
  return (
    <section className="grid gap-4 rounded-[1.25rem] border border-border/80 bg-white p-5 shadow-soft">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Tipos de atendimento</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Cadastre um novo atendimento no topo e edite os existentes em cartões compactos.
        </p>
      </div>

      <div className="rounded-[1.25rem] border border-border/80 bg-[rgba(37,99,235,0.04)] p-4">
        <div className="mb-4 flex items-start gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Plus className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold">Novo atendimento</p>
            <p className="text-sm leading-6 text-muted-foreground">
              Crie um tipo por vez. Os itens salvos aparecem logo abaixo.
            </p>
          </div>
        </div>
        <ServiceTypeEditor isCreate returnTo={returnTo} />
      </div>

      <div className="grid gap-3">
        {serviceTypes.length ? (
          serviceTypes.map((serviceType) => (
            <details
              key={serviceType.id}
              className="group rounded-[1.25rem] border border-border/80 bg-white p-4 shadow-soft"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-base font-semibold tracking-tight">
                      {serviceType.name}
                    </h3>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {serviceType.duration_minutes} min
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {serviceType.description || "Sem observação cadastrada."}
                  </p>
                </div>
                <span className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-white text-muted-foreground transition group-open:rotate-180">
                  <ChevronDown className="h-4 w-4" />
                </span>
              </summary>

              <div className="mt-4 grid gap-4 border-t border-border/80 pt-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <PencilLine className="h-4 w-4" />
                  Editar atendimento
                </div>
                <ServiceTypeEditor serviceType={serviceType} returnTo={returnTo} />
              </div>
            </details>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-[rgba(37,99,235,0.04)] p-4 text-sm text-muted-foreground">
            Nenhum tipo de atendimento cadastrado ainda.
          </div>
        )}
      </div>
    </section>
  );
}

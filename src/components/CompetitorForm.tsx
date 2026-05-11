import { Plus, Save, X } from "lucide-react";
import { gradeOptions } from "../data/grades";
import type { Categoria, CompetitorDraft } from "../types";

interface CompetitorFormProps {
  draft: CompetitorDraft;
  category: Categoria | null;
  categoryReady: boolean;
  editing: boolean;
  onDraftChange: (draft: CompetitorDraft) => void;
  onSubmit: () => void;
  onCancelEdit: () => void;
  canSubmit: boolean;
}

export function CompetitorForm({
  draft,
  category,
  categoryReady,
  editing,
  onDraftChange,
  onSubmit,
  onCancelEdit,
  canSubmit,
}: CompetitorFormProps) {
  const update = (field: keyof CompetitorDraft, value: string) => {
    onDraftChange({ ...draft, [field]: value });
  };

  return (
    <section className="panel">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-ufko-blue">Paso 2</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">
            {editing ? "Editar competidor" : "Agregar competidor"}
          </h2>
        </div>
        {editing ? (
          <button type="button" className="btn-secondary" onClick={onCancelEdit}>
            <X size={18} aria-hidden="true" />
            Cancelar edición
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <label className="md:col-span-2">
          <span className="field-label">Nombre del competidor</span>
          <input
            className="field-input"
            type="text"
            value={draft.nombre}
            placeholder="Nombre y apellido"
            onChange={(event) => update("nombre", event.target.value)}
          />
        </label>

        <label>
          <span className="field-label">Edad</span>
          <input
            className="field-input"
            type="number"
            min={4}
            max={80}
            value={draft.edad}
            onChange={(event) => update("edad", event.target.value)}
          />
        </label>

        <label>
          <span className="field-label">Peso en kg</span>
          <input
            className="field-input"
            type="number"
            min={10}
            max={200}
            step={0.1}
            value={draft.peso}
            onChange={(event) => update("peso", event.target.value)}
          />
        </label>

        <label>
          <span className="field-label">Sexo</span>
          <select
            className="field-input"
            value={draft.sexo}
            onChange={(event) => update("sexo", event.target.value)}
          >
            <option value="">Seleccionar</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
          </select>
        </label>

        <label className="md:col-span-2">
          <span className="field-label">Grado / Kyu / Dan</span>
          <select
            className="field-input"
            value={draft.grado}
            onChange={(event) => update("grado", event.target.value)}
          >
            <option value="">Seleccionar grado</option>
            {gradeOptions.map((grade) => (
              <option key={grade.value} value={grade.value}>
                {grade.label}
              </option>
            ))}
          </select>
        </label>

        <div className="md:col-span-3">
          <span className="field-label">Categoría asignada</span>
          <div className="min-h-12 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3">
            {!categoryReady ? (
              <p className="text-sm font-medium text-slate-500">Complete sexo, edad, peso y grado.</p>
            ) : category ? (
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-bold text-slate-950">
                  {category.codigo} · {category.nombre}
                </p>
                {category.clasificatoria ? (
                  <span className="w-fit rounded-full bg-ufko-blue px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                    Clasificatoria
                  </span>
                ) : null}
              </div>
            ) : (
              <p className="text-sm font-bold text-red-700">
                No se encontró una categoría automática para estos datos. Revisar manualmente con la organización.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button type="button" className="btn-primary w-full sm:w-auto" onClick={onSubmit} disabled={!canSubmit}>
          {editing ? <Save size={18} aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />}
          {editing ? "Guardar edición" : "Agregar competidor"}
        </button>
      </div>
    </section>
  );
}

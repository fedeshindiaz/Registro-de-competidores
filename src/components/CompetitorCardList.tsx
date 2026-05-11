import { Edit3, Trash2 } from "lucide-react";
import type { Competidor } from "../types";
import { formatGrade, formatSexo } from "../utils/formatters";

interface CompetitorCardListProps {
  competitors: Competidor[];
  onEdit: (competitor: Competidor) => void;
  onDelete: (competitorId: string) => void;
}

export function CompetitorCardList({ competitors, onEdit, onDelete }: CompetitorCardListProps) {
  return (
    <div className="grid gap-3 lg:hidden">
      {competitors.map((competitor) => (
        <article key={competitor.competidorId} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-950">{competitor.nombre}</h3>
              <p className="mt-1 text-sm text-slate-600">
                {competitor.edad} años · {competitor.peso} kg · {formatSexo(competitor.sexo)}
              </p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-black text-ufko-blue">
              {competitor.categoriaCodigo}
            </span>
          </div>
          <dl className="mt-4 grid gap-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="font-bold text-slate-500">Grado</dt>
              <dd className="text-right text-slate-900">{formatGrade(competitor.grado)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="font-bold text-slate-500">Categoría</dt>
              <dd className="max-w-48 text-right font-semibold text-slate-900">{competitor.categoriaNombre}</dd>
            </div>
          </dl>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" className="btn-secondary px-3" onClick={() => onEdit(competitor)}>
              <Edit3 size={16} aria-hidden="true" />
              Editar
            </button>
            <button type="button" className="btn-danger px-3" onClick={() => onDelete(competitor.competidorId)}>
              <Trash2 size={16} aria-hidden="true" />
              Eliminar
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

import { Edit3, Trash2 } from "lucide-react";
import type { Competidor } from "../types";
import { formatGrade, formatSexo } from "../utils/formatters";

interface CompetitorTableProps {
  competitors: Competidor[];
  onEdit: (competitor: Competidor) => void;
  onDelete: (competitorId: string) => void;
}

export function CompetitorTable({ competitors, onEdit, onDelete }: CompetitorTableProps) {
  return (
    <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white lg:block">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-100 text-left text-xs font-black uppercase tracking-wide text-slate-600">
          <tr>
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3">Edad</th>
            <th className="px-4 py-3">Peso</th>
            <th className="px-4 py-3">Sexo</th>
            <th className="px-4 py-3">Grado</th>
            <th className="px-4 py-3">Código</th>
            <th className="px-4 py-3">Categoría</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {competitors.map((competitor) => (
            <tr key={competitor.competidorId} className="align-top">
              <td className="px-4 py-3 font-bold text-slate-950">{competitor.nombre}</td>
              <td className="px-4 py-3">{competitor.edad}</td>
              <td className="px-4 py-3">{competitor.peso} kg</td>
              <td className="px-4 py-3">{formatSexo(competitor.sexo)}</td>
              <td className="px-4 py-3">{formatGrade(competitor.grado)}</td>
              <td className="px-4 py-3 font-bold text-ufko-blue">{competitor.categoriaCodigo}</td>
              <td className="max-w-sm px-4 py-3">{competitor.categoriaNombre}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <button type="button" className="btn-secondary min-h-10 px-3 py-2" onClick={() => onEdit(competitor)}>
                    <Edit3 size={16} aria-hidden="true" />
                    Editar
                  </button>
                  <button type="button" className="btn-danger min-h-10 px-3 py-2" onClick={() => onDelete(competitor.competidorId)}>
                    <Trash2 size={16} aria-hidden="true" />
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

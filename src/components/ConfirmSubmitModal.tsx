import { AlertTriangle, Send, X } from "lucide-react";

interface ConfirmSubmitModalProps {
  open: boolean;
  competitorCount: number;
  sending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmSubmitModal({
  open,
  competitorCount,
  sending,
  onCancel,
  onConfirm,
}: ConfirmSubmitModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/55 p-3 sm:items-center sm:justify-center">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl sm:p-6" role="dialog" aria-modal="true">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-blue-50 p-3 text-ufko-blue">
            <AlertTriangle size={24} aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-black text-slate-950">Confirmar envío</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Se enviará la inscripción completa con {competitorCount} competidor
              {competitorCount === 1 ? "" : "es"} a Google Sheets. Luego se limpiará el borrador local.
            </p>
          </div>
          <button type="button" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" onClick={onCancel}>
            <X size={20} aria-label="Cerrar" />
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={sending}>
            Cancelar
          </button>
          <button type="button" className="btn-primary" onClick={onConfirm} disabled={sending}>
            <Send size={18} aria-hidden="true" />
            {sending ? "Enviando..." : "Enviar inscripción"}
          </button>
        </div>
      </div>
    </div>
  );
}

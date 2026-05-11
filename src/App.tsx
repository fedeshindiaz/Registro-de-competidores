import { Download, Eraser, Send, ShieldCheck, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CompetitorCardList } from "./components/CompetitorCardList";
import { CompetitorForm } from "./components/CompetitorForm";
import { CompetitorTable } from "./components/CompetitorTable";
import { ConfirmSubmitModal } from "./components/ConfirmSubmitModal";
import { DojoForm } from "./components/DojoForm";
import { getGradeOption } from "./data/grades";
import { submitInscription } from "./services/googleSheets";
import type { Competidor, CompetitorDraft, DojoData, Sexo } from "./types";
import { assignCategory } from "./utils/assignCategory";
import { competitorsToCsv, groupByCategory } from "./utils/formatters";

const DOJO_STORAGE_KEY = "ufko_dojo_data";
const COMPETITORS_STORAGE_KEY = "ufko_competitors_draft";
const permitirCategoriaSinConfirmar = false;

const emptyDojoData: DojoData = {
  dojo: "",
  organizacion: "",
  departamento: "",
  encargadoDojo: "",
};

const emptyDraft: CompetitorDraft = {
  nombre: "",
  edad: "",
  peso: "",
  sexo: "",
  grado: "",
};

function isValidDojo(data: DojoData) {
  return Boolean(
    data.dojo.trim() &&
      data.organizacion.trim() &&
      data.departamento.trim() &&
      data.encargadoDojo.trim(),
  );
}

function isReasonableDraft(draft: CompetitorDraft) {
  const edad = Number(draft.edad);
  const peso = Number(draft.peso);

  return (
    draft.nombre.trim().length > 0 &&
    Number.isFinite(edad) &&
    edad >= 4 &&
    edad <= 80 &&
    Number.isFinite(peso) &&
    peso >= 10 &&
    peso <= 200 &&
    (draft.sexo === "M" || draft.sexo === "F") &&
    Boolean(getGradeOption(draft.grado))
  );
}

function createCompetitorFromDraft(
  draft: CompetitorDraft,
  existingId?: string,
  existingDate?: string,
): Competidor | null {
  const grade = getGradeOption(draft.grado);
  const edad = Number(draft.edad);
  const peso = Number(draft.peso);

  if (!grade || !isReasonableDraft(draft) || (draft.sexo !== "M" && draft.sexo !== "F")) {
    return null;
  }

  const assigned = assignCategory({
    sexo: draft.sexo,
    edad,
    peso,
    gradoValor: grade.numericValue,
  });

  if (!assigned && !permitirCategoriaSinConfirmar) {
    return null;
  }

  return {
    competidorId: existingId ?? crypto.randomUUID(),
    nombre: draft.nombre.trim(),
    edad,
    peso,
    sexo: draft.sexo,
    grado: grade.value,
    gradoValor: grade.numericValue,
    categoriaCodigo: assigned?.codigo ?? "SIN-CATEGORIA",
    categoriaNombre: assigned?.nombre ?? "Sin categoría confirmada",
    estado: "Borrador",
    fechaCarga: existingDate ?? new Date().toISOString(),
  };
}

function draftFromCompetitor(competitor: Competidor): CompetitorDraft {
  return {
    nombre: competitor.nombre,
    edad: String(competitor.edad),
    peso: String(competitor.peso),
    sexo: competitor.sexo,
    grado: competitor.grado,
  };
}

function sameCompetitorSignature(a: Competidor, b: Competidor) {
  return (
    a.nombre.trim().toLocaleLowerCase("es") === b.nombre.trim().toLocaleLowerCase("es") &&
    a.edad === b.edad &&
    a.peso === b.peso &&
    a.sexo === b.sexo &&
    a.grado === b.grado
  );
}

export default function App() {
  const [dojoData, setDojoData] = useState<DojoData>(emptyDojoData);
  const [draft, setDraft] = useState<CompetitorDraft>(emptyDraft);
  const [competitors, setCompetitors] = useState<Competidor[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const savedDojo = localStorage.getItem(DOJO_STORAGE_KEY);
    const savedCompetitors = localStorage.getItem(COMPETITORS_STORAGE_KEY);
    let restored = false;

    if (savedDojo) {
      setDojoData(JSON.parse(savedDojo) as DojoData);
      restored = true;
    }

    if (savedCompetitors) {
      setCompetitors(JSON.parse(savedCompetitors) as Competidor[]);
      restored = true;
    }

    if (restored) {
      setToast({ type: "info", message: "Se recuperó una inscripción en borrador." });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(DOJO_STORAGE_KEY, JSON.stringify(dojoData));
  }, [dojoData]);

  useEffect(() => {
    localStorage.setItem(COMPETITORS_STORAGE_KEY, JSON.stringify(competitors));
  }, [competitors]);

  const grade = getGradeOption(draft.grado);
  const parsedEdad = Number(draft.edad);
  const parsedPeso = Number(draft.peso);
  const categoryReady =
    (draft.sexo === "M" || draft.sexo === "F") &&
    Number.isFinite(parsedEdad) &&
    parsedEdad > 0 &&
    Number.isFinite(parsedPeso) &&
    parsedPeso > 0 &&
    Boolean(grade);

  const liveCategory = categoryReady
    ? assignCategory({
        sexo: draft.sexo as Sexo,
        edad: parsedEdad,
        peso: parsedPeso,
        gradoValor: grade!.numericValue,
      })?.categoriaCompleta ?? null
    : null;

  const canSaveCompetitor = isReasonableDraft(draft) && Boolean(liveCategory);

  const filteredCompetitors = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("es");
    if (!normalized) {
      return competitors;
    }

    return competitors.filter((competitor) =>
      [competitor.nombre, competitor.categoriaCodigo, competitor.categoriaNombre]
        .join(" ")
        .toLocaleLowerCase("es")
        .includes(normalized),
    );
  }, [competitors, query]);

  const categorySummary = useMemo(() => groupByCategory(competitors), [competitors]);

  const addOrUpdateCompetitor = () => {
    const existing = competitors.find((competitor) => competitor.competidorId === editingId);
    const newCompetitor = createCompetitorFromDraft(draft, existing?.competidorId, existing?.fechaCarga);

    if (!newCompetitor) {
      setToast({ type: "error", message: "Revise los datos del competidor y la categoría asignada." });
      return;
    }

    const duplicate = competitors.some(
      (competitor) => competitor.competidorId !== newCompetitor.competidorId && sameCompetitorSignature(competitor, newCompetitor),
    );

    if (duplicate && !window.confirm("Ya existe un competidor con los mismos datos. ¿Desea cargarlo igualmente?")) {
      return;
    }

    if (editingId) {
      setCompetitors((current) =>
        current.map((competitor) => (competitor.competidorId === editingId ? newCompetitor : competitor)),
      );
      setToast({ type: "success", message: "Competidor actualizado correctamente." });
    } else {
      setCompetitors((current) => [...current, newCompetitor]);
      setToast({ type: "success", message: "Competidor agregado al borrador." });
    }

    setDraft(emptyDraft);
    setEditingId(null);
  };

  const editCompetitor = (competitor: Competidor) => {
    setEditingId(competitor.competidorId);
    setDraft(draftFromCompetitor(competitor));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteCompetitor = (competitorId: string) => {
    const competitor = competitors.find((item) => item.competidorId === competitorId);
    if (!competitor || !window.confirm(`¿Eliminar a ${competitor.nombre} del borrador?`)) {
      return;
    }

    setCompetitors((current) => current.filter((item) => item.competidorId !== competitorId));
    if (editingId === competitorId) {
      setEditingId(null);
      setDraft(emptyDraft);
    }
  };

  const clearDraft = () => {
    if (!window.confirm("¿Limpiar toda la inscripción en borrador?")) {
      return;
    }

    setDojoData(emptyDojoData);
    setCompetitors([]);
    setDraft(emptyDraft);
    setEditingId(null);
    setSent(false);
    localStorage.removeItem(DOJO_STORAGE_KEY);
    localStorage.removeItem(COMPETITORS_STORAGE_KEY);
    setToast({ type: "info", message: "Inscripción limpiada." });
  };

  const openSubmitModal = () => {
    if (!isValidDojo(dojoData)) {
      setToast({ type: "error", message: "Complete todos los datos del dojo antes de enviar." });
      return;
    }

    if (competitors.length === 0) {
      setToast({ type: "error", message: "Agregue al menos un competidor antes de enviar." });
      return;
    }

    setConfirmOpen(true);
  };

  const sendInscription = async () => {
    setSending(true);
    const result = await submitInscription(dojoData, competitors);
    setSending(false);

    if (!result.ok) {
      setToast({ type: "error", message: result.message });
      return;
    }

    localStorage.removeItem(DOJO_STORAGE_KEY);
    localStorage.removeItem(COMPETITORS_STORAGE_KEY);
    setCompetitors([]);
    setDojoData(emptyDojoData);
    setDraft(emptyDraft);
    setEditingId(null);
    setConfirmOpen(false);
    setSent(true);
    setToast({ type: "success", message: result.message });
  };

  const exportCsv = () => {
    const csv = competitorsToCsv(competitors);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "encuentro-kyokushin-uruguay.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-ufko-pale">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-ufko-blue p-3 text-white shadow-lg">
              <Trophy size={30} aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-950 sm:text-3xl">Encuentro Kyokushin Uruguay</h1>
              <p className="mt-1 text-base font-medium text-slate-600">Carga de competidores por dojo</p>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-sm font-bold text-slate-500">Competidores cargados</p>
            <p className="text-3xl font-black text-ufko-blue">{competitors.length}</p>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:py-8">
        {toast ? (
          <div
            className={`rounded-xl border px-4 py-3 text-sm font-bold ${
              toast.type === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : toast.type === "success"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-blue-200 bg-blue-50 text-ufko-blue"
            }`}
          >
            {toast.message}
          </div>
        ) : null}

        {sent ? (
          <section className="rounded-2xl border border-green-200 bg-green-50 p-5 text-green-800 shadow-soft">
            <div className="flex items-center gap-3">
              <ShieldCheck size={28} aria-hidden="true" />
              <div>
                <h2 className="text-xl font-black">Inscripción enviada correctamente</h2>
                <p className="mt-1 text-sm font-medium">El borrador local fue limpiado y la organización ya puede revisar la hoja.</p>
              </div>
            </div>
          </section>
        ) : null}

        <DojoForm value={dojoData} onChange={setDojoData} />

        <CompetitorForm
          draft={draft}
          category={liveCategory}
          categoryReady={categoryReady}
          editing={Boolean(editingId)}
          onDraftChange={setDraft}
          onSubmit={addOrUpdateCompetitor}
          onCancelEdit={() => {
            setEditingId(null);
            setDraft(emptyDraft);
          }}
          canSubmit={canSaveCompetitor}
        />

        <section className="panel">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-ufko-blue">Paso 3</p>
              <h2 className="mt-1 text-xl font-black text-slate-950">Competidores cargados</h2>
            </div>
            <label className="w-full md:max-w-xs">
              <span className="field-label">Buscar</span>
              <input
                className="field-input"
                type="search"
                placeholder="Nombre, código o categoría"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
          </div>

          {competitors.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
              <p className="font-bold text-slate-700">Todavía no hay competidores cargados.</p>
              <p className="mt-1 text-sm text-slate-500">Agregue el primero desde el formulario superior.</p>
            </div>
          ) : (
            <>
              <CompetitorTable competitors={filteredCompetitors} onEdit={editCompetitor} onDelete={deleteCompetitor} />
              <CompetitorCardList competitors={filteredCompetitors} onEdit={editCompetitor} onDelete={deleteCompetitor} />
            </>
          )}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="panel">
            <h2 className="text-xl font-black text-slate-950">Resumen por categoría</h2>
            {Object.keys(categorySummary).length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">El resumen aparecerá cuando cargue competidores.</p>
            ) : (
              <div className="mt-4 flex flex-wrap gap-2">
                {Object.entries(categorySummary).map(([codigo, summary]) => (
                  <span key={codigo} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700">
                    {codigo}: {summary.cantidad} · {summary.nombre}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="panel min-w-full lg:min-w-80">
            <div className="grid gap-3">
              <button type="button" className="btn-primary w-full" onClick={openSubmitModal} disabled={sending}>
                <Send size={18} aria-hidden="true" />
                Enviar inscripción
              </button>
              <button type="button" className="btn-secondary w-full" onClick={exportCsv} disabled={competitors.length === 0}>
                <Download size={18} aria-hidden="true" />
                Exportar CSV
              </button>
              <button type="button" className="btn-secondary w-full" onClick={clearDraft}>
                <Eraser size={18} aria-hidden="true" />
                Limpiar inscripción
              </button>
            </div>
          </div>
        </section>
      </div>

      <ConfirmSubmitModal
        open={confirmOpen}
        competitorCount={competitors.length}
        sending={sending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={sendInscription}
      />
    </main>
  );
}

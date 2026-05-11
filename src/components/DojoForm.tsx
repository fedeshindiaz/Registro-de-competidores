import type { DojoData } from "../types";

interface DojoFormProps {
  value: DojoData;
  onChange: (data: DojoData) => void;
}

const fields: Array<{ name: keyof DojoData; label: string; placeholder: string }> = [
  { name: "dojo", label: "Dojo", placeholder: "Ej. Dojo Central" },
  { name: "organizacion", label: "Organización", placeholder: "Ej. UFKO" },
  { name: "departamento", label: "Departamento", placeholder: "Ej. Montevideo" },
  { name: "encargadoDojo", label: "Encargado del dojo", placeholder: "Nombre del instructor" },
];

export function DojoForm({ value, onChange }: DojoFormProps) {
  return (
    <section className="panel">
      <div className="mb-5">
        <p className="text-sm font-bold uppercase tracking-wide text-ufko-blue">Paso 1</p>
        <h2 className="mt-1 text-xl font-black text-slate-950">Datos del dojo</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <label key={field.name}>
            <span className="field-label">{field.label}</span>
            <input
              className="field-input"
              required
              type="text"
              placeholder={field.placeholder}
              value={value[field.name]}
              onChange={(event) => onChange({ ...value, [field.name]: event.target.value })}
            />
          </label>
        ))}
      </div>
    </section>
  );
}

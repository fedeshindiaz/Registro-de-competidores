import { getGradeOption } from "../data/grades";
import type { Competidor, Sexo } from "../types";

export function formatSexo(sexo: Sexo) {
  return sexo === "M" ? "Masculino" : "Femenino";
}

export function formatGrade(value: string) {
  return getGradeOption(value)?.label ?? value;
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-UY", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function groupByCategory(competitors: Competidor[]) {
  return competitors.reduce<Record<string, { nombre: string; cantidad: number }>>((acc, competitor) => {
    const key = competitor.categoriaCodigo;
    acc[key] = acc[key] ?? { nombre: competitor.categoriaNombre, cantidad: 0 };
    acc[key].cantidad += 1;
    return acc;
  }, {});
}

export function competitorsToCsv(competitors: Competidor[]) {
  const headers = [
    "Nombre",
    "Edad",
    "Peso",
    "Sexo",
    "Grado",
    "Valor grado",
    "Código categoría",
    "Categoría asignada",
    "Estado",
    "Fecha carga",
  ];

  const rows = competitors.map((competitor) => [
    competitor.nombre,
    competitor.edad,
    competitor.peso,
    formatSexo(competitor.sexo),
    formatGrade(competitor.grado),
    competitor.gradoValor,
    competitor.categoriaCodigo,
    competitor.categoriaNombre,
    competitor.estado,
    competitor.fechaCarga,
  ]);

  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

import { categories } from "../data/categories";
import type { Categoria, CategoryAssignment, Sexo } from "../types";

interface AssignCategoryInput {
  sexo: Sexo;
  edad: number;
  peso: number;
  gradoValor: number;
}

const OPEN_RANGE_SCORE = 9999;

function inNullableRange(value: number, min: number | null, max: number | null) {
  return (min === null || value >= min) && (max === null || value <= max);
}

function gradeMatches(value: number, min: number | null, max: number | null) {
  if (min === null && max === null) {
    return true;
  }

  if (min === null || max === null) {
    return inNullableRange(value, min, max);
  }

  const lower = Math.min(min, max);
  const upper = Math.max(min, max);
  return value >= lower && value <= upper;
}

function rangeSize(min: number | null, max: number | null) {
  if (min === null || max === null) {
    return OPEN_RANGE_SCORE;
  }

  return Math.abs(max - min);
}

function specificityScore(category: Categoria) {
  return [
    rangeSize(category.edadMin, category.edadMax),
    rangeSize(category.pesoMin, category.pesoMax),
    rangeSize(category.gradoMin, category.gradoMax),
  ];
}

export function assignCategory({
  sexo,
  edad,
  peso,
  gradoValor,
}: AssignCategoryInput): CategoryAssignment | null {
  const matches = categories.filter((category) => {
    const sexMatches = category.sexo === sexo || category.sexo === "MIXTO";

    return (
      sexMatches &&
      inNullableRange(edad, category.edadMin, category.edadMax) &&
      inNullableRange(peso, category.pesoMin, category.pesoMax) &&
      gradeMatches(gradoValor, category.gradoMin, category.gradoMax)
    );
  });

  if (matches.length === 0) {
    return null;
  }

  const [best] = matches.sort((a, b) => {
    const scoreA = specificityScore(a);
    const scoreB = specificityScore(b);

    return scoreA[0] - scoreB[0] || scoreA[1] - scoreB[1] || scoreA[2] - scoreB[2];
  });

  return {
    codigo: best.codigo,
    nombre: best.nombre,
    categoriaCompleta: best,
  };
}

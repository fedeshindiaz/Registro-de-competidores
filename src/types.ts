export type Sexo = "M" | "F";
export type EstadoCompetidor = "Borrador" | "Enviado";
export type Modalidad = "Kumite" | "Kata individual" | "Kata tríos";

export interface DojoData {
  dojo: string;
  organizacion: string;
  departamento: string;
  encargadoDojo: string;
}

export interface GradeOption {
  label: string;
  value: string;
  numericValue: number;
}

export interface CompetitorDraft {
  nombre: string;
  edad: string;
  peso: string;
  sexo: "" | Sexo;
  grado: string;
}

export interface Competidor {
  competidorId: string;
  nombre: string;
  edad: number;
  peso: number;
  sexo: Sexo;
  grado: string;
  gradoValor: number;
  categoriaCodigo: string;
  categoriaNombre: string;
  estado: EstadoCompetidor;
  fechaCarga: string;
}

export interface Categoria {
  codigo: string;
  modalidad: Modalidad;
  sexo: Sexo | "MIXTO";
  edadMin: number | null;
  edadMax: number | null;
  pesoMin: number | null;
  pesoMax: number | null;
  gradoMin: number | null;
  gradoMax: number | null;
  gradoDescripcion: string;
  nombre: string;
  clasificatoria: boolean;
  observaciones: string;
}

export interface CategoryAssignment {
  codigo: string;
  nombre: string;
  categoriaCompleta: Categoria;
}

export interface SubmitPayload extends DojoData {
  fechaEnvio: string;
  competidores: Array<Omit<Competidor, "estado" | "fechaCarga"> & { estado: "Enviado" }>;
}

import type { Competidor, DojoData, SubmitPayload } from "../types";

interface SubmitResponse {
  ok: boolean;
  message: string;
}

export async function submitInscription(
  dojoData: DojoData,
  competitors: Competidor[],
): Promise<SubmitResponse> {
  const endpoint = import.meta.env.VITE_GOOGLE_SCRIPT_URL as string | undefined;

  if (!endpoint) {
    return {
      ok: false,
      message: "No está configurada la variable VITE_GOOGLE_SCRIPT_URL.",
    };
  }

  const payload: SubmitPayload = {
    ...dojoData,
    fechaEnvio: new Date().toISOString(),
    competidores: competitors.map(({ estado: _estado, fechaCarga: _fechaCarga, ...competitor }) => ({
      ...competitor,
      estado: "Enviado",
    })),
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  let data: SubmitResponse;

  try {
    data = JSON.parse(text) as SubmitResponse;
  } catch {
    data = {
      ok: response.ok,
      message: response.ok ? "Inscripción enviada correctamente" : text,
    };
  }

  if (!response.ok || !data.ok) {
    return {
      ok: false,
      message: data.message || "No se pudo enviar la inscripción.",
    };
  }

  return data;
}

/**
 * Contexto de audio compartido; debe reactivarse tras un gesto del usuario (p. ej. login).
 */
let contexto: AudioContext | null = null;

export function obtenerContextoAudio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!contexto) {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    contexto = new Ctx();
  }
  return contexto;
}

/** Llamar tras interacción explícita (submit de login, clic). */
export async function desbloquearAudioUsuario(): Promise<void> {
  const ctx = obtenerContextoAudio();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    await ctx.resume();
  }
}

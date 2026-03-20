import {
  desbloquearAudioUsuario,
  obtenerContextoAudio,
} from "@/lib/audioContextoUsuario";

/** Tono corto de alerta (sin archivos externos). */
export async function reproducirTonoAlertaCritica(
  frecuenciaHz = 880,
  duracionMs = 180
): Promise<void> {
  await desbloquearAudioUsuario();
  const ctx = obtenerContextoAudio();
  if (!ctx || ctx.state !== "running") return;

  const osc = ctx.createOscillator();
  const ganancia = ctx.createGain();
  osc.type = "square";
  osc.frequency.value = frecuenciaHz;
  const t0 = ctx.currentTime;
  const t1 = t0 + duracionMs / 1000;
  ganancia.gain.setValueAtTime(0.12, t0);
  ganancia.gain.exponentialRampToValueAtTime(0.001, t1);
  osc.connect(ganancia);
  ganancia.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t1);
}

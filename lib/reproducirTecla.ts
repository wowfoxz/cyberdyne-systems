const SRC_PULSACION = "./pulsacion-tecla.mp3";

/** Clic de tecla. Cada llamada usa su propio audio para que se puedan superponer. */
export function reproducirPulsacionTecla(): void {
  if (typeof window === "undefined") return;
  const audio = new Audio(SRC_PULSACION);
  audio.volume = 0.7;
  void audio.play().catch(() => {
    // El navegador puede bloquear el audio antes del primer gesto.
  });
}

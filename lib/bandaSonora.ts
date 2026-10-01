const SRC = {
  tema: "./audio/tema-t2.mp3",
  estatica: "./audio/estatica.wav",
  bateria: "./audio/bateria.wav",
  alarmaPlano: "./audio/alarma-plano.wav",
  ciborg: "./audio/ciborg.wav",
  escaner: "./audio/escaner.mp3",
  alarmaNuclear: "./audio/alarma-nuclear.mp3",
  explosion: "./audio/explosion.mp3",
} as const;

type OyenteCrt = () => void;

let tema: HTMLAudioElement | null = null;
let estatica: HTMLAudioElement | null = null;
let bateria: HTMLAudioElement | null = null;
let alarmaPlano: HTMLAudioElement | null = null;
let ciborg: HTMLAudioElement | null = null;
let escaner: HTMLAudioElement | null = null;
let alarmaNuclear: HTMLAudioElement | null = null;
let explosion: HTMLAudioElement | null = null;
let secuenciaNuclear: "espera" | "alarma" | "explosion" = "espera";
let alarmaNuclearCancelada = false;
const oyentesCrt: OyenteCrt[] = [];

function crear(src: string, loop: boolean, volumen: number): HTMLAudioElement {
  const audio = new Audio(src);
  audio.loop = loop;
  audio.volume = volumen;
  return audio;
}

function parar(audio: HTMLAudioElement | null): null {
  if (!audio) return null;
  audio.pause();
  audio.currentTime = 0;
  return null;
}

function reproducir(audio: HTMLAudioElement) {
  void audio.play().catch(() => {
    // El navegador puede bloquear el audio hasta el primer gesto.
  });
}

/** Tema del arranque y del login. Se puede reintentar tras un clic o tecla. */
export function iniciarTemaIngreso() {
  if (typeof window === "undefined") return;
  if (!tema) tema = crear(SRC.tema, true, 0.9);
  if (tema.paused) reproducir(tema);
}

export function detenerTemaIngreso() {
  tema = parar(tema);
}

/** Estática más la batería de fondo al 40 %. */
export function iniciarAmbiente() {
  if (typeof window === "undefined") return;
  if (!estatica) estatica = crear(SRC.estatica, true, 1);
  if (!bateria) bateria = crear(SRC.bateria, true, 0.4);
  if (estatica.paused) reproducir(estatica);
  if (bateria.paused) reproducir(bateria);
}

export function detenerAmbiente() {
  estatica = parar(estatica);
  bateria = parar(bateria);
}

/** Alarma del plano: una sola vez. Si la ventana se cierra, se corta. */
export function reproducirAlarmaPlano() {
  if (typeof window === "undefined") return;
  alarmaPlano = parar(alarmaPlano);
  alarmaPlano = crear(SRC.alarmaPlano, false, 1);
  reproducir(alarmaPlano);
}

export function detenerAlarmaPlano() {
  alarmaPlano = parar(alarmaPlano);
}

/** Ciborg mientras la animación 3D está abierta. */
export function iniciarSonidoCiborg() {
  if (typeof window === "undefined") return;
  if (!ciborg) ciborg = crear(SRC.ciborg, true, 0.9);
  if (ciborg.paused) reproducir(ciborg);
}

export function detenerSonidoCiborg() {
  ciborg = parar(ciborg);
}

/** Escáner del mapa hasta que se lanza la simulación. */
export function iniciarEscanerNuclear() {
  if (typeof window === "undefined") return;
  secuenciaNuclear = "espera";
  alarmaNuclearCancelada = false;
  if (!escaner) escaner = crear(SRC.escaner, true, 0.85);
  if (escaner.paused) reproducir(escaner);
}

export function detenerEscanerNuclear() {
  escaner = parar(escaner);
}

/**
 * Al pulsar Y: corta el escáner y reproduce la alarma una vez.
 * Al terminar, si la ventana sigue abierta, el callback dispara la explosión.
 */
export function lanzarAlarmaNuclear(alTerminar: () => void) {
  if (typeof window === "undefined") return;
  if (secuenciaNuclear !== "espera") return;
  secuenciaNuclear = "alarma";
  alarmaNuclearCancelada = false;
  detenerEscanerNuclear();
  alarmaNuclear = parar(alarmaNuclear);
  alarmaNuclear = crear(SRC.alarmaNuclear, false, 1);
  alarmaNuclear.addEventListener(
    "ended",
    () => {
      if (alarmaNuclearCancelada) return;
      secuenciaNuclear = "explosion";
      alTerminar();
    },
    { once: true }
  );
  reproducir(alarmaNuclear);
}

export function cancelarAlarmaNuclear() {
  alarmaNuclearCancelada = true;
  secuenciaNuclear = "espera";
  alarmaNuclear = parar(alarmaNuclear);
  detenerEscanerNuclear();
}

export function reproducirExplosionNuclear() {
  if (typeof window === "undefined") return;
  explosion = parar(explosion);
  explosion = crear(SRC.explosion, false, 1);
  reproducir(explosion);
}

export function suscribirApagadoCrt(oyente: OyenteCrt) {
  oyentesCrt.push(oyente);
  return () => {
    const indice = oyentesCrt.indexOf(oyente);
    if (indice >= 0) oyentesCrt.splice(indice, 1);
  };
}

export function iniciarApagadoCrt() {
  detenerTemaIngreso();
  detenerAmbiente();
  detenerAlarmaPlano();
  detenerSonidoCiborg();
  detenerEscanerNuclear();
  alarmaNuclearCancelada = true;
  alarmaNuclear = parar(alarmaNuclear);
  oyentesCrt.forEach((oyente) => oyente());
}

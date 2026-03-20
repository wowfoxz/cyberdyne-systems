/** Clave de persistencia para preferencias del HUD en localStorage. */
export const CLAVE_STORAGE_HUD = "cyberdyne_hud_config";

/** Máximo de eventos en el historial (ring buffer lógico). */
export const MAX_EVENTOS_CRITICOS = 100;

/** Configuración del HUD personalizable por el usuario. */
export interface ConfiguracionHud {
  /** Color principal (texto, bordes retro, taskbar). */
  colorPrimario: string;
  /** Color de alertas críticas. */
  colorAlerta: string;
  /** Color de fondo base. */
  colorFondo: string;
  /** Reproducir tono al dispararse evento crítico. */
  alertasSonido: boolean;
  /** Mostrar overlay y resaltados visuales globales. */
  alertasVisuales: boolean;
  /** Umbral de CPU (0–100) para considerar crítico en el monitor. */
  umbralCpuCritico: number;
  /** Umbral de memoria (0–100). */
  umbralMemoriaCritico: number;
}

export const configuracionHudPorDefecto: ConfiguracionHud = {
  colorPrimario: "#00FF00",
  colorAlerta: "#ff0000",
  colorFondo: "#000000",
  alertasSonido: true,
  alertasVisuales: true,
  umbralCpuCritico: 85,
  umbralMemoriaCritico: 90,
};

/** Evento crítico registrado en el historial. */
export interface EventoCritico {
  id: string;
  marcaTiempo: number;
  tipo: string;
  mensaje: string;
  origen: string;
}

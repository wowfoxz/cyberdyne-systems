"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  CLAVE_STORAGE_HUD,
  MAX_EVENTOS_CRITICOS,
  configuracionHudPorDefecto,
  type ConfiguracionHud,
  type EventoCritico,
} from "@/config/hudConfig";
import { reproducirTonoAlertaCritica } from "@/lib/reproducirAlertaSonora";

export interface PayloadEventoCritico {
  tipo: string;
  mensaje: string;
  origen: string;
}

interface ValorContextoHud {
  configuracion: ConfiguracionHud;
  actualizarConfiguracion: (parcial: Partial<ConfiguracionHud>) => void;
  eventos: EventoCritico[];
  limpiarHistorialEventos: () => void;
  emitirEventoCritico: (payload: PayloadEventoCritico) => void;
  /** Overlay global visible (alerta visual). */
  overlayAlertaVisible: boolean;
  descartarOverlayAlerta: () => void;
}

const ContextoHud = createContext<ValorContextoHud | null>(null);

function cargarConfiguracionDesdeStorage(): ConfiguracionHud {
  if (typeof window === "undefined") return { ...configuracionHudPorDefecto };
  try {
    const raw = localStorage.getItem(CLAVE_STORAGE_HUD);
    if (!raw) return { ...configuracionHudPorDefecto };
    const parsed = JSON.parse(raw) as Partial<ConfiguracionHud>;
    return { ...configuracionHudPorDefecto, ...parsed };
  } catch {
    return { ...configuracionHudPorDefecto };
  }
}

function guardarConfiguracionEnStorage(cfg: ConfiguracionHud) {
  try {
    localStorage.setItem(CLAVE_STORAGE_HUD, JSON.stringify(cfg));
  } catch {
    /* ignorar cuota o modo privado */
  }
}

function aplicarVariablesCss(cfg: ConfiguracionHud) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--hud-primary", cfg.colorPrimario);
  root.style.setProperty("--hud-alert", cfg.colorAlerta);
  root.style.setProperty("--hud-bg", cfg.colorFondo);
  /* Scrollbar thumb coherente con primario */
  root.style.setProperty("--hud-scrollbar-thumb", cfg.colorPrimario);
}

function generarIdEvento(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function HudAlertProvider({ children }: { children: ReactNode }) {
  const [configuracion, setConfiguracion] = useState<ConfiguracionHud>(
    configuracionHudPorDefecto
  );
  const [eventos, setEventos] = useState<EventoCritico[]>([]);
  const [overlayAlertaVisible, setOverlayAlertaVisible] = useState(false);
  const timeoutOverlayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const configuracionRef = useRef(configuracion);
  configuracionRef.current = configuracion;

  // Hidratar desde localStorage solo en cliente
  useEffect(() => {
    const cfg = cargarConfiguracionDesdeStorage();
    setConfiguracion(cfg);
    aplicarVariablesCss(cfg);
  }, []);

  const actualizarConfiguracion = useCallback((parcial: Partial<ConfiguracionHud>) => {
    setConfiguracion((prev) => {
      const next = { ...prev, ...parcial };
      guardarConfiguracionEnStorage(next);
      aplicarVariablesCss(next);
      return next;
    });
  }, []);

  const descartarOverlayAlerta = useCallback(() => {
    if (timeoutOverlayRef.current) {
      clearTimeout(timeoutOverlayRef.current);
      timeoutOverlayRef.current = null;
    }
    setOverlayAlertaVisible(false);
  }, []);

  const limpiarHistorialEventos = useCallback(() => {
    setEventos([]);
  }, []);

  const emitirEventoCritico = useCallback((payload: PayloadEventoCritico) => {
    const cfgActual = configuracionRef.current;
    const nuevo: EventoCritico = {
      id: generarIdEvento(),
      marcaTiempo: Date.now(),
      tipo: payload.tipo,
      mensaje: payload.mensaje,
      origen: payload.origen,
    };
    setEventos((prev) => {
      const siguiente = [nuevo, ...prev];
      return siguiente.slice(0, MAX_EVENTOS_CRITICOS);
    });
    if (cfgActual.alertasSonido) {
      void reproducirTonoAlertaCritica();
    }
    if (cfgActual.alertasVisuales) {
      if (timeoutOverlayRef.current) clearTimeout(timeoutOverlayRef.current);
      setOverlayAlertaVisible(true);
      timeoutOverlayRef.current = setTimeout(() => {
        setOverlayAlertaVisible(false);
        timeoutOverlayRef.current = null;
      }, 8000);
    }
  }, []);

  const valor = useMemo<ValorContextoHud>(
    () => ({
      configuracion,
      actualizarConfiguracion,
      eventos,
      limpiarHistorialEventos,
      emitirEventoCritico,
      overlayAlertaVisible,
      descartarOverlayAlerta,
    }),
    [
      configuracion,
      actualizarConfiguracion,
      eventos,
      limpiarHistorialEventos,
      emitirEventoCritico,
      overlayAlertaVisible,
      descartarOverlayAlerta,
    ]
  );

  return <ContextoHud.Provider value={valor}>{children}</ContextoHud.Provider>;
}

export function useHudAlert(): ValorContextoHud {
  const ctx = useContext(ContextoHud);
  if (!ctx) {
    throw new Error("useHudAlert debe usarse dentro de HudAlertProvider");
  }
  return ctx;
}

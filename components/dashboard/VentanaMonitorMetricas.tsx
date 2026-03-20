"use client";

import { useEffect, useRef, useState } from "react";
import DraggableResizableWindow from "@/components/DraggableResizableWindow";
import { useHudAlert } from "@/context/HudAlertProvider";

interface VentanaMonitorMetricasProps {
  onClose: () => void;
  minimized: boolean;
  onToggleMinimize: () => void;
  onFocus: () => void;
  zIndex: number;
  title?: string;
}

interface MetricasSimuladas {
  cpu: number;
  memoria: number;
  latenciaMs: number;
}

function generarMetricasSimuladas(): MetricasSimuladas {
  return {
    cpu: Math.min(100, Math.max(0, 40 + Math.random() * 55)),
    memoria: Math.min(100, Math.max(0, 35 + Math.random() * 50)),
    latenciaMs: Math.round(20 + Math.random() * 120),
  };
}

export default function VentanaMonitorMetricas({
  onClose,
  minimized,
  onToggleMinimize,
  onFocus,
  zIndex,
  title = "MONITOR DE MÉTRICAS",
}: VentanaMonitorMetricasProps) {
  const { configuracion, emitirEventoCritico } = useHudAlert();
  const [metricas, setMetricas] = useState<MetricasSimuladas>(
    generarMetricasSimuladas
  );
  /** Solo disparamos al entrar en estado crítico (evita spam por tick). */
  const estabaEnCriticoRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      setMetricas(generarMetricasSimuladas());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const cpuCrit = metricas.cpu >= configuracion.umbralCpuCritico;
    const memCrit = metricas.memoria >= configuracion.umbralMemoriaCritico;
    const criticoAhora = cpuCrit || memCrit;
    if (criticoAhora && !estabaEnCriticoRef.current) {
      emitirEventoCritico({
        tipo: "UMBRAL_METRICA",
        mensaje: `CPU ${metricas.cpu.toFixed(0)}% / MEM ${metricas.memoria.toFixed(0)}% (umbrales ${configuracion.umbralCpuCritico}/${configuracion.umbralMemoriaCritico})`,
        origen: "Monitor de métricas",
      });
    }
    estabaEnCriticoRef.current = criticoAhora;
  }, [metricas, configuracion, emitirEventoCritico]);

  const criticoVisual =
    metricas.cpu >= configuracion.umbralCpuCritico ||
    metricas.memoria >= configuracion.umbralMemoriaCritico;

  return (
    <DraggableResizableWindow
      title={title}
      minimized={minimized}
      onToggleMinimize={onToggleMinimize}
      onClose={onClose}
      onFocus={onFocus}
      zIndex={zIndex}
      initialWidth={420}
      initialHeight={320}
    >
      <div style={{ padding: "12px 16px", height: "100%", overflow: "auto" }}>
        <h2 className="ventana-hud-seccion-titulo">TIEMPO REAL</h2>
        <div
          className={
            criticoVisual
              ? "ventana-hud-metricas ventana-hud-metricas--critico"
              : "ventana-hud-metricas"
          }
        >
          <div>CPU........: {metricas.cpu.toFixed(1)} %</div>
          <div>MEMORIA....: {metricas.memoria.toFixed(1)} %</div>
          <div>LATENCIA...: {metricas.latenciaMs} ms</div>
          <div style={{ marginTop: 8, opacity: 0.85 }}>
            Umbrales — CPU ≥ {configuracion.umbralCpuCritico}% · MEM ≥{" "}
            {configuracion.umbralMemoriaCritico}%
          </div>
        </div>
      </div>
    </DraggableResizableWindow>
  );
}

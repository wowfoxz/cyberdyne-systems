"use client";

import DraggableResizableWindow from "@/components/DraggableResizableWindow";
import { useHudAlert } from "@/context/HudAlertProvider";

interface VentanaMonitorEventosProps {
  onClose: () => void;
  minimized: boolean;
  onToggleMinimize: () => void;
  onFocus: () => void;
  zIndex: number;
  title?: string;
}

function formatearHora(ms: number): string {
  try {
    return new Date(ms).toLocaleString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return String(ms);
  }
}

export default function VentanaMonitorEventos({
  onClose,
  minimized,
  onToggleMinimize,
  onFocus,
  zIndex,
  title = "MONITOR DE EVENTOS",
}: VentanaMonitorEventosProps) {
  const { eventos, limpiarHistorialEventos } = useHudAlert();

  return (
    <DraggableResizableWindow
      title={title}
      minimized={minimized}
      onToggleMinimize={onToggleMinimize}
      onClose={onClose}
      onFocus={onFocus}
      zIndex={zIndex}
      initialWidth={480}
      initialHeight={380}
    >
      <div style={{ padding: "12px 16px", height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <h2 className="ventana-hud-seccion-titulo">Historial crítico</h2>
        <div className="ventana-hud-eventos" style={{ flex: 1 }}>
          {eventos.length === 0 ? (
            <p style={{ opacity: 0.7 }}>Sin eventos registrados.</p>
          ) : (
            eventos.map((ev) => (
              <div key={ev.id} className="ventana-hud-evento-fila">
                <div className="ventana-hud-evento-meta">
                  {formatearHora(ev.marcaTiempo)} · {ev.origen} · [{ev.tipo}]
                </div>
                <div>{ev.mensaje}</div>
              </div>
            ))
          )}
        </div>
        <button
          type="button"
          className="ventana-hud-boton-secundario"
          onClick={limpiarHistorialEventos}
        >
          Limpiar historial
        </button>
      </div>
    </DraggableResizableWindow>
  );
}

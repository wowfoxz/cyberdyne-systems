"use client";

import DraggableResizableWindow from "@/components/DraggableResizableWindow";
import { useHudAlert } from "@/context/HudAlertProvider";
import { configuracionHudPorDefecto } from "@/config/hudConfig";

interface VentanaConfiguracionHudProps {
  onClose: () => void;
  minimized: boolean;
  onToggleMinimize: () => void;
  onFocus: () => void;
  zIndex: number;
  title?: string;
}

export default function VentanaConfiguracionHud({
  onClose,
  minimized,
  onToggleMinimize,
  onFocus,
  zIndex,
  title = "CONFIGURACIÓN DEL HUD",
}: VentanaConfiguracionHudProps) {
  const { configuracion, actualizarConfiguracion } = useHudAlert();

  return (
    <DraggableResizableWindow
      title={title}
      minimized={minimized}
      onToggleMinimize={onToggleMinimize}
      onClose={onClose}
      onFocus={onFocus}
      zIndex={zIndex}
      initialWidth={520}
      initialHeight={480}
    >
      <div style={{ padding: "12px 16px", overflow: "auto", height: "100%" }}>
        <nav className="ventana-hud-breadcrumb" aria-label="Ruta">
          DASHBOARD / CONFIGURACIÓN DEL HUD
        </nav>

        <h2 className="ventana-hud-seccion-titulo">Tema y colores</h2>
        <div className="ventana-hud-formulario">
          <div className="ventana-hud-fila">
            <label htmlFor="hud-color-primario">Color principal</label>
            <input
              id="hud-color-primario"
              type="color"
              value={configuracion.colorPrimario}
              onChange={(e) =>
                actualizarConfiguracion({ colorPrimario: e.target.value })
              }
            />
            <span>{configuracion.colorPrimario}</span>
          </div>
          <div className="ventana-hud-fila">
            <label htmlFor="hud-color-alerta">Color de alerta</label>
            <input
              id="hud-color-alerta"
              type="color"
              value={configuracion.colorAlerta}
              onChange={(e) =>
                actualizarConfiguracion({ colorAlerta: e.target.value })
              }
            />
            <span>{configuracion.colorAlerta}</span>
          </div>
          <div className="ventana-hud-fila">
            <label htmlFor="hud-color-fondo">Color de fondo</label>
            <input
              id="hud-color-fondo"
              type="color"
              value={configuracion.colorFondo}
              onChange={(e) =>
                actualizarConfiguracion({ colorFondo: e.target.value })
              }
            />
            <span>{configuracion.colorFondo}</span>
          </div>
        </div>

        <button
          type="button"
          className="ventana-hud-boton-secundario"
          onClick={() => actualizarConfiguracion(configuracionHudPorDefecto)}
        >
          Restaurar colores originales
        </button>

        <h2 className="ventana-hud-seccion-titulo">Alertas</h2>
        <div className="ventana-hud-formulario">
          <div className="ventana-hud-fila">
            <label htmlFor="hud-sonido">Sonido en eventos críticos</label>
            <input
              id="hud-sonido"
              type="checkbox"
              checked={configuracion.alertasSonido}
              onChange={(e) =>
                actualizarConfiguracion({ alertasSonido: e.target.checked })
              }
            />
          </div>
          <div className="ventana-hud-fila">
            <label htmlFor="hud-visual">Overlay y avisos visuales</label>
            <input
              id="hud-visual"
              type="checkbox"
              checked={configuracion.alertasVisuales}
              onChange={(e) =>
                actualizarConfiguracion({ alertasVisuales: e.target.checked })
              }
            />
          </div>
        </div>

        <h2 className="ventana-hud-seccion-titulo">Umbrales del monitor</h2>
        <div className="ventana-hud-formulario">
          <div className="ventana-hud-fila">
            <label htmlFor="hud-umbral-cpu">CPU crítica (%)</label>
            <input
              id="hud-umbral-cpu"
              type="number"
              min={50}
              max={100}
              value={configuracion.umbralCpuCritico}
              onChange={(e) =>
                actualizarConfiguracion({
                  umbralCpuCritico: Number(e.target.value),
                })
              }
            />
          </div>
          <div className="ventana-hud-fila">
            <label htmlFor="hud-umbral-mem">Memoria crítica (%)</label>
            <input
              id="hud-umbral-mem"
              type="number"
              min={50}
              max={100}
              value={configuracion.umbralMemoriaCritico}
              onChange={(e) =>
                actualizarConfiguracion({
                  umbralMemoriaCritico: Number(e.target.value),
                })
              }
            />
          </div>
        </div>
      </div>
    </DraggableResizableWindow>
  );
}

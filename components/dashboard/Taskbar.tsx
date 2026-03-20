"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

type MinimizableWindow =
  | { type: "notepad"; id: number; title: string }
  | { type: "nuclearMap"; title: string }
  | { type: "threeD"; title: string }
  | { type: "plano"; title: string }
  | { type: "hudConfig"; title: string }
  | { type: "monitorMetricas"; title: string }
  | { type: "monitorEventos"; title: string };

interface TaskbarProps {
  minimizedWindows: MinimizableWindow[];
  toggleMinimizeNotepad: (id: number) => void;
  toggleMinimizeNuclearMap: () => void;
  toggleMinimizeThreeDWindow: () => void;
  toggleMinimizePlanoWindow: () => void;
  /** Opcionales: usados por el dashboard principal con HUD/monitores. */
  toggleMinimizeHudConfig?: () => void;
  toggleMinimizeMonitorMetricas?: () => void;
  toggleMinimizeMonitorEventos?: () => void;
}

export default function Taskbar({
  minimizedWindows,
  toggleMinimizeNotepad,
  toggleMinimizeNuclearMap,
  toggleMinimizeThreeDWindow,
  toggleMinimizePlanoWindow,
  toggleMinimizeHudConfig = () => {},
  toggleMinimizeMonitorMetricas = () => {},
  toggleMinimizeMonitorEventos = () => {},
}: TaskbarProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = mounted ? currentTime.toLocaleTimeString() : "";
  const dateString = mounted ? currentTime.toLocaleDateString() : "";

  return (
    <div className="taskbar">
      <div className="glitch-content">
        {/* Sección izquierda: botón de inicio, lupa y ventanas minimizadas */}
        <div className="left-section">
          <div className="start-button">Inicio</div>
          <div className="taskbar-icon search-button">
            <Image src="Buscador-inicio.svg" alt="Buscar" width={32} height={32} />
          </div>
          <div className="minimized-windows">
            {minimizedWindows.map((mw, idx) => {
              if (mw.type === "notepad") {
                return (
                  <div
                    key={`${mw.type}-${mw.id}`}
                    className="minimized-icon"
                    onClick={() => toggleMinimizeNotepad(mw.id)}
                  >
                    <Image src="notepad.svg" alt={mw.title} width={32} height={32} />
                    <span>{mw.title}</span>
                  </div>
                );
              } else if (mw.type === "nuclearMap") {
                return (
                  <div
                    key={`nuclearMap-${idx}`}
                    className="minimized-icon"
                    onClick={toggleMinimizeNuclearMap}
                  >
                    <Image src="explorer.svg" alt={mw.title} width={32} height={32} />
                    <span>{mw.title}</span>
                  </div>
                );
              } else if (mw.type === "threeD") {
                return (
                  <div
                    key={`threeD-${idx}`}
                    className="minimized-icon"
                    onClick={toggleMinimizeThreeDWindow}
                  >
                    <Image src="papelera.svg" alt={mw.title} width={32} height={32} />
                    <span>{mw.title}</span>
                  </div>
                );
              } else if (mw.type === "plano") {
                return (
                  <div
                    key={`plano-${idx}`}
                    className="minimized-icon"
                    onClick={toggleMinimizePlanoWindow}
                  >
                    <Image src="mi pc.svg" alt={mw.title} width={32} height={32} />
                    <span>{mw.title}</span>
                  </div>
                );
              } else if (mw.type === "hudConfig") {
                return (
                  <div
                    key={`hudConfig-${idx}`}
                    className="minimized-icon"
                    onClick={toggleMinimizeHudConfig}
                  >
                    <Image src="mundo.svg" alt={mw.title} width={32} height={32} />
                    <span>{mw.title}</span>
                  </div>
                );
              } else if (mw.type === "monitorMetricas") {
                return (
                  <div
                    key={`monitorMetricas-${idx}`}
                    className="minimized-icon"
                    onClick={toggleMinimizeMonitorMetricas}
                  >
                    <Image src="metricas.svg" alt={mw.title} width={32} height={32} />
                    <span>{mw.title}</span>
                  </div>
                );
              } else if (mw.type === "monitorEventos") {
                return (
                  <div
                    key={`monitorEventos-${idx}`}
                    className="minimized-icon"
                    onClick={toggleMinimizeMonitorEventos}
                  >
                    <Image src="Buscador-inicio.svg" alt={mw.title} width={32} height={32} />
                    <span>{mw.title}</span>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>

        <div className="taskbar-spacer" />

        <div className="taskbar-icon">
          <Image src="mundo.svg" alt="Mundo" width={32} height={32} />
        </div>

        <div className="taskbar-icon">
          <Image src="Volumen.svg" alt="Volumen" width={32} height={32} />
        </div>

        <div className="separator"></div>

        <div className="datetime">
          <span>{timeString}</span>
          <span>{dateString}</span>
        </div>
      </div>
    </div>
  );
}

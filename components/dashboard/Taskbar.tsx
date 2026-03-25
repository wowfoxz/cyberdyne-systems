"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useHudAlert } from "@/context/HudAlertProvider";
import { MAX_EVENTOS_CRITICOS } from "@/config/hudConfig";
import { notepadConfigs } from "@/config/notepadConfig";
import { nuclearPlatforms } from "@/config/nuclearPlatforms";
import { planoSections } from "@/config/planoSections";
import { reproducirTonoAlertaCritica } from "@/lib/reproducirAlertaSonora";

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

  /** Etapa B: callbacks opcionales para abrir/restaurar ventanas con foco. */
  onAbrirNotepad?: (id: number) => void;
  onAbrirNuclearMap?: () => void;
  onAbrirThreeDWindow?: () => void;
  onAbrirPlanoWindow?: () => void;
  onAbrirHudConfig?: () => void;
  onAbrirMonitorMetricas?: () => void;
  onAbrirMonitorEventos?: () => void;
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
  onAbrirNotepad,
  onAbrirNuclearMap,
  onAbrirThreeDWindow,
  onAbrirPlanoWindow,
  onAbrirHudConfig,
  onAbrirMonitorMetricas,
  onAbrirMonitorEventos,
}: TaskbarProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [mounted, setMounted] = useState(false);
  const [inicioAbierto, setInicioAbierto] = useState(false);
  const [buscadorAbierto, setBuscadorAbierto] = useState(false);
  const [diagnosticoAbierto, setDiagnosticoAbierto] = useState(false);
  const [textoBuscador, setTextoBuscador] = useState("");
  const [estadoConsola, setEstadoConsola] = useState<string>("");
  const buscadorInputRef = useRef<HTMLInputElement | null>(null);

  const {
    eventos,
    overlayAlertaVisible,
    configuracion,
    actualizarConfiguracion,
    emitirEventoCritico,
  } = useHudAlert();

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = mounted ? currentTime.toLocaleTimeString() : "";
  const dateString = mounted ? currentTime.toLocaleDateString() : "";

  const cerrarPaneles = () => {
    setInicioAbierto(false);
    setBuscadorAbierto(false);
    setDiagnosticoAbierto(false);
    setEstadoConsola("");
  };

  useEffect(() => {
    if (!inicioAbierto && !buscadorAbierto && !diagnosticoAbierto) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrarPaneles();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [inicioAbierto, buscadorAbierto, diagnosticoAbierto]);

  useEffect(() => {
    if (!buscadorAbierto) return;
    const t = window.setTimeout(() => buscadorInputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [buscadorAbierto]);

  function normalizarTexto(s: string) {
    return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  }

  const queryNorm = normalizarTexto(textoBuscador);
  const queryUpper = textoBuscador.trim().toUpperCase();
  const esCodigoPlano = /^A\d{2,3}$/.test(queryUpper);
  const coincideCodigoPlano = useMemo(() => {
    if (!esCodigoPlano) return null;
    return planoSections.find((s) => s.id.toUpperCase() === queryUpper) ?? null;
  }, [esCodigoPlano, planoSections, queryUpper]);

  const coincideCiudad = useMemo(() => {
    if (!queryNorm) return null;
    // Coincidencia por inclusión (p.ej. "new york" => "New York")
    const match = nuclearPlatforms.find(
      (p) => normalizarTexto(p.name).includes(queryNorm) || queryNorm.includes(normalizarTexto(p.name))
    );
    return match ?? null;
  }, [queryNorm]);

  const coincideNotepad = useMemo(() => {
    if (queryNorm.length < 3) return [];
    const resultados = notepadConfigs
      .map((cfg) => {
        const enTitulo = normalizarTexto(cfg.title).includes(queryNorm);
        const enDescripcion = normalizarTexto(cfg.description).includes(queryNorm);
        return { cfg, score: (enTitulo ? 2 : 0) + (enDescripcion ? 1 : 0) };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((r) => r.cfg);
    return resultados;
  }, [queryNorm]);

  const modoBuscador = esCodigoPlano
    ? "SECTOR (PLANO)"
    : coincideCiudad
      ? "CIUDAD (MAPA NUCLEAR)"
      : "TEXTO (NOTEPADS)";

  const ejecutarEscaneoSimulado = (accionTexto: string) => {
    // Etapa A: no abre ventanas; solo registra una respuesta narrativa.
    const stamp = new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    setEstadoConsola(`[${stamp}] ESCANEO REGISTRADO: ${accionTexto}`);
  };

  const cerrarInicio = () => {
    setInicioAbierto(false);
    setEstadoConsola("");
  };

  const cerrarBuscador = () => {
    setBuscadorAbierto(false);
    setEstadoConsola("");
  };

  return (
    <div className="taskbar">
      <div className="glitch-content">
        {/* Sección izquierda: botón de inicio, lupa y ventanas minimizadas */}
        <div className="left-section">
          <button
            type="button"
            className="start-button"
            aria-label="Abrir consola Skynet"
            onClick={() => {
              setInicioAbierto((prev) => {
                const next = !prev;
                if (next) {
                  setBuscadorAbierto(false);
                  setDiagnosticoAbierto(false);
                  setEstadoConsola("");
                }
                return next;
              });
            }}
          >
            Inicio
          </button>
          <button
            type="button"
            className="taskbar-icon search-button"
            aria-label="Abrir buscador"
            onClick={() => {
              setBuscadorAbierto((prev) => {
                const next = !prev;
                if (next) {
                  setInicioAbierto(false);
                  setDiagnosticoAbierto(false);
                  setEstadoConsola("");
                }
                return next;
              });
            }}
          >
            <Image src="Buscador-inicio.svg" alt="Buscar" width={32} height={32} />
          </button>
          <div className="minimized-windows">
            {minimizedWindows.map((mw, idx) => {
              if (mw.type === "notepad") {
                return (
                  <div
                    key={`${mw.type}-${mw.id}`}
                    className="minimized-icon"
                    onClick={() => {
                      if (onAbrirNotepad) {
                        onAbrirNotepad(mw.id);
                        return;
                      }
                      toggleMinimizeNotepad(mw.id);
                    }}
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
                    onClick={() => {
                      if (onAbrirNuclearMap) {
                        onAbrirNuclearMap();
                        return;
                      }
                      toggleMinimizeNuclearMap();
                    }}
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
                    onClick={() => {
                      if (onAbrirThreeDWindow) {
                        onAbrirThreeDWindow();
                        return;
                      }
                      toggleMinimizeThreeDWindow();
                    }}
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
                    onClick={() => {
                      if (onAbrirPlanoWindow) {
                        onAbrirPlanoWindow();
                        return;
                      }
                      toggleMinimizePlanoWindow();
                    }}
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
                    onClick={() => {
                      if (onAbrirHudConfig) {
                        onAbrirHudConfig();
                        return;
                      }
                      toggleMinimizeHudConfig();
                    }}
                  >
                    <Image
                      src="configure.svg"
                      alt={mw.title}
                      width={32}
                      height={32}
                    />
                    <span>{mw.title}</span>
                  </div>
                );
              } else if (mw.type === "monitorMetricas") {
                return (
                  <div
                    key={`monitorMetricas-${idx}`}
                    className="minimized-icon"
                    onClick={() => {
                      if (onAbrirMonitorMetricas) {
                        onAbrirMonitorMetricas();
                        return;
                      }
                      toggleMinimizeMonitorMetricas();
                    }}
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
                    onClick={() => {
                      if (onAbrirMonitorEventos) {
                        onAbrirMonitorEventos();
                        return;
                      }
                      toggleMinimizeMonitorEventos();
                    }}
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

        <button
          type="button"
          className="taskbar-icon"
          aria-label="Abrir diagnóstico Skynet"
          onClick={() => {
            setDiagnosticoAbierto((prev) => {
              const next = !prev;
              if (next) {
                setInicioAbierto(false);
                setBuscadorAbierto(false);
                setEstadoConsola("");
              }
              return next;
            });
          }}
        >
          <Image src="configure.svg" alt="Diagnóstico Skynet" width={32} height={32} />
        </button>

        <button
          type="button"
          className={`taskbar-icon ${
            configuracion.alertasSonido ? "" : "volumen-silenciado"
          }`}
          aria-label="Alternar sonido de alertas"
          onClick={() => {
            const nuevoSonido = !configuracion.alertasSonido;
            actualizarConfiguracion({ alertasSonido: nuevoSonido });
            if (nuevoSonido) {
              // Señal corta estilo T-800.
              void reproducirTonoAlertaCritica(740, 160);
            }
          }}
        >
          <Image src="Volumen.svg" alt="Volumen" width={32} height={32} />
        </button>

        <div className="separator"></div>

        <div className="datetime">
          <span>{timeString}</span>
          <span>{dateString}</span>
        </div>
      </div>

      {/* Panel: Inicio / Consola Skynet (Etapa A: UI sin ejecutar acciones reales) */}
      {inicioAbierto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Consola Skynet"
          style={{
            position: "absolute",
            left: 10,
            bottom: 40,
            width: 420,
            maxWidth: "calc(100vw - 20px)",
            backgroundColor: "var(--hud-bg)",
            border: "2px dashed var(--hud-primary)",
            boxShadow:
              "0 0 24px color-mix(in srgb, var(--hud-primary) 35%, transparent)",
            padding: 12,
            zIndex: 20000,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <div style={{ fontWeight: 900, letterSpacing: "0.12em" }}>SKYNET CONSOLE</div>
            <button
              type="button"
              onClick={cerrarPaneles}
              aria-label="Cerrar consola"
              style={{
                background: "transparent",
                color: "var(--hud-primary)",
                border: "1px solid var(--hud-primary)",
                cursor: "pointer",
                padding: "4px 10px",
                fontFamily: "inherit",
                textTransform: "uppercase",
                fontSize: 12,
              }}
            >
              CERRAR
            </button>
          </div>

          <div style={{ marginTop: 10, opacity: 0.95 }}>
            <div style={{ fontSize: 12, marginBottom: 6, color: "var(--hud-primary)" }}>
              UNIDAD T-800 EN ESCUCHA
            </div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>
              EVENTOS CRÍTICOS: {eventos.length}/{MAX_EVENTOS_CRITICOS}
            </div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>
              OVERLAY: {overlayAlertaVisible ? "ACTIVO" : "INACTIVO"}
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 900, textTransform: "uppercase", fontSize: 12, marginBottom: 6 }}>
              ABRIR
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {notepadConfigs.map((cfg) => (
                <button
                  key={cfg.id}
                  type="button"
                  style={{
                    background: "transparent",
                    color: "var(--hud-primary)",
                    border: "1px dashed var(--hud-primary)",
                    padding: "6px 10px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    textTransform: "uppercase",
                    fontSize: 12,
                  }}
                  onClick={() => {
                    if (onAbrirNotepad) {
                      onAbrirNotepad(cfg.id);
                      cerrarInicio();
                      return;
                    }
                    ejecutarEscaneoSimulado(`ABRIR NOTAS (${cfg.title})`);
                  }}
                >
                  {cfg.title}
                </button>
              ))}

              <button
                type="button"
                style={{
                  background: "transparent",
                  color: "var(--hud-primary)",
                  border: "1px dashed var(--hud-primary)",
                  padding: "6px 10px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textTransform: "uppercase",
                  fontSize: 12,
                }}
                onClick={() => {
                  if (onAbrirNuclearMap) {
                    onAbrirNuclearMap();
                    cerrarInicio();
                    return;
                  }
                  ejecutarEscaneoSimulado("ABRIR MAPA NUCLEAR");
                }}
              >
                MAPA NUCLEAR
              </button>

              <button
                type="button"
                style={{
                  background: "transparent",
                  color: "var(--hud-primary)",
                  border: "1px dashed var(--hud-primary)",
                  padding: "6px 10px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textTransform: "uppercase",
                  fontSize: 12,
                }}
                onClick={() => {
                  if (onAbrirPlanoWindow) {
                    onAbrirPlanoWindow();
                    cerrarInicio();
                    return;
                  }
                  ejecutarEscaneoSimulado("ABRIR PLANO CYBERDYNE");
                }}
              >
                PLANO
              </button>

              <button
                type="button"
                style={{
                  background: "transparent",
                  color: "var(--hud-primary)",
                  border: "1px dashed var(--hud-primary)",
                  padding: "6px 10px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textTransform: "uppercase",
                  fontSize: 12,
                }}
                onClick={() => {
                  if (onAbrirThreeDWindow) {
                    onAbrirThreeDWindow();
                    cerrarInicio();
                    return;
                  }
                  ejecutarEscaneoSimulado("ABRIR ANIMACIÓN 3D");
                }}
              >
                ANIMACIÓN 3D
              </button>

              <button
                type="button"
                style={{
                  background: "transparent",
                  color: "var(--hud-primary)",
                  border: "1px dashed var(--hud-primary)",
                  padding: "6px 10px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textTransform: "uppercase",
                  fontSize: 12,
                }}
                onClick={() => {
                  if (onAbrirHudConfig) {
                    onAbrirHudConfig();
                    cerrarInicio();
                    return;
                  }
                  ejecutarEscaneoSimulado("ABRIR CONFIG HUD");
                }}
              >
                CONFIG HUD
              </button>

              <button
                type="button"
                style={{
                  background: "transparent",
                  color: "var(--hud-primary)",
                  border: "1px dashed var(--hud-primary)",
                  padding: "6px 10px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textTransform: "uppercase",
                  fontSize: 12,
                }}
                onClick={() => {
                  if (onAbrirMonitorMetricas) {
                    onAbrirMonitorMetricas();
                    cerrarInicio();
                    return;
                  }
                  ejecutarEscaneoSimulado("ABRIR MONITOR DE MÉTRICAS");
                }}
              >
                MÉTRICAS
              </button>

              <button
                type="button"
                style={{
                  background: "transparent",
                  color: "var(--hud-primary)",
                  border: "1px dashed var(--hud-primary)",
                  padding: "6px 10px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textTransform: "uppercase",
                  fontSize: 12,
                }}
                onClick={() => {
                  if (onAbrirMonitorEventos) {
                    onAbrirMonitorEventos();
                    cerrarInicio();
                    return;
                  }
                  ejecutarEscaneoSimulado("ABRIR MONITOR DE EVENTOS");
                }}
              >
                EVENTOS
              </button>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 900, textTransform: "uppercase", fontSize: 12, marginBottom: 6 }}>
              PROTOCOLOS
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <button
                type="button"
                style={{
                  background: "transparent",
                  color: "var(--hud-primary)",
                  border: "1px dashed var(--hud-primary)",
                  padding: "6px 10px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textTransform: "uppercase",
                  fontSize: 12,
                }}
                onClick={() => {
                  if (onAbrirThreeDWindow) {
                    onAbrirThreeDWindow();
                    cerrarInicio();
                    return;
                  }
                  ejecutarEscaneoSimulado("REINICIAR UNIDAD 3D");
                }}
              >
                REINICIAR 3D
              </button>

              <button
                type="button"
                style={{
                  background: "transparent",
                  color: "var(--hud-primary)",
                  border: "1px dashed var(--hud-primary)",
                  padding: "6px 10px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textTransform: "uppercase",
                  fontSize: 12,
                }}
                onClick={() => {
                  if (onAbrirNuclearMap) {
                    onAbrirNuclearMap();
                    cerrarInicio();
                    return;
                  }
                  ejecutarEscaneoSimulado("ACTIVAR MISIL (Y)");
                }}
              >
                PROTOCOLO MISIL (Y)
              </button>

              <button
                type="button"
                style={{
                  background: "transparent",
                  color: "var(--hud-primary)",
                  border: "1px dashed var(--hud-primary)",
                  padding: "6px 10px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textTransform: "uppercase",
                  fontSize: 12,
                }}
                onClick={() => {
                  if (onAbrirPlanoWindow) {
                    onAbrirPlanoWindow();
                    cerrarInicio();
                    return;
                  }
                  ejecutarEscaneoSimulado("ALARMA DEL PLANO: ACTIVAR/LIMPIAR");
                }}
              >
                ALARMA PLANO
              </button>
            </div>
          </div>

          {estadoConsola && (
            <div style={{ marginTop: 12, fontSize: 12, opacity: 0.95 }}>
              {estadoConsola}
            </div>
          )}
        </div>
      )}

      {/* Panel: Buscador (Etapa A: UI/escaneo simulado, sin ejecutar acciones reales) */}
      {buscadorAbierto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Buscador de sectores y ciudades"
          style={{
            position: "absolute",
            left: 100,
            bottom: 40,
            width: 520,
            maxWidth: "calc(100vw - 120px)",
            backgroundColor: "var(--hud-bg)",
            border: "2px dashed var(--hud-primary)",
            boxShadow:
              "0 0 24px color-mix(in srgb, var(--hud-primary) 35%, transparent)",
            padding: 12,
            zIndex: 20000,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <div style={{ fontWeight: 900, letterSpacing: "0.12em" }}>
              BUSCADOR DE SECTORES / CIUDADES
            </div>
            <button
              type="button"
              onClick={cerrarPaneles}
              aria-label="Cerrar buscador"
              style={{
                background: "transparent",
                color: "var(--hud-primary)",
                border: "1px solid var(--hud-primary)",
                cursor: "pointer",
                padding: "4px 10px",
                fontFamily: "inherit",
                textTransform: "uppercase",
                fontSize: 12,
              }}
            >
              CERRAR
            </button>
          </div>

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.9 }}>
            MODO: {modoBuscador} · UNIDAD T-800
          </div>

          <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
            <input
              ref={buscadorInputRef}
              value={textoBuscador}
              onChange={(e) => setTextoBuscador(e.target.value)}
              placeholder="Ej: A34, Tokyo, 'Cyperdyne'..."
              aria-label="Escribe un sector, ciudad o texto"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (coincideCodigoPlano) {
                    if (onAbrirPlanoWindow) {
                      onAbrirPlanoWindow();
                      cerrarBuscador();
                      return;
                    }
                    ejecutarEscaneoSimulado(
                      `SECTOR ${coincideCodigoPlano.id} (${coincideCodigoPlano.name})`
                    );
                    return;
                  }
                  if (coincideCiudad) {
                    if (onAbrirNuclearMap) {
                      onAbrirNuclearMap();
                      cerrarBuscador();
                      return;
                    }
                    ejecutarEscaneoSimulado(`CIUDAD ${coincideCiudad.name}`);
                    return;
                  }
                  if (coincideNotepad.length > 0) {
                    if (onAbrirNotepad) {
                      onAbrirNotepad(coincideNotepad[0].id);
                      cerrarBuscador();
                      return;
                    }
                    ejecutarEscaneoSimulado(`NOTEPAD ${coincideNotepad[0].title}`);
                    return;
                  }
                  ejecutarEscaneoSimulado("SIN COINCIDENCIAS (REINTENTAR ESCANEO)");
                }
              }}
              style={{
                flex: 1,
                height: 34,
                background: "transparent",
                border: "1px solid var(--hud-primary)",
                color: "var(--hud-primary)",
                padding: "0 10px",
                fontFamily: "inherit",
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={() => {
                if (coincideCodigoPlano) {
                  if (onAbrirPlanoWindow) {
                    onAbrirPlanoWindow();
                    cerrarBuscador();
                    return;
                  }
                  ejecutarEscaneoSimulado(
                    `SECTOR ${coincideCodigoPlano.id} (${coincideCodigoPlano.name})`
                  );
                  return;
                }
                if (coincideCiudad) {
                  if (onAbrirNuclearMap) {
                    onAbrirNuclearMap();
                    cerrarBuscador();
                    return;
                  }
                  ejecutarEscaneoSimulado(`CIUDAD ${coincideCiudad.name}`);
                  return;
                }
                if (coincideNotepad.length > 0) {
                  if (onAbrirNotepad) {
                    onAbrirNotepad(coincideNotepad[0].id);
                    cerrarBuscador();
                    return;
                  }
                  ejecutarEscaneoSimulado(`NOTEPAD ${coincideNotepad[0].title}`);
                  return;
                }
                ejecutarEscaneoSimulado("SIN COINCIDENCIAS (REINTENTAR ESCANEO)");
              }}
              style={{
                background: "transparent",
                color: "var(--hud-primary)",
                border: "1px dashed var(--hud-primary)",
                padding: "6px 10px",
                cursor: "pointer",
                fontFamily: "inherit",
                textTransform: "uppercase",
                fontSize: 12,
                whiteSpace: "nowrap",
              }}
            >
              ESCANEAR
            </button>
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 900, textTransform: "uppercase", fontSize: 12, marginBottom: 6 }}>
              RESULTADOS (SIMULADOS)
            </div>

            {coincideCodigoPlano && (
              <div
                style={{
                  border: "1px solid var(--hud-primary)",
                  padding: 10,
                  fontSize: 12,
                  color: "var(--hud-primary)",
                  marginBottom: 10,
                  cursor: "pointer",
                }}
                onClick={() => {
                  if (onAbrirPlanoWindow) {
                    onAbrirPlanoWindow();
                    cerrarBuscador();
                    return;
                  }
                  ejecutarEscaneoSimulado(
                    `SELECCIONAR SECTOR ${coincideCodigoPlano.id}`
                  );
                }}
                role="button"
                tabIndex={0}
              >
                {coincideCodigoPlano.id} · {coincideCodigoPlano.name}
              </div>
            )}

            {!coincideCodigoPlano && coincideCiudad && (
              <div
                style={{
                  border: "1px solid var(--hud-primary)",
                  padding: 10,
                  fontSize: 12,
                  color: "var(--hud-primary)",
                  marginBottom: 10,
                  cursor: "pointer",
                }}
                onClick={() => {
                  if (onAbrirNuclearMap) {
                    onAbrirNuclearMap();
                    cerrarBuscador();
                    return;
                  }
                  ejecutarEscaneoSimulado(
                    `SELECCIONAR CIUDAD ${coincideCiudad.name}`
                  );
                }}
                role="button"
                tabIndex={0}
              >
                {coincideCiudad.name}
              </div>
            )}

            {!coincideCodigoPlano && !coincideCiudad && coincideNotepad.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {coincideNotepad.map((cfg) => (
                  <div
                    key={cfg.id}
                    style={{
                      border: "1px solid var(--hud-primary)",
                      padding: 10,
                      fontSize: 12,
                      color: "var(--hud-primary)",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      if (onAbrirNotepad) {
                        onAbrirNotepad(cfg.id);
                        cerrarBuscador();
                        return;
                      }
                      ejecutarEscaneoSimulado(`SELECCIONAR NOTEPAD ${cfg.title}`);
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    {cfg.title}
                  </div>
                ))}
              </div>
            )}

            {!coincideCodigoPlano && !coincideCiudad && coincideNotepad.length === 0 && textoBuscador && (
              <div style={{ opacity: 0.8, fontSize: 12 }}>
                Sin coincidencias. Ajusta el escaneo (A## / ciudad / texto).
              </div>
            )}
          </div>

          {estadoConsola && (
            <div style={{ marginTop: 12, fontSize: 12, opacity: 0.95 }}>
              {estadoConsola}
            </div>
          )}
        </div>
      )}

      {/* Panel: Diagnostico Skynet (mundo/configure icon -> algo distinto a Config HUD) */}
      {diagnosticoAbierto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Diagnostico Skynet"
          style={{
            position: "absolute",
            right: 10,
            bottom: 40,
            width: 420,
            maxWidth: "calc(100vw - 20px)",
            backgroundColor: "var(--hud-bg)",
            border: "2px dashed var(--hud-primary)",
            boxShadow:
              "0 0 24px color-mix(in srgb, var(--hud-primary) 35%, transparent)",
            padding: 12,
            zIndex: 20000,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
            }}
          >
            <div style={{ fontWeight: 900, letterSpacing: "0.12em" }}>
              DIAGNOSTICO SKYNET
            </div>
            <button
              type="button"
              onClick={() => setDiagnosticoAbierto(false)}
              aria-label="Cerrar diagnostico"
              style={{
                background: "transparent",
                color: "var(--hud-primary)",
                border: "1px solid var(--hud-primary)",
                cursor: "pointer",
                padding: "4px 10px",
                fontFamily: "inherit",
                textTransform: "uppercase",
                fontSize: 12,
              }}
            >
              CERRAR
            </button>
          </div>

          <div style={{ marginTop: 10, opacity: 0.95 }}>
            <div style={{ fontSize: 12, opacity: 0.9 }}>
              EVENTOS CRITICOS: {eventos.length}/{MAX_EVENTOS_CRITICOS}
            </div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>
              OVERLAY: {overlayAlertaVisible ? "ACTIVO" : "INACTIVO"}
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <div
              style={{
                fontWeight: 900,
                textTransform: "uppercase",
                fontSize: 12,
                marginBottom: 6,
              }}
            >
              ACCIONES
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <button
                type="button"
                style={{
                  background: "transparent",
                  color: "var(--hud-primary)",
                  border: "1px dashed var(--hud-primary)",
                  padding: "6px 10px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textTransform: "uppercase",
                  fontSize: 12,
                }}
                onClick={() => {
                  emitirEventoCritico({
                    tipo: "AUTOCHEQUEO",
                    mensaje: "Autochequeo completado. Integridad nominal.",
                    origen: "DIAGNOSTICO SKYNET",
                  });
                  setDiagnosticoAbierto(false);
                }}
              >
                EJECUTAR AUTOCHEQUEO
              </button>

              <button
                type="button"
                style={{
                  background: "transparent",
                  color: "var(--hud-primary)",
                  border: "1px dashed var(--hud-primary)",
                  padding: "6px 10px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textTransform: "uppercase",
                  fontSize: 12,
                }}
                onClick={() => {
                  if (onAbrirMonitorEventos) {
                    onAbrirMonitorEventos();
                    setDiagnosticoAbierto(false);
                    return;
                  }
                  ejecutarEscaneoSimulado("ABRIR MONITOR EVENTOS");
                  setDiagnosticoAbierto(false);
                }}
              >
                VER EVENTOS
              </button>

              <button
                type="button"
                style={{
                  background: "transparent",
                  color: "var(--hud-primary)",
                  border: "1px dashed var(--hud-primary)",
                  padding: "6px 10px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textTransform: "uppercase",
                  fontSize: 12,
                }}
                onClick={() => {
                  if (onAbrirMonitorMetricas) {
                    onAbrirMonitorMetricas();
                    setDiagnosticoAbierto(false);
                    return;
                  }
                  ejecutarEscaneoSimulado("ABRIR MONITOR METRICAS");
                  setDiagnosticoAbierto(false);
                }}
              >
                VER METRICAS
              </button>

              <button
                type="button"
                style={{
                  background: "transparent",
                  color: "var(--hud-primary)",
                  border: "1px dashed var(--hud-primary)",
                  padding: "6px 10px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textTransform: "uppercase",
                  fontSize: 12,
                }}
                onClick={() => {
                  if (onAbrirHudConfig) {
                    onAbrirHudConfig();
                    setDiagnosticoAbierto(false);
                    return;
                  }
                  ejecutarEscaneoSimulado("ABRIR CONFIG HUD");
                  setDiagnosticoAbierto(false);
                }}
              >
                CONFIG HUD
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import BootScreen from "@/components/boot_bios/BootScreen";
import {
  notepadConfigs,
  NotepadConfig,
} from "@/config/notepadConfig";
import NotepadWindow from "@/components/ventana_nota/NotepadWindow";
import Notepad3DWindow from "@/components/ventana_3d/Notepad3DWindow";
import NuclearMapWindow from "@/components/map/NuclearMapWindow";
import PlanoWindow from "@/components/ventana_plano/PlanoWindow";
import PlasmaRifleModel from "@/components/ventana_3d/modelos_3d/PlasmaRifleModel";
import Taskbar from "@/components/dashboard/Taskbar";
import HudOverlayAlerta from "@/components/dashboard/HudOverlayAlerta";
import VentanaConfiguracionHud from "@/components/dashboard/VentanaConfiguracionHud";
import VentanaMonitorMetricas from "@/components/dashboard/VentanaMonitorMetricas";
import VentanaMonitorEventos from "@/components/dashboard/VentanaMonitorEventos";
import { HudAlertProvider, useHudAlert } from "@/context/HudAlertProvider";
import { desbloquearAudioUsuario } from "@/lib/audioContextoUsuario";
import { Canvas } from "@react-three/fiber";

// Componente Dashboard unificado
const Dashboard = () => {
  const { emitirEventoCritico } = useHudAlert();
  // Tipos y estados internos
  interface OpenNotepad {
    id: number;
    config: NotepadConfig;
    minimized: boolean;
    zIndex: number;
  }

  interface NuclearMapState {
    open: boolean;
    minimized: boolean;
    zIndex: number;
  }

  interface ThreeDWindowState {
    open: boolean;
    minimized: boolean;
    zIndex: number;
  }

  interface PlanoWindowState {
    open: boolean;
    minimized: boolean;
    zIndex: number;
  }

  interface SimpleWindowState {
    open: boolean;
    minimized: boolean;
    zIndex: number;
  }

  type MinimizableWindow =
    | { type: "notepad"; id: number; title: string }
    | { type: "nuclearMap"; title: string }
    | { type: "threeD"; title: string }
    | { type: "plano"; title: string }
    | { type: "hudConfig"; title: string }
    | { type: "monitorMetricas"; title: string }
    | { type: "monitorEventos"; title: string };

  const [openNotepads, setOpenNotepads] = useState<OpenNotepad[]>([]);
  const [nuclearMap, setNuclearMap] = useState<NuclearMapState>({
    open: false,
    minimized: false,
    zIndex: 1000,
  });
  const [threeDWindow, setThreeDWindow] = useState<ThreeDWindowState>({
    open: false,
    minimized: false,
    zIndex: 1000,
  });
  const [planoWindow, setPlanoWindow] = useState<PlanoWindowState>({
    open: false,
    minimized: false,
    zIndex: 1000,
  });
  const [hudConfigWindow, setHudConfigWindow] = useState<SimpleWindowState>({
    open: false,
    minimized: false,
    zIndex: 1000,
  });
  const [monitorMetricasWindow, setMonitorMetricasWindow] =
    useState<SimpleWindowState>({
      open: false,
      minimized: false,
      zIndex: 1000,
    });
  const [monitorEventosWindow, setMonitorEventosWindow] =
    useState<SimpleWindowState>({
      open: false,
      minimized: false,
      zIndex: 1000,
    });
  const [maxZIndex, setMaxZIndex] = useState(1000);

  /* Funciones para Notepad */
  const openNotepad = (config: NotepadConfig) => {
    if (!openNotepads.find((np) => np.id === config.id)) {
      const newZ = maxZIndex + 1;
      setOpenNotepads((prev) => [
        ...prev,
        { id: config.id, config, minimized: false, zIndex: newZ },
      ]);
      setMaxZIndex(newZ);
    }
  };

  const closeNotepad = (id: number) => {
    setOpenNotepads((prev) => prev.filter((np) => np.id !== id));
  };

  const toggleMinimizeNotepad = (id: number) => {
    setOpenNotepads((prev) =>
      prev.map((np) =>
        np.id === id ? { ...np, minimized: !np.minimized } : np
      )
    );
  };

  const bringNotepadToFront = (id: number) => {
    const newZ = maxZIndex + 1;
    setOpenNotepads((prev) =>
      prev.map((np) => (np.id === id ? { ...np, zIndex: newZ } : np))
    );
    setMaxZIndex(newZ);
  };

  /* Funciones para Nuclear Map */
  const openNuclearMap = () => {
    if (!nuclearMap.open) {
      const newZ = maxZIndex + 1;
      setNuclearMap({
        open: true,
        minimized: false,
        zIndex: newZ,
      });
      setMaxZIndex(newZ);
    }
  };

  const closeNuclearMap = () => {
    setNuclearMap({
      open: false,
      minimized: false,
      zIndex: 1000,
    });
  };

  const toggleMinimizeNuclearMap = () => {
    setNuclearMap((prev) => ({
      ...prev,
      minimized: !prev.minimized,
    }));
  };

  const bringNuclearMapToFront = () => {
    const newZ = maxZIndex + 1;
    setNuclearMap((prev) => ({
      ...prev,
      zIndex: newZ,
    }));
    setMaxZIndex(newZ);
  };

  /* Funciones para Ventana 3D */
  const openThreeDWindow = () => {
    if (!threeDWindow.open) {
      const newZ = maxZIndex + 1;
      setThreeDWindow({
        open: true,
        minimized: false,
        zIndex: newZ,
      });
      setMaxZIndex(newZ);
    }
  };

  const closeThreeDWindow = () => {
    setThreeDWindow({
      open: false,
      minimized: false,
      zIndex: 1000,
    });
  };

  const toggleMinimizeThreeDWindow = () => {
    setThreeDWindow((prev) => ({
      ...prev,
      minimized: !prev.minimized,
    }));
  };

  const bringThreeDWindowToFront = () => {
    const newZ = maxZIndex + 1;
    setThreeDWindow((prev) => ({
      ...prev,
      zIndex: newZ,
    }));
    setMaxZIndex(newZ);
  };

  /* Funciones para Ventana Plano */
  const openPlanoWindow = () => {
    if (!planoWindow.open) {
      const newZ = maxZIndex + 1;
      setPlanoWindow({
        open: true,
        minimized: false,
        zIndex: newZ,
      });
      setMaxZIndex(newZ);
    }
  };

  const closePlanoWindow = () => {
    setPlanoWindow({
      open: false,
      minimized: false,
      zIndex: 1000,
    });
  };

  const toggleMinimizePlanoWindow = () => {
    setPlanoWindow((prev) => ({
      ...prev,
      minimized: !prev.minimized,
    }));
  };

  const bringPlanoWindowToFront = () => {
    const newZ = maxZIndex + 1;
    setPlanoWindow((prev) => ({
      ...prev,
      zIndex: newZ,
    }));
    setMaxZIndex(newZ);
  };

  /* Ventana configuración HUD */
  const openHudConfigWindow = () => {
    if (!hudConfigWindow.open) {
      const newZ = maxZIndex + 1;
      setHudConfigWindow({
        open: true,
        minimized: false,
        zIndex: newZ,
      });
      setMaxZIndex(newZ);
    }
  };

  const closeHudConfigWindow = () => {
    setHudConfigWindow({
      open: false,
      minimized: false,
      zIndex: 1000,
    });
  };

  const toggleMinimizeHudConfigWindow = () => {
    setHudConfigWindow((prev) => ({
      ...prev,
      minimized: !prev.minimized,
    }));
  };

  const bringHudConfigWindowToFront = () => {
    const newZ = maxZIndex + 1;
    setHudConfigWindow((prev) => ({
      ...prev,
      zIndex: newZ,
    }));
    setMaxZIndex(newZ);
  };

  /* Monitor de métricas */
  const openMonitorMetricasWindow = () => {
    if (!monitorMetricasWindow.open) {
      const newZ = maxZIndex + 1;
      setMonitorMetricasWindow({
        open: true,
        minimized: false,
        zIndex: newZ,
      });
      setMaxZIndex(newZ);
    }
  };

  const closeMonitorMetricasWindow = () => {
    setMonitorMetricasWindow({
      open: false,
      minimized: false,
      zIndex: 1000,
    });
  };

  const toggleMinimizeMonitorMetricasWindow = () => {
    setMonitorMetricasWindow((prev) => ({
      ...prev,
      minimized: !prev.minimized,
    }));
  };

  const bringMonitorMetricasWindowToFront = () => {
    const newZ = maxZIndex + 1;
    setMonitorMetricasWindow((prev) => ({
      ...prev,
      zIndex: newZ,
    }));
    setMaxZIndex(newZ);
  };

  /* Monitor de eventos */
  const openMonitorEventosWindow = () => {
    if (!monitorEventosWindow.open) {
      const newZ = maxZIndex + 1;
      setMonitorEventosWindow({
        open: true,
        minimized: false,
        zIndex: newZ,
      });
      setMaxZIndex(newZ);
    }
  };

  const closeMonitorEventosWindow = () => {
    setMonitorEventosWindow({
      open: false,
      minimized: false,
      zIndex: 1000,
    });
  };

  const toggleMinimizeMonitorEventosWindow = () => {
    setMonitorEventosWindow((prev) => ({
      ...prev,
      minimized: !prev.minimized,
    }));
  };

  const bringMonitorEventosWindowToFront = () => {
    const newZ = maxZIndex + 1;
    setMonitorEventosWindow((prev) => ({
      ...prev,
      zIndex: newZ,
    }));
    setMaxZIndex(newZ);
  };

  /** Etapa B: abrir/restaurar con foco (incluye traer al frente si está minimizado). */
  const abrirNotepadConFoco = (id: number) => {
    const cfg = notepadConfigs.find((c) => c.id === id);
    if (!cfg) return;
    const abierta = openNotepads.find((np) => np.id === id);
    if (!abierta) {
      openNotepad(cfg);
      return;
    }
    if (abierta.minimized) toggleMinimizeNotepad(id);
    bringNotepadToFront(id);
  };

  const abrirNuclearMapConFoco = () => {
    if (!nuclearMap.open) {
      openNuclearMap();
      return;
    }
    if (nuclearMap.minimized) toggleMinimizeNuclearMap();
    bringNuclearMapToFront();
  };

  const abrirThreeDWindowConFoco = () => {
    if (!threeDWindow.open) {
      openThreeDWindow();
      return;
    }
    if (threeDWindow.minimized) toggleMinimizeThreeDWindow();
    bringThreeDWindowToFront();
  };

  const abrirPlanoWindowConFoco = () => {
    if (!planoWindow.open) {
      openPlanoWindow();
      return;
    }
    if (planoWindow.minimized) toggleMinimizePlanoWindow();
    bringPlanoWindowToFront();
  };

  const abrirHudConfigConFoco = () => {
    if (!hudConfigWindow.open) {
      openHudConfigWindow();
      return;
    }
    if (hudConfigWindow.minimized) toggleMinimizeHudConfigWindow();
    bringHudConfigWindowToFront();
  };

  const abrirMonitorMetricasConFoco = () => {
    if (!monitorMetricasWindow.open) {
      openMonitorMetricasWindow();
      return;
    }
    if (monitorMetricasWindow.minimized) toggleMinimizeMonitorMetricasWindow();
    bringMonitorMetricasWindowToFront();
  };

  const abrirMonitorEventosConFoco = () => {
    if (!monitorEventosWindow.open) {
      openMonitorEventosWindow();
      return;
    }
    if (monitorEventosWindow.minimized) toggleMinimizeMonitorEventosWindow();
    bringMonitorEventosWindowToFront();
  };

  // Ventanas minimizadas
  const minimizedNotepads = openNotepads.filter((np) => np.minimized);
  const minimizedWindows: MinimizableWindow[] = [
    ...minimizedNotepads.map((np) => ({
      type: "notepad" as const,
      id: np.id,
      title: np.config.title,
    })),
    ...(nuclearMap.open && nuclearMap.minimized
      ? [{ type: "nuclearMap" as const, title: "Mapa Nuclear" }]
      : []),
    ...(threeDWindow.open && threeDWindow.minimized
      ? [{ type: "threeD" as const, title: "Animación 3D" }]
      : []),
    ...(planoWindow.open && planoWindow.minimized
      ? [{ type: "plano" as const, title: "Plano Cyberdyne" }]
      : []),
    ...(hudConfigWindow.open && hudConfigWindow.minimized
      ? [{ type: "hudConfig" as const, title: "Config. HUD" }]
      : []),
    ...(monitorMetricasWindow.open && monitorMetricasWindow.minimized
      ? [{ type: "monitorMetricas" as const, title: "Métricas" }]
      : []),
    ...(monitorEventosWindow.open && monitorEventosWindow.minimized
      ? [{ type: "monitorEventos" as const, title: "Eventos" }]
      : []),
  ];

  return (
    <div className="desktop">
      <div className="glitch-wrapper">
        <div className="desktop-icons">
          {notepadConfigs.map((config) => (
            <div
              key={config.id}
              className="icon"
              onDoubleClick={() => openNotepad(config)}
            >
              <Image
                src="./notepad.svg"
                alt={config.title}
                width={64}
                height={64}
              />
              <span>{config.title}</span>
            </div>
          ))}

          <div className="icon" onClick={openThreeDWindow}>
            <Image
              src="./papelera.svg"
              alt="Animación 3D"
              width={64}
              height={64}
            />
            <span>Animación 3D</span>
          </div>

          <div className="icon" onDoubleClick={openNuclearMap}>
            <Image
              src="./explorer.svg"
              alt="Mapa Nuclear"
              width={64}
              height={64}
            />
            <span>Mapa Nuclear</span>
          </div>

          <div className="icon" onDoubleClick={openPlanoWindow}>
            <Image
              src="./mi pc.svg"
              alt="Plano Cyberdyne"
              width={64}
              height={64}
            />
            <span>Plano Cyberdyne</span>
          </div>

          <div className="icon" onDoubleClick={openHudConfigWindow}>
            <Image
              src="./configure.svg"
              alt="Configuración del HUD"
              width={64}
              height={64}
            />
            <span>Config. HUD</span>
          </div>

          <div className="icon" onDoubleClick={openMonitorMetricasWindow}>
            <Image
              src="./metricas.svg"
              alt="Monitor de métricas"
              width={64}
              height={64}
            />
            <span>Métricas</span>
          </div>

          <div className="icon" onDoubleClick={openMonitorEventosWindow}>
            <Image
              src="./Buscador-inicio.svg"
              alt="Monitor de eventos"
              width={64}
              height={64}
            />
            <span>Eventos</span>
          </div>
        </div>

        {/* Logo Skynet arriba a la derecha */}
        <Image
          src="./skynet logo.png"
          alt="Skynet Logo"
          className="skynet-logo"
          width={200}
          height={100}
        />

        {/* Modelo 3D del Plasma Rifle */}
        <div className="weapon-canvas-wrapper">
          <Canvas>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <PlasmaRifleModel />
          </Canvas>
        </div>

        {/* Ventanas */}
        {nuclearMap.open && (
          <NuclearMapWindow
            onClose={closeNuclearMap}
            minimized={nuclearMap.minimized}
            onToggleMinimize={toggleMinimizeNuclearMap}
            onFocus={bringNuclearMapToFront}
            zIndex={nuclearMap.zIndex}
            title="Mapa Nuclear"
            onExplosionCritica={({ ciudad, lineaId }) => {
              emitirEventoCritico({
                tipo: "EXPLOSION_MAPA",
                mensaje: `Impacto en ${ciudad} (trayectoria ${lineaId})`,
                origen: "Mapa nuclear",
              });
            }}
          />
        )}
        {openNotepads.map((np) => (
          <NotepadWindow
            key={np.id}
            notepadId={np.id}
            text={np.config.description}
            title={np.config.title}
            onClose={() => closeNotepad(np.id)}
            minimized={np.minimized}
            onToggleMinimize={() => toggleMinimizeNotepad(np.id)}
            onFocus={() => bringNotepadToFront(np.id)}
            zIndex={np.zIndex}
          />
        ))}
        {threeDWindow.open && (
          <Notepad3DWindow
            title="Animación 3D"
            onClose={closeThreeDWindow}
            minimized={threeDWindow.minimized}
            onToggleMinimize={toggleMinimizeThreeDWindow}
            onFocus={bringThreeDWindowToFront}
            zIndex={threeDWindow.zIndex}
          />
        )}
        {planoWindow.open && (
          <PlanoWindow
            title="Plano Cyberdyne"
            onClose={closePlanoWindow}
            minimized={planoWindow.minimized}
            onToggleMinimize={toggleMinimizePlanoWindow}
            onFocus={bringPlanoWindowToFront}
            zIndex={planoWindow.zIndex}
            onNuevaAlarmaCritica={(codigo) => {
              emitirEventoCritico({
                tipo: "ALARMA_PLANO",
                mensaje: `Sector ${codigo} en alarma`,
                origen: "Plano Cyberdyne",
              });
            }}
          />
        )}
        {hudConfigWindow.open && (
          <VentanaConfiguracionHud
            title="CONFIGURACIÓN DEL HUD"
            onClose={closeHudConfigWindow}
            minimized={hudConfigWindow.minimized}
            onToggleMinimize={toggleMinimizeHudConfigWindow}
            onFocus={bringHudConfigWindowToFront}
            zIndex={hudConfigWindow.zIndex}
          />
        )}
        {monitorMetricasWindow.open && (
          <VentanaMonitorMetricas
            onClose={closeMonitorMetricasWindow}
            minimized={monitorMetricasWindow.minimized}
            onToggleMinimize={toggleMinimizeMonitorMetricasWindow}
            onFocus={bringMonitorMetricasWindowToFront}
            zIndex={monitorMetricasWindow.zIndex}
          />
        )}
        {monitorEventosWindow.open && (
          <VentanaMonitorEventos
            onClose={closeMonitorEventosWindow}
            minimized={monitorEventosWindow.minimized}
            onToggleMinimize={toggleMinimizeMonitorEventosWindow}
            onFocus={bringMonitorEventosWindowToFront}
            zIndex={monitorEventosWindow.zIndex}
          />
        )}
      </div>

      <HudOverlayAlerta />

      <Taskbar
        minimizedWindows={minimizedWindows}
        toggleMinimizeNotepad={toggleMinimizeNotepad}
        toggleMinimizeNuclearMap={toggleMinimizeNuclearMap}
        toggleMinimizeThreeDWindow={toggleMinimizeThreeDWindow}
        toggleMinimizePlanoWindow={toggleMinimizePlanoWindow}
        toggleMinimizeHudConfig={toggleMinimizeHudConfigWindow}
        toggleMinimizeMonitorMetricas={toggleMinimizeMonitorMetricasWindow}
        toggleMinimizeMonitorEventos={toggleMinimizeMonitorEventosWindow}
        onAbrirNotepad={abrirNotepadConFoco}
        onAbrirNuclearMap={abrirNuclearMapConFoco}
        onAbrirThreeDWindow={abrirThreeDWindowConFoco}
        onAbrirPlanoWindow={abrirPlanoWindowConFoco}
        onAbrirHudConfig={abrirHudConfigConFoco}
        onAbrirMonitorMetricas={abrirMonitorMetricasConFoco}
        onAbrirMonitorEventos={abrirMonitorEventosConFoco}
      />
    </div>
  );
};

export default function MainPageClient() {
  // Fases: 'boot', 'login' o 'dashboard'
  const [phase, setPhase] = useState<"boot" | "login" | "dashboard">("boot");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const targetUsername = "Dr. Miles Bennett Dyson";

  useEffect(() => {
    const timer = setTimeout(() => setPhase("login"), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("authenticated", "true");
    await desbloquearAudioUsuario();
    setPhase("dashboard");
  };

  const handleUsernameKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault();
    if (username.length < targetUsername.length) {
      const nextLetter = targetUsername.charAt(username.length);
      setUsername(username + nextLetter);
    }
  };

  if (phase === "boot") return <BootScreen />;

  if (phase === "login") {
    return (
      <div className="login-page">
        <div className="grid-texture">
          <div className="login-container">
            <Image
              src="./cyberdyne.png"
              alt="Skynet Logo"
              className="login-logo"
              width={200}
              height={200}
            />
            <div className="glitch-wrapper">
              <div className="login-wrapper">
                <div className="login-card">
                  <form onSubmit={handleLogin}>
                    <div className="dotted-container">
                      <div className="login-field">
                        <input
                          type="text"
                          className="login-input"
                          value={username}
                          readOnly
                          onKeyDown={handleUsernameKeyDown}
                        />
                        <label className="login-label">username</label>
                      </div>
                      <div className="login-field">
                        <input
                          type="password"
                          className="login-input"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <label className="login-label">password</label>
                      </div>
                    </div>
                    <button type="submit" className="login-button">
                      ENTER
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "dashboard") {
    return (
      <HudAlertProvider>
        <Dashboard />
      </HudAlertProvider>
    );
  }

  return null;
}


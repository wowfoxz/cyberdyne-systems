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
import { Canvas } from "@react-three/fiber";

// Componente Dashboard unificado
const Dashboard = () => {
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

  type MinimizableWindow =
    | { type: "notepad"; id: number; title: string }
    | { type: "nuclearMap"; title: string }
    | { type: "threeD"; title: string }
    | { type: "plano"; title: string };

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
          />
        )}
        {openNotepads.map((np) => (
          <NotepadWindow
            key={np.id}
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
          />
        )}
      </div>

      <Taskbar
        minimizedWindows={minimizedWindows}
        toggleMinimizeNotepad={toggleMinimizeNotepad}
        toggleMinimizeNuclearMap={toggleMinimizeNuclearMap}
        toggleMinimizeThreeDWindow={toggleMinimizeThreeDWindow}
        toggleMinimizePlanoWindow={toggleMinimizePlanoWindow}
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("authenticated", "true");
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

  if (phase === "dashboard") return <Dashboard />;

  return null;
}


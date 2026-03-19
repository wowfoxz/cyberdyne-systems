"use client";
export const dynamic = 'force-static';
import { useState } from "react";
import NotepadWindow from "@/components/ventana_nota/NotepadWindow";
import Notepad3DWindow from "@/components/ventana_3d/Notepad3DWindow"; // Nuevo componente para la ventana 3D
import NuclearMapWindow from "@/components/map/NuclearMapWindow";
import PlanoWindow from "@/components/ventana_plano/PlanoWindow"; // Importamos la nueva ventana
import { notepadConfigs, NotepadConfig } from "@/config/notepadConfig";
import Taskbar from "@/components/dashboard/Taskbar";
import PlasmaRifleModel from "@/components/ventana_3d/modelos_3d/PlasmaRifleModel";
import { Canvas } from "@react-three/fiber";
import Image from "next/image";

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

export default function Dashboard() {
  // Colección de Notepads abiertos
  const [openNotepads, setOpenNotepads] = useState<OpenNotepad[]>([]);
  // Estado para la ventana Nuclear Map
  const [nuclearMap, setNuclearMap] = useState<NuclearMapState>({
    open: false,
    minimized: false,
    zIndex: 1000,
  });
  // Estado para la ventana 3D
  const [threeDWindow, setThreeDWindow] = useState<ThreeDWindowState>({
    open: false,
    minimized: false,
    zIndex: 1000,
  });
  // Estado para la ventana Plano
  const [planoWindow, setPlanoWindow] = useState<PlanoWindowState>({
    open: false,
    minimized: false,
    zIndex: 1000,
  });
  // Manejar el zIndex máximo para traer ventanas al frente
  const [maxZIndex, setMaxZIndex] = useState(1000);

  /* ------------------  Funciones para NOTEPAD ------------------ */
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

  /* ------------------  Funciones para MAPA NUCLEAR ------------------ */
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

  /* ------------------  Funciones para VENTANA 3D ------------------ */
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

  /* ------------------  Funciones para VENTANA PLANO ------------------ */
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

  // Filtramos las ventanas minimizadas (Notepads, Mapa Nuclear, 3D y Plano)
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
        {/* Contenedor de iconos */}
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
          width={200} // Ajusta según necesites
          height={100} // Ajusta según necesites
        />

        {/* Modelo 3D del rifle de plasma abajo a la derecha */}
        {/* Modelo 3D del rifle de plasma abajo a la derecha */}
        <div className="weapon-canvas-wrapper">
          <Canvas>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <PlasmaRifleModel />
          </Canvas>
        </div>

        {/* Ventana Mapa Nuclear */}
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

        {/* Ventanas Notepad */}
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

        {/* Ventana 3D */}
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

        {/* Ventana Plano */}
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

      {/* Barra de Tareas */}
      <Taskbar
        minimizedWindows={minimizedWindows}
        toggleMinimizeNotepad={toggleMinimizeNotepad}
        toggleMinimizeNuclearMap={toggleMinimizeNuclearMap}
        toggleMinimizeThreeDWindow={toggleMinimizeThreeDWindow}
        toggleMinimizePlanoWindow={toggleMinimizePlanoWindow}
      />
    </div>
  );
}

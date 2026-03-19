"use client";

import { CSSProperties, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import DraggableResizableWindow from "@/components/DraggableResizableWindow";
import AnimatedConsoleText from "@/components/ventana_3d/AnimatedConsoleText";
import AnimatedConsoleTextStage3 from "@/components/ventana_3d/AnimatedConsoleTextStage3";
import AnimatedCodeText from "@/components/ventana_3d/AnimatedCodeText";
import SkynetScreen from "@/components/ventana_3d/modelos_2d/SkynetScreen";
import T800ArmModel from "@/components/ventana_3d/modelos_3d/T800ArmModel";
import CPUModel from "@/components/ventana_3d/modelos_3d/CPUModel";
import CyberdyneLogo from "@/components/ventana_3d/modelos_2d/CyberdyneLogo";
import TerminatorModel from "@/components/ventana_3d/modelos_3d/TerminatorModel";
import FinalScreen from "@/components/ventana_3d/modelos_2d/FinalScreen";

interface Notepad3DWindowProps {
  title?: string;
  onClose: () => void;
  minimized: boolean;
  onToggleMinimize: () => void;
  onFocus: () => void;
  zIndex: number;
}

const containerStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  height: "100%",
  backgroundColor: "#000",
  color: "#00FF00",
  fontFamily: "monospace",
  overflow: "hidden",
};

const textBlockStyle: CSSProperties = {
  margin: "20px",
  whiteSpace: "pre-line",
  lineHeight: "1.2em",
};

const canvasContainerStyle: CSSProperties = {
  width: "40%",
  height: "80%",
  position: "absolute",
  bottom: 0,
  right: 0,
  boxSizing: "border-box",
  filter: "brightness(2) contrast(1.2) hue-rotate(260deg)",
};

const centerCanvasContainerStyle: CSSProperties = {
  width: "60%",
  height: "60%",
  position: "absolute",
  bottom: "10%",
  left: "20%",
  boxSizing: "border-box",
  filter: "brightness(2) contrast(1.2) hue-rotate(260deg)",
};

const terminatorCanvasStyle: CSSProperties = {
  width: "80%",
  height: "60%",
  position: "absolute",
  bottom: "10%",
  left: "10%",
  boxSizing: "border-box",
  filter: "brightness(0.5) contrast(5) hue-rotate(260deg)",
};

export default function Notepad3DWindow({
  title = "Notepad 3D",
  onClose,
  minimized,
  onToggleMinimize,
  onFocus,
  zIndex,
}: Notepad3DWindowProps) {
  // simulationStage: "phase1" | "phase2" | "phase3"
  const [simulationStage, setSimulationStage] = useState<"phase1" | "phase2" | "phase3">("phase1");
  const [transition, setTransition] = useState(false);
  const [finished, setFinished] = useState(false);
  // Estado para controlar la transición en fase 3:
  const [showTerminator, setShowTerminator] = useState(false);

  // Para fases 1 y 2 se usa el AnimatedConsoleText que ya tienes
  const handleSimulationComplete = () => {
    setTransition(true);
    setTimeout(() => {
      if (simulationStage === "phase1") {
        setSimulationStage("phase2");
      } else if (simulationStage === "phase2") {
        setSimulationStage("phase3");
      }
      setTransition(false);
    }, 2000);
  };

  // Para fase 3, al finalizar la animación, esperamos 3 segundos y finalizamos
  const handleStage3Complete = () => {
    setTimeout(() => {
      setFinished(true);
    }, 3000);
  };

  if (finished) {
    return (
      <DraggableResizableWindow
        title={title}
        minimized={minimized}
        onToggleMinimize={onToggleMinimize}
        onClose={onClose}
        onFocus={onFocus}
        zIndex={zIndex}
        initialWidth={700}
        initialHeight={560}
      >
        <FinalScreen />
      </DraggableResizableWindow>
    );
  }

  if (transition) {
    return (
      <DraggableResizableWindow
        title={title}
        minimized={minimized}
        onToggleMinimize={onToggleMinimize}
        onClose={onClose}
        onFocus={onFocus}
        zIndex={zIndex}
        initialWidth={700}
        initialHeight={560}
      >
        <SkynetScreen />
      </DraggableResizableWindow>
    );
  }

  let content;
  if (simulationStage === "phase1" || simulationStage === "phase2") {
    content = (
      <>
        <CyberdyneLogo />
        <div style={textBlockStyle}>
          <AnimatedConsoleText onComplete={handleSimulationComplete} />
        </div>
        <div style={textBlockStyle}>
          <AnimatedCodeText
            text={
              simulationStage === "phase1"
                ? `#include <skynet.h>
#include <T800_Arm.h>
if (T800_Arm.isReady()) 
{ goto iniciar_secuencia_terminacion; }
powerUnits=(energiaDisponible-POTENCIA_MINIMA)/FACTOR_OPERACIONAL;
powerUnits=powerUnits ?: 1;
skynetModule = asignarMemoria(sizeof(ModuloSkynet) - powerUnits - 
sizeof(datosAdicionales));
if (!skynetModule)
    return FALLO_CRITICO;
skynetModule->integridadDeBrazo = energiaDisponible;
skynetModule->nucleosActivos = powerUnits;
atomic_set(skynetModule->usoDelSistema, 1);
if (energiaDisponible <= UMBRAL_CRITICO)
    skynetModule->moduloPrincipal = skynetModule->moduloRespaldo;
else {
    for (int i = 0; i < powerUnits; i++) {
         objetivo = obtenerObjetivo(i);
         iniciarProtocoloDestruccion(objetivo);}}`
                : `#include <skynet.h>
#include <T800_CPU.h>
if (T800_Arm.isReady()) 
{ goto iniciar_secuencia_terminacion; }
powerUnits=(energiaDisponible-POTENCIA_MINIMA)/FACTOR_OPERACIONAL;
powerUnits=powerUnits ?: 1;
skynetModule = asignarMemoria(sizeof(ModuloSkynet) - powerUnits - 
sizeof(datosAdicionales));
if (!skynetModule)
    return FALLO_CRITICO;
skynetModule->integridadDeBrazo = energiaDisponible;
skynetModule->nucleosActivos = powerUnits;
atomic_set(skynetModule->usoDelSistema, 1);
if (energiaDisponible <= UMBRAL_CRITICO)
    skynetModule->moduloPrincipal = skynetModule->moduloRespaldo;
else {
    for (int i = 0; i < powerUnits; i++) {
         objetivo = obtenerObjetivo(i);
         iniciarProtocoloDestruccion(objetivo);}}`
            }
          />
        </div>
        <div style={canvasContainerStyle}>
          <Canvas>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            {simulationStage === "phase1" ? <T800ArmModel /> : <CPUModel />}
            <OrbitControls />
          </Canvas>
        </div>
      </>
    );
  } else if (simulationStage === "phase3") {
    content = (
      <>
        <CyberdyneLogo />
        {/* Canvas para los modelos T800ArmModel y CPUModel */}
        {!showTerminator && (
          <div style={centerCanvasContainerStyle}>
            <Canvas>
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
              {/* Se muestran ambos modelos; puedes ajustar sus posiciones para separarlos */}
              <T800ArmModel opacity={1} />
              <CPUModel opacity={1} />
              <OrbitControls />
            </Canvas>
          </div>
        )}
        {/* Canvas exclusivo para TerminatorModel */}
        {showTerminator && (
          <div style={terminatorCanvasStyle}>
            <Canvas>
              <ambientLight intensity={0.1} />
              <directionalLight position={[1, 1, 1]} intensity={0.5} />
              <TerminatorModel opacity={1} position={[0, -1, 0]} />
              <OrbitControls />
            </Canvas>
          </div>
        )}
        <div style={textBlockStyle}>
          <AnimatedConsoleTextStage3
            onComplete={handleStage3Complete}
            onProgress={(progress, stepIndex) => {
              // Suponiendo que el paso 5 es "Compiling"
              if (stepIndex === 6 ) {
                setShowTerminator(true);
              }
            }}
          />
        </div>
      </>
    );
  }

  return (
    <DraggableResizableWindow
      title={title}
      minimized={minimized}
      onToggleMinimize={onToggleMinimize}
      onClose={onClose}
      onFocus={onFocus}
      zIndex={zIndex}
      initialWidth={700}
      initialHeight={560}
    >
      <div style={containerStyle}>{content}</div>
    </DraggableResizableWindow>
  );
}

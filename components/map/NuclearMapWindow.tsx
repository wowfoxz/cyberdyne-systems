"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import DraggableResizableWindow from "@/components/DraggableResizableWindow";

interface NuclearMapWindowProps {
  onClose: () => void;
  minimized: boolean;
  onToggleMinimize: () => void;
  onFocus: () => void;
  zIndex: number;
  title?: string;
}

const NuclearMapContent = dynamic(() => import("./NuclearMapContent"), {
  ssr: false,
});

export default function NuclearMapWindow({
  onClose,
  minimized,
  onToggleMinimize,
  onFocus,
  zIndex,
  title = "Mapa Nuclear",
}: NuclearMapWindowProps) {
  // Estado para forzar la actualización del mapa
  const [resizeSignal, setResizeSignal] = useState(0);

  // Callback para DraggableResizableWindow
  function handleWindowResize() {
    // cada vez que cambie el tamaño => incrementamos resizeSignal
    setResizeSignal((prev) => prev + 1);
  }

  return (
    <DraggableResizableWindow
      title={title}
      minimized={minimized}
      onToggleMinimize={onToggleMinimize}
      onClose={onClose}
      onFocus={onFocus}
      zIndex={zIndex}
      initialWidth={900}
      initialHeight={500}
      onWindowResize={handleWindowResize}
    >
      <div style={{ width: "100%", height: "100%" }}>
        <NuclearMapContent resizeSignal={resizeSignal} />
      </div>
    </DraggableResizableWindow>
  );
}

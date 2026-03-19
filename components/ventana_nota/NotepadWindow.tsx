"use client";

import { useState } from "react";
import DraggableResizableWindow from "@/components/DraggableResizableWindow";

/** Texto por defecto cuando la ventana se abre sin contenido. */
const CONTENIDO_POR_DEFECTO = `CYBERDYNE SYSTEMS — BLOQUE DE NOTAS
========================================

Bienvenido al bloc de notas del sistema. Aquí puedes anotar información, instrucciones o registros de misión.

CONTROLES Y VENTANAS:
• Mapa nuclear: abre la vista de plataformas. Pulsa [Y] para lanzar simulación de misiles.
• Ventana 3D: visualización de modelos y animaciones.
• Plano: navegación por instalaciones.

Este documento es editable. Escribe o pega aquí el contenido que necesites.`;

interface NotepadWindowProps {
  text: string;
  title?: string;
  onClose: () => void;
  minimized: boolean;
  onToggleMinimize: () => void;
  onFocus: () => void;
  zIndex: number;
}

export default function NotepadWindow({
  text,
  title = "Notepad",
  onClose,
  minimized,
  onToggleMinimize,
  onFocus,
  zIndex,
}: NotepadWindowProps) {
  const [content, setContent] = useState(
    text?.trim() ? text : CONTENIDO_POR_DEFECTO
  );

  return (
    <DraggableResizableWindow
      title={title}
      minimized={minimized}
      onToggleMinimize={onToggleMinimize}
      onClose={onClose}
      onFocus={onFocus}
      zIndex={zIndex}
      initialWidth={400}
      initialHeight={300}
    >
      <textarea
        style={{  width: "100%",
    height: "100%",
    border: "none",
    outline: "none",
    backgroundColor: "#000", // o el color que prefieras
    color: "#00FF00" }}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
    </DraggableResizableWindow>
  );
}

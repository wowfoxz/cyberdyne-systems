"use client";

import { useHudAlert } from "@/context/HudAlertProvider";

/** Capa fija de alerta crítica alimentada por el contexto HUD. */
export default function HudOverlayAlerta() {
  const { overlayAlertaVisible, descartarOverlayAlerta } = useHudAlert();

  if (!overlayAlertaVisible) return null;

  return (
    <div className="hud-capa-alerta" role="alertdialog" aria-live="assertive">
      <div className="hud-capa-alerta__panel">
        <div className="hud-capa-alerta__titulo">ALERTA CRÍTICA</div>
        <p className="hud-capa-alerta__texto">
          Se ha registrado un evento crítico en el sistema. Revise el monitor
          de eventos y el plano de instalaciones.
        </p>
        <button
          type="button"
          className="hud-capa-alerta__cerrar"
          onClick={descartarOverlayAlerta}
        >
          Descartar aviso
        </button>
      </div>
    </div>
  );
}

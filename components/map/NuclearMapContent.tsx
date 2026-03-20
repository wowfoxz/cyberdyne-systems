"use client";

import { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";
import dynamic from "next/dynamic";
import { nuclearPlatforms } from "@/config/nuclearPlatforms";
import { useMap } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Importaciones dinámicas (sin SSR)
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
);
const Circle = dynamic(
  () => import("react-leaflet").then((mod) => mod.Circle),
  { ssr: false }
);

interface NuclearMapContentProps {
  resizeSignal: number;
  /** Al generarse una explosión en el mapa (impacto). */
  onExplosionCritica?: (payload: {
    lineaId: string;
    ciudad: string;
    plataformaId: number;
  }) => void;
}

/** Estructura para cada trayectoria (misil). */
interface MissileLine {
  id: string; // Ej. "3-15"
  fromId: number; // Id de la plataforma origen
  toId: number; // Id de la plataforma destino
  points: [number, number][]; // Puntos calculados con la curva
}

/** Estructura para cada explosión (onda expansiva). */
interface Explosion {
  id: string; // Para key
  position: [number, number]; // Dónde explota
  startTime: number; // Momento en que se generó la explosión
}

/** Bézier forzando la curva "al norte". */
function getCurvedLineAllNorth(
  start: [number, number],
  end: [number, number],
  curvature = 0.2,
  numPoints = 150
): [number, number][] {
  const mid: [number, number] = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2,
  ];
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const dist = Math.sqrt(dx * dx + dy * dy);
  const control: [number, number] = [mid[0] + curvature * dist, mid[1]];
  const points: [number, number][] = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const x =
      (1 - t) ** 2 * start[0] +
      2 * (1 - t) * t * control[0] +
      t ** 2 * end[0];
    const y =
      (1 - t) ** 2 * start[1] +
      2 * (1 - t) * t * control[1] +
      t ** 2 * end[1];
    points.push([x, y]);
  }
  return points;
}

export default function NuclearMapContent({
  resizeSignal,
  onExplosionCritica,
}: NuclearMapContentProps) {
  // Configurar iconos por defecto de Leaflet
  delete (L.Icon.Default.prototype as Partial<{ _getIconUrl: () => string }>)
    ._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  });

  // Icono personalizado: un punto negro
  const nuclearIcon = L.divIcon({
    className: "",
    html: '<div style="width:8px;height:8px;background:#00FF00;border-radius:50%;"></div>',
    iconSize: [8, 8],
    iconAnchor: [4, 4],
  });

  // Almacena trayectorias
  const [missiles, setMissiles] = useState<MissileLine[]>([]);
  // Indica si está corriendo la animación
  const [animate, setAnimate] = useState(false);
  // Avanza de 0 a 2
  const [progress, setProgress] = useState(0);
  // Explosiones (ondas expansivas)
  const [explosions, setExplosions] = useState<Explosion[]>([]);

  // Capturar tecla "y" para iniciar
  useEffect(() => {
    function generateRandomMissiles() {
      const newLines: MissileLine[] = [];
      for (let i = 0; i < nuclearPlatforms.length; i++) {
        const from = nuclearPlatforms[i];
        const others = nuclearPlatforms.filter((_, idx) => idx !== i);
        const shuffled = [...others].sort(() => 0.5 - Math.random());
        const chosenDestinations = shuffled.slice(0, 2);
        chosenDestinations.forEach((dest) => {
          const pts = getCurvedLineAllNorth(
            from.position,
            dest.position,
            0.2,
            150
          );
          newLines.push({
            id: `${from.id}-${dest.id}`,
            fromId: from.id,
            toId: dest.id,
            points: pts,
          });
        });
      }
      setMissiles(newLines);
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "y") {
        generateRandomMissiles();
        setAnimate(true);
        setProgress(0);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Si animate=true, progress va de 0..2 en 3s
  useEffect(() => {
    if (animate) {
      const durationMs = 6000;
      const steps = 60;
      const stepTime = durationMs / steps;
      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const newProg = (currentStep / steps) * 2; // 0..2
        setProgress(newProg);
        if (newProg >= 2) {
          clearInterval(timer);
          setAnimate(false);
        }
      }, stepTime);
      return () => clearInterval(timer);
    }
  }, [animate]);

  // Al pasar progress=1 => llegar al destino => onda expansiva
  useEffect(() => {
    // Solo queremos disparar esto cuando EXACTAMENTE cruzamos 1 (no en cada render)
    // Para simplificar, checamos si progress >=1 && <1.05
    if (progress >= 1 && progress < 1.05) {
      // Para cada línea, creamos explosión en su destino (si no existe ya).
      missiles.forEach((line) => {
        // Id único para la explosión
        const explosionId = line.id + "-boom";
        // Revisamos si ya existe
        const exExists = explosions.find((ex) => ex.id === explosionId);
        if (!exExists) {
          // Buscamos la plataforma destino
          const dest = nuclearPlatforms.find((p) => p.id === line.toId);
          if (dest) {
            onExplosionCritica?.({
              lineaId: line.id,
              ciudad: dest.name,
              plataformaId: dest.id,
            });
            const newExplosion: Explosion = {
              id: explosionId,
              position: dest.position,
              startTime: Date.now(),
            };
            setExplosions((prev) => [...prev, newExplosion]);
          }
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, onExplosionCritica]);

  // Borramos explosiones antiguas
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      // cada explosión dura 1s
      const keep = explosions.filter((ex) => now - ex.startTime < 1000);
      if (keep.length !== explosions.length) {
        setExplosions(keep);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [explosions]);

  function InvalidateOnResize({ signal }: { signal: number }) {
    const map = useMap();

    useEffect(() => {
      map.invalidateSize();
    }, [map, signal]);

    return null; // No renderiza nada
  }

  /** Retorna la porción de la línea según progress (0..2).
   *  - 0..1: crece desde el origen
   *  - 1..2: desaparece desde el origen
   */
  function getLineToDisplay(points: [number, number][]) {
    const total = points.length;
    if (progress <= 1) {
      // fase 1: 0..1 => line grows from start to end
      const n = Math.max(2, Math.ceil(progress * total));
      return points.slice(0, n);
    } else {
      // fase 2: 1..2 => line shrinks from start
      // subProg 1..2 => factor 0..1
      const factor = progress - 1;
      const n = Math.max(2, Math.ceil((1 - factor) * total));
      // Removemos desde el inicio => slice(total-n, total)
      // De modo que "desaparezca" desde el origen
      return points.slice(total - n, total);
    }
  }

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      <MapContainer
        center={[20, 0] as [number, number]}
        zoom={2}
        style={{ height: "100%", width: "100%" }}
      >
        {/* Llamamos a nuestro subcomponente */}
        <InvalidateOnResize signal={resizeSignal} />
        <TileLayer
          url="https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://carto.com/attributions">CartoDB Dark Matter</a>'
        />

        {/* Marcadores */}
        {nuclearPlatforms.map((platform) => (
          <Marker
            key={platform.id}
            position={platform.position}
            icon={nuclearIcon}
          />
        ))}

        {/* Misiles */}
        {missiles.map((line) => {
          const segs = getLineToDisplay(line.points);
          return (
            <Polyline
              key={line.id}
              positions={segs}
              pathOptions={{ color: "#00FF00", weight: 3 }}
            />
          );
        })}

        {/* Explosiones (onda expansiva) */}
        {explosions.map((ex) => {
          const elapsed = Date.now() - ex.startTime; // 0..1000ms
          const frac = elapsed / 1000; // 0..1
          const radius = frac * 800000; // Crece a 50km
          const opacity = 1 - frac;
          return (
            <Circle
              key={ex.id}
              center={ex.position}
              radius={radius}
              pathOptions={{
                color: "#ff0000",
                fillColor: "#ff0000",
                fillOpacity: opacity,
              }}
              opacity={opacity}
            />
          );
        })}
      </MapContainer>
      <div className="map-overlay" />
      {/* Aviso de tecla para lanzar misiles */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          zIndex: 1000,
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          color: "#00FF00",
          padding: "6px 10px",
          fontSize: "12px",
          fontWeight: 600,
          borderRadius: 4,
          pointerEvents: "none",
          boxShadow: "0 0 8px rgba(0, 255, 0, 0.6)",
        }}
        aria-label="Tecla para lanzar misiles"
      >
        Pulsa{" "}
        <kbd
          style={{
            borderRadius: 3,
            border: "1px solid #00FF00",
            padding: "2px 6px",
            fontFamily: "monospace",
            backgroundColor: "rgba(0, 0, 0, 0.9)",
          }}
        >
          Y
        </kbd>{" "}
        para lanzar los misiles
      </div>
    </div>
  );
}

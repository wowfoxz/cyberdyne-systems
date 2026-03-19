import React, { useEffect, useRef, useState } from "react";
import DraggableResizableWindow from "@/components/DraggableResizableWindow";
import { planoSections } from "@/config/planoSections";
import { alarmChains } from "@/config/alarmChains";
import Image from "next/image";
interface PlanoWindowProps {
  onClose: () => void;
  onToggleMinimize: () => void;
  onFocus: () => void;
  minimized: boolean;
  zIndex: number;
  title: string;
}

const PlanoWindow: React.FC<PlanoWindowProps> = ({
  onClose,
  onToggleMinimize,
  onFocus,
  minimized,
  zIndex,
  title,
}) => {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  // Alarmas activas: array de códigos (pueden repetirse)
  const [activeAlarms, setActiveAlarms] = useState<string[]>([]);
  // Coordenadas escaladas de las alarmas activas, por código
  const [alarmsScaledCoords, setAlarmsScaledCoords] = useState<Record<string, { x: number; y: number }>>({});

  // Cargar el SVG desde public/plano_2.svg
  useEffect(() => {
    fetch("./plano_2.svg")
      .then((response) => response.text())
      .then((text) => setSvgContent(text))
      .catch((error) => console.error("Error al cargar el SVG:", error));
  }, []);
  const chainActivatedRef = useRef(false);
  // Seleccionar una cadena aleatoria y activarla progresivamente (cada 2 segundos)
  useEffect(() => {
    if (!chainActivatedRef.current && alarmChains.length > 0) {
      chainActivatedRef.current = true;
      const randomChain = alarmChains[Math.floor(Math.random() * alarmChains.length)];
      // Retraso inicial de 3 segundos antes de comenzar la cadena
      setTimeout(() => {
        const activateChain = (i: number) => {
          if (i < randomChain.length) {
            setActiveAlarms((prev) => [...prev, randomChain[i]]);
            setTimeout(() => {
              activateChain(i + 1);
            }, 2000);
          }
        };
        activateChain(0);
      }, 3000);
    }
  }, []);
  

  // Función para recalcular las coordenadas escaladas de las alarmas activas
const recalcAlarmsScaledCoordinates = () => {
  if (!svgContainerRef.current) return;
  const svgElement = svgContainerRef.current.querySelector("svg");
  if (!svgElement) return;
  const rect = svgElement.getBoundingClientRect();
  // viewBox definido en el SVG
  const viewBoxWidth = 929.02;
  const viewBoxHeight = 644.31;
  const scaleX = rect.width / viewBoxWidth;
  const scaleY = rect.height / viewBoxHeight;
  const newCoords: Record<string, { x: number; y: number }> = {};  // Ahora es const
  const textElements = svgContainerRef.current.querySelectorAll("text.cls-2");
  activeAlarms.forEach((code) => {
    textElements.forEach((el) => {
      if (el.textContent && el.textContent.trim() === code) {
        const transform = el.getAttribute("transform");
        if (transform) {
          const values = transform
            .replace("translate(", "")
            .replace(")", "")
            .split(/[\s,]+/);
          if (values.length >= 2) {
            const viewX = parseFloat(values[0]);
            const viewY = parseFloat(values[1]);
            newCoords[code] = { x: viewX * scaleX, y: viewY * scaleY };
          }
        }
      }
    });
  });
  setAlarmsScaledCoords(newCoords);
};

// Recalcular al cargar o cuando cambien el SVG o las alarmas, y en resize
useEffect(() => {
  recalcAlarmsScaledCoordinates();
  window.addEventListener("resize", recalcAlarmsScaledCoordinates);
  return () => window.removeEventListener("resize", recalcAlarmsScaledCoordinates);
}, [svgContent, activeAlarms]);

// (Opcional) ResizeObserver para detectar cambios en el contenedor
useEffect(() => {
  if (svgContainerRef.current) {
    const observer = new ResizeObserver(() => {
      recalcAlarmsScaledCoordinates();
    });
    observer.observe(svgContainerRef.current);
    return () => {
      observer.disconnect();
    };
  }
}, [svgContainerRef, activeAlarms]);


  // Agrupar secciones para la lista en dos columnas
  const groupedSections = planoSections.reduce<Record<string, string[]>>(
    (acc, section) => {
      if (!acc[section.name]) {
        acc[section.name] = [];
      }
      acc[section.name].push(section.id);
      return acc;
    },
    {}
  );
  const groupedArray = Object.entries(groupedSections);
  const half = Math.ceil(groupedArray.length / 2);
  const leftColumn = groupedArray.slice(0, half);
  const rightColumn = groupedArray.slice(half);

  return (
    <div className="plano-window">
      <DraggableResizableWindow
        onClose={onClose}
        onToggleMinimize={onToggleMinimize}
        onFocus={onFocus}
        minimized={minimized}
        zIndex={zIndex}
        title={title}
        initialWidth={1200}
        initialHeight={700}
        maximizeOnMount={true}
      >
        <div className="plano-content">
          {/* Sección izquierda: contenedor del SVG */}
          <div className="plano-image" style={{ position: "relative" }}>
            <div
              ref={svgContainerRef}
              className="plano-svg-container"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
            {/* Renderizar la onda para cada alarma activa */}
            {activeAlarms.map((code, index) =>
              alarmsScaledCoords[code] ? (
                <div
                  key={`${code}-${index}`}
                  className="wave"
                  style={{
                    position: "absolute",
                    left: `${alarmsScaledCoords[code].x - 2}px`,
                    top: `${alarmsScaledCoords[code].y - 13}px`,
                  }}
                />
              ) : null
            )}
            {/* Texto ALERT */}
            {activeAlarms.length > 0 && (
              <div
                className="alert-text"
                style={{ position: "absolute", top: "60%", left: "30%" }}
              >
                ALERT
              </div>
            )}
          </div>

{/* Sección derecha: logo y lista en dos columnas */}
<div className="plano-sections-list">
  <div className="plano-sections-logo">
  <Image
      src="cyberdyne.png"
      alt="Cyberdyne Logo"
      width={120}  // Ajusta según el tamaño deseado
      height={60}  // Ajusta según el aspect ratio del logo
    />
   
  </div>
  <h2>Secciones del Plano</h2>
  <div className="two-columns">
    <div className="column">
      <ul>
        {leftColumn.map(([name, ids]) => (
          <li key={`group-${name}`}>
            {/* Contenedor para los badges */}
            <span className="id-badges">
              {ids.map((id, idx) => (
                <span
                  key={`${name}-${id}-${idx}`}
                  className={`id-badge ${
                    activeAlarms.includes(id) ? "alarm-blink" : ""
                  }`}
                >
                  {id}
                </span>
              ))}
            </span>
            {/* Contenedor para el texto */}
            <span className="section-name">- {name}</span>
          </li>
        ))}
      </ul>
    </div>

    <div className="column">
      <ul>
        {rightColumn.map(([name, ids]) => (
          <li key={`group-${name}`}>
            <span className="id-badges">
              {ids.map((id, idx) => (
                <span
                  key={`${name}-${id}-${idx}`}
                  className={`id-badge ${
                    activeAlarms.includes(id) ? "alarm-blink" : ""
                  }`}
                >
                  {id}
                </span>
              ))}
            </span>
            <span className="section-name">- {name}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
</div>


        </div>
      </DraggableResizableWindow>
    </div>
  );
};

export default PlanoWindow;

"use client";

import { useEffect, useRef, useState } from "react";
import DraggableResizableWindow from "@/components/DraggableResizableWindow";

interface VentanaVistaT800Props {
  onClose: () => void;
  minimized: boolean;
  onToggleMinimize: () => void;
  onFocus: () => void;
  zIndex: number;
  title?: string;
}

const SRC_VIDEO = "./vision-t800.mp4";

interface CuadroVideo {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Rectángulo pintado del video dentro del elemento (object-fit: contain). */
function cuadroDelVideo(video: HTMLVideoElement): CuadroVideo | null {
  const ancho = video.clientWidth;
  const alto = video.clientHeight;
  const relacionVideo = video.videoWidth / video.videoHeight;
  if (!ancho || !alto || !Number.isFinite(relacionVideo) || relacionVideo <= 0) return null;
  const relacionCaja = ancho / alto;
  if (relacionCaja > relacionVideo) {
    const height = alto;
    const width = alto * relacionVideo;
    return { left: (ancho - width) / 2, top: 0, width, height };
  }
  const width = ancho;
  const height = ancho / relacionVideo;
  return { left: 0, top: (alto - height) / 2, width, height };
}

function formatearTiempo(segundos: number) {
  if (!Number.isFinite(segundos) || segundos < 0) return "00:00";
  const total = Math.floor(segundos);
  const minutos = Math.floor(total / 60);
  const resto = total % 60;
  return `${String(minutos).padStart(2, "0")}:${String(resto).padStart(2, "0")}`;
}

export default function VentanaVistaT800({
  onClose,
  minimized,
  onToggleMinimize,
  onFocus,
  zIndex,
  title = "Test vista T800",
}: VentanaVistaT800Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const contenedorRef = useRef<HTMLDivElement | null>(null);
  const pistaRef = useRef<HTMLDivElement | null>(null);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [tiempoActual, setTiempoActual] = useState(0);
  const [duracion, setDuracion] = useState(0);
  const [volumen, setVolumen] = useState(1);
  const [silenciado, setSilenciado] = useState(false);
  const [pantallaCompleta, setPantallaCompleta] = useState(false);
  const [cuadro, setCuadro] = useState<CuadroVideo | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (minimized) {
      video.pause();
      return;
    }
    void video.play().catch(() => {
      // El navegador puede bloquear el autoplay con sonido; el visor deja el control INICIAR.
    });
  }, [minimized]);

  useEffect(() => {
    const alCambiarPantalla = () => {
      setPantallaCompleta(document.fullscreenElement === contenedorRef.current);
    };
    document.addEventListener("fullscreenchange", alCambiarPantalla);
    return () => document.removeEventListener("fullscreenchange", alCambiarPantalla);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const medir = () => {
      const siguiente = cuadroDelVideo(video);
      setCuadro((anterior) => {
        if (!siguiente) return anterior;
        if (
          anterior &&
          anterior.left === siguiente.left &&
          anterior.top === siguiente.top &&
          anterior.width === siguiente.width &&
          anterior.height === siguiente.height
        ) {
          return anterior;
        }
        return siguiente;
      });
    };
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(video);
    video.addEventListener("loadedmetadata", medir);
    return () => {
      observador.disconnect();
      video.removeEventListener("loadedmetadata", medir);
    };
  }, []);

  const alternarReproduccion = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play().catch(() => {});
      return;
    }
    video.pause();
  };

  const irAPosicion = (clientX: number) => {
    const video = videoRef.current;
    const pista = pistaRef.current;
    if (!video || !pista || !Number.isFinite(video.duration)) return;
    const rect = pista.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    video.currentTime = ratio * video.duration;
  };

  const alternarPantallaCompleta = () => {
    const contenedor = contenedorRef.current;
    if (!contenedor) return;
    if (document.fullscreenElement === contenedor) {
      void document.exitFullscreen();
      return;
    }
    void contenedor.requestFullscreen();
  };

  const porcentaje = duracion > 0 ? (tiempoActual / duracion) * 100 : 0;

  return (
    <DraggableResizableWindow
      title={title}
      minimized={minimized}
      onToggleMinimize={onToggleMinimize}
      onClose={onClose}
      onFocus={onFocus}
      zIndex={zIndex}
      initialWidth={512}
      initialHeight={362}
    >
      <div className="visor-t800" ref={contenedorRef}>
        <div className="visor-t800-pantalla">
          <video
            ref={videoRef}
            className="visor-t800-video"
            src={SRC_VIDEO}
            autoPlay
            playsInline
            disablePictureInPicture
            onClick={alternarReproduccion}
            onContextMenu={(evento) => evento.preventDefault()}
            onPlay={() => setReproduciendo(true)}
            onPause={() => setReproduciendo(false)}
            onTimeUpdate={(evento) => setTiempoActual(evento.currentTarget.currentTime)}
            onLoadedMetadata={(evento) => setDuracion(evento.currentTarget.duration)}
            onVolumeChange={(evento) => {
              setVolumen(evento.currentTarget.volume);
              setSilenciado(evento.currentTarget.muted);
            }}
          />
          {cuadro && (
            <div
              className="visor-t800-esquinas"
              style={{
                left: cuadro.left,
                top: cuadro.top,
                width: cuadro.width,
                height: cuadro.height,
              }}
            >
              <div className="visor-t800-insignia visor-t800-insignia-no">
                <img src="./cyberdyne.png" alt="" />
                <span>Skynet</span>
              </div>
              <div className="visor-t800-insignia visor-t800-insignia-ne">
                <span>Cyberdyne</span>
              </div>
              <div className="visor-t800-insignia visor-t800-insignia-so">
                <span>T-800</span>
              </div>
              <div className="visor-t800-insignia visor-t800-insignia-se">
                <span className="visor-t800-ojo" />
                <span>N.N.P.</span>
              </div>
            </div>
          )}
        </div>
        <div className="visor-t800-barra">
          <button
            type="button"
            className="visor-t800-boton"
            onClick={alternarReproduccion}
          >
            {reproduciendo ? "PAUSA" : "INICIAR"}
          </button>
          <div
            ref={pistaRef}
            className="visor-t800-pista"
            role="slider"
            aria-label="Posición del visor"
            aria-valuemin={0}
            aria-valuemax={Math.round(duracion)}
            aria-valuenow={Math.round(tiempoActual)}
            onPointerDown={(evento) => {
              evento.currentTarget.setPointerCapture(evento.pointerId);
              irAPosicion(evento.clientX);
            }}
            onPointerMove={(evento) => {
              if (evento.currentTarget.hasPointerCapture(evento.pointerId)) {
                irAPosicion(evento.clientX);
              }
            }}
          >
            <div className="visor-t800-progreso" style={{ width: `${porcentaje}%` }} />
          </div>
          <span className="visor-t800-tiempo">
            {formatearTiempo(tiempoActual)} / {formatearTiempo(duracion)}
          </span>
          <div className="visor-t800-audio">
            <button
              type="button"
              className="visor-t800-boton"
              aria-pressed={silenciado}
              onClick={() => {
                const video = videoRef.current;
                if (!video) return;
                video.muted = !video.muted;
              }}
            >
              {silenciado ? "MUDO" : "AUDIO"}
            </button>
            <input
              className="visor-t800-volumen"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={silenciado ? 0 : volumen}
              aria-label="Nivel de audio"
              onChange={(evento) => {
                const video = videoRef.current;
                if (!video) return;
                const nivel = Number(evento.target.value);
                video.muted = nivel === 0;
                video.volume = nivel;
              }}
            />
          </div>
          <button
            type="button"
            className="visor-t800-boton"
            onClick={alternarPantallaCompleta}
          >
            {pantallaCompleta ? "SALIR" : "PANTALLA"}
          </button>
        </div>
      </div>
    </DraggableResizableWindow>
  );
}

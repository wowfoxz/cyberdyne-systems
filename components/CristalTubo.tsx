"use client";

import { useLayoutEffect, useRef } from "react";
import { contornoDelVidrio, crearMapaDelTubo, muestraDelTubo } from "@/lib/distorsionTubo";

/**
 * Vidrio del tubo: deforma lo que se dibuja y manda el clic
 * al punto que se está viendo, porque el filtro no mueve el layout.
 */
export default function CristalTubo() {
  const filtroRef = useRef<SVGFilterElement>(null);
  const imagenRef = useRef<SVGFEImageElement>(null);
  const mapaRef = useRef<SVGFEDisplacementMapElement>(null);

  useLayoutEffect(() => {
    let marco = 0;
    const aplicar = () => {
      const svg = filtroRef.current?.ownerSVGElement;
      const sistema = svg?.querySelector(".lienzo-sistema");
      const grupo = svg?.querySelector(".grupo-tubo");
      if (
        !(svg instanceof SVGSVGElement) ||
        !(sistema instanceof HTMLElement) ||
        !(grupo instanceof SVGGElement) ||
        !filtroRef.current ||
        !imagenRef.current ||
        !mapaRef.current
      ) {
        return;
      }
      const caja = svg.getBoundingClientRect();
      svg.setAttribute("width", String(Math.max(1, Math.round(caja.width))));
      svg.setAttribute("height", String(Math.max(1, Math.round(caja.height))));
      const rect = sistema.getBoundingClientRect();
      const ancho = Math.max(1, Math.round(rect.width || window.innerWidth));
      const alto = Math.max(1, Math.round(rect.height || window.innerHeight));
      const mapa = crearMapaDelTubo(ancho, alto);
      if (!mapa.url) return;
      imagenRef.current.setAttribute("href", mapa.url);
      imagenRef.current.setAttribute("width", String(ancho));
      imagenRef.current.setAttribute("height", String(alto));
      mapaRef.current.setAttribute("scale", String(mapa.escala));
      grupo.setAttribute("filter", "url(#tubo-crt)");
      const interior = contornoDelVidrio(ancho, alto);
      const recorte = `polygon(${interior
        .map((punto) => `${punto.x.toFixed(1)}px ${punto.y.toFixed(1)}px`)
        .join(", ")})`;
      const viewport = svg.closest(".lienzo-viewport");
      if (viewport instanceof HTMLElement) {
        viewport.style.setProperty("--recorte-vidrio", recorte);
      }
    };
    const alRedimensionar = () => {
      cancelAnimationFrame(marco);
      marco = requestAnimationFrame(aplicar);
    };
    aplicar();
    window.addEventListener("resize", alRedimensionar);
    return () => {
      cancelAnimationFrame(marco);
      window.removeEventListener("resize", alRedimensionar);
    };
  }, []);

  useLayoutEffect(() => {
    const vistos = new WeakSet<Event>();
    const tipos = [
      "pointerdown",
      "pointerup",
      "mousedown",
      "mouseup",
      "click",
      "dblclick",
      "contextmenu",
      "wheel",
    ];

    let clicNativo: number | null = null;
    let ultimoDoble: { cuando: number; el: Element } | null = null;

    const despachar = (evento: MouseEvent, destino: Element, tipo = evento.type) => {
      const base = {
        bubbles: true,
        cancelable: true,
        composed: true,
        view: window,
        clientX: evento.clientX,
        clientY: evento.clientY,
        screenX: evento.screenX,
        screenY: evento.screenY,
        ctrlKey: evento.ctrlKey,
        shiftKey: evento.shiftKey,
        altKey: evento.altKey,
        metaKey: evento.metaKey,
        button: evento.button,
        buttons: evento.buttons,
      };
      let copia: Event;
      if (tipo !== evento.type) {
        copia = new MouseEvent(tipo, base);
      } else if (evento instanceof PointerEvent) {
        copia = new PointerEvent(evento.type, {
          ...base,
          pointerId: evento.pointerId,
          pointerType: evento.pointerType,
          isPrimary: evento.isPrimary,
          width: evento.width,
          height: evento.height,
          pressure: evento.pressure,
        });
      } else if (evento instanceof WheelEvent) {
        copia = new WheelEvent(evento.type, {
          ...base,
          deltaX: evento.deltaX,
          deltaY: evento.deltaY,
          deltaMode: evento.deltaMode,
        });
      } else {
        copia = new MouseEvent(evento.type, base);
      }
      vistos.add(copia);
      destino.dispatchEvent(copia);
    };

    const elementoEnContenido = (x: number, y: number): Element | null => {
      const svg = filtroRef.current?.ownerSVGElement;
      if (!(svg instanceof SVGSVGElement)) return document.elementFromPoint(x, y);
      const recorte = svg.style.clipPath;
      svg.style.clipPath = "none";
      const hallado = document.elementFromPoint(x, y);
      svg.style.clipPath = recorte;
      return hallado;
    };

    const cursorDelContenido = (evento: PointerEvent) => {
      const sistema = filtroRef.current?.ownerSVGElement?.querySelector(
        ".lienzo-sistema"
      );
      if (!(sistema instanceof HTMLElement)) return;
      const rect = sistema.getBoundingClientRect();
      const localX = evento.clientX - rect.left;
      const localY = evento.clientY - rect.top;
      if (
        localX < 0 ||
        localY < 0 ||
        localX > rect.width ||
        localY > rect.height
      ) {
        document.documentElement.style.cursor = "";
        return;
      }
      const muestra = muestraDelTubo(localX, localY, rect.width, rect.height);
      const real = elementoEnContenido(muestra.x + rect.left, muestra.y + rect.top);
      const cursor = real ? getComputedStyle(real).cursor : "auto";
      document.documentElement.style.cursor = cursor === "auto" ? "" : cursor;
    };

    const corregir = (evento: Event) => {
      if (vistos.has(evento) || !(evento instanceof MouseEvent)) return;
      if (
        evento instanceof PointerEvent &&
        evento.type !== "pointerdown" &&
        evento.target instanceof Element &&
        evento.target.hasPointerCapture(evento.pointerId)
      ) {
        return;
      }
      const sistema = filtroRef.current?.ownerSVGElement?.querySelector(
        ".lienzo-sistema"
      );
      if (!(sistema instanceof HTMLElement)) return;
      const rect = sistema.getBoundingClientRect();
      const localX = evento.clientX - rect.left;
      const localY = evento.clientY - rect.top;
      if (
        localX < 0 ||
        localY < 0 ||
        localX > rect.width ||
        localY > rect.height
      ) {
        return;
      }
      const muestra = muestraDelTubo(localX, localY, rect.width, rect.height);
      const afuera =
        muestra.x < 0 ||
        muestra.y < 0 ||
        muestra.x > rect.width ||
        muestra.y > rect.height;
      const visual = document.elementFromPoint(evento.clientX, evento.clientY);
      const real = afuera
        ? null
        : elementoEnContenido(muestra.x + rect.left, muestra.y + rect.top);
      if (!afuera && (!real || real === visual)) return;

      evento.stopImmediatePropagation();
      evento.preventDefault();
      if (!real) return;

      if (evento.type === "click" || evento.type === "dblclick") {
        if (clicNativo !== null) {
          window.clearTimeout(clicNativo);
          clicNativo = null;
        }
      }
      despachar(evento, real);

      if (evento.type === "pointerup") {
        const destino = real;
        clicNativo = window.setTimeout(() => {
          clicNativo = null;
          despachar(evento, destino, "click");
          const ahora = Date.now();
          if (
            ultimoDoble &&
            ultimoDoble.el === destino &&
            ahora - ultimoDoble.cuando < 500
          ) {
            despachar(evento, destino, "dblclick");
            ultimoDoble = null;
          } else {
            ultimoDoble = { cuando: ahora, el: destino };
          }
        }, 0);
      }

      if (
        evento.type === "pointerdown" &&
        evento instanceof PointerEvent &&
        !real.closest(".app-window-controls")
      ) {
        const asa = real.closest(".app-window-header, .resize-handle");
        if (asa instanceof HTMLElement) {
          try {
            asa.setPointerCapture(evento.pointerId);
          } catch {
            // El arrastre sigue con el evento reenviado si el navegador ya capturó.
          }
        }
        const enfocable = real.closest("input, textarea, select, button");
        if (enfocable instanceof HTMLElement) enfocable.focus();
      }
    };

    for (const tipo of tipos) {
      document.addEventListener(tipo, corregir, true);
    }
    document.addEventListener("pointermove", cursorDelContenido, true);
    return () => {
      if (clicNativo !== null) window.clearTimeout(clicNativo);
      document.documentElement.style.cursor = "";
      for (const tipo of tipos) {
        document.removeEventListener(tipo, corregir, true);
      }
      document.removeEventListener("pointermove", cursorDelContenido, true);
    };
  }, []);

  return (
    <defs>
      <filter
        ref={filtroRef}
        id="tubo-crt"
        x="0"
        y="0"
        width="100%"
        height="100%"
        colorInterpolationFilters="sRGB"
      >
        <feImage
          ref={imagenRef}
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          result="mapa"
        />
        <feDisplacementMap
          ref={mapaRef}
          in="SourceGraphic"
          in2="mapa"
          scale="0"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </defs>
  );
}

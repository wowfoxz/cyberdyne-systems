"use client";

import { useEffect, useRef } from "react";
import { contornoDelVidrio, visualDelTubo } from "@/lib/distorsionTubo";

const ALCANCE_PX = 58;

type Rgb = { r: number; g: number; b: number };

type Luz = {
  visto: DOMRect;
  color: Rgb;
};

type PuntoArco = {
  x: number;
  y: number;
  nx: number;
  ny: number;
  color: Rgb;
  fuerza: number;
};

function leerRgb(color: string): Rgb | null {
  const partes = color.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
  if (partes) {
    return { r: Number(partes[1]), g: Number(partes[2]), b: Number(partes[3]) };
  }
  const hex = color.trim().match(/^#([0-9a-f]{6})$/i);
  if (!hex) return null;
  const valor = Number.parseInt(hex[1], 16);
  return { r: (valor >> 16) & 255, g: (valor >> 8) & 255, b: valor & 255 };
}

function tieneLuz(color: Rgb | null): color is Rgb {
  if (!color) return false;
  const mayor = Math.max(color.r, color.g, color.b);
  const menor = Math.min(color.r, color.g, color.b);
  return mayor > 28 && mayor - menor > 10;
}

function colorDeImagen(imagen: HTMLImageElement): Rgb | null {
  if (!imagen.complete || imagen.naturalWidth < 1) return null;
  try {
    const lienzo = document.createElement("canvas");
    lienzo.width = 1;
    lienzo.height = 1;
    const contexto = lienzo.getContext("2d");
    if (!contexto) return null;
    contexto.drawImage(
      imagen,
      imagen.naturalWidth / 2,
      imagen.naturalHeight / 2,
      1,
      1,
      0,
      0,
      1,
      1
    );
    const pixel = contexto.getImageData(0, 0, 1, 1).data;
    const color = { r: pixel[0], g: pixel[1], b: pixel[2] };
    return pixel[3] > 40 && tieneLuz(color) ? color : null;
  } catch {
    return null;
  }
}

function colorVisible(nodo: Element | null, tope: HTMLElement): Rgb | null {
  let actual = nodo;
  while (actual) {
    const fondo = leerRgb(getComputedStyle(actual).backgroundColor);
    if (tieneLuz(fondo)) return fondo;
    if (actual === tope) break;
    actual = actual.parentElement;
  }
  return null;
}

const SELECTOR_LUZ =
  ".app-window, .icon, .taskbar, .skynet-logo, .weapon-canvas-wrapper, [aria-label='Consola Skynet']";

/**
 * Color que el marco puede devolver: el fondo, el borde o la tinta
 * del elemento que está cerca.
 */
function colorDelElemento(elemento: HTMLElement, x: number, y: number): Rgb | null {
  const punto = document.elementFromPoint(x, y);
  const delContenido = colorVisible(punto, elemento);
  if (delContenido) return delContenido;
  const estilo = getComputedStyle(elemento);
  const borde = leerRgb(estilo.borderTopColor);
  if (tieneLuz(borde)) return borde;
  const tinta = leerRgb(estilo.color);
  if (tieneLuz(tinta)) return tinta;
  if (elemento instanceof HTMLImageElement) {
    const deLaImagen = colorDeImagen(elemento);
    if (deLaImagen) return deLaImagen;
  }
  const primario = leerRgb(
    getComputedStyle(document.documentElement).getPropertyValue("--hud-primary")
  );
  return tieneLuz(primario) ? primario : null;
}

function cajaVisible(rect: DOMRect, vidrio: DOMRect): DOMRect {
  const puntos = [
    [rect.left, rect.top],
    [rect.right, rect.top],
    [rect.left, rect.bottom],
    [rect.right, rect.bottom],
  ].map(([x, y]) => {
    const visto = visualDelTubo(x - vidrio.left, y - vidrio.top, vidrio.width, vidrio.height);
    return { x: visto.x + vidrio.left, y: visto.y + vidrio.top };
  });
  const izquierda = Math.min(...puntos.map((punto) => punto.x));
  const arriba = Math.min(...puntos.map((punto) => punto.y));
  const derecha = Math.max(...puntos.map((punto) => punto.x));
  const abajo = Math.max(...puntos.map((punto) => punto.y));
  return new DOMRect(izquierda, arriba, derecha - izquierda, abajo - arriba);
}

function distanciaAlRect(x: number, y: number, rect: DOMRect): number {
  const dx = x < rect.left ? rect.left - x : x > rect.right ? x - rect.right : 0;
  const dy = y < rect.top ? rect.top - y : y > rect.bottom ? y - rect.bottom : 0;
  return Math.hypot(dx, dy);
}

/**
 * Plastico del tubo. Pinta un reflejo en el tramo del marco
 * que tiene luz cerca: ventanas, iconos, barra, logo o el arma.
 */
export default function ReflejoMarco() {
  const lienzoRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let marco = 0;
    let vacio = true;

    const dibujar = () => {
      marco = requestAnimationFrame(dibujar);
      const lienzo = lienzoRef.current;
      const viewport = lienzo?.parentElement;
      const vidrio = viewport?.querySelector(".lienzo-svg");
      if (!lienzo || !viewport || !(vidrio instanceof Element)) return;

      const ctx = lienzo.getContext("2d");
      if (!ctx) return;

      const caja = viewport.getBoundingClientRect();
      const vidrioCaja = vidrio.getBoundingClientRect();
      const escala = window.devicePixelRatio || 1;
      const ancho = Math.max(1, Math.round(caja.width));
      const alto = Math.max(1, Math.round(caja.height));
      if (lienzo.width !== Math.round(ancho * escala) || lienzo.height !== Math.round(alto * escala)) {
        lienzo.width = Math.round(ancho * escala);
        lienzo.height = Math.round(alto * escala);
      }
      ctx.setTransform(escala, 0, 0, escala, 0, 0);

      const origenX = caja.left;
      const origenY = caja.top;
      const vx = vidrioCaja.left - origenX;
      const vy = vidrioCaja.top - origenY;
      const nodos = viewport.querySelectorAll(SELECTOR_LUZ);
      const luces: Luz[] = [];

      nodos.forEach((nodo) => {
        if (!(nodo instanceof HTMLElement)) return;
        if (getComputedStyle(nodo).display === "none") return;
        const rect = nodo.getBoundingClientRect();
        if (rect.width < 8 || rect.height < 8) return;
        const visto = cajaVisible(rect, vidrioCaja);
        const color = colorDelElemento(
          nodo,
          rect.left + rect.width / 2,
          rect.top + Math.min(18, rect.height / 2)
        );
        if (!color) return;
        luces.push({
          visto: new DOMRect(
            visto.left - origenX,
            visto.top - origenY,
            visto.width,
            visto.height
          ),
          color,
        });
      });

      if (luces.length === 0) {
        if (!vacio) {
          ctx.clearRect(0, 0, ancho, alto);
          vacio = true;
        }
        return;
      }

      const contorno = contornoDelVidrio(vidrioCaja.width, vidrioCaja.height, 96);
      const centroX = vx + vidrioCaja.width / 2;
      const centroY = vy + vidrioCaja.height / 2;
      const arco: (PuntoArco | null)[] = contorno.map((punto, indice) => {
        const siguiente = contorno[(indice + 1) % contorno.length];
        const x = vx + punto.x;
        const y = vy + punto.y;
        let nx = siguiente.y - punto.y;
        let ny = punto.x - siguiente.x;
        const largoNormal = Math.hypot(nx, ny) || 1;
        nx /= largoNormal;
        ny /= largoNormal;
        if ((x - centroX) * nx + (y - centroY) * ny < 0) {
          nx = -nx;
          ny = -ny;
        }
        let mejor: { color: Rgb; dist: number } | null = null;
        for (const luz of luces) {
          const dist = distanciaAlRect(x, y, luz.visto);
          if (dist > ALCANCE_PX) continue;
          if (!mejor || dist < mejor.dist) mejor = { color: luz.color, dist };
        }
        if (!mejor) return null;
        return {
          x,
          y,
          nx,
          ny,
          color: mejor.color,
          fuerza: 1 - mejor.dist / ALCANCE_PX,
        };
      });

      if (arco.every((punto) => punto === null)) {
        if (!vacio) {
          ctx.clearRect(0, 0, ancho, alto);
          vacio = true;
        }
        return;
      }
      vacio = false;
      ctx.clearRect(0, 0, ancho, alto);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, ancho, alto);
      if (contorno.length > 0) {
        ctx.moveTo(vx + contorno[0].x, vy + contorno[0].y);
        contorno.forEach((punto) => ctx.lineTo(vx + punto.x, vy + punto.y));
        ctx.closePath();
      }
      ctx.fill("evenodd");
      ctx.clip("evenodd");
      ctx.filter = "blur(12px)";

      for (let indice = 0; indice < arco.length; indice += 1) {
        const actual = arco[indice];
        const sigue = arco[(indice + 1) % arco.length];
        if (!actual || !sigue) continue;
        const fuerza = Math.min(actual.fuerza, sigue.fuerza);
        if (fuerza < 0.05) continue;
        const grosor = 14 + fuerza * 16;
        const margen = 4;
        ctx.beginPath();
        ctx.moveTo(actual.x + actual.nx * margen, actual.y + actual.ny * margen);
        ctx.lineTo(sigue.x + sigue.nx * margen, sigue.y + sigue.ny * margen);
        ctx.lineTo(
          sigue.x + sigue.nx * (margen + grosor),
          sigue.y + sigue.ny * (margen + grosor)
        );
        ctx.lineTo(
          actual.x + actual.nx * (margen + grosor),
          actual.y + actual.ny * (margen + grosor)
        );
        ctx.closePath();
        ctx.fillStyle = `rgba(${actual.color.r}, ${actual.color.g}, ${actual.color.b}, ${fuerza * 0.8})`;
        ctx.fill();
      }

      ctx.filter = "none";
      ctx.restore();
    };

    marco = requestAnimationFrame(dibujar);
    return () => cancelAnimationFrame(marco);
  }, []);

  return <canvas ref={lienzoRef} className="reflejo-marco" aria-hidden="true" />;
}

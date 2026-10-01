/**
 * Curva de un tubo CRT.
 * Más chico el valor, más combado el vidrio: el centro queda más grande
 * y lo que se aleja del centro se achica.
 */
const CURVA_TUBO = 3.2;

/**
 * Dónde hay que leer el contenido para que, visto en (x, y),
 * el centro se infle y los bordes se achiquen como un tubo.
 */
export function muestraDelTubo(
  x: number,
  y: number,
  ancho: number,
  alto: number
): { x: number; y: number } {
  const nx = (x / ancho - 0.5) * 2;
  const ny = (y / alto - 0.5) * 2;
  const nxCurvo = nx * (1 + (Math.abs(ny) / CURVA_TUBO) ** 2);
  const nyCurvo = ny * (1 + (Math.abs(nxCurvo) / CURVA_TUBO) ** 2);
  return {
    x: (nxCurvo / 2 + 0.5) * ancho,
    y: (nyCurvo / 2 + 0.5) * alto,
  };
}

function limitarCanal(valor: number): number {
  return Math.max(0, Math.min(255, Math.round(valor)));
}

/**
 * Mapa rojo/verde que el filtro SVG usa para empujar cada pixel.
 * El rojo mueve en horizontal y el verde en vertical.
 */
export function crearMapaDelTubo(
  anchoVista: number,
  altoVista: number
): { url: string; escala: number } {
  const columnas = 320;
  const filas = 180;
  const lienzo = document.createElement("canvas");
  lienzo.width = columnas;
  lienzo.height = filas;
  const contexto = lienzo.getContext("2d");
  if (!contexto) return { url: "", escala: 1 };

  const desplazamientos: { dx: number; dy: number }[] = [];
  let punta = 1;
  for (let fila = 0; fila < filas; fila += 1) {
    for (let columna = 0; columna < columnas; columna += 1) {
      const origenX = (columna / (columnas - 1)) * anchoVista;
      const origenY = (fila / (filas - 1)) * altoVista;
      const destino = muestraDelTubo(origenX, origenY, anchoVista, altoVista);
      const dx = destino.x - origenX;
      const dy = destino.y - origenY;
      desplazamientos.push({ dx, dy });
      punta = Math.max(punta, Math.abs(dx), Math.abs(dy));
    }
  }

  // El canal 128 es “sin mover”. La escala cabe justo el desplazamiento mayor.
  const escala = punta * 2 + 4;
  const imagen = contexto.createImageData(columnas, filas);
  const pixeles = imagen.data;
  for (let indice = 0; indice < desplazamientos.length; indice += 1) {
    const { dx, dy } = desplazamientos[indice];
    const base = indice * 4;
    pixeles[base] = limitarCanal(255 * (dx / escala + 0.5));
    pixeles[base + 1] = limitarCanal(255 * (dy / escala + 0.5));
    pixeles[base + 2] = 128;
    pixeles[base + 3] = 255;
  }
  contexto.putImageData(imagen, 0, 0);
  return { url: lienzo.toDataURL("image/png"), escala };
}

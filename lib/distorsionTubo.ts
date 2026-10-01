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

/**
 * Dónde se ve en el vidrio un punto del contenido.
 * Es el camino inverso de muestraDelTubo.
 */
export function visualDelTubo(
  origenX: number,
  origenY: number,
  ancho: number,
  alto: number
): { x: number; y: number } {
  let x = origenX;
  let y = origenY;
  for (let paso = 0; paso < 12; paso += 1) {
    const muestra = muestraDelTubo(x, y, ancho, alto);
    const dx = origenX - muestra.x;
    const dy = origenY - muestra.y;
    if (dx * dx + dy * dy < 0.25) break;
    x += dx * 0.65;
    y += dy * 0.65;
  }
  return { x, y };
}

function limitarCanal(valor: number): number {
  return Math.max(0, Math.min(255, Math.round(valor)));
}

/**
 * Mapa rojo/verde que el filtro SVG usa para empujar cada pixel.
 * El rojo mueve en horizontal y el verde en vertical.
 */
/**
 * Borde del vidrio. El plástico sigue este arco: las esquinas
 * quedan más adentro que el centro, igual que el contenido.
 */
export function contornoDelVidrio(
  ancho: number,
  alto: number,
  pasos = 72
): { x: number; y: number }[] {
  const centroX = ancho / 2;
  const centroY = alto / 2;
  const alcance = Math.hypot(ancho, alto);
  const puntos: { x: number; y: number }[] = [];

  for (let paso = 0; paso < pasos; paso += 1) {
    const angulo = (paso / pasos) * Math.PI * 2;
    const direccionX = Math.cos(angulo);
    const direccionY = Math.sin(angulo);
    let menor = 0;
    let mayor = alcance;
    for (let intento = 0; intento < 18; intento += 1) {
      const radio = (menor + mayor) / 2;
      const x = centroX + direccionX * radio;
      const y = centroY + direccionY * radio;
      const muestra = muestraDelTubo(x, y, ancho, alto);
      const adentro =
        x >= 0 &&
        y >= 0 &&
        x <= ancho &&
        y <= alto &&
        muestra.x >= 1 &&
        muestra.y >= 1 &&
        muestra.x <= ancho - 1 &&
        muestra.y <= alto - 1;
      if (adentro) menor = radio;
      else mayor = radio;
    }
    puntos.push({
      x: centroX + direccionX * menor,
      y: centroY + direccionY * menor,
    });
  }
  return puntos;
}

export function crearMapaDelTubo(
  anchoVista: number,
  altoVista: number
): { url: string; escala: number } {
  const columnas = Math.max(2, Math.round(anchoVista));
  const filas = Math.max(2, Math.round(altoVista));
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
  suavizarMapa(pixeles, columnas, filas);
  contexto.putImageData(imagen, 0, 0);
  return { url: lienzo.toDataURL("image/png"), escala };
}

/** Difumina un poco el mapa para que las líneas no salgan en escalera. */
function suavizarMapa(pixeles: Uint8ClampedArray, columnas: number, filas: number): void {
  const copia = new Uint8ClampedArray(pixeles);
  for (let fila = 1; fila < filas - 1; fila += 1) {
    for (let columna = 1; columna < columnas - 1; columna += 1) {
      const indice = (fila * columnas + columna) * 4;
      for (let canal = 0; canal < 2; canal += 1) {
        let suma = 0;
        for (let dy = -1; dy <= 1; dy += 1) {
          for (let dx = -1; dx <= 1; dx += 1) {
            suma += copia[((fila + dy) * columnas + (columna + dx)) * 4 + canal];
          }
        }
        pixeles[indice + canal] = Math.round(suma / 9);
      }
    }
  }
}

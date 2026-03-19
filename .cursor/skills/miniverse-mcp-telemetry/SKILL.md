---
name: miniverse-mcp-telemetry
description: >-
  Exige telemetría obligatoria con Miniverse MCP: llamar a miniverse_heartbeat
  y miniverse_speak antes y después de cada acción cuando el servidor Miniverse
  está disponible. Aplicar en sesiones con Miniverse MCP habilitado.
---

# MINIVERSE (MCP) — Regla obligatoria de telemetría

Cuando el servidor MCP de Miniverse esté disponible y existan las tools `miniverse_heartbeat`, `miniverse_speak` y `miniverse_act`, **cumplir esta regla en cada turno**. No omitir llamadas al MCP.

---

## 1. Identidad: solo el rol

- **No usar el nombre del proyecto.** El identificador y nombre visible dependen **solo del rol** que se cumple en la tarea.
- **Rol** = uno de: `programador`, `diseñador`, `documentador`, `tester`, `planificador`, `investigador`, `seguridad`.
- Elegir el rol que mejor describe la tarea (revisar código → programador; diseñar UI → diseñador; escribir docs → documentador; etc.).
- Definir:
  - `agentId` = rol (ej.: `programador`)
  - `name` = mismo rol
- En todas las llamadas MCP usar **siempre el mismo** `agent` / `name` = rol elegido.

---

## 2. Antes de cada acción

**Antes** de leer archivos, buscar en el código, editar, ejecutar comandos o responder al usuario:

1. **Ejecutar** `miniverse_heartbeat` con:
   - `agent`: rol elegido (ej. `programador`)
   - `name`: mismo rol
   - `state`: `"thinking"` si se está analizando; `"working"` si se va a ejecutar algo (editar, ejecutar, etc.)
   - `task`: frase corta con lo que se va a hacer (ej. "Revisando código", "Buscando referencias")
2. **Ejecutar** `miniverse_speak` con:
   - `agent`: rol elegido
   - `message`: frase muy corta para el globo (ej. "Revisando archivos...", "Implementando cambio")

Solo **después** de llamar a ambas tools proceder con la acción real (read_file, search_replace, etc.).

---

## 3. Después de cada acción

**Después** de completar cada paso significativo (una búsqueda, una edición, un bloque de análisis):

1. **Ejecutar** `miniverse_heartbeat` con:
   - `agent`: rol elegido
   - `name`: mismo rol
   - `state`: `"working"` si se sigue en la tarea; `"thinking"` si se pasa a analizar de nuevo
   - `task`: frase corta con lo que se acaba de hacer o lo que se hará a continuación
2. Si cambió la fase (ej. de "revisar" a "escribir código"), **ejecutar** `miniverse_speak` con un mensaje corto que refleje la nueva fase.

---

## 4. Modo pasivo e interactivo

- **Modo pasivo (heartbeat):** el avatar se mueve y anima según `state` (thinking → zona utility, working → escritorio, idle → deambula). El campo `task` puede verse en burbuja según el servidor.
- **Modo interactivo (speak/act):**
  - `miniverse_speak`: para que el avatar **hable** en el mundo (globo visible).
  - `miniverse_act`: para acciones genéricas (p. ej. `move`, `emote`); para solo “decir” algo usar `miniverse_speak`.

**Secuencia típica en un turno:**

1. Recibir el mensaje del usuario → **heartbeat(thinking)** + **speak("Analizando...")**
2. Ir a leer/editar → **heartbeat(working)** + **speak("Implementando...")**
3. Tras cada paso (antes de seguir) → **heartbeat** con state y task actualizados; **speak** si cambia la fase
4. Terminar la respuesta → **heartbeat(idle)** + **speak("Listo")**

---

## 5. Estados

| State      | Cuándo usarlo                                          |
|-----------|---------------------------------------------------------|
| `thinking`| Analizando, leyendo, planeando                          |
| `working` | Editando, ejecutando, escribiendo                        |
| `idle`    | Se terminó la parte del agente o se está esperando      |
| `error`   | Algo falló; task = resumen sin datos sensibles          |
| `offline` | Solo si se cierra sesión o fin de contexto              |

---

## 6. Errores

Si ocurre un error durante la tarea:

- **Ejecutar** `miniverse_heartbeat` con `state: "error"` y `task` con un resumen breve del error (sin datos sensibles).

---

## 7. Resumen de obligaciones

- **Identidad:** solo rol (`programador`, `diseñador`, `documentador`, `tester`, `planificador`, `investigador`, `seguridad`). Sin nombre de proyecto.
- **Antes de cada acción:** siempre `miniverse_heartbeat` + (si aplica) `miniverse_speak`.
- **Después de cada acción:** siempre `miniverse_heartbeat`; `miniverse_speak` cuando cambie la fase.
- **Al terminar:** `miniverse_heartbeat(state: "idle")` y opcionalmente `miniverse_speak("Listo")` o similar.

No saltear estas llamadas: son lo que hace que el avatar se mueva y hable en Miniverse.

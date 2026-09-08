# Prompts de la sesión — Kanban de candidatos por posición

Registro de los prompts usados con Claude Code para implementar la página "position" (tablero kanban
de candidatos) pedida en `REQ.md`, y de las decisiones y hallazgos relevantes de la sesión.

## Prompts del usuario, en orden

1. /init para generar @CLAUDE.md

2. **"leer @REQ.md y @img.png verificar endpoints que permitan cumplir con lo requerido, utilizar
   web-inspector para validar resultado. Generar plan de implementacion"** — pidiendo
   explícitamente un plan de implementación antes de tocar código. Disparó el modo plan.

3. Durante el modo plan, Claude preguntó tres decisiones de diseño (ver más abajo) mediante
   `AskUserQuestion`; se aceptaron las tres opciones recomendadas.

4. Tras aprobar el plan (`ExitPlanMode`), la implementación se ejecutó en el mismo turno sin prompts
   adicionales del usuario.

5. **"rellenar @../prompts/prompts-iniciales.md con los prompts de esta sesion y cosas que sean
   relevantes mencionar de la sesion"** — este mismo encargo, que generó el presente documento.

## Decisiones tomadas (preguntadas al usuario y confirmadas)

- **Endpoints**: adaptar el frontend a la API real existente, sin modificar el backend.
- **Drag & drop**: usar `@hello-pangea/dnd` en vez de `react-beautiful-dnd` (roto bajo
  `React.StrictMode`, que la app ya usa en `src/index.tsx`).
- **Navegación desde el listado**: añadir `id` reales a `mockPositions` en `Positions.tsx` y cablear el
  botón "Ver proceso" a `/positions/:id`, en vez de construir un endpoint `GET /positions` nuevo.

## Hallazgo más importante: REQ.md documenta endpoints que no existen

El documento de requisitos especifica `GET /positions/:id/interviewFlow`, `GET /positions/:id/candidates`
y `PUT /candidates/:id/stage`. Verificado leyendo el código del backend, la API real es:

| REQ.md dice | Existe de verdad |
|---|---|
| `GET /positions/:id/interviewFlow` | `GET /position/:id/interviewflow` (singular, minúscula) |
| `GET /positions/:id/candidates` | `GET /position/:id/candidates` (singular) |
| `PUT /candidates/:id/stage` | `PUT /candidates/:id` (sin `/stage`) |

Dos trampas adicionales, también verificadas en el código y no documentadas en `REQ.md`:

- La respuesta de `interviewflow` va **doblemente anidada** (`{ interviewFlow: { positionName,
  interviewFlow: { interviewSteps } } }`) por un bug de doble wrapping en el controlador.
- `GET .../candidates` devuelve `currentInterviewStep` como **nombre** de fase, pero el `PUT` espera el
  **id** de la fase — hace falta mapear nombre → id con la lista de `interviewSteps`.

Otros datos verificados directamente en la base de datos sembrada (no solo leyendo el código):
la posición 1 tiene 3 fases, dos de ellas con el mismo `orderIndex` (bug de los datos semilla, exige
desempatar por `id` al ordenar columnas); la posición 2 no tiene ninguna fase definida pero sí un
candidato, un caso límite real que el frontend debe manejar sin romperse.

## Metodología de verificación

- Antes de escribir el frontend: se comprobaron los tres endpoints con `curl`, incluyendo un
  **preflight CORS explícito** (`OPTIONS` con cabeceras `Access-Control-Request-*`) para el `PUT`, ya
  que un fallo ahí solo se manifiesta en el navegador y no en `curl`.
- Tras implementar: verificación en navegador real con el MCP `web-inspector` (no solo lectura de
  código) — navegación, inspección de red, y arrastre de tarjetas.
- **El arrastre por puntero del MCP no funcionó** (el `drag` no cruzó de una columna a otra; limitación
  conocida de los sensores de puntero de las librerías de DnD). Se usó como alternativa el **drag &
  drop por teclado** que trae `@hello-pangea/dnd` de serie (Espacio para levantar, flechas para mover
  entre columnas, Espacio para soltar), confirmando así de paso que la interfaz es accesible por
  teclado.
- Se confirmó que el `PUT` disparado por el arrastre llevaba exactamente
  `{"applicationId":4,"currentInterviewStep":3}` (id de fase, no nombre ni orderIndex), y que el cambio
  persistía tras recargar la página.
- Se restauró la base de datos al estado original sembrado después de las pruebas de arrastre.

## Bug real encontrado y corregido durante la verificación

Al probar la posición 2 (sin fases), la página crasheaba con
`Could not find "store" in the context of "Connect(Droppable)"`. Causa: la columna de "candidatos sin
fase asignada" se renderizaba fuera de `<DragDropContext>` cuando `steps.length === 0`, pero esa
columna sigue usando internamente un `<Droppable>`, que no puede montarse sin un `DragDropContext`
ancestro. Arreglo: envolver siempre el tablero en `DragDropContext`, dejando que `isDropDisabled` /
`isDragDisabled` en las columnas controlen qué se puede arrastrar, en vez de condicionar el propio
`DragDropContext`. Este bug no se detectó por inspección de código ni por `tsc --noEmit` — solo
apareció al navegar de verdad a `/positions/2` en el navegador.

## Archivos creados/modificados

Nuevos: `frontend/src/services/positionService.ts`, `frontend/src/components/PositionKanban.tsx`,
`PositionKanban.types.ts`, `KanbanColumn.tsx`, `CandidateCard.tsx`, `ScoreDots.tsx`,
`PositionKanban.css`.

Modificados: `frontend/src/App.js` (ruta `/positions/:id`), `frontend/src/components/Positions.tsx`
(ids reales en `mockPositions` + enlace funcional en "Ver proceso").

Sin cambios en `backend/` — la decisión fue adaptar el frontend a la API existente en lugar de
modificarla.

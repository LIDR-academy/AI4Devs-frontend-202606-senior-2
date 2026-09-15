## Context

- **Frontend actual**: Create React App con JS y TS mezclados, react-bootstrap 2, react-router v6 y `react-bootstrap-icons`. `App.js` es la app real, montada en `index.tsx` dentro de `React.StrictMode`. Las llamadas a la API usan `fetch` con la base `http://localhost:3010` escrita a mano.
- **Listado de posiciones**: `Positions.tsx` usa datos mock sin ids y su botón "Ver proceso" no hace nada.
- **Backend**: ya existe y no se toca en este cambio. Las rutas reales difieren del enunciado del ejercicio:

  | Enunciado | Backend real | Respuesta relevante |
  |---|---|---|
  | `GET /positions/:id/interviewFlow` | `GET /position/:id/interviewflow` | `{ interviewFlow: { positionName, interviewFlow: { id, description, interviewSteps[] } } }` (doble anidación) |
  | `GET /positions/:id/candidates` | `GET /position/:id/candidates` | `[{ fullName, currentInterviewStep (nombre), averageScore, id (candidateId), applicationId }]` |
  | `PUT /candidates/:id/stage` | `PUT /candidates/:id` | cuerpo `{ applicationId, currentInterviewStep (id de fase) }` |

- **Particularidades del backend a tener en cuenta**:
  - `candidates` identifica la fase por **nombre**, pero el `PUT` necesita su **id**.
  - Las fases no vienen ordenadas, y el seed tiene dos fases con `orderIndex: 2`.
  - `interviewflow` responde 404 ante cualquier error, incluido un id no numérico.
  - `candidates` responde `200 []` para una posición inexistente.
  - En el seed, la posición 2 tiene un flujo sin fases y un candidato en una fase de otro flujo.
- **Alcance del ejercicio**: solo el contenido interno de la página. El menú superior y el footer se asumen existentes.

## Goals / Non-Goals

**Goals:**
- Página `/positions/:id` que cumpla la spec `position-kanban`: título con flecha de vuelta, columnas por fase, tarjetas con nombre y puntuación, arrastrar para cambiar de fase y diseño responsive.
- Arrastre usable con ratón, táctil y teclado.
- Respuesta inmediata al soltar (actualización optimista) con reversión si falla el guardado.
- Lógica de datos (ordenar, agrupar y mover) en funciones puras con tests.
- Llegar a la página desde el botón "Ver proceso" del listado.

**Non-Goals:**
- Cambiar el backend: añadir `currentInterviewStepId`, renombrar rutas o arreglar el seed.
- Conectar el listado de posiciones a datos reales (no existe `GET /positions`).
- Crear el menú superior o el footer.
- Reordenar tarjetas dentro de una misma columna. No hay campo que lo persista.
- Ver el detalle de un candidato o editar entrevistas.
- Arreglar el script `npm test` roto del frontend. Se usa `npx react-scripts test`.

## Decisions

### 1. Usar las rutas reales del backend, centralizadas en un servicio

Se crea `frontend/src/services/positionService.ts`. Es el único punto que conoce la URL base y los paths. Expone:
- `getInterviewFlow(positionId)`: devuelve `{ positionName, steps }` ya desanidado.
- `getCandidates(positionId)`
- `updateCandidateStage(candidateId, applicationId, stepId)`

Una respuesta 404 lanza un `NotFoundError` propio; cualquier otro estado no 2xx o error de red lanza `ApiError`.

- *Por qué*: el enunciado y el código no coinciden. Aislar los paths permite ajustarlos en un solo sitio si el backend cambia a las rutas del enunciado.
- *Alternativa descartada*: usar las rutas del enunciado. Fallarían (`/positions` no existe) y obligarían a tocar el backend, que queda fuera de alcance.
- *Alternativa descartada*: axios, como en `candidateService.js`. No es una dependencia instalada y el resto de la app usa `fetch`.

### 2. Relacionar candidato y columna por nombre de fase, en una utilidad pura

Se crea `frontend/src/utils/kanban.ts` con:
- `sortSteps(steps)`: ordena por `orderIndex` y luego por `id`.
- `buildBoard(steps, candidates)`: devuelve `{ columns: [{ step, candidates[] }], unassigned: Candidate[] }`. Busca la primera fase ordenada cuyo `name` coincida con `currentInterviewStep`.
- `moveCandidate(board, applicationId, toStepId)`: devuelve un tablero nuevo, sin mutar el anterior.

El estado de la página guarda las fases y la lista de candidatos, y cada candidato lleva un `stepId` resuelto. Al mover, solo cambia el `stepId` de un candidato, y la reversión consiste en restaurar el valor previo.

- *Por qué*: la API no da el id de fase del candidato. Resolverlo una vez al cargar evita comparar por nombre en cada render y deja claro qué id se envía en el `PUT`. Las funciones puras se prueban sin DOM.
- *Alternativa descartada*: añadir `currentInterviewStepId` al backend. Es más robusto, pero queda fuera del alcance de una rama de frontend. Queda como pregunta abierta.

### 3. Drag and drop con `@hello-pangea/dnd`

Estructura: `DragDropContext` en la página, un `Droppable` por columna (`droppableId = String(step.id)`) y un `Draggable` por tarjeta (`draggableId = String(applicationId)`). `onDragEnd` recibe `source` y `destination`:
- Si `destination` es nulo o coincide con la columna de origen, no hace nada.
- En otro caso, mueve la tarjeta en el estado y llama al servicio.

- *Por qué*:
  - Está pensada para listas y tableros kanban.
  - Trae de serie soporte táctil (necesario para el requisito de móvil), arrastre con teclado y anuncios para lectores de pantalla.
  - Su API declarativa encaja con Bootstrap.
  - Es el fork mantenido de `react-beautiful-dnd`, compatible con React 18 y `StrictMode` (v18.0.1, peer `react ^18 || ^19`).
- *Alternativa descartada*: HTML5 Drag and Drop nativo. No funciona con táctil ni teclado, así que incumpliría el requisito de móvil y la accesibilidad.
- *Alternativa descartada*: `@dnd-kit/core`. Es más flexible y ligera, pero exige montar a mano sensores, colisiones, anuncios accesibles y la lógica de listas. Hay más código propio para el mismo resultado en un kanban simple.

### 4. Actualización optimista con reversión

Al soltar en otra columna:
1. Se guarda el `stepId` previo y se aplica `moveCandidate`.
2. Se llama a `updateCandidateStage`.
3. Si falla, se restaura el `stepId` previo **solo si la tarjeta sigue en la columna a la que se movió**, para no pisar un movimiento posterior. Después se muestra un `Alert` de Bootstrap que el usuario puede cerrar.

- *Por qué*: el arrastre debe sentirse inmediato. Esperar a la respuesta haría que la tarjeta "saltara" de vuelta a su columna durante la petición.
- *Alternativa descartada*: bloquear el tablero mientras se guarda. Es más simple, pero empeora la experiencia y no aporta nada: el backend no tiene conflictos de versión que resolver.

### 5. Componentes TypeScript en `components/PositionDetails/`

- `PositionDetails.tsx`: página. Lee `:id` con `useParams`, gestiona la carga, los errores y los reintentos, y contiene `DragDropContext` y `onDragEnd`.
- `StageColumn.tsx`: `Droppable` con cabecera y estado vacío.
- `CandidateCard.tsx`: `Draggable` con nombre y puntuación.
- `ScoreDots.tsx`: puntos redondeados con `aria-label`, o "Sin puntuación" si es 0.
- `PositionDetails.css`: estilos del tablero.

La ruta `<Route path="/positions/:id" element={<PositionDetails />} />` se añade en `App.js`.

- *Por qué*:
  - Se usa TS porque el código tipa las respuestas de la API y `Positions.tsx`, la página vecina, ya está en TS.
  - Se agrupa en carpeta porque son varios archivos de una misma pantalla. El resto de `components/` es plano, pero ahí cada componente es un solo archivo.
- La carga usa `Promise.all` sobre las dos peticiones dentro de un `useEffect` con un flag de cancelación. `StrictMode` monta dos veces en desarrollo, y el flag evita actualizar el estado de un efecto descartado.

### 6. Layout responsive con CSS propio, no con la rejilla de Bootstrap

Contenedor del tablero:
- En escritorio: `display: flex`, `gap`, `overflow-x: auto`, y columnas `flex: 0 0 280px`. Sobre fondo gris claro, columnas gris y tarjetas blancas con sombra, como en el ejemplo.
- Con `@media (max-width: 767.98px)`: `flex-direction: column` y columnas a `width: 100%`.

El título es un `h2`, precedido de un `Link` a `/positions` con el icono `ArrowLeft` de `react-bootstrap-icons` y `aria-label="Volver a posiciones"`.

- *Por qué*: la rejilla de Bootstrap reparte 12 columnas, y con 5 o más fases las columnas quedan estrechas o saltan de fila. Un flex con ancho fijo y scroll horizontal se adapta a cualquier número de fases. El breakpoint coincide con el `md` de Bootstrap para ser coherente.
- *Alternativa descartada*: usar `Row`/`Col` de Bootstrap. No gestiona bien un número variable de columnas.

### 7. Navegación desde el listado mock

Se añade `id` a cada posición de `mockPositions` en `Positions.tsx`: 1 y 2 coinciden con el seed, y 3 no existe. El botón "Ver proceso" usa `useNavigate` para ir a `/positions/${id}`. Así se llega a posiciones reales del seed y se puede probar el estado "no encontrada".

- *Por qué*: el enunciado pide asumir que el listado existe, pero sin este cambio no hay forma de llegar a la página desde la interfaz.

### 8. Tests

- Tests unitarios de `utils/kanban.ts`: orden con empates, agrupación, candidatos sin fase y movimiento sin mutación.
- Tests de `positionService.ts` con `fetch` simulado: desanidado, 404 → `NotFoundError`, error de red y cuerpo del `PUT`.
- Tests de `PositionDetails` con React Testing Library y el servicio simulado: título, columnas, tarjetas, "Sin puntuación", "Posición no encontrada", error con reintento, y aviso de candidatos sin fase.

El arrastre en sí no se prueba en jsdom. El comportamiento de `onDragEnd` se cubre exportando un manejador probado aparte y con la verificación manual.

## Risks / Trade-offs

- **[Riesgo] Dos fases con el mismo nombre en un flujo** → el candidato se asigna a la primera, que puede no ser la real. Mitigación: se documenta en la spec. La solución definitiva es que el backend devuelva el id de fase (ver Open Questions).
- **[Riesgo] El backend adopta las rutas del enunciado** (`/positions/...`, `/stage`) → las llamadas fallarían. Mitigación: las rutas solo están en `positionService.ts`.
- **[Riesgo] Datos inconsistentes del seed** (posición 2 sin fases y candidato en una fase ajena) → tablero vacío o candidato invisible. Mitigación: estado "sin fases definidas" y aviso de candidatos cuya fase no pertenece al proceso.
- **[Riesgo] Carrera entre movimientos rápidos**: un `PUT` antiguo falla después de un movimiento posterior de la misma tarjeta. Mitigación: la reversión solo se aplica si la tarjeta sigue en la columna del intento fallido.
- **[Trade-off] Actualización optimista** → durante un instante la interfaz muestra un estado aún no guardado. Se acepta a cambio de fluidez, y la reversión y el aviso cubren el fallo.
- **[Trade-off] Nueva dependencia** (~30 kB gzip) → se acepta a cambio de soporte táctil y de teclado sin código propio.
- **[Riesgo] Arrastre táctil en columnas apiladas largas** → la librería desplaza la ventana automáticamente al acercarse al borde. Se verifica manualmente en un viewport móvil.
- **[Limitación] `averageScore` hace la media de todas las entrevistas**, y 0 puede significar "sin entrevistas" o "puntuación 0". Se muestra "Sin puntuación" en ambos casos.

## Migration Plan

1. `npm install @hello-pangea/dnd` en `frontend/`.
2. Desplegar el frontend. Es un cambio aditivo: nueva ruta y un botón que antes no hacía nada.
3. Rollback: revertir el commit. No hay migraciones de datos ni cambios de API.

## Open Questions

- ¿Debería el backend devolver `currentInterviewStepId` en `GET /position/:id/candidates` para no depender del nombre de la fase?
- ¿Se corrige el seed (fases del flujo de "Data Scientist" y `orderIndex` duplicado) en un cambio aparte?
- ¿Se alinean las rutas del backend con las del enunciado (`/positions/:id/interviewFlow`, `PUT /candidates/:id/stage`) o se actualiza el enunciado?

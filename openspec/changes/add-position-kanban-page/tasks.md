## 1. Preparación

- [ ] 1.1 Instalar `@hello-pangea/dnd` en `frontend/` (`npm install @hello-pangea/dnd`) y comprobar que queda en `dependencies` de `frontend/package.json`
- [ ] 1.2 Verificar que `npm run build` en `frontend/` compila sin errores antes de empezar

## 2. Capa de datos

- [ ] 2.1 Crear `frontend/src/services/positionService.ts`:
  - URL base `http://localhost:3010`
  - Tipos `InterviewStep`, `PositionCandidate` e `InterviewFlowResult`
  - Clases de error `NotFoundError` y `ApiError`
- [ ] 2.2 Implementar `getInterviewFlow(positionId)` contra `GET /position/:id/interviewflow`. Debe devolver `{ positionName, steps }` desanidando `interviewFlow.interviewFlow.interviewSteps`, lanzar `NotFoundError` con 404 y `ApiError` con cualquier otro fallo
- [ ] 2.3 Implementar `getCandidates(positionId)` contra `GET /position/:id/candidates`, lanzando `ApiError` si la respuesta no es 2xx o hay error de red
- [ ] 2.4 Implementar `updateCandidateStage(candidateId, applicationId, stepId)` contra `PUT /candidates/:candidateId`, con cuerpo JSON `{ applicationId, currentInterviewStep: stepId }` y lanzando `ApiError` si falla
- [ ] 2.5 Crear `frontend/src/utils/kanban.ts` con:
  - `sortSteps`: orden por `orderIndex` y luego por `id`
  - `buildBoard(steps, candidates)`: asigna a cada candidato el `stepId` de la primera fase ordenada con el mismo nombre y separa los `unassigned`
  - `moveCandidate(candidates, applicationId, toStepId)`: inmutable

## 3. Componentes de la página

- [ ] 3.1 Crear `frontend/src/components/PositionDetails/ScoreDots.tsx`: `Math.round(averageScore)` puntos (máximo 5), `aria-label` "Puntuación media: X de 5", y "Sin puntuación" cuando la puntuación es 0
- [ ] 3.2 Crear `CandidateCard.tsx`: un `Draggable` con `draggableId = String(applicationId)` que muestra `fullName` y `ScoreDots`
- [ ] 3.3 Crear `StageColumn.tsx`: un `Droppable` con `droppableId = String(step.id)`, cabecera con el nombre de la fase, las tarjetas y el texto "Sin candidatos" cuando está vacía
- [ ] 3.4 Crear `PositionDetails.tsx`, parte de carga:
  - Leer `:id` con `useParams`; si no es numérico, mostrar "Posición no encontrada" sin llamar a la API
  - Cargar flujo y candidatos con `Promise.all` en un `useEffect` con flag de cancelación
  - Mostrar un spinner mientras carga
  - Con `NotFoundError`, mostrar "Posición no encontrada"
  - Con cualquier otro error, mostrar un mensaje y el botón "Reintentar"
- [ ] 3.5 En `PositionDetails.tsx`, añadir la cabecera: `Link` a `/positions` con el icono `ArrowLeft` y `aria-label="Volver a posiciones"`, seguido de un `h2` con `positionName`
- [ ] 3.6 En `PositionDetails.tsx`, renderizar el tablero:
  - `DragDropContext` con una `StageColumn` por fase ordenada
  - Mensaje "Esta posición no tiene fases definidas" si no hay fases
  - Alerta con los nombres de los candidatos `unassigned`
- [ ] 3.7 Implementar `onDragEnd`:
  - Sin `destination` o en la misma columna, no hacer nada
  - En otro caso, aplicar `moveCandidate` y llamar a `updateCandidateStage`
  - Si falla, restaurar el `stepId` previo solo si la tarjeta sigue en la columna destino, y mostrar un `Alert` de error que se pueda cerrar
- [ ] 3.8 Crear `PositionDetails.css`:
  - Tablero flex horizontal con `overflow-x: auto` y columnas `flex: 0 0 280px`
  - Estilo del ejemplo: columnas gris claro redondeadas y tarjetas blancas con sombra
  - Con `@media (max-width: 767.98px)`: `flex-direction: column` y columnas a todo el ancho

## 4. Rutas y navegación

- [ ] 4.1 Añadir `<Route path="/positions/:id" element={<PositionDetails />} />` en `frontend/src/App.js`
- [ ] 4.2 En `frontend/src/components/Positions.tsx`, añadir `id` a cada posición mock (1, 2 y 3) y hacer que "Ver proceso" navegue a `/positions/${id}` con `useNavigate`

## 5. Tests

- [ ] 5.1 Tests de `utils/kanban.ts`: orden con `orderIndex` empatado, agrupación por nombre, candidatos sin fase, nombres duplicados (gana la primera) y `moveCandidate` sin mutar la entrada
- [ ] 5.2 Tests de `positionService.ts` con `fetch` simulado: desanidado del flujo, 404 → `NotFoundError`, 500 y error de red → `ApiError`, y URL y cuerpo del `PUT`
- [ ] 5.3 Tests de `PositionDetails` con React Testing Library, `MemoryRouter` y el servicio simulado: título y flecha, número y orden de columnas, tarjeta en su columna, "Sin puntuación", "Posición no encontrada", error con "Reintentar" que vuelve a pedir los datos, y aviso de candidatos sin fase
- [ ] 5.4 Ejecutar `npx react-scripts test --watchAll=false` en `frontend/` y dejar todos los tests en verde

## 6. Verificación

- [ ] 6.1 Ejecutar `npm run build` en `frontend/` sin errores de TypeScript ni de compilación
- [ ] 6.2 Con la base de datos y el seed levantados, el backend en 3010 y el frontend en 3000, comprobar en `/positions/1`: título, flecha de vuelta, tres columnas ordenadas y tarjetas con puntuación
- [ ] 6.3 Arrastrar una tarjeta a otra columna con ratón y con teclado, recargar y comprobar que la fase persiste
- [ ] 6.4 Con el backend parado, arrastrar una tarjeta y comprobar que vuelve a su columna y aparece el error
- [ ] 6.5 Comprobar `/positions/2` (sin fases y candidato sin columna), `/positions/3` y `/positions/abc` (posición no encontrada), y "Ver proceso" desde `/positions`
- [ ] 6.6 Comprobar la vista móvil a 390 px de ancho: columnas apiladas a todo el ancho, sin scroll horizontal de la página, y arrastre táctil entre columnas

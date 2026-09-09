## 1. Preparación del proyecto

- [x] 1.1 Añadir `axios` y `@hello-pangea/dnd` a `dependencies` en `frontend/package.json` e instalar (`npm install` en `frontend/`)
- [x] 1.2 Declarar en `devDependencies` las piezas de test que hoy solo existen como dependencia transitiva: `jest`, `jest-environment-jsdom`, `babel-jest`, `identity-obj-proxy`, `@types/jest`
- [x] 1.3 Crear `frontend/jest.config.js` con `testEnvironment: 'jsdom'`, `transform` vía `babel-jest` con `presets: ['react-app']`, `moduleNameMapper` de CSS a `identity-obj-proxy`, `setupFilesAfterEnv` apuntando a `src/setupTests.ts` y `testMatch` sobre `src/**/*.test.{ts,tsx}`
- [x] 1.4 Crear `frontend/src/setupTests.ts` importando `@testing-library/jest-dom`
- [x] 1.5 Verificar que `npm test` arranca sin errores de configuración (aún sin suites o con una suite trivial)

## 2. Tipos y capa de servicios

- [x] 2.1 Crear `frontend/src/types/position.ts` con `InterviewStep` (`id`, `name`, `orderIndex`), `CandidateCard` (`id`, `applicationId`, `fullName`, `currentInterviewStep`, `averageScore`) e `InterviewFlow` (`positionName`, `steps`)
- [x] 2.2 Crear `frontend/src/services/positionService.ts` con `API_BASE_URL` leído de `process.env.REACT_APP_API_URL` y valor por defecto `http://localhost:3010`
- [x] 2.3 Implementar `getInterviewFlow(positionId)` contra `GET /position/:id/interviewflow`, desanidando `data.interviewFlow.interviewFlow` y ordenando `interviewSteps` por `orderIndex` ascendente
- [x] 2.4 Implementar `getCandidatesByPosition(positionId)` contra `GET /position/:id/candidates`, conservando `id` y `applicationId`
- [x] 2.5 Implementar `updateCandidateStage(candidateId, applicationId, interviewStepId)` contra `PUT /candidates/:id` con cuerpo `{ applicationId, currentInterviewStep }`

## 3. Lógica pura del tablero

- [x] 3.1 Crear `frontend/src/utils/kanban.ts` con `buildStepIndex(steps)` que devuelva el mapa `nombre de fase → id de fase`
- [x] 3.2 Implementar `groupCandidatesByStep(candidates, steps)` que agrupe por id de fase resolviendo el nombre, y ubique en la primera fase (con aviso en consola) los candidatos cuyo `currentInterviewStep` no coincida con ninguna
- [x] 3.3 Implementar `moveCandidate(candidates, applicationId, targetStepName)` como función pura que devuelva una nueva lista con la fase del candidato actualizada, sin mutar la entrada

## 4. Componentes de la interfaz

- [x] 4.1 Crear `frontend/src/components/kanban/CandidateCard.tsx` mostrando nombre completo y puntuación media, envuelto en `Draggable` con `draggableId` derivado del `applicationId`
- [x] 4.2 Crear `frontend/src/components/kanban/StageColumn.tsx` con el nombre de la fase como cabecera y un `Droppable` cuyo `droppableId` es el id de la fase, que se renderice también cuando no tenga candidatos
- [x] 4.3 Crear `frontend/src/components/kanban/KanbanBoard.tsx` con el `DragDropContext`, las columnas en el orden de `orderIndex` y un `onDragEnd` delgado que ignore los soltados sin destino o sobre la misma columna
- [x] 4.4 Crear `frontend/src/components/kanban/kanban.css` con la disposición responsive: `flex-column` por defecto y `flex-md-row` con `overflow-x: auto` desde el punto de corte `md`, más ancho mínimo de columna y estado visual de arrastre

## 5. Página de posición

- [x] 5.1 Crear `frontend/src/pages/PositionPage.tsx` que lea `:id` con `useParams` y cargue flujo y candidatos en paralelo al montar
- [x] 5.2 Añadir la cabecera con el `positionName` y, a su izquierda, un botón de flecha con nombre accesible que navegue a `/positions`
- [x] 5.3 Añadir el indicador de carga mientras las peticiones están en curso y el mensaje de error cuando alguna de las dos cargas falle
- [x] 5.4 Implementar el manejador de cambio de fase con actualización optimista, llamada a `updateCandidateStage`, reversión del estado ante fallo y alerta de error descartable

## 6. Integración con la aplicación

- [x] 6.1 Añadir la ruta `/positions/:id` → `PositionPage` al router ya existente en `frontend/src/App.js` (se detectó que `App.tsx`, el fichero que iba a reescribirse, era código muerto por duplicidad con `App.js`; se elimina `App.tsx` y no se tocan las rutas `/`, `/add-candidate`, `/positions` ya existentes)
- [x] 6.2 ~~Importar el CSS de Bootstrap en `frontend/src/index.tsx`~~ — innecesario: `App.js` ya lo importa; se revierte el import duplicado añadido por error en `index.tsx`
- [x] 6.3 Añadir `id` al modelo mock de `frontend/src/components/Positions.tsx` y hacer que "Ver proceso" navegue a `/positions/:id`

## 7. Tests unitarios

- [x] 7.1 `positionService.test.ts`: con `axios` mockeado, verificar las URLs exactas (`/position/:id/interviewflow`, `/position/:id/candidates`, `/candidates/:id`), el desanidado del flujo, el orden por `orderIndex` y el cuerpo `{ applicationId, currentInterviewStep }` del `PUT`
- [x] 7.2 `kanban.test.ts`: cubrir `groupCandidatesByStep` (resolución por nombre, fase desconocida a la primera columna sin perder al candidato) y `moveCandidate` (no mutación de la entrada, fase actualizada)
- [x] 7.3 `KanbanBoard.test.tsx`: una columna por fase, orden de columnas, columna vacía renderizada, tarjeta con nombre y puntuación media (incluido `averageScore: 0`) en la columna correcta
- [x] 7.4 `PositionPage.test.tsx`: con el servicio mockeado, verificar el indicador de carga, el título de la posición, la flecha de retorno navegando a `/positions` y el mensaje de error cuando falla la carga inicial
- [x] 7.5 `PositionPage.test.tsx`: verificar el flujo de cambio de fase invocando el manejador — tarjeta movida de inmediato, llamada a `updateCandidateStage` con los argumentos correctos, y reversión más alerta cuando la promesa se rechaza
- [x] 7.6 Ejecutar `npm test` en `frontend/` y dejar la suite completa en verde

## 8. Verificación final

- [x] 8.1 Levantar backend (`npm run dev` en `backend/`) y frontend (`npm start` en `frontend/`) y comprobar en `/positions/1` que se cargan fases y candidatos reales
- [x] 8.2 Comprobar que arrastrar/mover una tarjeta entre columnas persiste la fase (recargar la página y ver la tarjeta en la nueva columna). El gesto de ratón real no se pudo completar por limitaciones del navegador automatizado de esta sesión (los frames de animación de la librería no avanzan en una pestaña sin foco real); en su lugar se verificó: (a) que el sensor de `@hello-pangea/dnd` se activa correctamente ante un `mousedown`+`mousemove` reales (la tarjeta pasa a `position: fixed` con la clase `kanban-card-dragging`), y (b) el round-trip completo de persistencia — `PUT /candidates/:id` con el mismo payload que emite `updateCandidateStage`, seguido de recarga de página, mostró la tarjeta ya en la columna destino; se revirtió el dato de prueba al terminar
- [x] 8.3 Comprobar en vista móvil del navegador que las fases se apilan en vertical a ancho completo. El entorno de automatización no permitió redimensionar la ventana real del navegador; se verificó en su lugar que la media query `@media (min-width: 768px)` está presente tal cual en el CSS servido por la app en ejecución, y se confirmó visualmente el resultado forzando esa condición (columnas apiladas, ancho completo)

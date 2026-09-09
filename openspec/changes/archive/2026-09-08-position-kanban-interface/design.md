## Context

El frontend es una app CRA 5 (React 18.3 + TypeScript 4.9 + react-bootstrap 2.10), pero **coexisten dos ficheros de entrada**: `src/App.js` y `src/App.tsx`. La resolución de módulos de Create React App prioriza `.js` sobre `.tsx` (orden de `resolve.extensions`), así que `App.js` es el que realmente monta la aplicación; `App.tsx` es código muerto que webpack nunca compila ni sirve, aunque el editor no avisa de ello. `App.js` ya monta un `BrowserRouter` con rutas a `RecruiterDashboard` (`/`), `AddCandidateForm` (`/add-candidate`) y `Positions` (`/positions`) — `react-router-dom@6.23` ya está en uso, no es una dependencia sin estrenar. `Positions.tsx` existe y es alcanzable desde el dashboard, pero su botón "Ver proceso" no navega a ningún sitio. `axios` se importa en `services/candidateService.js` pero **no está declarado ni instalado**, así que cualquier ruta que lo cargue rompe hoy mismo.

El backend (Express, puerto **3010**, CORS abierto a `http://localhost:3000`) ya expone todo lo necesario, pero **las rutas reales no coinciden con las del enunciado**. Contrastado con `backend/src/index.ts`, `backend/src/routes/positionRoutes.ts` y `backend/src/routes/candidateRoutes.ts`:

| Enunciado | Real | Nota |
|---|---|---|
| `GET /positions/:id/interviewFlow` | `GET /position/:id/interviewflow` | recurso singular, ruta en minúsculas |
| `GET /positions/:id/candidates` | `GET /position/:id/candidates` | recurso singular |
| `PUT /candidates/:id/stage` con `new_interview_step` | `PUT /candidates/:id` con `{ applicationId, currentInterviewStep }` | sin sufijo `/stage`; ese parámetro no existe |

Dos formas concretas de las respuestas condicionan el diseño:

1. **Doble anidación en `interviewflow`.** El servicio devuelve `{ positionName, interviewFlow: {...} }` y el controlador lo envuelve otra vez (`res.json({ interviewFlow })`), de modo que el payload real es:

```json
{ "interviewFlow": { "positionName": "...", "interviewFlow": { "id": 1, "description": "...", "interviewSteps": [{ "id": 1, "name": "Initial Screening", "orderIndex": 1 }] } } }
```

2. **Asimetría de tipos en la fase.** `GET /position/:id/candidates` devuelve `currentInterviewStep` como **nombre de fase (string)**, mientras que el `PUT` exige el **id numérico** del `InterviewStep`. El frontend es el único responsable de traducir entre ambos.

```json
[{ "id": 4, "applicationId": 7, "fullName": "Ana Ruiz", "currentInterviewStep": "Technical Interview", "averageScore": 4.5 }]
```

El `PUT` identifica la aplicación por la pareja `(applicationId, candidateId)` — `Application.findOneByPositionCandidateId` filtra por ambos — así que la tarjeta debe conservar los dos identificadores.

## Goals / Non-Goals

**Goals:**
- Página kanban en `/positions/:id` con una columna por fase del flujo, ordenada por `orderIndex`.
- Tarjetas con nombre completo y puntuación media, colocadas en su fase actual.
- Cambio de fase por arrastre, persistido en el backend, con feedback inmediato y recuperación ante error.
- Presentación correcta en móvil: fases apiladas en vertical a ancho completo.
- Cobertura con tests unitarios de la lógica de servicio, del mapeo de datos y del comportamiento de la UI.
- Aislar el frontend de las rarezas del contrato de API (doble anidación, fase como nombre) en una única capa.

**Non-Goals:**
- No se modifica el backend ni se corrige la doble anidación de `interviewflow` (se normaliza en el cliente).
- No se implementa el listado real de posiciones (sigue con datos mock); solo se enlaza la navegación.
- Sin menú superior ni footer: el enunciado los da por existentes; esta página aporta el contenido interno.
- Sin reordenación dentro de una misma columna (el backend no persiste orden entre candidatos).
- Sin filtros, búsqueda, paginación, detalle de candidato ni tests E2E.

## Decisions

### 1. Librería de drag and drop: `@hello-pangea/dnd`

Es el fork mantenido de `react-beautiful-dnd`, compatible con React 18 (el original avisa con `StrictMode` en React 18 y está sin mantenimiento). Aporta soporte táctil y navegación por teclado de serie, lo que cubre el requisito móvil y la accesibilidad sin trabajo extra.

*Alternativas consideradas:*
- **HTML5 Drag and Drop nativo**: cero dependencias y trivial de simular en jsdom (`fireEvent.dragStart` / `drop`), pero **no funciona en táctil**, justo el escenario que el requisito de móvil pide cuidar. Descartada.
- **`@dnd-kit/core`**: más flexible y ligero, pero exige construir a mano el sensor de teclado y los anuncios de accesibilidad. Descartada por coste de implementación frente a un tablero sencillo.

### 2. La lógica de movimiento vive en funciones puras, fuera del árbol de DnD

`@hello-pangea/dnd` es difícil de ejercitar en jsdom porque mide el DOM real. En lugar de simular arrastres, `onDragEnd` se reduce a un adaptador delgado que extrae `draggableId` y `destination.droppableId` y delega en una función pura `moveCandidate(candidates, applicationId, targetStepId)`. Esa función, la de agrupación y el `positionService` concentran la lógica y **se testean directamente**, sin DOM. Los tests de componente cubren el render (columnas, tarjetas, título, flecha) y la invocación del callback, no la mecánica del arrastre.

*Alternativa considerada:* simular el arrastre completo con `userEvent` y mocks de `getBoundingClientRect`. Da tests frágiles y lentos que verifican la librería de terceros, no nuestro código. Descartada.

### 3. Capa `positionService` que normaliza el contrato

Un único módulo `services/positionService.ts` expone tres funciones tipadas que devuelven modelos limpios de dominio, absorbiendo las anomalías del backend:

- `getInterviewFlow(positionId)` → desanida `data.interviewFlow.interviewFlow` y devuelve `{ positionName, steps: InterviewStep[] }` con los pasos ordenados por `orderIndex`.
- `getCandidatesByPosition(positionId)` → `CandidateCard[]`.
- `updateCandidateStage(candidateId, applicationId, interviewStepId)` → `PUT /candidates/:id` con el body correcto.

La **base URL** se lee de `process.env.REACT_APP_API_URL` con `http://localhost:3010` como valor por defecto, en lugar de repetir la URL literal como hace hoy `candidateService.js`.

### 4. Mapeo nombre-de-fase a id de fase en el cliente

Como los candidatos llegan con la fase por nombre y el `PUT` exige id, el tablero construye un índice `name → stepId` a partir de los pasos del flujo y agrupa los candidatos por ese id. Un candidato cuyo `currentInterviewStep` no encaje con ninguna fase del flujo **se coloca en la primera columna** y se registra un aviso en consola: es preferible a ocultarlo, que dejaría candidatos invisibles para el reclutador.

*Alternativa considerada:* una columna "Sin asignar". Añade una columna que no existe en el proceso y confunde el modelo. Descartada.

### 5. Actualización optimista con rollback

Al soltar la tarjeta, el estado local se actualiza al instante y la llamada al `PUT` viaja en segundo plano. Si falla, la tarjeta vuelve a su columna original y se muestra una alerta descartable. Se prefiere esto a bloquear la UI durante la petición: el arrastre debe sentirse inmediato y la operación es reversible sin coste.

### 6. Responsive con utilidades de Bootstrap, con el mínimo CSS propio

El tablero es un contenedor flex: `flex-column` por defecto (móvil, cada columna a ancho completo) y `flex-md-row` con `overflow-x: auto` a partir de `md`. Bootstrap 5.3 ya está en el proyecto; solo se añade una hoja de estilos mínima para la altura de columna y el estado de arrastre.

### 7. Infraestructura de tests: `jest.config.js` con `babel-jest` y el preset de CRA

`npm test` ya apunta a `jest --config jest.config.js`, **pero ese fichero no existe**, así que hoy el comando falla. Se crea con `testEnvironment: 'jsdom'`, transformación vía `babel-jest` + `presets: ['react-app']` (ya presente en `node_modules`), `identity-obj-proxy` para CSS y un `setupTests` con `@testing-library/jest-dom`. Todo el toolchain necesario ya está instalado como dependencia transitiva de `react-scripts`; solo se declaran explícitamente las piezas que usamos.

*Alternativa considerada:* cambiar el script a `react-scripts test --watchAll=false`. Es cero configuración, pero rompe el script declarado en el repo y deja menos control sobre la cobertura. Descartada.

### 8. Añadir la ruta sobre el router real (`App.js`), no sobre el muerto (`App.tsx`)

En lugar de construir un router nuevo, se añade `<Route path="/positions/:id" element={<PositionPage />} />` a las rutas ya existentes en `App.js`, preservando `/` (`RecruiterDashboard`), `/add-candidate` y `/positions` tal cual estaban. `App.tsx` se elimina: mantenerlo habría dejado dos definiciones de rutas divergentes en el repositorio, una de ellas invisible en tiempo de ejecución. `Positions.tsx` gana un `id` en su modelo mock y el botón "Ver proceso" navega a la ruta de detalle.

*Nota:* la propuesta original planteaba reescribir `App.tsx` asumiendo que era la plantilla CRA sin usar; solo al verificar el resultado en el navegador (bundle sin cambios pese a los edits) se detectó la duplicidad `App.js`/`App.tsx`. Se documenta aquí porque cambia el fichero afectado por la tarea 6.1, no la funcionalidad entregada.

## Risks / Trade-offs

- **El mapeo por nombre de fase se rompe si dos pasos del flujo comparten `name`** → El índice usa la primera coincidencia y los pasos se ordenan por `orderIndex`; los nombres duplicados dentro de un mismo flujo no tienen sentido de negocio. Si aparecieran, el candidato cae en la primera de ellas y nunca desaparece.
- **La actualización optimista puede divergir del servidor si el `PUT` responde 200 pero no persiste** → El backend devuelve la `Application` actualizada; ante un error se revierte, y recargar la página siempre reconstruye el estado desde la API. No se cachea nada entre sesiones.
- **`@hello-pangea/dnd` es una dependencia nueva de unos 100 kB** → Aceptado a cambio de soporte táctil y de teclado. Al estar aislada en el componente de tablero, sustituirla afectaría a un único fichero.
- **Los tests no ejercitan el arrastre real** → Un fallo de integración con la librería no lo detectaría Jest. Mitigación: la lógica de negocio (agrupación, mapeo, llamada al API, rollback) está en funciones puras totalmente cubiertas; la verificación visual del arrastre se hace manualmente al levantar la app.
- **Añadir el router cambia la pantalla de inicio de la app** → Es intencionado: hoy es la plantilla CRA, sin valor. Revertible eliminando el router de `App.tsx`.
- **`axios` se añade ahora como dependencia declarada** → Corrige un fallo latente de `candidateService.js`, que dejaba de compilar en cuanto se importara.

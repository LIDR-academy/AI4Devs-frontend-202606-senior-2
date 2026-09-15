# Prompts iniciales

Registro de todos los prompts usados con el asistente de IA en este proyecto, en orden cronológico.
Cada entrada recoge el prompt literal, su objetivo y lo que se hizo como resultado.

---

## Prompt 1 — Usar OpenSpec (opsx) en el proyecto

- **Fecha:** 2026-09-15
- **Rama:** `frontend-JP`

### Prompt

> Quiero usar opsx en este proyecto

### Objetivo

Configurar OpenSpec en el repositorio para poder usar el flujo de comandos `/opsx` (propuestas de cambio, aplicación y archivado de especificaciones) desde Claude Code.

### Resultado

- Se comprobó que la CLI de OpenSpec ya está instalada globalmente (`openspec` 1.4.1, Node v23.6.0).
- Se verificó que el proyecto aún no tiene ni la carpeta `openspec/` ni `.claude/`, por lo que hay que ejecutar `openspec init`.
- El usuario interrumpió la tarea antes de inicializar OpenSpec para pedir primero el registro de prompts (Prompt 2).

---

## Prompt 2 — Crear el registro de prompts

- **Fecha:** 2026-09-15
- **Rama:** `frontend-JP`

### Prompt

> Debes crear la carpeta prompts y el archivo prompts-inicales.md cada prompt debe esatr detallado en ese archivo, entiendo que se tiene que poner esa norma en CLAUDE.md

### Objetivo

Dejar trazabilidad de todos los prompts del proyecto en un único archivo y convertirlo en una norma permanente para el asistente.

### Resultado

- Se creó la carpeta `prompts/` en la raíz del repositorio.
- Se creó este archivo, `prompts/prompts-iniciales.md`, con el Prompt 1 y el Prompt 2 documentados.
- Se añadió a `CLAUDE.md` una sección "Registro de prompts" que obliga a registrar cada prompt nuevo en este archivo con el mismo formato.
- A continuación se completó lo pendiente del Prompt 1 con `openspec init --tools claude`:
  - `openspec/` con `specs/`, `changes/` y `changes/archive/` (carpetas vacías; git no las rastrea hasta que contengan archivos).
  - `.claude/commands/opsx/`: `propose`, `explore`, `apply`, `verify`, `sync` y `archive`.
  - `.claude/skills/`: las 6 skills de OpenSpec correspondientes.
  - La configuración opcional (`config`) se omitió porque la inicialización fue no interactiva.
- Pendiente: reiniciar el IDE para que aparezcan los comandos `/opsx:*`.

---

## Prompt 3 — Explorar la interfaz "position"

- **Fecha:** 2026-09-15
- **Rama:** `frontend-JP`

### Prompt

> /openspec-explore Voya tener que crear la interfaz "position", una página en la que poder visualizar y gestionar los diferentes candidatos de una posición específica.

### Objetivo

Explorar (sin implementar) qué implica crear una página de detalle de posición donde ver los candidatos de una posición concreta y gestionarlos (moverlos entre etapas del proceso de entrevistas), antes de crear una propuesta de cambio en OpenSpec.

### Resultado

- Modo exploración de OpenSpec: no se escribió código de la aplicación.
- `openspec list --json` confirmó que no hay cambios activos.
- Se revisaron `frontend/src/App.js`, `Positions.tsx`, `RecruiterDashboard.js`, `package.json`, `backend/src/routes/positionRoutes.ts`, `positionService.ts`, `candidateController.ts`, `candidateService.ts`, `Application.ts`, `schema.prisma` y `prisma/seed.ts`.
- Hallazgos principales:
  - El backend ya tiene lo necesario: `GET /position/:id/interviewflow` (columnas), `GET /position/:id/candidates` (tarjetas) y `PUT /candidates/:id` (mover de etapa).
  - `candidates` devuelve la etapa por **nombre**, pero el `PUT` necesita el **id** de la etapa, así que hay que cruzarlos con el flujo.
  - Las etapas no vienen ordenadas por `orderIndex`, y en el seed "Technical Interview" y "Manager Interview" comparten `orderIndex: 2`.
  - No existe `GET /positions`: la lista de posiciones es mock y no tiene ids para enlazar a `/positions/:id`.
  - En el seed, el flujo de "Data Scientist" no tiene etapas y su candidato está en una etapa de otro flujo.
  - No hay librería de drag and drop en el frontend.
- Se plantearon opciones de interacción (arrastrar y soltar frente a botones o selector) y preguntas abiertas para el usuario.
- Pendiente: decisiones del usuario y, después, `/opsx:propose`.

---

## Prompt 4 — Propuesta OpenSpec de la página kanban de posición

- **Fecha:** 2026-09-15
- **Rama:** `frontend-JP`

### Prompt

> /opsx:propose Tu misión en este ejercicio es crear la interfaz "position", una página en la que poder visualizar y gestionar los diferentes candidatos de una posición específica.
>
> Se ha decidido que la interfaz sea tipo kanban, mostrando los candidatos como tarjetas en diferentes columnas que representan las fases del proceso de contratación, y pudiendo actualizar la fase en la que se encuentra un candidato solo arrastrando su tarjeta.Aquí tienes un ejemplo de interfaz posible:
>
> Algunos de los requerimientos del equipo de diseño que se pueden ver en el ejemplo son:
>
> Se debe mostrar el título de la posición en la parte superior, para dar contexto
>
> Añadir una flecha a la izquierda del título que permita volver al listado de posiciones
>
> Deben mostrarse tantas columnas como fases haya en el proceso
>
> La tarjeta de cada candidato/a debe situarse en la fase correspondiente, y debe mostrar su nombre completo y su puntuación media
>
> Si es posible, debe mostrarse adecuadamente en móvil (las fases en vertical ocupando todo el ancho)
>
> Algunas observaciones:
>
> Asume que la página de posiciones la encuentras
>
> Asume que existe la estructura global de la página, la cual incluye los elementos comunes como menú superior y footer. Lo que estás creando es el contenido interno de la página.
>
> Para implementar la funcionalidad de la página cuentas con diversos endpoints API que ha preparado el equipo de backend:
>
> GET /positions/:id/interviewFlow
> Este endpoint devuelve información sobre el proceso de contratación para una determinada posición:
>
> positionName: Título de la posición
>
> interviewSteps: id y nombre de las diferentes fases de las que consta el proceso de contratación
>
> ```json
> {
>       "positionName": "Senior backend engineer",
>       "interviewFlow": {
>
>               "id": 1,
>               "description": "Standard development interview process",
>               "interviewSteps": [
>                   {
>                       "id": 1,
>                       "interviewFlowId": 1,
>                       "interviewTypeId": 1,
>                       "name": "Initial Screening",
>                       "orderIndex": 1
>                   },
>                   {
>                       "id": 2,
>                       "interviewFlowId": 1,
>                       "interviewTypeId": 2,
>                       "name": "Technical Interview",
>                       "orderIndex": 2
>                   },
>                   {
>                       "id": 3,
>                       "interviewFlowId": 1,
>                       "interviewTypeId": 3,
>                       "name": "Manager Interview",
>                       "orderIndex": 2
>                   }
>               ]
>           }
>   }
> ```
>
> GET /positions/:id/candidates
> Este endpoint devuelve todos los candidatos en proceso para una determinada posición, es decir, todas las aplicaciones para un determinado positionID. Proporciona la siguiente información:
>
> name: Nombre completo del candidato
>
> current_interview_step: en qué fase del proceso está el candidato.
>
> score: La puntuación media del candidato
>
> ```json
> [
>       {
>            "fullName": "Jane Smith",
>            "currentInterviewStep": "Technical Interview",
>            "averageScore": 4
>        },
>        {
>            "fullName": "Carlos García",
>            "currentInterviewStep": "Initial Screening",
>            "averageScore": 0
>        },
>        {
>            "fullName": "John Doe",
>            "currentInterviewStep": "Manager Interview",
>            "averageScore": 5
>       }
>  ]
> ```
>
> PUT /candidates/:id/stage
> Este endpoint actualiza la etapa del candidato movido. Permite modificar la fase actual del proceso de entrevista en la que se encuentra un candidato específico, a través del parámetro "new_interview_step" y proporionando el interview_step_id correspondiente a la columna en la cual se encuentra ahora el candidato.
>
> ```json
> {
>      "applicationId": "1",
>      "currentInterviewStep": "3"
>  }
> ```
>
> ```json
> {
>     "message": "Candidate stage updated successfully",
>      "data": {
>          "id": 1,
>          "positionId": 1,
>          "candidateId": 1,
>          "applicationDate": "2024-06-04T13:34:58.304Z",
>          "currentInterviewStep": 3,
>          "notes": null,
>          "interviews": []
>      }
>  }
> ```

Nota: el prompt incluía una imagen de ejemplo tras "ejemplo de interfaz posible:". Muestra el título "Senior Backend Engineer Position" y cuatro columnas grises ("Llamada telefónica", "Entrevista técnica", "Entrevista cultural", "Entrevista manager"). Cada columna tiene tarjetas blancas con el nombre del candidato y círculos verdes que representan su puntuación.

### Objetivo

Crear con OpenSpec (`/opsx:propose`) un cambio completo, con propuesta, specs, diseño y tareas, para implementar la página kanban de una posición. En ella, los candidatos se muestran como tarjetas en columnas por fase y se cambian de fase arrastrándolos.

### Resultado

- Se creó el cambio `add-position-kanban-page` (esquema `spec-driven`) con `openspec new change`.
- Se comprobó el backend real, que difiere del enunciado:
  - Las rutas reales son `GET /position/:id/interviewflow`, `GET /position/:id/candidates` y `PUT /candidates/:id` (sin `/stage`).
  - `candidates` devuelve además `id` (candidateId) y `applicationId`.
- Se verificó que `@hello-pangea/dnd` 18.0.1 es compatible con React 18 (`peerDependencies` `^18 || ^19`). `@dnd-kit/core` 6.3.1 queda como alternativa.
- Artefactos creados en `openspec/changes/add-position-kanban-page/`:
  - `proposal.md`: motivo, cambios, capacidad nueva `position-kanban` e impacto. Solo frontend.
  - `specs/position-kanban/spec.md`: 7 requisitos con escenarios (acceso y ruta, carga y errores, cabecera con flecha, columnas por fase, tarjetas con puntuación, arrastre con actualización optimista, responsive).
  - `design.md`: 8 decisiones con alternativas, riesgos, plan de despliegue y preguntas abiertas.
  - `tasks.md`: 27 tareas en 6 grupos (preparación, capa de datos, componentes, rutas, tests y verificación manual).
- Decisiones tomadas sin preguntar al usuario:
  - Usar las rutas reales del backend, centralizadas en `positionService.ts`.
  - No modificar el backend ni el seed.
  - Resolver la fase del candidato por nombre y ordenar las fases por `orderIndex` y luego `id`.
  - Usar `@hello-pangea/dnd` para tener soporte táctil y de teclado.
  - Aplicar actualización optimista con reversión si falla el guardado.
  - Escribir los componentes en TypeScript, en `components/PositionDetails/`.
  - Añadir ids al mock de `Positions.tsx` para que "Ver proceso" navegue a la página.
- `openspec validate add-position-kanban-page --strict`: el cambio es válido. `openspec status`: 4/4 artefactos completos.
- No se escribió código de la aplicación.
- Pendiente: revisión del usuario y `/opsx:apply` para implementar. Quedan abiertas tres preguntas: devolver `currentInterviewStepId` desde el backend, corregir el seed y alinear las rutas del enunciado con las del backend.

---

## Prompt 5 — Implementar el cambio kanban

- **Fecha:** 2026-09-15
- **Rama:** `frontend-JP`

### Prompt

> /opsx:apply

### Objetivo

Implementar las tareas de `openspec/changes/add-position-kanban-page/tasks.md`: la página kanban `/positions/:id`, con su servicio de API, utilidades, componentes, estilos, rutas y tests, siguiendo la propuesta, la spec y el diseño.

### Resultado

- Las 27 tareas del cambio `add-position-kanban-page` quedaron completadas y marcadas en `tasks.md`.
- Se consultó en Context7 la documentación de `@hello-pangea/dnd` (`DragDropContext`, `Droppable`, `Draggable` y `DropResult`).
- **Archivos creados:**
  - `frontend/src/services/positionService.ts`: llamadas a las rutas reales del backend, con errores `ApiError` y `NotFoundError`.
  - `frontend/src/utils/kanban.ts`: `sortSteps`, `buildBoard`, `groupByStep`, `moveCandidate`, `revertMove` y `getMoveFromDropResult`.
  - `frontend/src/components/PositionDetails/`: `PositionDetails.tsx`, `StageColumn.tsx`, `CandidateCard.tsx`, `ScoreDots.tsx` y `PositionDetails.css`.
  - `frontend/src/setupTests.ts`: carga los matchers de `jest-dom`, que no existía.
  - Tests: `kanban.test.ts`, `positionService.test.ts` y `PositionDetails.test.tsx`.
- **Archivos modificados:**
  - `frontend/package.json` y `package-lock.json`: dependencia `@hello-pangea/dnd` ^18.0.1.
  - `frontend/src/App.js`: ruta `/positions/:id`.
  - `frontend/src/components/Positions.tsx`: `id` en las posiciones mock y "Ver proceso" navega a `/positions/:id`.
- **Tests:** 28 de 28 en verde con `npx react-scripts test --watchAll=false`.
  - Un test falló primero porque `user-event` v13 usa otra copia de `@testing-library/dom` y su clic no pasa por `act`. Se corrigió esperando con `findByText`.
- **Build:** `npm run build` compila sin errores. El único aviso de ESLint (`InputGroup` sin usar en `AddCandidateForm.js`) ya existía.
- **Verificación manual con Playwright** (backend en 3010, frontend en 3000 y la base de datos del contenedor `ai4devs-qa-202606-senior-2-db-1`, que usa las mismas credenciales):
  - `/positions/1`: título, flecha de vuelta, tres columnas en orden, tarjetas con puntos de puntuación y "Sin candidatos". El aspecto coincide con el ejemplo de diseño.
  - Arrastre con teclado, ratón (con movimientos progresivos) y táctil (eventos táctiles de CDP a 390 px): en los tres casos se envió `PUT /candidates/3` con respuesta 200, el cambio quedó en la base de datos y persiste al recargar.
    - `dragTo` de Playwright no mueve la tarjeta, porque hace un único movimiento de ratón y la librería necesita movimientos intermedios. No es un fallo de la aplicación.
  - Fallo al guardar: se abortó el `PUT` con `page.route` para simular el backend caído. La tarjeta volvió a su columna y apareció el aviso "No se pudo mover a Carlos García de fase. Inténtalo de nuevo.", que se puede cerrar.
  - `/positions/2` muestra el aviso de John Doe (fase ajena) y "Esta posición no tiene fases definidas". `/positions/3` y `/positions/abc` muestran "Posición no encontrada". "Ver proceso" navega correctamente.
  - Móvil a 390 px: columnas apiladas a todo el ancho (366 px útiles) y sin scroll horizontal de la página.
- Los datos modificados durante las pruebas se restauraron: la aplicación 4 volvió a la fase 1.
- Backend y frontend quedan arrancados en segundo plano. No se hizo commit.
- Pendiente: revisión del usuario y `/opsx:archive`.

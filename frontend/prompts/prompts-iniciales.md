# Prompts iniciales — Change `position-kanban-detail`

Este documento registra, en orden cronológico, cada prompt utilizado durante el desarrollo de la vista Kanban de detalle de posición (`PositionKanbanDetail`), incluyendo la propuesta inicial (`/opsx:propose`), las correcciones sobre los artefactos de planificación, y la implementación (`/opsx:apply`).

---

## 1. Propuesta inicial

**Fecha:** 2026-09-07

**Objetivo del prompt:** Solicitar la creación de una nueva vista Kanban para gestionar candidatos arrastrables entre las fases del proceso de contratación de una posición, generando todos los artefactos de planificación (proposal, specs, design, tasks) en un solo paso.

**Prompt usado:**
> "Crear vista Kanban de detalle de posición (PositionKambanDetail) para gestionar candidatos arrastrables entre fases del proceso de contratación, consumiendo los endpoints GET /position/{id}/interviewFlow, GET /position/{id}/candidates y PUT /candidates/{id}"

**Resultado obtenido:** Se creó el change `position-kanban-detail` en OpenSpec. Antes de escribir los artefactos, se inspeccionó el backend (`positionRoutes.ts`, `candidateRoutes.ts`, `positionService.ts`, `candidateController.ts`, `schema.prisma`) para confirmar la forma real de los tres endpoints, y se detectó que la ruta real es `interviewflow` en minúsculas (no `interviewFlow`). Como no existía ninguna librería de drag-and-drop ni se sabía si el alcance debía incluir el routing, se hicieron dos preguntas de aclaración al usuario:
- Librería de drag-and-drop a usar.
- Si el alcance incluye conectar la navegación (botón "Ver proceso" + ruta) o solo el componente aislado.

Las respuestas del usuario fueron inicialmente contradictorias entre sí (un texto libre decía "sí incluir routing", pero la opción seleccionada decía "solo el componente"), por lo que se pidió una confirmación explícita antes de continuar. El usuario confirmó: alcance completo (componente + routing + conexión del botón), usando `@hello-pangea/dnd`.

Se generaron los 4 artefactos: `proposal.md`, `specs/position-kanban/spec.md`, `design.md` y `tasks.md`, y el change validó correctamente con `openspec validate --strict`.

---

## 2. Primera corrección de artefactos

**Fecha:** 2026-09-07

**Objetivo del prompt:** Revisar los artefactos generados y señalar requisitos del enunciado original del ejercicio que faltaban en `tasks.md`, además de tres problemas técnicos a verificar contra el código real.

**Prompt usado:**
> "Revisé los artefactos generados y encontré 5 requerimientos del ejercicio que faltan en el tasks.md y 3 problemas técnicos. Por favor actualiza tasks.md y design.md para incluir:
>
> REQUERIMIENTOS FALTANTES:
> 1. Agregar task en sección 3: 'Renderizar el positionName como título en la parte superior de la vista'
> 2. Agregar task en sección 3: 'Añadir botón/flecha de retorno a la izquierda del título que navegue a /positions'
> 3. Agregar task en sección 3: 'Aplicar estilos responsive: columnas en horizontal (desktop) y vertical apiladas (móvil)'
> 4. Agregar task en sección 3: 'Mostrar fullName y averageScore dentro de cada tarjeta de candidato'
> 5. Agregar task en sección 5: 'Crear archivo prompts/prompts-iniciales.md documentando los prompts usados durante el desarrollo'
>
> PROBLEMAS TÉCNICOS:
> 6. Verificar si la ruta del endpoint es /position/:id/interviewflow (minúsculas) o /position/:id/interviewFlow (camelCase) revisando backend/src/routes/positionRoutes.ts, y corregir la task 2.1 si es necesario
> 7. Verificar si react-bootstrap está instalado en frontend/package.json. Si no, agregar task 1.3 para instalarlo, o cambiar la estrategia de alerts
> 8. En la task 4.2, documentar explícitamente que los IDs de posición mock son índices de array y que la verificación manual debe usar IDs que existan en la base de datos seed
>
> No ejecutes /opsx:apply todavía. Solo actualiza los artefactos y muéstrame los cambios."

**Resultado obtenido:** Se verificaron los puntos 6 y 7 contra el código antes de tocar nada: la ruta ya estaba correcta en minúsculas (`interviewflow`) y `react-bootstrap` ya estaba instalado, por lo que no requirieron cambios. Se agregaron las 5 tareas faltantes en `tasks.md` (título, botón de retorno, layout responsive, datos de la tarjeta, archivo de prompts) y se documentó explícitamente en la task 4.2 que los IDs mock son índices de array. Además, se detectó un vacío no solicitado: ninguna ruta montaba `Positions.tsx`, por lo que el botón de retorno apuntaría a una ruta vacía; se ajustó la task de routing para montar también `/positions`. Se actualizó `design.md` con las decisiones de header/back-navigation y layout responsive.

---

## 3. Segunda corrección de artefactos

**Fecha:** 2026-09-07

**Objetivo del prompt:** Solicitar que los 4 nuevos requisitos observables (título, botón de retorno, datos de la tarjeta, layout responsive) queden respaldados por escenarios BDD en el spec, y aclarar el contenido esperado del archivo de prompts.

**Prompt usado:**
> "Antes de ejecutar /opsx:apply, necesito dos correcciones finales:
>
> 1. AGREGAR SCENARIOS BDD AL SPEC.MD (Opción B que elegí):
> Agrega los Scenario correspondientes en specs/position-kanban/spec.md para los 4 nuevos requisitos observables que agregaste en tasks.md:
> - Título de la posición en la parte superior (task 3.2)
> - Botón de retorno al listado (task 3.3)
> - Datos en la tarjeta: fullName y averageScore (task 3.5)
> - Layout responsive (task 3.7)
>
> 2. ACLARAR LA TASK 5.1 SOBRE PROMPTS-INICIALES.MD:
> La task 5.1 dice solo 'frontend/prompts/prompts-iniciales.md' pero no especifica qué hacer. Actualízala para que sea explícita:
> - Crear el archivo frontend/prompts/prompts-iniciales.md
> - Documentar todos los prompts usados durante el desarrollo (propose, apply, etc.)
> - Incluir estructura: fecha, objetivo del prompt, prompt usado, resultado obtenido
>
> * todo el contenido de este archivbo en espanol
>
> Después de estas dos correcciones, muéstrame los cambios y luego ejecuta /opsx:apply."

**Resultado obtenido:** Se agregaron 4 nuevos elementos a `specs/position-kanban/spec.md`: un scenario "Returning to the positions list", y tres nuevos requirements ("Position title is displayed", "Candidate card shows identifying information", "Board layout adapts to viewport size"), cada uno con su/sus scenario(s) en formato WHEN/THEN. Se reescribió la task 5.1 de `tasks.md` para especificar explícitamente que el archivo debe escribirse enteramente en español y debe incluir, por cada prompt: fecha, objetivo, prompt usado (texto literal) y resultado obtenido — el propio archivo que se está leyendo ahora. El change volvió a validar correctamente en modo estricto.

---

## 4. Primer intento de `/opsx:apply` — bloqueado por test runner roto

**Fecha:** 2026-09-07

**Objetivo del prompt:** Iniciar la implementación de las tareas del change.

**Prompt usado:**
> "/opsx:apply" (invocado como slash command, sin argumentos adicionales del usuario más allá del nombre del change ya establecido en la conversación)

**Resultado obtenido:** Antes de escribir código se detectó que `frontend/package.json` define `"test": "jest --config jest.config.js"`, pero ese archivo no existe en `frontend/`, por lo que `npm test` fallaba inmediatamente (`Error: Can't find a root directory while resolving a config file path`). Esto bloqueaba la verificación de casi todas las tareas del plan que dependen de tests. Se presentaron tres opciones al usuario (usar `react-scripts test`, crear un `jest.config.js` propio, o verificar todo manualmente sin tests). El usuario descartó la pregunta sin elegir ("do not proceed, wait for next instruction"), por lo que la implementación se detuvo sin hacer ningún cambio de código.

---

## 5. Corrección del test runner

**Fecha:** 2026-09-07

**Objetivo del prompt:** Indicar la causa raíz del test runner roto y la solución específica a aplicar, y luego reanudar la implementación.

**Prompt usado:**
> "El proyecto usa Create React App, que incluye Jest configurado vía react-scripts. El script 'test' en package.json está mal configurado.
>
> Cambia la línea '\"test\": \"jest --config jest.config.js\"' por '\"test\": \"react-scripts test\"' en frontend/package.json.
>
> Después de ese cambio, vuelve a ejecutar /opsx:apply."

**Resultado obtenido:** Se corrigió el script `test` en `frontend/package.json` a `"react-scripts test"`. Se verificó ejecutando `npm test -- --watchAll=false`, confirmando que el runner ahora arranca correctamente (falla únicamente por ausencia de archivos de test en ese momento, lo esperado antes de implementar).

---

## 6. Reanudación e implementación (`/opsx:apply`)

**Fecha:** 2026-09-07

**Objetivo del prompt:** Reanudar `/opsx:apply` para implementar las 20 tareas de `tasks.md`.

**Prompt usado:**
> "/opsx:apply position-kanban-detail"

**Resultado obtenido:** Se implementaron las tareas de forma incremental, ejecutando y verificando tests después de cada grupo:

- **Setup (1.1–1.2):** se instaló `@hello-pangea/dnd`. Al intentar montar la ruta `/position/:id` en `App.tsx` se descubrió que el proyecto tenía **dos** archivos de entrada (`App.tsx`, boilerplate muerto de CRA, y `App.js`, el que webpack realmente resuelve y carga primero, con routing ya configurado para `/`, `/add-candidate` y `/positions`). Se preguntó al usuario cómo resolver la duplicación; el usuario eligió editar `App.js` y borrar `App.tsx`. Se aplicó esa decisión y se actualizaron `design.md`/`tasks.md` para reflejarla.
- **Servicios (2.1–2.3):** se creó `positionService.ts` (`getInterviewFlow`, `getCandidatesByPosition`) y se agregó `updateCandidateStage` a `candidateService.js`, con tests unitarios mockeando `axios` (6/6 tests en verde). Durante esta etapa se detectó que `axios` nunca había sido agregado a `package.json` pese a que `candidateService.js` ya lo importaba (el archivo estaba huérfano y webpack nunca lo compilaba); se instaló como dependencia real, ya que era necesario para que el código nuevo funcionara.
- **Componente `PositionKanbanDetail` (3.1–3.10):** se implementó el componente completo (columnas por fase, título, botón de retorno, tarjetas con nombre/puntuación, estados de carga/error, layout responsive vía CSS, y drag-and-drop con `@hello-pangea/dnd`, incluyendo actualización optimista con revert en caso de fallo). Se creó `PositionKanbanDetail.test.tsx` con 11 tests que mockean los servicios y la librería de drag-and-drop (interceptando `onDragEnd` para simular el drop sin depender de coordenadas reales de DOM, ya que jsdom no calcula layout real). Los 11 tests pasan.
- **Navegación (4.1–4.2):** se reemplazó el placeholder por `PositionKanbanDetail` en `App.js` y se conectó el botón "Ver proceso" de `Positions.tsx` a `navigate('/position/{index}')`, con test dedicado (`Positions.test.tsx`, 1/1 en verde). Se verificó manualmente en el navegador: clic en "Ver proceso" navega correctamente a `/position/0`.
- **Verificación adicional en vivo:** se consultó el backend real (`GET /position/1/interviewflow`, `GET /position/1/candidates`, `PUT /candidates/3`) con `curl`, confirmando que la forma de los datos coincide exactamente con lo implementado, y revirtiendo el dato de prueba modificado para no dejar efectos secundarios. No fue posible verificar visualmente el flujo completo de éxito ni el arrastre real en el navegador del sandbox porque el puerto 3000 (el único permitido por CORS en el backend) estaba ocupado por otra aplicación ajena a este proyecto ("Facturas"); esa verificación visual final queda pendiente para el entorno propio del usuario (task 5.3).

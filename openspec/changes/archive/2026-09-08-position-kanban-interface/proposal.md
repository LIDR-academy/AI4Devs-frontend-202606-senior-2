## Why

El equipo de reclutamiento no dispone de ninguna vista para seguir y gestionar el avance de los candidatos dentro del proceso de contratación de una posición concreta: el frontend solo tiene un listado de posiciones con datos mock (`frontend/src/components/Positions.tsx`) y el botón "Ver proceso" no lleva a ningún sitio. El backend ya expone los tres endpoints necesarios, por lo que la capacidad se puede entregar completa sin tocar el servidor.

## What Changes

- Nueva página "Position" (`/positions/:id`) con tablero **kanban**: una columna por cada fase del `interviewFlow` y una tarjeta por candidato en su fase actual.
- Cabecera con el **título de la posición** y una **flecha de retroceso** al listado de posiciones.
- Cada tarjeta muestra **nombre completo** y **puntuación media** del candidato.
- **Drag & drop** de tarjetas entre columnas que persiste la nueva fase vía API, con actualización optimista y *rollback* ante error.
- **Diseño responsive**: columnas en horizontal con scroll en escritorio, apiladas en vertical a ancho completo en móvil.
- Se añade la ruta `/positions/:id` al router ya existente en `frontend/src/App.js` (el proyecto tenía **dos** ficheros de entrada, `App.js` y `App.tsx`; por resolución de módulos de CRA, `App.js` es el que realmente se ejecutaba y ya enrutaba `/` → `RecruiterDashboard`, `/add-candidate` y `/positions`, mientras que `App.tsx` era código muerto). Se elimina `App.tsx` para no dejar dos entradas divergentes.
- Nueva capa de servicios `positionService` en el frontend, alineada con los endpoints **reales** del backend.
- **Corrección de endpoints respecto al enunciado** (verificado en `backend/src/index.ts`, `backend/src/routes/*`):
  - `GET /positions/:id/interviewFlow` → **`GET /position/:id/interviewflow`** (recurso en singular y ruta en minúsculas).
  - `GET /positions/:id/candidates` → **`GET /position/:id/candidates`** (recurso en singular).
  - `PUT /candidates/:id/stage` con `new_interview_step` → **`PUT /candidates/:id`** con body `{ applicationId, currentInterviewStep }`. **No existe** el sufijo `/stage` ni el parámetro `new_interview_step`.
- Infraestructura de **tests unitarios**: `jest.config.js` (hoy `npm test` apunta a un fichero inexistente) más suites para servicios y componentes.

## Capabilities

### New Capabilities
- `position-kanban`: visualización y gestión del proceso de contratación de una posición como tablero kanban — carga de fases y candidatos, tarjetas con nombre y puntuación media, cambio de fase por arrastre con persistencia, navegación de retorno y comportamiento responsive.

### Modified Capabilities
<!-- Ninguna: openspec/specs/ está vacío; no hay requisitos previos que cambien. -->

## Impact

**Código nuevo (frontend)**
- `frontend/src/pages/PositionPage.tsx`, `frontend/src/components/kanban/*` (tablero, columna, tarjeta), `frontend/src/services/positionService.ts`, `frontend/src/types/position.ts`.

**Código modificado**
- `frontend/src/App.js`: se añade la ruta `/positions/:id`. Se elimina `frontend/src/App.tsx` (código muerto, nunca resuelto por webpack).
- `frontend/src/components/Positions.tsx`: "Ver proceso" navega a `/positions/:id`.
- `frontend/package.json`: nuevas dependencias y script de test.

**Dependencias**
- `axios`: **no está instalado** pese a que `frontend/src/services/candidateService.js` ya lo importa (el código actual rompería en runtime). Se añade.
- Librería de drag & drop (`@hello-pangea/dnd`) — decisión detallada en `design.md`.
- Dev: `jest.config.js` + preset de CRA/babel para ejecutar las suites.

**Contratos de API (solo consumo, sin cambios en backend)**
- Base URL `http://localhost:3010` (CORS ya permite `http://localhost:3000`).
- `GET /position/:id/interviewflow` devuelve una estructura **doblemente anidada** (`{ interviewFlow: { positionName, interviewFlow: { interviewSteps[] } } }`), que el servicio debe normalizar.
- `GET /position/:id/candidates` devuelve `currentInterviewStep` como **nombre de la fase (string)**, mientras que el `PUT` espera el **id numérico** del paso: el frontend debe resolver ese mapeo.

**Riesgos**
- El backend no valida que el `currentInterviewStep` pertenezca al `interviewFlow` de la posición; la UI solo ofrecerá las fases del flujo cargado.
- `Positions.tsx` usa datos mock sin `id` real; se usará un id de posición navegable mientras no exista el endpoint de listado.

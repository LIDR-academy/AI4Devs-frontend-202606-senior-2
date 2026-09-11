# Prompts — Interfaz de gestión de candidatos (kanban)

> **Ejercicio:** AI4Devs · Módulo 10 (Programación asistida por IA: Frontend)
> **Repositorio:** `AI4Devs-frontend`

## Flujo de trabajo

El desarrollo se abordó en dos fases asistidas por IA:

1. **Exploración (Claude Haiku).** Recorrido rápido y de solo lectura del
   repositorio para mapear estructura, rutas, componentes y backend.
2. **Planificación (Claude Opus, *plan mode*).** Consolidación de la arquitectura
   actual del sistema y sus tecnologías, cuyo resultado se documentó en
   `prompts/arquitectura.md` (adjunto a continuación).

Con ese documento como base de contexto, se lanzó el **prompt de implementación**
(más abajo), que lo referencia explícitamente.

---

## Artefacto de contexto: `arquitectura.md`

```markdown
# Arquitectura actual del sistema — AI4Devs (LTI)

> Documento generado a partir de la exploración (Claude Haiku) y la sesión de
> planificación (Claude Opus). Describe la arquitectura y las tecnologías
> existentes ANTES de implementar la vista `position`.

## Visión general
Monorepo con dos aplicaciones independientes:
- `frontend/` — SPA en React (Create React App).
- `backend/` — API REST en Node/Express con Prisma sobre PostgreSQL.
- Base de datos orquestada con `docker-compose` (servicio `db`, Postgres).

## Frontend
- **Stack:** React 18, TypeScript 4.9, Create React App (react-scripts 5).
- **UI:** Bootstrap 5 + React-Bootstrap; iconos con `react-bootstrap-icons`.
- **Routing:** react-router-dom 6. El router activo es `src/App.js` (se resuelve
  antes que `App.tsx` por el orden de extensiones de webpack).
- **Rutas actuales:** `/` (RecruiterDashboard), `/add-candidate`
  (AddCandidateForm), `/positions` (Positions, con datos mock).
- **Servicios:** `services/candidateService.js` (usa axios).
- **Observación:** el botón "Ver proceso" de `Positions.tsx` no navega.

## Backend
- **Stack:** Express, TypeScript, Prisma ORM, PostgreSQL. Puerto `3010`.
- **Arquitectura por capas:** `routes/` → `presentation/controllers/` →
  `application/services/` → `domain/models/` (+ Prisma Client).
- **CORS:** permite `http://localhost:3000`.
- **Endpoints reales:**
  - `GET /position/:id/interviewflow` — nombre de la posición + fases. Respuesta
    con doble anidamiento: `{ interviewFlow: { positionName, interviewFlow:
    { interviewSteps } } }`.
  - `GET /position/:id/candidates` — `[{ fullName, currentInterviewStep (nombre),
    averageScore, id, applicationId }]`.
  - `PUT /candidates/:id` — body `{ applicationId, currentInterviewStep }`, siendo
    `currentInterviewStep` el id de la fase destino.
- **Discrepancia detectada:** el enunciado documenta
  `/positions/:id/interviewFlow` y `PUT /candidates/:id/stage`, que NO existen en
  el backend. Se codificará contra los endpoints reales.

## Modelo de datos (relevante para el kanban)
- `Position` pertenece a un `InterviewFlow`.
- `InterviewFlow` tiene muchos `InterviewStep` (las fases; `orderIndex` ordena).
- `Application` relaciona `Candidate` con `Position` y guarda su
  `currentInterviewStep`.
- `Interview` aporta el `score` que alimenta la puntuación media.

## Datos de prueba (seed)
- Posición 1 "Senior Full-Stack Engineer": 3 fases, 3 candidatos.
- Posición 2 "Data Scientist": flujo sin fases (caso límite).
```

---

## Prompt de implementación

**Rol y contexto.** Actúa como desarrollador frontend senior. Trabajamos sobre el
fork `AI4Devs-frontend`. Toma como base de contexto la arquitectura descrita en
`prompts/arquitectura.md` (adjunta arriba): React 18 + TypeScript (CRA),
React-Bootstrap, React Router 6 y un backend Express/Prisma. El listado de
posiciones (`Positions.tsx`) ya existe pero su botón **"Ver proceso"** no navega.

**Objetivo.** Crea la vista de detalle de una posición (`position`): una interfaz
**tipo kanban** para visualizar y gestionar los candidatos de un proceso de
selección. Se llega a ella al pulsar "Ver proceso", navegando a `/positions/:id`.

**Requisitos funcionales (del enunciado).**
1. Mostrar el **título de la posición** en la parte superior.
2. Añadir una **flecha a la izquierda** del título para volver al listado.
3. Renderizar **tantas columnas como fases** tenga el proceso (dinámico).
4. Cada candidato es una **tarjeta** situada en su fase, con **nombre completo** y
   **puntuación media**.
5. Permitir **cambiar la fase de un candidato arrastrando** su tarjeta, y
   **persistir** el cambio contra la API.
6. Diseño **responsive**: en móvil, las fases se apilan en vertical al 100%.

**Contrato de datos.** Usa los endpoints reales descritos en la arquitectura
(`GET /position/:id/interviewflow`, `GET /position/:id/candidates`,
`PUT /candidates/:id`).

**Restricciones técnicas.**
- Respeta el stack existente (React-Bootstrap) y usa **TypeScript** en el código
  nuevo.
- Implementa el drag & drop con **@dnd-kit** (React 18 + soporte táctil).
- Centraliza las llamadas en un servicio con la base URL en `REACT_APP_API_URL`
  (fallback `http://localhost:3010`).
- Crea solo el **contenido interno** de la página; asume que menú y footer
  globales ya existen.

**Robustez y casos límite.**
- Aplica **actualización optimista** al mover una tarjeta y **revierte** el estado,
  mostrando un aviso, si el `PUT` falla.
- Muestra un **estado vacío** cuando la posición no tenga fases configuradas
  (`interviewSteps` vacío), en lugar de un tablero en blanco.
- Ante una **posición inexistente (HTTP 404)** o un fallo de red, captura el error
  de la petición y muéstralo en un `Alert`, gestionando de forma explícita los
  estados de carga (spinner) y error para que el componente nunca quede roto.

---

## Resultado

Interfaz `position` tipo kanban conectada al backend real, con drag & drop
persistente (optimista, con reversión ante error), diseño responsive, estado vacío
para posiciones sin fases y manejo de posición inexistente. Todos los requisitos
funcionales del enunciado quedan cubiertos y verificados en local.

---

## Correcciones detectadas durante la implementación

Durante el desarrollo, el asistente detectó los siguientes puntos y, tras
indicárselos, recibió la instrucción de corregirlos:

1. **Normalización del doble anidamiento de `interviewflow`.** La respuesta real
   del endpoint viene envuelta como `interviewFlow.interviewFlow.interviewSteps`.
   Se ajustó el servicio para aplanar esa estructura antes de consumirla. No
   formaba parte del prompt de implementación; se resolvió como corrección al
   verificar la respuesta real del backend.
2. **Doble mensaje ante posición inexistente (HTTP 404).** El `Alert` de error de
   carga y el estado vacío "sin fases" se mostraban simultáneamente. Se corrigió
   para mostrar únicamente el `Alert` cuando la carga falla, y el estado vacío solo
   cuando la posición existe pero no tiene fases configuradas.
3. **Estado de aviso sin uso (código muerto).** Existía un estado `notice` que
   nunca se asignaba y su `Alert` asociado nunca se mostraba. Se eliminaron ambos.

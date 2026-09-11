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

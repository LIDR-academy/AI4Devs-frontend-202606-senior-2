# Prompts iniciales — Vista Position (Kanban)

Ejercicio AI4Devs Frontend. Stack real del repo: Create React App, React 18, TypeScript, React Bootstrap, react-router-dom v6. Backend Express en `http://localhost:3010`.

Cada bloque es un prompt independiente. Pegar uno por turno. No ejecutar el siguiente hasta que el anterior esté aplicado y el plan (si lo pide) esté aceptado.

---

## Prompt 1 — Contexto y plan (no codear todavía)

Lee el frontend y solo lo necesario del backend para implementar la vista de detalle de una posición (Kanban de candidatos). No escribas código todavía.

Archivos a leer sí o sí:
- `frontend/src/App.js` (rutas reales; ignora `App.tsx`, es el boilerplate CRA sin usar)
- `frontend/src/components/Positions.tsx`
- `frontend/src/components/RecruiterDashboard.js`
- `frontend/src/services/candidateService.js`
- `frontend/package.json`
- `backend/src/index.ts`
- `backend/src/routes/positionRoutes.ts`
- `backend/src/routes/candidateRoutes.ts`
- `backend/src/presentation/controllers/positionController.ts`
- `backend/src/presentation/controllers/candidateController.ts`
- `backend/src/application/services/positionService.ts`

Devuelve un plan corto (máx. 1 página) con:
1. Archivos a crear/tocar en `/frontend` y por qué.
2. Contrato real de cada endpoint (URL, método, shape de request/response), contrastado con el código, no con el enunciado.
3. Cómo mapear candidato → columna (el GET trae el nombre de la fase; el PUT necesita el `id` numérico del `interviewStep`).
4. Cómo hacer drag and drop sin inflar el stack.
5. Qué no vas a tocar.

Restricciones:
- No Next.js, no shadcn, no Tailwind, no MUI.
- No toques `/backend`.
- No rediseñes layout global (header/footer/menú). Solo el contenido interno de la página.
- TypeScript estricto, sin `any`.
- Componentes pequeños (un concepto por archivo; si pasa de ~150 líneas, divide).
- KISS: cero animaciones decorativas, cero estado global extra, cero dependencias que no hagan falta.
- Mobile first y WCAG 2.2 AA (semántica HTML antes que ARIA).

---

## Prompt 2 — Implementar la página Position

Implementa el plan acordado. Muestra el diff mental (archivos) en 5 líneas y luego aplica.

### Qué hay que construir
Al hacer clic en "Ver proceso" de una tarjeta en `/positions`, navegar a `/positions/:id` (página "position"): Kanban de candidatos de esa posición.

### UI (contenido interno, no el chrome de la app)
- Fila superior: botón/enlace "volver" (flecha a la izquierda) + título de la posición (`positionName`).
- Tantas columnas como fases en `interviewSteps`, ordenadas por `orderIndex`.
- Cada candidato es una tarjeta en su fase: nombre completo + puntuación media.
- En móvil: columnas apiladas a todo el ancho. En desktop: columnas en horizontal, scroll horizontal si no caben.
- Estilo alineado con `Positions.tsx` (React Bootstrap: Container, Row, Col, Card, Button). No inventes un design system.

### Navegación
- En `Positions.tsx`, el botón "Ver proceso" debe ser un `Link`/`navigate` a `/positions/:id`.
- Las posiciones mock no tienen `id`. Añade ids numéricos coherentes con el seed (al menos `1` y `2`). Sin eso el Kanban no puede pegarle al backend.
- Registrar la ruta en `frontend/src/App.js`. No uses `App.tsx`.

### API real (inspecciona el código; el enunciado está desfasado)
Base: `http://localhost:3010`

1. `GET /position/:id/interviewflow`
   - El controller responde `{ interviewFlow: <retorno del service> }`.
   - El service ya trae `{ positionName, interviewFlow: { id, description, interviewSteps: [{ id, name, orderIndex, ... }] } }`.
   - Desanida con cuidado. No asumas el JSON del enunciado.

2. `GET /position/:id/candidates`
   - Array. Enunciado: `fullName`, `currentInterviewStep` (nombre de fase), `averageScore`.
   - El service también incluye `id` (candidateId) y `applicationId`. Úsalos: hacen falta para el PUT.
   - Agrupa por `currentInterviewStep` === `interviewSteps[].name`.

3. `PUT /candidates/:id`
   - `:id` = candidateId.
   - Body: `{ "applicationId": <number>, "currentInterviewStep": <interviewStep.id> }` (el id de la columna destino, no el nombre).
   - Respuesta: `{ message, data }`.

Estados de UI: loading, error (mensaje claro, sin stack), vacío por columna.

### Arquitectura (frontend)
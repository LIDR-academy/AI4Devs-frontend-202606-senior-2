# Plan — Vista Position (Kanban)

## 1. Archivos a crear/tocar (`/frontend`)

### Tocar

- `src/App.js` — registrar `/positions/:id` (el entry `index.tsx` importa `./App` y CRA resuelve `.js` antes que `App.tsx`).
- `src/components/Positions.tsx` — id numérico en el mock (al menos 1 y 2, alineado al seed) y “Ver proceso” → `Link` a `/positions/:id`.

### Crear (un concepto por archivo, React Bootstrap como `Positions.tsx`)

- `src/types/position.ts` — tipos del contrato real (sin `any`).
- `src/services/positionService.ts` — GET flow, GET candidatos, PUT etapa. Base `http://localhost:3010` como el servicio actual. No mezclar con `candidateService.js` (CV / alta).
- `src/components/PositionPage.tsx` — lee `:id`, loading/error, orquesta.
- `src/components/PositionHeader.tsx` — volver a `/positions` + `positionName`.
- `src/components/KanbanBoard.tsx` — columnas ordenadas por `orderIndex`.
- `src/components/KanbanColumn.tsx` — drop zone + vacío.
- `src/components/CandidateCard.tsx` — `fullName`, `averageScore`, draggable + control de teclado.

Estado local en la página. Cero store extra.

## 2. Contrato real (código, no enunciado)

Montaje: `app.use('/position', …)` y `app.use('/candidates', …)`.

### `GET /position/:id/interviewflow` → 200

El controller envuelve el service otra vez: `{ interviewFlow: <retorno del service> }`. Shape real:

```ts
{
  interviewFlow: {
    positionName: string;           // Position.title
    interviewFlow: {
      id: number;
      description: string;
      interviewSteps: Array<{
        id: number;
        interviewFlowId: number;
        interviewTypeId: number;
        name: string;
        orderIndex: number;
      }>;
    };
  };
}
```

- **Título:** `data.interviewFlow.positionName`
- **Pasos:** `data.interviewFlow.interviewFlow.interviewSteps`
- **404:** `{ message, error }`

### `GET /position/:id/candidates` → 200, array plano (sin wrapper)

```ts
Array<{
  fullName: string;
  currentInterviewStep: string; // nombre de fase, no id
  averageScore: number;         // 0 si no hay entrevistas
  id: number;                   // candidateId (PUT)
  applicationId: number;        // PUT
}>
```

### `PUT /candidates/:id`

- `:id` = `candidateId`
- Body: `{ applicationId, currentInterviewStep }` (ambos `parseInt`; `currentInterviewStep` = id numérico del step)
- **200:** `{ message, data }`
- **Errores:** 400/404 con `{ error }` o `{ message, error }`

No hay `GET /positions`. El listado sigue mock.

## 3. Candidato → columna

- Ordenar `interviewSteps` por `orderIndex` (el seed tiene dos steps con `orderIndex: 2`; desempate por `id`).
- Columna = `step.name`. Candidato entra si `candidate.currentInterviewStep === step.name`.
- Mapa `name → step.id` para el PUT: al soltar en una columna, body `currentInterviewStep: step.id`, no el nombre.
- Seed útil: posición 1 “Senior Full-Stack Engineer” (3 fases; candidatos en Screening y Technical). Posición 2 “Data Scientist” no tiene steps en su flow; el Kanban puede quedar vacío o con candidatos sin columna — UI de vacío, no “arreglar” el seed (backend off-limits).

## 4. Drag and drop sin inflar el stack

`package.json` no tiene DnD. No añadir `@dnd-kit` ni nada extra (aunque haya restos en `node_modules`).

- **HTML5:** `draggable` en la tarjeta, `onDragOver`/`onDrop` en la columna.
- **WCAG / móvil:** `<select>` nativo (o anterior/siguiente) con las fases, mismo PUT. El DnD nativo no es usable con teclado ni fiable en touch.
- Optimista + rollback si el PUT falla. Sin animaciones.

## 5. Qué no tocar

- Backend entero
- `App.tsx`
- `RecruiterDashboard.js`
- `AddCandidateForm`
- `FileUploader`
- `candidateService.js`
- Layout global
- Next / shadcn / Tailwind / MUI
- Estado global
- Dependencias nuevas

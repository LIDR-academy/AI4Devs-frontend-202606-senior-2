## Why

Los reclutadores no tienen forma de ver en qué fase del proceso de contratación está cada candidato de una posición ni de cambiarla desde la interfaz. El backend ya expone el flujo de entrevistas, los candidatos por posición y la actualización de fase, pero ninguna pantalla del frontend los usa. El botón "Ver proceso" del listado de posiciones no hace nada.

## What Changes

- Nueva página `/positions/:id` con un tablero kanban de la posición:
  - Título de la posición arriba, con una flecha a la izquierda para volver a `/positions`.
  - Una columna por cada fase del flujo de entrevistas de la posición, ordenadas por `orderIndex`.
  - Una tarjeta por candidato en la columna de su fase actual, con su nombre completo y su puntuación media.
  - Arrastrar una tarjeta a otra columna actualiza la fase del candidato en el backend. Si la petición falla, la tarjeta vuelve a su columna original y se muestra un error.
  - Estados de carga, posición no encontrada, error de red y columnas vacías.
  - En móvil (menos de 768 px), las fases se apilan en vertical y ocupan todo el ancho.
- Nueva capa de acceso a la API de posiciones en el frontend, que consume los endpoints reales del backend:
  - `GET /position/:id/interviewflow`
  - `GET /position/:id/candidates`
  - `PUT /candidates/:id`
- El botón "Ver proceso" del listado de posiciones (mock) navega a la página de la posición correspondiente. Para ello se añade un `id` a cada posición mock.
- Nueva dependencia de frontend: `@hello-pangea/dnd`, para arrastrar y soltar con soporte táctil y de teclado.
- Fuera de alcance: cambios en el backend, conectar el listado de posiciones a datos reales, y el menú superior y footer globales (se asume que ya existen).

## Capabilities

### New Capabilities

- `position-kanban`: página de detalle de una posición que muestra sus candidatos agrupados por fase del proceso de contratación y permite cambiarlos de fase arrastrando su tarjeta. Incluye la navegación desde y hacia el listado de posiciones y el comportamiento responsive.

### Modified Capabilities

(Ninguna: `openspec/specs/` está vacío.)

## Impact

- **Frontend**:
  - `frontend/src/App.js`: nueva ruta.
  - `frontend/src/components/Positions.tsx`: ids en el mock y navegación en "Ver proceso".
  - Nuevos componentes TypeScript para la página, las columnas y las tarjetas.
  - Nuevo servicio `frontend/src/services/positionService.ts`.
  - Utilidades puras para agrupar y mover candidatos.
  - Una hoja de estilos para el tablero.
- **Dependencias**: se añade `@hello-pangea/dnd` (^18, compatible con React 18) a `frontend/package.json`.
- **APIs**: solo se consumen las existentes; no hay cambios de contrato. El enunciado del ejercicio documenta `/positions/:id/interviewFlow` y `PUT /candidates/:id/stage`, pero el backend real monta `/position/:id/interviewflow` y `PUT /candidates/:id`. Se usan las rutas reales.
- **Backend y base de datos**: sin cambios.

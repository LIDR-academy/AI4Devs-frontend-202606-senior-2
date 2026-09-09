## Why

El ejercicio original está descrito en openspec/specs/position-kanban/spec.md. Nuestra base conserva la historia del PR #5. El rollback global de un movimiento fallido puede borrar movimientos posteriores si permitimos guardados simultáneos. Necesitamos estados observables y una operación en vuelo para mantener consistencia local.

Esta propuesta documenta retrospectivamente el ejemplo resuelto. La demo roja reproduce una regresión; no afirma un historial TDD original.

## What Changes

- Añadir estados reproducibles Loaded, Saving, MoveSuccess y MoveError.
- Separar responsabilidades con Atomic Design y bloquear movimientos simultáneos.
- Restaurar el tablero ante errores y liberar el bloqueo al terminar.
- Preparar aplicación, API y PostgreSQL local con datos ficticios y prueba integrada.
- Mantener la búsqueda fuera de esta base para construirla durante clase.

## Capabilities

### New Capabilities
- `kanban`: protecciones, accesibilidad por teclado y estados del kanban resuelto.

### Modified Capabilities

Ninguna: se conserva el contrato original position-kanban y se añaden protecciones.

## Impact

Frontend: PositionKanbanDetail, KanbanBoard, CandidateSummary, MoveStatus, tests y stories. Preparación local: listado de posiciones real, CORS local, DATABASE_URL y scripts de seed/arranque. No requiere desarrollar backend durante el ejercicio de búsqueda. Quedan fuera concurrencia entre usuarios, reintentos automáticos, resolución de respuestas ambiguas y validación de producción. Publicación actual y aceptación visual Chromatic siguen pendientes.

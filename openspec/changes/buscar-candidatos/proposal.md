## Why

El reclutador necesita encontrar candidatos dentro de una posición sin recorrer todas las tarjetas. Implementaremos el diseño de búsqueda de Figma sobre el kanban existente, conservando el movimiento persistente y la recuperación ante errores.

## What Changes

- Añadir búsqueda local por subcadena del nombre, insensible a mayúsculas, tildes y espacios exteriores.
- Mostrar coincidencias/total, limpiar con recuperación del foco y estado sin resultados.
- Mantener columnas, identidad de candidatura y datos ocultos al arrastrar con filtro.
- Desactivar búsqueda y arrastre mientras se guarda; conservar consulta y datos tras un fallo.
- Adaptar la barra a móvil y añadir pruebas, stories y evidencia visual conforme al flujo de clase.
- Usar datos reales del seed (José García, Alex Demo, Sam Ejemplo); los nombres y conteos de Figma son ejemplos, no constantes de UI.

## Capabilities

### New Capabilities
- `busqueda`: búsqueda accesible y convivencia con el kanban de la posición cargada.

### Modified Capabilities

Ninguna. Se conserva position-kanban y las protecciones de kanban-seguro. Filtrar cambia la proyección visible, no el conjunto de candidaturas ni el contrato de persistencia.

## Impact

Frontend: nueva molécula CandidateSearch, estado derivado y traducción de índices en PositionKanbanDetail, CSS, tests y stories. Se reutilizan KanbanBoard, CandidateSummary, MoveStatus y Bootstrap. No hay dependencias nuevas ni cambios de backend. La API ya devuelve el conjunto completo y guarda por id/applicationId.

Referencia visual: https://www.figma.com/design/MAYDxDOTFpBPFeK0HqHbvQ?node-id=0-1 . Frames «01 · Búsqueda · Coincidencia y vacío» y «02 · Búsqueda · Móvil», revisados el 9 de septiembre. No existe prototipo verificado de los estados de guardado/error; design.md explicita las decisiones propuestas.

Fuera de alcance: búsqueda global, endpoint search, paginación, filtros por score/fase/email, persistencia de consulta entre visitas, refactor del resto de rutas y migraciones de herramientas. El cambio local frontend-atomic-storybook es independiente y no se modifica. Los checkpoints existentes son referencias de recuperación, no evidencia de haber implementado esta propuesta actual.

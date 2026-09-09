# SDD del ejemplo resuelto: Atomic Design

Primero describimos la pantalla LTI y los estados Loaded, Saving, MoveSuccess y MoveError. Después acordamos las responsabilidades antes de implementar.

| Nivel | Implementación | Contrato |
| --- | --- | --- |
| Átomos | Button, Spinner y texto de Bootstrap | Acciones y feedback accesible; reutilizamos las primitivas existentes. |
| Moléculas | CandidateSummary y MoveStatus | Mostrar una candidatura y anunciar el guardado. Sin llamadas HTTP. |
| Organismo | KanbanBoard | Recibir steps, columns, disabled y onDragEnd. Componer columnas y tarjetas, emitir el gesto. |
| Plantilla | Distribución del detalle LTI | Cabecera, estados y tablero adaptable. No requiere un archivo artificial. |
| Página | PositionKanbanDetail | Ruta, carga, estado, identidad del movimiento, guardado y rollback. Inyectar servicios para probar sin red. |

El organismo presenta el estado recibido. La página decide si un movimiento es válido y mantiene una única operación en vuelo. La identidad de candidatura nunca depende del nombre. La separación se comprueba con tests de la página y stories de las moléculas y estados completos.

## Decisiones y límites

La página acepta servicios inyectables con los servicios HTTP actuales por defecto. Stories usan candidatos ficticios y promesas controladas. El guard con ref bloquea sin esperar un render; el estado React desactiva las tarjetas y anuncia guardado. El rollback global se conserva porque solo hay una operación en vuelo. Finalmente se libera el bloqueo, tanto en éxito como en fallo.

CandidateSummary concentra presentación; MoveStatus concentra el anuncio accesible. Se conserva la apariencia original de LTI/Bootstrap: fondo blanco, columnas #f8f9fa, tarjetas blancas con borde #dee2e6, texto secundario #6c757d y foco azul #0d6efd. No se migra el resto de páginas.

Riesgos pendientes de integración: respuestas tardías al navegar, conflictos entre sesiones y error de red tras una persistencia exitosa. Requieren contrato backend e idempotencia; no se consideran resueltos por mocks.

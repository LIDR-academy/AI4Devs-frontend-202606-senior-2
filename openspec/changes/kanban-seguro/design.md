# Decisiones

El organismo acepta servicios inyectables con los servicios HTTP actuales por defecto. Stories usan candidatos ficticios y promesas controladas. El guard con ref bloquea sin esperar un render; el estado React desactiva las tarjetas y anuncia guardado. El rollback global se conserva porque solo hay una operación en vuelo. Finalmente se libera el bloqueo, tanto en éxito como en fallo.

CandidateSummary concentra presentación; MoveStatus concentra el anuncio accesible. Se conserva la apariencia original de LTI/Bootstrap: fondo blanco, columnas #f8f9fa, tarjetas blancas con borde #dee2e6, texto secundario #6c757d y foco azul #0d6efd. No se migra el resto de páginas.

Riesgos pendientes de integración: respuestas tardías al navegar, conflictos entre sesiones y error de red tras una persistencia exitosa. Requieren contrato backend e idempotencia; no se consideran resueltos por mocks.

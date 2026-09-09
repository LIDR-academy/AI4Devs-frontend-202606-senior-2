# Decisiones

El organismo acepta servicios inyectables con los servicios HTTP actuales por defecto. Stories usan candidatos ficticios y promesas controladas. El guard con ref bloquea sin esperar un render; el estado React desactiva las tarjetas y anuncia guardado. El rollback global se conserva porque solo hay una operación en vuelo. Finalmente se libera el bloqueo, tanto en éxito como en fallo.

CandidateSummary concentra presentación; MoveStatus concentra el anuncio accesible. Se usa CSS acotado al tablero con fondo negro y acento amarillo LIDR. No se migra el resto de páginas.

Riesgos pendientes de integración: respuestas tardías al navegar, conflictos entre sesiones y error de red tras una persistencia exitosa. Requieren contrato backend e idempotencia; no se consideran resueltos por mocks.

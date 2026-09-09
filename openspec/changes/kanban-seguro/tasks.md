## 1. Contrato y diseño
- [x] 1.1 Documentar enunciado original y adaptaciones reales en openspec/specs/position-kanban/spec.md.
- [x] 1.2 Definir Atomic Design y contratos de responsabilidad en design.md.

## 2. Implementación y pruebas
- [x] 2.1 Añadir stories del componente real con servicios deterministas.
- [x] 2.2 Extraer KanbanBoard, CandidateSummary y MoveStatus.
- [x] 2.3 Serializar movimientos, anunciar guardado y conservar rollback.
- [x] 2.4 Verificar 12 pruebas del tablero y 4 escenarios Chrome; reproducir rojo/verde preparado.
- [x] 2.5 Conectar listado real y PostgreSQL local con seed repetible y backend preparado.
- [x] 2.6 Verificar aplicación → API → PostgreSQL → recarga mediante frontend/e2e-app/kanban.spec.ts; comprobar rollback ante PUT fallido simulado. 17 pruebas frontend y compilaciones también pasaron.

## 3. Revisión pendiente
- [ ] 3.1 Republicar el commit actual y sus stories en Chromatic; builds 1 y 2 son anteriores a la extracción.
- [ ] 3.2 Completar revisión visual humana y aceptación de baseline.

No archivar el cambio mientras quede aceptación pendiente. La integración demostrada es local con datos ficticios; no declara preparación para producción ni prueba de concurrencia entre usuarios.

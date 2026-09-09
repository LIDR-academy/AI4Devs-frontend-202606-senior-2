## 1. Diseño y SDD

- [x] 1.1 Revisar esta propuesta contra los dos frames de Figma y registrar aceptación de columnas conservadas, datos dinámicos y estados de guardado/error; comprobar que BS-01 a BS-05 reflejan lo acordado.
- [x] 1.2 Registrar commit base y contratos Atomic Design de design.md; validar con npm run openspec -- validate buscar-candidatos --strict y guardar un checkpoint de planificación sin código de búsqueda.

## 2. TDD rojo

- [x] 2.1 Añadir pruebas BS-01/02 de normalización, conteos, ausencia de nuevas peticiones, vacío y foco; ejecutar test:session y registrar fallos por búsqueda inexistente, no por imports rotos.
- [x] 2.2 Añadir pruebas BS-03 para José en índice visible cero, ancla destino con tarjetas ocultas y fase sin coincidencias; verificar identidad de payload y conservación de tarjetas, con fallo esperado en la base.
- [x] 2.3 Añadir pruebas BS-04 de bloqueo y rollback completo con consulta activa; demostrar el fallo y que las 12 pruebas previas del kanban siguen pasando. Guardar checkpoint rojo y salida de pruebas.

## 3. Implementación verde

- [x] 3.1 Crear CandidateSearch controlada con Bootstrap, etiqueta, conteos y limpiar/foco; pasar pruebas BS-01/02 sin servicios ni DnD dentro de la molécula.
- [x] 3.2 Derivar resultados y conteos desde query y columnas completas en la página; comprobar ausencia de GET adicional y distinguir error de carga, posición vacía y cero coincidencias.
- [x] 3.3 Traducir origen y ancla destino por applicationId, conservar guard y snapshot completo; pasar todos los escenarios BS-03/04 sin alterar backend.
- [x] 3.4 Aplicar disposición desktop/móvil y foco visible; ejecutar typecheck, lint:session y test:session desde frontend, registrar evidencia y guardar checkpoint verde.

## 4. Storybook e integración

- [ ] 4.1 Leer skills storybook y storybook-component-documentation y añadir Ready, Match, NoResults y Saving de la molécula; comprobar documentación de props y build-storybook sin actualizar versiones.
- [ ] 4.2 Añadir stories integradas para consulta vacía, coincidencia, cero resultados, error/rollback y móvil; verificar conteo calculado, foco y teclado mediante pruebas de navegador, diferenciando args fijos de integración.
- [x] 4.3 Probar BS-03 desde la aplicación real con backend ya iniciado: buscar jose, mover José, limpiar para comprobar Alex/Sam y recargar para verificar persistencia. Registrar resultado y restaurar datos ficticios al terminar.
- [ ] 4.4 Verificar 375px sin desbordamiento y controles desactivados durante guardado; guardar checkpoint Storybook con resultados y relación escenario/story/test.

## 5. Chromatic

- [ ] 5.1 Revisar compatibilidad de skills Chromatic con Storybook 7.6; publicar en el proyecto autorizado el commit actual sin guardar tokens en el repo y registrar URL, commit, stories y viewports.
- [ ] 5.2 Revisar diferencias desktop/móvil contra el diseño y documentar aceptación humana o incidencias; no usar builds históricos como prueba del commit nuevo ni aceptar baselines automáticamente.
- [ ] 5.3 Guardar checkpoint Chromatic con enlaces y estado real de revisión; comprobar que los pendientes de publicación/aceptación permanecen abiertos si no se completan.

## 6. PR y cierre

- [ ] 6.1 Revisar diff contra kanban-solved, enlazar Figma, spec, pruebas de aplicación, stories y build; verificar que no hay cambios backend, nuevas dependencias ni guion docente publicado.
- [ ] 6.2 Crear o actualizar el PR del incremento con evidencia por BS-01 a BS-05, límites y ramas de recuperación; guardar checkpoint PR sin sobrescribir referencias existentes.
- [ ] 6.3 Sincronizar especificación y archivar solo tras aceptación funcional y visual; comprobar requisitos y tareas pendientes antes de ejecutar sync/archive.

Base de implementación: 8693e5a. Inicio autorizado tras revisar la propuesta. Checkpoint de planificación: buscar-candidatos-clase/02-sdd.

TDD rojo: 7 fallos nuevos por buscador/estado vacío ausentes; 12 pruebas originales pasan. Checkpoint buscar-candidatos-clase/03-tdd-rojo.

TDD verde: 19/19 pruebas, typecheck y lint:session aprobados. test:app verifica búsqueda jose, arrastre de José, conservación de Alex al limpiar, persistencia tras recarga y rollback. Comprobación Chrome adicional a 375px: botón debajo, sin desbordamiento y foco recuperado. Checkpoint buscar-candidatos-clase/04-tdd-verde. Stories del nuevo componente y publicación actual pendientes.

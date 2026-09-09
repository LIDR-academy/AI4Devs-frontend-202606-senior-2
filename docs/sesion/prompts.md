# Prompts para desarrollar con IA

Ejecutar por etapas: Diseño → SDD con Atomic Design → TDD → Storybook → Chromatic → PR. Revisar la salida antes de ejecutar el siguiente prompt. Las instrucciones siguientes son material para copiar a una IA, no un guion del presentador.

## Contexto inicial para ambos recorridos

> Trabaja en este repositorio LTI. Lee sus instrucciones, identifica la rama y revisa el estado de Git antes de editar. Conserva el trabajo existente. Inspecciona los componentes, servicios, estilos, pruebas y skills disponibles. No cambies de librería visual ni amplíes el alcance. Diferencia lo observado de lo supuesto y no presentes resultados sin haber ejecutado la verificación. No publiques ni aceptes cambios externos hasta que te lo pida. Para cada etapa devuelve los archivos afectados, decisiones, evidencia y pendientes.

## A. Kanban con drag and drop

La referencia resuelta está en `kanban-solved`, revisada en PR #12. Si se trabaja sobre esa referencia, pedir análisis y reproducción de las pruebas, sin fingir que la característica no existe. Para reconstruir una implementación, acordar primero la rama de trabajo y su estado inicial.

### A1. Diseño y estados

> Inspecciona la vista original de detalle de posición de LTI. Describe la interacción de arrastrar una candidatura entre fases y conserva Bootstrap. Define los estados cargando, vacío, error de carga, movimiento en curso, éxito y fallo con recuperación. Incluye teclado y móvil a 375 px. Identifica qué se puede reutilizar y qué decisiones de producto faltan. Entrega un inventario visual y reglas observables; todavía no implementes.

### A2. SDD empezando por Atomic Design

> Empieza por las responsabilidades de Atomic Design: primitivas Bootstrap, CandidateSummary y MoveStatus como moléculas, KanbanBoard como organismo y PositionKanbanDetail como página. Define el contrato steps, columns, disabled y onDragEnd del tablero. La página posee datos, servicios, identidad, bloqueo y rollback. No crees wrappers o carpetas sin responsabilidad real. Documenta propuesta, diseño, escenarios KB-01 a KB-04 y tareas en openspec/changes/kanban-seguro. Especifica que solo persiste una operación a la vez y qué sucede en éxito o fallo. Señala la concurrencia entre usuarios como fuera de alcance.

### A3. TDD y reproducción del fallo

> Vincula cada criterio KB con una prueba observable. Cubre cambio de fase, rollback, bloqueo de un segundo movimiento y móvil. Si la conducta falta, escribe primero una prueba que falle por ese requisito. Si estás en kanban-solved, reproduce la regresión preparada con scripts/kanban-exercise.py rojo, ejecuta test:session y explica por qué falla KB-03; restaura con verde y repite. No presentes esta reproducción como historial original de TDD. No cambies los requisitos para hacer pasar las pruebas ni dejes el guard retirado.

### A4. Implementación y refactor

> Implementa o revisa la composición acordada. KanbanBoard presenta columnas y emite gestos; CandidateSummary y MoveStatus presentan datos y estado; PositionKanbanDetail controla servicios, columnas y persistencia. Serializa movimientos y restaura el estado anterior ante error. Conserva claves applicationId y apariencia LTI. Si la solución ya existe, identifica diferencias frente al contrato antes de modificar. Ejecuta pruebas, tipos y lint; comprueba el diff y los límites que siguen pendientes.

### A5. Storybook e interacción

> Documenta las moléculas y los estados Loaded, Empty, Loading, LoadError, CandidatesError, LongName, Saving, MoveSuccess y MoveError. Usa datos ficticios y promesas controladas. Verifica el gesto con teclado en un navegador real, el bloqueo mientras guarda, el rollback y el ancho móvil. Distingue pruebas del callback de la interacción completa y explica qué depende de servicios simulados.

### A6. Chromatic

> Con autorización para publicar y el token configurado de forma segura, publica el commit verificado de kanban-solved en el proyecto Chromatic de LIDR. Registra commit, número de build, stories, capturas y resultado. Compara con el baseline y revisa si el refactor conserva la apariencia. No confundas salida exitosa del CLI con aceptación visual. No aceptes diferencias automáticamente. Si faltan credenciales, deja el comando preparado y el paso pendiente.

### A7. PR del ejemplo resuelto

> Prepara la revisión de la referencia kanban-solved. Explica la historia heredada del PR #5, las mejoras docentes y la composición Atomic Design. Relaciona KB-01 a KB-04 con tests, stories y build real. Señala que el diff contra main incluye la historia previa. Describe riesgos de navegación, concurrencia y red que los mocks no resuelven. No fusiones el PR ni marques aceptación pendiente como completada.

## B. Búsqueda de candidatos sobre el kanban resuelto

Trabajar en `sesion-frontend/sesion`, que comienza como `kanban-solved`, sin búsqueda. Los checkpoints `kanban-ejercicio/01-diseno` a `06-chromatic-pr` permiten consultar el resultado de cada etapa. Guardar el trabajo antes de cambiar de rama.

### B1. Diseño de la nueva función

> Revisa el diseño del laboratorio en https://www.figma.com/design/MAYDxDOTFpBPFeK0HqHbvQ y la vista LTI existente. Define búsqueda vacía, coincidencia, cero resultados y móvil. Buscar jose encuentra José; limpiar devuelve el foco; el conteo se refiere a la posición cargada. El filtro no elimina datos ni cambia la identidad al arrastrar. Describe estados y reglas, sin implementar ni asumir acceso a otro archivo de Figma.

### B2. SDD empezando por Atomic Design

> Reutiliza el mapa de Atomic Design del kanban. Añade CandidateSearch como molécula controlada que recibe query, visibleCount, totalCount, disabled y onQueryChange. La molécula no conoce HTTP ni DnD; la página posee query y columnas completas y deriva visibleColumns. Conserva KanbanBoard. Redacta propuesta, decisiones, tareas y criterios BS-01 a BS-05 en openspec/changes/buscar-candidatos. Incluye foco, vacío, normalización, identidad, rollback y móvil. Todavía no implementes.

### B3. Pruebas rojas

> Escribe pruebas que fallen porque todavía no existe la búsqueda. Conserva las doce pruebas del kanban. Cubre jose/José, conteo y vacío, foco al limpiar, arrastre de José cuando su índice visible es cero y rollback con candidatos ocultos. Ejecuta test:session y explica el fallo de cada caso. El checkpoint 03-tdd-rojo espera cuatro fallos nuevos y doce pruebas existentes pasando; una importación rota no demuestra el requisito.

### B4. Implementación con Atomic Design

> Implementa CandidateSearch según su contrato controlado. La página mantiene la consulta, normaliza con NFD y deriva resultados y conteo sin duplicar estado. Al mover, resuelve applicationId desde la lista visible y traduce también el índice de destino a la lista completa. Conserva el bloqueo durante guardado y el rollback de todas las columnas. Reutiliza KanbanBoard y Bootstrap. Ejecuta tests, tipos y lint. Explica por qué los candidatos ocultos permanecen intactos.

### B5. Storybook e interacción

> Añade stories aisladas de CandidateSearch para Ready, Match, NoResults y Saving, e integradas SearchReady, SearchMatch y SearchNoResults de la página. Aclara que los conteos fijos de la molécula son entradas de presentación; la página debe verificar su cálculo. Ejecuta las pruebas Chrome de búsqueda, limpiar con foco, arrastre filtrado y móvil. Comprueba que no se pierden los escenarios del kanban.

### B6. Chromatic y comparación

> Con autorización y token seguro, publica la rama de búsqueda en el mismo proyecto Chromatic. Compara con kanban-solved y distingue nuevos estados de regresiones en stories existentes. Verifica que el build corresponde al commit actual; los builds 1 y 2 anteriores al refactor no demuestran las nuevas extracciones. Enlaza el build y deja las diferencias pendientes de revisión humana, sin autoaceptarlas.

### B7. PR y alcance de producto

> Revisa el diff de búsqueda contra kanban-solved. Relaciona BS-01 a BS-05 con pruebas y stories, enlaza Figma y el build del commit actual. Distingue las pruebas Chrome con servicios simulados de la comprobación independiente de API con PostgreSQL y del recorrido integrado aún pendiente. Actualiza tasks.md con evidencia real. Proponer búsqueda global, filtros o paginación como nuevos incrementos, no como refactors. No fusionar ni archivar el cambio mientras falte aceptación.

## C. Evolución del contrato

> Ante un cambio pedido durante el desarrollo, clasifica si conserva la conducta o introduce un requisito. Si es refactor, conserva pruebas y compara capturas. Si cambia conducta, actualiza diseño, criterio, prueba, implementación, story y revisión antes de cerrar la tarea. Explica los efectos sobre componentes y servicios. Mantén la trazabilidad y no amplíes silenciosamente la feature.

## D. Práctica de skills

### D1. Atomic Design antes del SDD

> Lee .agents/skills/lti-atomic-design/SKILL.md y aplícala al estado real de esta rama. Devuelve inventario existente/propuesto, contratos de props, propietario del estado y relación con criterios y pruebas. Explica qué componente no debe conocer HTTP ni DnD. No implementes todavía ni crees wrappers solo para completar niveles. Indica qué decisión del resultado procede de la skill y cuál de la spec de la feature.

### D2. Storybook después del contrato

> Lee .agents/skills/storybook/SKILL.md, frontend/package.json y las stories existentes antes de proponer cambios. Respeta las versiones instaladas. Para CandidateSearch propone Ready, Match, NoResults y Saving, diferenciando args de presentación de cálculos que debe probar la página. Si CandidateSearch todavía no existe, entrega el plan; si existe y te pido implementarlo, añade o revisa las stories y ejecuta build-storybook. No actualices paquetes ni publiques por el mero hecho de usar la skill.

### D3. Revisar la salida de una skill

> Contrasta el resultado con la spec y el código. Detecta responsabilidades mezcladas, estado derivado duplicado, ejemplos incompatibles con la versión de Storybook y stories que aparenten verificar lógica solo por recibir args fijos. Explica qué aceptas, qué corriges y qué prueba demuestra la corrección. Una skill guía la ejecución; no sustituye evidencia ni aceptación humana.

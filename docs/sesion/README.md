# Sesión: búsqueda sobre nuestro kanban resuelto

**Punto de partida: `kanban-solved`.** Contiene nuestra versión resuelta del drag and drop, con Bootstrap LTI, guardado y rollback, Storybook y pruebas. La búsqueda todavía no existe en esta rama.

`sesion-frontend/sesion` arranca en el mismo commit que `kanban-solved` y sirve para trabajar en directo. Nuestra solución conserva la historia del PR #5; no se presenta como main ni como una implementación independiente de esa historia.

## Checkpoints

| Rama | Estado |
| --- | --- |
| kanban-solved | Nuestro kanban resuelto, sin búsqueda |
| sesion-frontend/sesion | Rama para implementar en clase, mismo inicio |
| kanban-ejercicio/01-diseno | Diseño de búsqueda, conteo y vacío |
| kanban-ejercicio/02-sdd | Propuesta y criterios BS-01 a BS-05 |
| kanban-ejercicio/03-tdd-rojo | Cuatro pruebas nuevas fallan; 12 existentes pasan |
| kanban-ejercicio/04-tdd-verde | Búsqueda implementada; 16 pruebas pasan |
| kanban-ejercicio/05-storybook | Stories de búsqueda y 7 escenarios Chrome |
| kanban-ejercicio/06-chromatic-pr | Guía de comparación visual y revisión del cambio |

Los checkpoints son acumulativos y quedan como referencias. Para cambiar de rama, guardar primero el trabajo con commit. Crear ramas locales de seguimiento desde origin si todavía no existen. No se modifica main ni una rama de alumno.

## Preparación

Node 22.6+ y Chrome. Desde frontend: `npm ci`, `npm run storybook`. Pruebas: `npm run test:session`, `npm run typecheck`, `npm run test:stories`. En el checkpoint rojo se esperan fallos de la característica nueva.

## Recorrido

Diseño → SDD → TDD → Storybook → Chromatic → PR.

La nueva característica permite buscar candidatos por nombre, contar coincidencias, limpiar y recuperar foco, y distinguir cero resultados. El filtro debe conservar la identidad de la candidatura al arrastrar y los datos ocultos ante un rollback. No se añaden nuevas peticiones backend.

Diseño propio basado en LTI: https://www.figma.com/design/MAYDxDOTFpBPFeK0HqHbvQ . El archivo muestra el resultado que construiremos, no una función ya disponible en kanban-solved.

00–20: revisión de PRs y diseño. 20–40: SDD con IA. 40–60: tests rojos y corrección. 60–70: descanso. 70–90: Storybook y navegador. 90–100: Chromatic. 100–120: PR, preguntas y cierre.

La IA debe leer el repo y el contrato antes de editar, demostrar el fallo y enlazar cada criterio con evidencia. Chromatic requiere un proyecto autorizado y revisión humana de baselines. Backend real e integración quedan pendientes. Las herramientas y skills apoyan cada paso, sin decidir el alcance por su cuenta.

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
| kanban-ejercicio/06-chromatic | Publicación y revisión visual preparadas; build actual pendiente |
| kanban-ejercicio/07-pr | Revisión del incremento, enlaces y evidencia de API |

Los checkpoints son acumulativos y quedan como referencias. Para cambiar de rama, guardar primero el trabajo con commit. Crear ramas locales de seguimiento desde origin si todavía no existen. No se modifica main ni una rama de alumno.

## Preparación

Node 22.6+ y Chrome. Desde frontend: `npm ci`, `npm run storybook`. Pruebas: `npm run test:session`, `npm run typecheck`, `npm run test:stories`. En el checkpoint rojo se esperan fallos de la característica nueva.

## Dos recorridos de la clase

Primero explicamos el kanban resuelto usando Diseño, SDD con Atomic Design, TDD, Storybook, Chromatic y PR. Después repetimos ese proceso para construir la búsqueda en directo. El ejemplo de referencia contiene KanbanBoard, CandidateSummary y MoveStatus; la solución de búsqueda añade CandidateSearch. Atomic Design se aplica en código, no solo en el diagrama.

## Recorrido

Diseño → SDD → TDD → Storybook → Chromatic → PR.

La nueva característica permite buscar candidatos por nombre, contar coincidencias, limpiar y recuperar foco, y distinguir cero resultados. El filtro debe conservar la identidad de la candidatura al arrastrar y los datos ocultos ante un rollback. No se añaden nuevas peticiones backend.

Diseño propio basado en LTI: https://www.figma.com/design/MAYDxDOTFpBPFeK0HqHbvQ . El archivo muestra el resultado que construiremos, no una función ya disponible en kanban-solved.

00–15: revisión de PRs. 15–40: kanban resuelto y Atomic Design. 40–60: diseño y SDD de búsqueda. 60–70: descanso. 70–100: implementación, tests, Storybook y Chromatic. 100–120: PR y cierre.

La IA debe leer el repo y el contrato antes de editar, demostrar el fallo y enlazar cada criterio con evidencia. Chromatic requiere un proyecto autorizado y revisión humana de baselines. El arranque local y la prueba de aplicación están documentados en backend-local.md. Las herramientas y skills apoyan cada paso, sin decidir el alcance por su cuenta.


## Recuperar un paso

Cada checkpoint contiene el resultado de esa etapa. Para rehacer una etapa, partir del checkpoint anterior; para saltar una etapa bloqueada, partir del suyo. 03-tdd-rojo falla intencionalmente (4 nuevos fallos, 12 pruebas existentes pasando); 04-tdd-verde pasa las 16 pruebas.

Antes de cambiar de rama, detener los servidores de desarrollo y revisar git status. Guardar los cambios elegidos en un commit en la rama de trabajo. No borrar trabajo ni usar reset --hard para recuperar.

Ejemplo para continuar desde la implementación resuelta en una rama nueva:

```sh
git fetch origin
git switch -c recuperacion/04-tdd-verde origin/kanban-ejercicio/04-tdd-verde
cd frontend
npm ci
npm run test:session
npm run storybook
```

Si ese nombre local ya existe, elegir otro nombre de recuperación, sin sobrescribirlo. Mantener sesion-frontend/sesion como inicio de clase y los checkpoints como referencias.

La rama histórica 06-chromatic-pr se conserva porque es la cabecera del PR #11. Los checkpoints para recorrer el proceso son ahora 06-chromatic y 07-pr por separado. Cambiar de rama no restaura Figma, datos de backend, builds ni aprobaciones externas. Seguir los enlaces de evidencia para esos sistemas.

## Aplicación completa antes de clase

Preparar el backend con [backend-local.md](backend-local.md). La sesión parte con API y datos listos; la búsqueda se implementa enteramente en frontend. `npm run test:app` verifica el tablero real contra PostgreSQL.

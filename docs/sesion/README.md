# Laboratorio LIDR: del kanban a una feature verificable con AI

Este ejercicio vive en **AI4Devs-frontend-202606-senior-2**, sobre el código del [PR #5](https://github.com/LIDR-academy/AI4Devs-frontend-202606-senior-2/pull/5), commit `b5e3b255bfe640ff2079e1cef330a28e382e3e50`. Rama docente: `sesion-frontend/storybook-sdd-kanban`.

## Preparación previa de entorno

Node 22.6 o posterior y Google Chrome instalado. Desde `frontend`:

```sh
npm ci
npm run storybook
```

Abrir http://localhost:6006 y entrar en **LIDR / Organisms / PositionKanbanDetail**. No requiere backend: las stories inyectan servicios deterministas sobre el componente real. La aplicación conserva sus servicios HTTP por defecto. CRA, Bootstrap y las rutas originales siguen siendo el punto de partida; Vite se usa únicamente para Storybook. Se fijó una familia Storybook compatible con este stack; modernizar dependencias sería otro cambio.

Explorar Loaded, Empty, Loading, LoadError, CandidatesError y LongName. Después ejecutar MoveSuccess, Saving y MoveError: seleccionar una tarjeta con Espacio, mover con flechas y soltar con Espacio; Escape cancela. Las interacciones horizontales se prueban en escritorio; móvil tiene cobertura de layout, no se presupone idéntica navegación direccional.

## Sesión de 120 minutos

| Minutos | Trabajo y evidencia |
| --- | --- |
| 00–20 | Feedback PR #5/#7 y diseño LTI: estados, jerarquía, responsive y Atomic Design. |
| 20–40 | SDD con IA: propuesta de feature, límites, decisiones y criterios KB-01 a KB-04. |
| 40–50 | Storybook: representar el contrato con estados reproducibles y servicios deterministas. |
| 50–60 | TDD: activar rojo y explicar el fallo KB-03 antes de corregirlo. |
| 60–70 | Descanso. |
| 70–90 | TDD con IA: implementar la protección, comprobar rollback y recuperar interacción. |
| 90–100 | Chromatic: comparar estados contra una referencia revisada; demo de publicación solo con proyecto autorizado. |
| 100–110 | PR: reunir spec, tests, revisión visual, decisiones y pendientes de integración. |
| 110–120 | Preguntas, retro y cierre. |

## Recorrido del ejercicio

**Diseño → SDD → Storybook → TDD → Chromatic → PR.**

1. **Diseño:** partir del Figma propio y la vista original de LTI. Acordar estados de carga, error, guardado y móvil. Resultado: decisiones visuales y de interacción explícitas.
2. **SDD:** convertir esas decisiones en la feature «mover una candidatura sin perder cambios», con límites y criterios KB-01 a KB-04. Resultado: propuesta, spec, diseño técnico y tareas versionados.
3. **Storybook:** representar los estados del contrato con el componente real y datos ficticios. Resultado: ejemplos ejecutables revisables antes de integrar backend.
4. **TDD:** activar el fallo KB-03, ejecutar el test, implementar la corrección y comprobar teclado y rollback. Resultado: evidencia roja y verde. Las stories acompañan este ciclo y no sustituyen las pruebas de comportamiento.
5. **Chromatic:** comparar los estados y viewports contra una referencia aceptada por una persona. Resultado: diferencias explicadas. La publicación sigue pendiente de conectar un proyecto autorizado.
6. **PR:** enlazar requisito, implementación, pruebas y revisión visual, dejando explícitos los pendientes de backend real. Resultado: cambio revisable dentro del mismo repositorio.

La AI participa en cada paso con contexto del repo y skills pertinentes. La secuencia permite volver al diseño o al contrato cuando una prueba descubre una ambigüedad. Storybook antes de TDD significa preparar los ejemplos y el entorno, no implementar toda la lógica antes del test.

## Diseños propios en Figma

[Laboratorio Kanban en Figma](https://www.figma.com/design/MAYDxDOTFpBPFeK0HqHbvQ). Contiene dos marcos editables: escritorio con estados y anatomía, y móvil a 375 px. Usan la vista original de LTI del PR #5: Bootstrap, fondo blanco, columnas gris claro, tarjetas blancas y tipografía del sistema. Son una referencia docente creada sobre el dominio del PR #5; no se presentan como el diseño original del alumnado ni como un prototipo interactivo.

## Atomic Design aplicado

- Átomo: `MoveStatus`, mensaje accesible de guardado; Bootstrap aporta botones existentes.
- Molécula: `CandidateSummary`, nombre y puntuación de la candidatura.
- Organismo: `PositionKanbanDetail`, columnas, tarjetas arrastrables y operación de cambio de fase.
- Página: la ruta existente `/position/:id` conecta contexto del producto y organismo.

Los niveles sirven para decidir responsabilidades. No se crean carpetas o abstracciones sin necesidad. La descomposición mantiene el dominio del repositorio.

## Ejercicio rojo → verde

Desde la raíz del repositorio:

```sh
python3 scripts/kanban-exercise.py rojo
cd frontend
npm run test:session
```

El criterio KB-03 debe fallar: una segunda operación entra mientras la primera está pendiente. Pedir a la AI que explique por qué un rollback de todo el tablero podría borrar otro movimiento. La solución de esta sesión serializa movimientos con un guard inmediato y desactiva el arrastre mientras persiste. Alternativa para debate: rollback por operación con control de concurrencia, que requiere otro contrato.

Para restaurar la solución docente desde la raíz:

```sh
python3 scripts/kanban-exercise.py verde
cd frontend
npm run test:session
npm run typecheck
npm run build-storybook
npm run test:stories
```

El test unitario invoca el callback directamente para probar el guard incluso antes de renderizar el bloqueo. Chrome comprueba el arrastre real con teclado, rollback, estado pendiente y nombre largo a 375 px.

## Skills y AI

[Midudev/autoskills](https://github.com/midudev/autoskills) es el detector solicitado. Está instalado como CLI local en el workspace de preparación. Para reproducir su análisis desde `frontend`: `npx autoskills@0.3.6 --dry-run`. Revisar sus recomendaciones antes de instalarlas: detectar Node no demuestra que necesitemos modificar el backend.

Se incluyen en `.agents/skills` la skill comunitaria [Storybook](https://skills.sh/mindrally/skills/storybook) y las oficiales de [Chromatic](https://github.com/chromaui/chromatic-skills): setup de CI, viewports y diagnóstico de diferencias. Su instalación no equivale a habilitar una cuenta Chromatic ni a validar automáticamente sus sugerencias.

Prompt de análisis: «Lee la propuesta y el componente existente. Relaciona cada criterio KB con una story y una prueba. Señala riesgos de concurrencia; no cambies dependencias ni backend sin justificarlo».

Prompt de implementación: «Implementa solo KB-03 en este organismo. Conserva servicios y rutas. Primero demuestra el fallo, luego el cambio mínimo, y entrega comandos y resultados reales».

Prompt de revisión: «Revisa el diff como una feature: contrato, accesibilidad, rollback, alcance y evidencia. Distingue tests ejecutados de comprobaciones pendientes. No aceptes baselines visuales por tu cuenta».

## Chromatic y entrega macro

Con un proyecto autorizado y su secreto `CHROMATIC_PROJECT_TOKEN` configurado en el entorno, ejecutar desde `frontend`: `npm run chromatic -- --build-script-name build-storybook`. Nunca escribir el token en el repositorio. Las stories declaran viewports 375 y 1280; las interactivas usan 1280. El primer build crea la referencia que debe revisar una persona; un diff visual no demuestra comportamiento correcto. No se ha publicado ni aceptado una baseline en la nube como parte de la preparación local.

La feature macro comprende tres incrementos: estados observables, movimiento seguro y evidencia de integración. Los documentos están en `openspec/changes/kanban-seguro`; no son solo una referencia a un prompt. El cierre exige pruebas, revisión visual humana y posteriormente una prueba con backend real. Reintentos, conflictos entre usuarios y persistencia al recargar quedan fuera del incremento local.

Para un ticket: objetivo «mover una candidatura sin perder cambios», criterios KB-01 a KB-04, enlaces al cambio, stories y resultados. No se crea en Jira Arukay: ese acceso no corresponde al curso LIDR.

El árbol de dependencias reporta vulnerabilidades de npm; este laboratorio no resuelve una actualización completa de CRA. Antes de producción requiere una revisión separada de dependencias y servicios reales.

## Verificación local de la entrega

12/12 pruebas Jest, 4/4 escenarios Chrome, TypeScript, lint de componentes y build de Storybook completados. El modo rojo produce 1 fallo (KB-03) y conserva 11 pruebas correctas; restaurar verde devuelve 12 correctas. Chromatic en la nube y backend real siguen pendientes.

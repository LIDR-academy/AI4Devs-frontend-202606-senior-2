# Laboratorio LTI: búsqueda de candidatos con AI y SDD

Este ejercicio vive en **AI4Devs-frontend-202606-senior-2**, sobre el código del [PR #5](https://github.com/LIDR-academy/AI4Devs-frontend-202606-senior-2/pull/5), commit `b5e3b255bfe640ff2079e1cef330a28e382e3e50`. Rama docente: `sesion-frontend/storybook-sdd-kanban`.

El ejercicio actual añade **búsqueda de candidatos**, una funcionalidad nueva respecto al PR #5. El movimiento y rollback ya existentes son la base de integración. El ejercicio anterior de KB-03 queda como antecedente.

## Preparación previa de entorno

Node 22.6 o posterior y Google Chrome instalado. Desde `frontend`:

```sh
npm ci
npm run storybook
```

Abrir http://localhost:6006 y entrar en **LIDR / Organisms / PositionKanbanDetail**. No requiere backend: las stories inyectan servicios deterministas sobre el componente real. La aplicación conserva sus servicios HTTP por defecto. CRA, Bootstrap y las rutas originales siguen siendo el punto de partida; Vite se usa únicamente para Storybook. Se fijó una familia Storybook compatible con este stack; modernizar dependencias sería otro cambio.

Explorar primero SearchReady, SearchMatch y SearchNoResults. Buscar «jose» debe encontrar «José Pérez». También se conservan Loaded, Empty, Loading, LoadError, CandidatesError y LongName. Después ejecutar MoveSuccess, Saving y MoveError: seleccionar una tarjeta con Espacio, mover con flechas y soltar con Espacio; Escape cancela. Las interacciones horizontales se prueban en escritorio; móvil tiene cobertura de layout, no se presupone idéntica navegación direccional.

## Sesión de 120 minutos

| Minutos | Trabajo y evidencia |
| --- | --- |
| 00–20 | Feedback PR #5/#7 y diseño LTI: estados, jerarquía, responsive y Atomic Design. |
| 20–40 | SDD con IA: propuesta de feature, límites, decisiones y criterios BS-01 a BS-05. |
| 40–60 | TDD con IA: activar BS-03 rojo, resolver identidad e índices filtrados y refactorizar en verde. |
| 60–70 | Descanso. |
| 70–90 | Storybook: representar estados con servicios deterministas y verificar teclado, rollback y móvil en navegador. |
| 90–100 | Chromatic: comparar estados contra una referencia revisada; demo de publicación solo con proyecto autorizado. |
| 100–110 | PR: reunir spec, tests, revisión visual, decisiones y pendientes de integración. |
| 110–120 | Preguntas, retro y cierre. |

## Recorrido del ejercicio

**Diseño → SDD → TDD → Storybook → Chromatic → PR.**

1. **Diseño:** partir del Figma propio y la vista original de LTI. Acordar búsqueda, coincidencias, cero resultados, limpiar y móvil. Resultado: decisiones visuales y de interacción explícitas.
2. **SDD:** convertir esas decisiones en la feature «localizar candidatos sin perder su identidad al filtrar», con límites y criterios BS-01 a BS-05. Resultado: propuesta, spec, diseño técnico y tareas versionados.
3. **TDD:** activar el fallo BS-03, ejecutar el test y explicar el resultado esperado antes de resolver la identidad de la candidatura. Comprobar rollback y recuperación, y refactorizar manteniendo verde. Resultado: evidencia roja y verde.
4. **Storybook:** representar los estados del contrato con el componente real y datos ficticios. Revisar coincidencias, cero resultados, limpiar y móvil, y comprobar teclado en navegador. Resultado: ejemplos ejecutables que complementan las pruebas de comportamiento.
5. **Chromatic:** comparar los estados y viewports contra una referencia aceptada por una persona. Resultado: diferencias explicadas. La publicación sigue pendiente de conectar un proyecto autorizado.
6. **PR:** enlazar requisito, implementación, pruebas y revisión visual, dejando explícitos los pendientes de backend real. Resultado: cambio revisable dentro del mismo repositorio.

La AI participa en cada paso con contexto del repo y skills pertinentes. La secuencia permite volver al diseño o al contrato cuando una prueba descubre una ambigüedad. TDD guía la implementación desde el contrato. Storybook permite después explorar y revisar los estados, y puede devolver hallazgos al ciclo de pruebas.

## Diseños propios en Figma

[Laboratorio Kanban en Figma](https://www.figma.com/design/MAYDxDOTFpBPFeK0HqHbvQ). Contiene dos marcos editables: escritorio con búsqueda y cero coincidencias, y móvil a 375 px. Usan la vista original de LTI del PR #5: Bootstrap, fondo blanco, columnas gris claro, tarjetas blancas y tipografía del sistema. Son una referencia docente creada sobre el dominio del PR #5; no se presentan como el diseño original del alumnado ni como un prototipo interactivo.

## Atomic Design aplicado

- Átomos: campo `Form.Control`, etiqueta y botón Bootstrap existentes.
- Molécula: el grupo de búsqueda, limpiar y conteo dentro del organismo. Se mantiene `CandidateSummary` para la tarjeta; extraer el buscador a un componente sería un refactor opcional.
- Organismo: `PositionKanbanDetail`, columnas, tarjetas arrastrables y operación de cambio de fase.
- Página: la ruta existente `/position/:id` conecta contexto del producto y organismo.

Los niveles sirven para decidir responsabilidades. No se crean carpetas o abstracciones sin necesidad. La descomposición mantiene el dominio del repositorio.

## Ejercicio rojo → verde

Desde la raíz del repositorio:

```sh
python3 scripts/search-exercise.py rojo
cd frontend
npm run test:session
```

El criterio BS-03 debe fallar: al buscar José, su tarjeta ocupa el índice visible 0 aunque sea la segunda en los datos completos. Usar source.index directamente mueve a Alex. Pedir a la AI que explique la diferencia entre identidad e índice, escriba el test y resuelva también el índice de destino. La búsqueda debe conservar las tarjetas ocultas y el rollback existente.

Para restaurar la solución docente desde la raíz:

```sh
python3 scripts/search-exercise.py verde
cd frontend
npm run test:session
npm run typecheck
npm run build-storybook
npm run test:stories
```

El test unitario invoca el callback para comprobar qué applicationId se envía. Chrome comprueba la búsqueda, limpiar por teclado, arrastre filtrado y móvil, además de las regresiones existentes.

## Skills y AI

[Midudev/autoskills](https://github.com/midudev/autoskills) es el detector solicitado. Está instalado como CLI local en el workspace de preparación. Para reproducir su análisis desde `frontend`: `npx autoskills@0.3.6 --dry-run`. Revisar sus recomendaciones antes de instalarlas: detectar Node no demuestra que necesitemos modificar el backend.

Se incluyen en `.agents/skills` la skill comunitaria [Storybook](https://skills.sh/mindrally/skills/storybook) y las oficiales de [Chromatic](https://github.com/chromaui/chromatic-skills): setup de CI, viewports y diagnóstico de diferencias. Su instalación no equivale a habilitar una cuenta Chromatic ni a validar automáticamente sus sugerencias.

Prompt de análisis: «Lee la propuesta y el componente existente. Relaciona cada criterio BS con una story y una prueba. Señala riesgos de identidad e índices al filtrar; no cambies dependencias ni backend sin justificarlo».

Prompt de implementación: «Implementa solo BS-03 en este organismo. Conserva servicios y rutas. Primero demuestra el fallo, luego el cambio mínimo, y entrega comandos y resultados reales».

Prompt de revisión: «Revisa el diff como una feature: contrato, accesibilidad, rollback, alcance y evidencia. Distingue tests ejecutados de comprobaciones pendientes. No aceptes baselines visuales por tu cuenta».

## Chromatic y entrega macro

Con un proyecto autorizado y su secreto `CHROMATIC_PROJECT_TOKEN` configurado en el entorno, ejecutar desde `frontend`: `npm run chromatic -- --build-script-name build-storybook`. Nunca escribir el token en el repositorio. Las stories de búsqueda declaran viewports 375 y 1280; las de arrastre existentes usan 1280. El primer build crea la referencia que debe revisar una persona; un diff visual no demuestra comportamiento correcto. No se ha publicado ni aceptado una baseline en la nube como parte de la preparación local.

La feature macro comprende tres incrementos: búsqueda y conteo, recuperación accesible y compatibilidad con el arrastre. Los documentos están en `openspec/changes/buscar-candidatos`; no son solo una referencia a un prompt. El cierre exige pruebas, revisión visual humana y posteriormente una prueba con backend real. Reintentos, conflictos entre usuarios y persistencia al recargar quedan fuera del incremento local.

Para un ticket: objetivo «localizar candidatos sin perder su identidad al filtrar», criterios BS-01 a BS-05, enlaces al cambio, stories y resultados. No se crea en Jira Arukay: ese acceso no corresponde al curso LIDR.

El árbol de dependencias reporta vulnerabilidades de npm; este laboratorio no resuelve una actualización completa de CRA. Antes de producción requiere una revisión separada de dependencias y servicios reales.

## Verificación local de la entrega

Antes de implementar el buscador, las cuatro pruebas nuevas fallaban y las 12 existentes pasaban. La solución pasa 16 pruebas Jest, 7 escenarios Chrome, TypeScript, lint de componentes y build de Storybook. El modo rojo de demostración provoca 1 fallo BS-03 y conserva 15 pruebas correctas; verde devuelve 16 correctas. Chromatic en la nube y backend real siguen pendientes.

---
name: frontend-sdd-workflow
description: Ejecuta o retoma una característica frontend desde diseño y OpenSpec hasta TDD, Storybook, Chromatic y PR, con Atomic Design, evidencia y checkpoints por etapa. Úsala para este flujo de desarrollo completo o una etapa solicitada; no para cambios triviales que no necesitan el proceso.
---

# Frontend SDD Workflow

Convierte un diseño y una necesidad en un incremento frontend comprobado. Ejecuta el trabajo autorizado, no te limites a devolver un plan o una lista de prompts.

## Elegir alcance y punto de reanudación

Determina el repositorio, diseño o descripción funcional, rama base, cambio OpenSpec y etapa final a partir de la conversación y los archivos. Pregunta solo por datos que realmente bloqueen decisiones. No adivines una base a partir de la rama abierta si el usuario ya indicó otra.

- «Propón» o «solo spec»: termina tras entregar los artefactos de planificación.
- «Hasta TDD rojo»: guarda pruebas y fallos esperados; no implementes verde.
- «Implementa en TDD»: completa rojo, verde y comprobación funcional; deja Storybook/publicación para cuando formen parte del alcance.
- «Flujo completo»: recorre las etapas autorizadas hasta PR y reporta lo que siga pendiente de revisión.
- «Continúa»: consulta tareas, commits y evidencia; no repitas etapas completas sin cambios que lo justifiquen.

Inspecciona git status, instrucciones del repo, package.json, OpenSpec y las piezas afectadas. Conserva cambios ajenos. Lee las skills especializadas disponibles cuando ayuden a la etapa, desde .agents/skills o las skills hermanas del plugin. No presupongas que están instaladas en otro proyecto ni instales herramientas nuevas silenciosamente.

## 1. Diseño

Revisa la referencia visual y la aplicación existente. Identifica estado inicial, éxito, carga, vacío, error, guardado, teclado y móvil según la característica. Diferencia fixtures del diseño de reglas del producto. Resuelve contradicciones materiales y registra las decisiones; no conviertas una omisión visual en eliminación de comportamiento existente.

Entrega un mapa breve de estados y criterios. Si faltan acceso a Figma o imágenes, usa referencias disponibles y declara el límite, sin afirmar fidelidad verificada. No cambies el archivo Figma salvo que esté dentro del encargo.

## 2. SDD con Atomic Design

Usa el CLI OpenSpec instalado en el repo. Primero status/list; si el cambio es nuevo, new change. Obtén instructions para cada artefacto y respeta el esquema y sus dependencias. Genera propuesta, diseño técnico, specs y tareas; consulta contextFiles al aplicar.

Empieza el diseño técnico por responsabilidades: primitivas reutilizadas, moléculas, organismos, distribución y página. Define props, eventos, propietario de cada estado, servicios y valores derivados. Evita wrappers y carpetas sin responsabilidad. En LTI, consulta lti-atomic-design; las convenciones genéricas de atomic-design-integration son referencias que deben adaptarse al repo.

Escribe requisitos observables con escenarios; organiza tareas pequeñas con su verificación en orden TDD → implementación → Storybook → Chromatic → PR. Valida estructura con el CLI. La validación no demuestra que la conducta funcione. Si el usuario solo pidió planificación, termina aquí. Para un flujo completo ya autorizado, continúa sin volver a pedir autorización genérica para implementar.

## 3. TDD rojo

Escribe pruebas del comportamiento nuevo sobre los componentes/páginas existentes. Cubre identidad, conservación de datos y fallos cuando corresponda. Ejecuta las pruebas antes de implementar y verifica que fallen por la ausencia del requisito, no por entorno o imports rotos. Conserva las pruebas anteriores verdes.

Registra comando, resultado, motivo de fallo y commit. Guarda checkpoint rojo. No sustituyas esta evidencia por una prueba escrita después del código ni presentes una regresión preparada como historial original de TDD.

## 4. Verde y refactor

Implementa el cambio acotado siguiendo los contratos. No alteres expectativas para ocultar defectos. Ejecuta pruebas, tipos y lint disponibles. Refactoriza conservando verde y responsabilidades Atomic Design.

Verifica desde la aplicación el flujo relevante, incluidos servicios reales cuando el requisito sea persistencia: gesto → petición → datos → recarga. Los mocks solo prueban el límite simulado. No abras recursos de producción para ensayar; usa el entorno local autorizado y conserva/restaura los datos ficticios de la prueba.

Guarda checkpoint verde. No declares resueltos riesgos fuera del contrato, como concurrencia multiusuario, por haber pasado una prueba local.

## 5. Storybook

Aplica las skills storybook y storybook-component-documentation disponibles, contrastando ejemplos con las versiones instaladas. Añade stories junto a los componentes con documentación de props/eventos y estados reproducibles.

Distingue stories aisladas con args fijos de stories integradas que calculan resultados. Una molécula controlada necesita un contenedor que actualice sus props al interactuar. Incluye teclado, foco, móvil y estados de error/guardado relevantes. Compila y verifica en navegador. Guarda checkpoint Storybook.

## 6. Chromatic

Usa el proyecto y las credenciales autorizadas. Lee las skills Chromatic relevantes y revisa compatibilidad; no actualices dependencias para seguir un ejemplo. Publica el build correspondiente al commit registrado con el CLI del repo; pasa el token mediante entorno, sin almacenarlo ni imprimirlo.

Espera el resultado y registra proyecto, build, commit, stories, capturas y diferencias. Publicar o usar exit-zero-on-changes no significa aceptar cambios visuales. No aceptes baselines automáticamente. Si falta credencial, autorización o servicio, prepara el build y documenta el bloqueo; no lo sustituyas por otro proyecto ni presentes un build antiguo como evidencia nueva. Guarda checkpoint con evidencia, conservando revisión pendiente.

## 7. PR y cierre

Revisa diff contra la base acordada, confirma identidad/remoto y busca un PR existente para la rama antes de crear otro. Cuando la publicación esté autorizada, incluye problema, conducta, diseño, spec, tests, Storybook/Chromatic y límites. Distingue API real de mocks y aprobación visual de build exitoso. Usa borrador si falta aceptación necesaria.

Guarda enlace y checkpoint PR. Marca tareas completas solo cuando se cumple su criterio; deja pendientes reales. Sincroniza/archiva OpenSpec cuando corresponda al alcance y aceptación, no por alcanzar un número de documentos.

## Checkpoints y evidencia

Usa una rama de trabajo y referencias distintas por etapa, por ejemplo:
`<cambio>/01-diseno`, `02-sdd`, `03-tdd-rojo`, `04-tdd-verde`, `05-storybook`, `06-chromatic`, `07-pr`.

Respeta nombres indicados y ramas existentes. Si un checkpoint existe, compara antes de reutilizar; crea una referencia nueva cuando el estado difiera. No sobrescribas ni hagas force push/reset para recuperar. Añade al commit solo los archivos del encargo. Cambiar de rama no restaura datos, Figma o baselines externos. Publica checkpoints solo dentro de la autorización del repositorio.

En tasks.md o evidencia enlazada registra requisito, comprobación, resultado, commit y pendiente. Si un commit posterior solo documenta un build, distingue su SHA del SHA construido. Reporta al terminar lo completado, enlaces, rama actual y siguiente etapa pendiente.

## Comandos del laboratorio LTI

Comprueba su existencia antes de usarlos en otro repo. Desde la raíz:

```sh
npm run openspec -- status --change <cambio>
npm run openspec -- instructions apply --change <cambio> --json
npm run spec:validate
npm run test:session
npm --prefix frontend run typecheck
npm --prefix frontend run lint:session
npm run test:app
npm run storybook
npm run storybook:build
npm run test:stories
```

En frontend, con CHROMATIC_PROJECT_TOKEN autorizado en el entorno:
`npx --no-install chromatic --storybook-build-dir=storybook-static`.

Los comandos npm ejecutan herramientas; esta skill dirige a la IA. No existe un CLI propio de Atomic Design. El guion docente queda privado; solo prompts y documentación de trabajo van al repo.

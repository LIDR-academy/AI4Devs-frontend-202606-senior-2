# Guion de clase: kanban resuelto y búsqueda con Atomic Design

Duración: 120 minutos, incluida una pausa de 10. Público: AI4Devs Seniors II. Los dos recorridos siguen Diseño → SDD con Atomic Design → TDD → Storybook → Chromatic → PR.

## Preparación

Abrir Figma, slides, PR #11 y los builds de Chromatic. Usar Node 22.6+ y Chrome. Ejecutar npm ci en frontend antes de clase. Mantener sesion-frontend/sesion como rama de trabajo; kanban-solved es la referencia sin búsqueda. Guardar el trabajo con commit antes de cambiar de rama. Los checkpoints se consultan o se usan como recuperación, anunciándolo a la clase. No sobrescribir trabajo con reset.

La demo roja del kanban retira temporalmente el guard mediante scripts/kanban-exercise.py. Es una reproducción docente de una regresión, no evidencia del historial original de TDD. Restaurar con el modo verde antes de cambiar de rama. La búsqueda sí dispone de checkpoint con cuatro pruebas nuevas fallando y doce existentes pasando.

## Agenda

| Tiempo | Bloque | Slides |
| --- | --- | --- |
| 00–15 | Contexto y feedback de PRs | 1–8 |
| 15–40 | Kanban resuelto y proceso completo | 9–13 |
| 40–60 | Diseño, Atomic Design y SDD de búsqueda | 14–17 |
| 60–70 | Pausa | 18 |
| 70–100 | Implementación, stories y revisión visual | 19–22 |
| 100–120 | PR, refactor, alcance de producto y cierre | 23–28 |

## Slide 1. Apertura (00–01)

**Qué decir**

«Hoy vamos a recorrer dos veces una forma de trabajar. Primero veremos un kanban ya resuelto, con arrastre, guardado y recuperación ante fallos. Después construiremos una búsqueda sobre esa misma aplicación. En ambos casos empezaremos por el diseño, concretaremos responsabilidades con Atomic Design y escribiremos criterios observables antes de pedir implementación a la IA.»

**Qué mostrar o hacer**

Mostrar la portada y presentar los dos resultados. No abrir todavía código.

**Pregunta a la clase**

¿Qué os da confianza para aceptar una interfaz generada con IA? Recoger una respuesta y retomarla al revisar el PR.

**Transición**

«Vamos a fijar primero qué vamos a construir y cómo lo comprobaremos.»

## Slide 2. Grabación (01–02)

**Qué decir**

«La sesión se graba. Revisad el aviso de la formación antes de participar y evitad mostrar información privada en las demos.»

**Qué mostrar o hacer**

Leer el aviso existente de la slide sin ampliar sus condiciones.

**Pregunta a la clase**

Comprobar que la audiencia conoce el aviso.

**Transición**

«Con el contexto de la sesión claro, vamos al objetivo.»

## Slide 3. Dos recorridos (02–03)

**Qué decir**

«La primera pieza es nuestro kanban resuelto. La segunda es una función nueva: encontrar un candidato sin perder el contexto del tablero. El ejercicio de búsqueda parte exactamente de kanban-solved. No vamos a rehacer el PR de un alumno ni a empezar otra aplicación.»

**Qué mostrar o hacer**

Señalar la diferencia entre referencia resuelta y construcción en directo.

**Pregunta a la clase**

¿Cuál es el comportamiento nuevo de la segunda parte? Buscar por nombre; el arrastre ya existe.

**Transición**

«Usaremos el mismo proceso en ambos recorridos.»

## Slide 4. Agenda (03–04)

**Qué decir**

«Reservamos los primeros quince minutos para contexto y feedback. Hasta el minuto cuarenta recorreremos el ejemplo del kanban. Antes de la pausa diseñaremos y especificaremos la búsqueda. Después implementaremos con pruebas, veremos las stories y revisaremos las diferencias visuales. Cerramos con el PR y cómo mantener la especificación.»

**Qué mostrar o hacer**

Mostrar el reloj de la sesión. La pausa es del minuto 60 al 70.

**Pregunta a la clase**

Explicar que los checkpoints permiten recuperar tiempo sin fingir que algo se ha construido en directo.

**Transición**

«El objetivo es entender las decisiones que conectan cada paso.»

## Slide 5. Resultados (04–05)

**Qué decir**

«Quiero que podáis convertir una pantalla en responsabilidades y criterios, pedir a la IA un cambio acotado y aportar evidencia para revisarlo. Contar componentes o tener una carpeta de specs no demuestra por sí mismo que el comportamiento esté resuelto.»

**Qué mostrar o hacer**

Relacionar cada resultado con un artefacto que se abrirá: diseño, design.md, tests, stories y PR.

**Pregunta a la clase**

¿Qué evidencia pediríais para un arrastre que falla al guardar?

**Transición**

«Vamos a aplicar esa pregunta a los PRs.»

## Slide 6. Feedback del PR #5 (05–09)

**Qué decir**

«En el PR #5 hay una base de kanban y pruebas útiles. La pregunta de revisión es qué pasa si un movimiento falla mientras otro ya ha modificado el tablero. Un rollback de todo el estado puede deshacer algo más. Nuestra referencia resuelve este escenario serializando operaciones: solo una persiste a la vez. Conservamos la autoría e historia de la base.»

**Qué mostrar o hacer**

Abrir https://github.com/LIDR-academy/AI4Devs-frontend-202606-senior-2/pull/5 y el cambio de guardado. Después mostrar el guard de nuestra rama, sin atribuírselo al PR original.

**Pregunta a la clase**

Si guardamos A, movemos B y falla A, ¿qué debería mantenerse? Explicar la opción elegida de bloquear B y sus límites.

**Transición**

«La revisión exige comprobar conducta, no solo leer un callback.»

## Slide 7. Qué hace figma-to-tokens (09–12)

**Qué decir**

«Este script lee un JSON local, genera una paleta y compara valores hexadecimales. Eso puede ser una herramienta dentro de un proceso de diseño. Por sí solo no demuestra conexión viva con Figma ni que el resultado conserve significado semántico. Dos roles pueden compartir un color y seguir siendo distintos.»

**Qué mostrar o hacer**

Abrir el script del PR #7 en el commit de la entrega: https://github.com/LIDR-academy/AI4Devs-frontend-202606-senior-2/blob/1434670fd7bd024df99965e1c7a83f3e3c1d7be5/frontend/scripts/figma-to-tokens.mjs . Señalar entrada, salida y comparación por hex.

**Pregunta a la clase**

¿Dónde se define que un color significa error y otro superficie? Seguir el origen del token semántico.

**Transición**

«La automatización necesita un contrato y una fuente comprobable.»

## Slide 8. Feedback del PR #7 (12–15)

**Qué decir**

«Pediría aclarar qué son estilos y qué son variables, de dónde viene la exportación y qué pruebas quedan versionadas. También separaría la migración de una librería visual de otras páginas: si el alcance crece, debe crecer la verificación. Un archivo generado puede ser correcto y la pantalla seguir teniendo un problema.»

**Qué mostrar o hacer**

Revisar las tres observaciones de la slide; usar outputs/feedback-entregas-frontend.md como apoyo, sin leerlo entero.

**Pregunta a la clase**

¿Qué evidencia añadiríais al PR para demostrar fidelidad visual?

**Transición**

«Ese es el motivo de conectar diseño, contrato, pruebas y revisión visual.»

## Slide 9. Proceso compartido (15–17)

**Qué decir**

«El recorrido es Diseño, SDD empezando por Atomic Design, TDD, Storybook, Chromatic y PR. No son seis entregables independientes: cada paso responde a una decisión del anterior. En el ejemplo resuelto recorreremos evidencia preparada; en el ejercicio construiremos el incremento.»

**Qué mostrar o hacer**

Señalar el ciclo completo y anunciar cuándo volveremos a él. Diferenciar reejecutar una regresión preparada de afirmar un historial TDD que no hemos observado.

**Pregunta a la clase**

¿Dónde decidiríamos quién mantiene el estado? En diseño técnico, antes de repartir implementación.

**Transición**

«Veamos cómo Atomic Design ayuda a esa decisión.»

## Slide 10. Atomic Design aplicado (17–21)

**Qué decir**

«En la base reutilizamos primitivas Bootstrap como átomos. CandidateSummary y MoveStatus son composiciones pequeñas. KanbanBoard compone columnas y tarjetas, recibe datos y emite el gesto. PositionKanbanDetail es la página: conoce la ruta, los servicios y el estado. La distribución actúa como plantilla, sin necesitar un archivo para cada nombre de la metodología. En la búsqueda añadiremos CandidateSearch como molécula controlada.»

**Qué mostrar o hacer**

Abrir frontend/src/components/kanban/KanbanBoard.tsx y los contratos de props. Comparar con PositionKanbanDetail. Aclarar que el nombre antiguo Organisms/PositionKanbanDetail del catálogo es una agrupación histórica de stories, no la responsabilidad actual del componente.

**Pregunta a la clase**

¿Debería CandidateSearch importar candidateService? No: emite cambios y recibe conteos de la página.

**Transición**

«Con estas responsabilidades podemos especificar el comportamiento del tablero.»

## Slide 11. Kanban resuelto: diseño y estados (21–27)

**Qué decir**

«Aquí está la pantalla de referencia. Arrastrar cambia la fase de una candidatura. Mientras guardamos anunciamos el estado y bloqueamos otro movimiento; si falla volvemos al estado anterior. El diseño incluye esos estados además de la vista feliz. Esta referencia conserva el aspecto original de LTI.»

**Qué mostrar o hacer**

En kanban-solved abrir las stories Loaded, Saving y MoveError. Mostrar un arrastre por teclado en Loaded: enfocar tarjeta, Espacio, flecha derecha y Espacio. Abrir openspec/changes/kanban-seguro/design.md para conectar esas pantallas con la composición.

**Pregunta a la clase**

¿Dónde debe vivir el rollback? En quien posee las columnas completas, la página.

**Transición**

«Vamos a convertir el bloqueo en una condición observable.»

## Slide 12. Contrato del kanban (27–31)

**Qué decir**

«Dado que hay una operación pendiente, si llega otra no se inicia una segunda petición. Cuando termina la primera se vuelve a permitir mover. Esta condición protege el rollback global que elegimos. No resuelve concurrencia entre usuarios ni una respuesta tardía después de navegar: son otros contratos.»

**Qué mostrar o hacer**

Abrir openspec/changes/kanban-seguro/specs/kanban/spec.md y localizar KB-01 a KB-04. Leer KB-03 y encontrar la prueba que lo verifica.

**Pregunta a la clase**

Pedir que alguien formule el caso de error con Dado/Cuando/Entonces.

**Transición**

«Ahora comprobaremos que una prueba detecta romper esa condición.»

## Slide 13. Kanban resuelto: rojo, verde y evidencia (31–40)

**Qué decir**

«Este es un experimento de regresión preparado: retiraremos el guard, veremos fallar la prueba y lo restauraremos. No afirmamos haber observado el historial original de desarrollo. El diseño técnico explica el guard con ref para bloquear sin esperar al siguiente render, y el estado React para desactivar y anunciar.»

**Qué mostrar o hacer**

Desde la raíz de kanban-solved: python3 scripts/kanban-exercise.py rojo; desde frontend: npm run test:session. Volver a la raíz y ejecutar python3 scripts/kanban-exercise.py verde. Repetir test:session: 12 pasan. Mostrar stories Saving/MoveError, el baseline Chromatic y la revisión del ejemplo. No cambiar de rama con el modo rojo activo.

**Pregunta a la clase**

¿Qué ocurriría si el test solo comprobara que se llamó una función? Faltaría comprobar qué tarjeta y qué estado quedan.

**Transición**

«Ya hemos recorrido el patrón con algo resuelto. Vamos a repetirlo para una función nueva.»

## Slide 14. Búsqueda: diseño del ejercicio (40–45)

**Qué decir**

«Un reclutador quiere localizar a José sin revisar todas las tarjetas. Dibujamos búsqueda vacía, coincidencia y cero resultados, también en móvil. Buscar jose debe encontrar José. Limpiar devuelve el foco al campo. El arrastre sigue disponible sobre los resultados visibles.»

**Qué mostrar o hacer**

Abrir https://www.figma.com/design/MAYDxDOTFpBPFeK0HqHbvQ . Mostrar las dos vistas editables y señalar etiqueta, conteo, vacío y botón móvil. Son diseños propios para el laboratorio. Partir de sesion-frontend/sesion, equivalente a kanban-solved y sin búsqueda.

**Pregunta a la clase**

¿El conteo representa toda la base o la posición cargada? Solo las candidaturas cargadas de esa posición.

**Transición**

«Antes de implementar decidiremos el alcance y el contrato de CandidateSearch.»

## Slide 15. SDD de búsqueda y composición (45–50)

**Qué decir**

«Primero hacemos el mapa Atomic Design: reutilizamos KanbanBoard y añadimos CandidateSearch. La molécula recibe query, visibleCount, totalCount, disabled y onQueryChange. No duplica las columnas. La página deriva visibleColumns desde los datos completos. Después redactamos proposal, escenarios y tareas.»

**Qué mostrar o hacer**

Abrir checkpoint 02-sdd o el documento en GitHub, manteniendo la rama de sesión para trabajar. Recorrer design.md primero; luego proposal.md, specs/busqueda/spec.md y tasks.md. Mostrar que el checkpoint de especificación todavía no trae la implementación.

**Pregunta a la clase**

¿Por qué no guardar visibleColumns con otro setState? Porque es un valor derivado y puede desincronizarse.

**Transición**

«Hay una condición de identidad que conviene escribir antes de tocar el arrastre.»

## Slide 16. Identidad con filtro (50–55)

**Qué decir**

«En la lista completa Alex ocupa la primera posición y José la segunda. Tras filtrar, José aparece como resultado cero. Ese cero ya no señala a Alex. El movimiento debe resolver applicationId desde la lista visible y encontrarlo en la lista completa. Lo mismo exige traducir la posición de inserción de destino.»

**Qué mostrar o hacer**

Dibujar verbalmente las dos listas de la slide y abrir BS-03. Pedir a la IA la prueba antes de mostrar la implementación resuelta. Cubrir también rollback con filtro y conservación de candidatos ocultos.

**Pregunta a la clase**

¿Qué dato es estable al filtrar? applicationId. El nombre no es una clave.

**Transición**

«Con el contrato claro podemos dar a la IA una tarea pequeña y verificable.»

## Slide 17. Prompt y límites para la IA (55–60)

**Qué decir**

«Las skills ayudan a ejecutar un trabajo concreto; no sustituyen leer el repositorio ni definir el resultado. Pediremos primero análisis de responsabilidades y una prueba que falle. Después implementación, revisión y stories. No pediremos generar toda la aplicación de una vez.»

**Qué mostrar o hacer**

Usar el prompt de preparación del guion. Revisar .agents/skills antes de invocar capacidades instaladas; no hacer instalaciones ni upgrades durante este bloque. Confirmar que todos conocen la rama de sesión y los checkpoints.

**Pregunta a la clase**

Pedir que cada pareja diga un criterio que la IA no puede cambiar para que su test pase.

**Transición**

«Después de la pausa haremos fallar esa condición y construiremos la molécula.»

## Slide 18. Pausa (60–70)

**Qué decir**

«Volvemos en diez minutos. Dejad el cambio guardado y anotad el criterio que vais a implementar.»

**Qué mostrar o hacer**

Mostrar la slide de pausa. Tener preparados los comandos de rojo y el acceso al checkpoint de recuperación.

**Pregunta a la clase**

No consumir la pausa con nuevas explicaciones.

**Transición**

«Retomamos con la prueba antes de la implementación.»

## Slide 19. TDD de búsqueda (70–75)

**Qué decir**

«El checkpoint rojo contiene cuatro pruebas nuevas sobre el tablero sin búsqueda. Las doce anteriores siguen pasando. Los fallos nuevos son esperados porque la característica no existe. Revisamos que fallen por el motivo previsto antes de implementar.»

**Qué mostrar o hacer**

Si se trabaja desde cero, escribir los escenarios con IA en la rama de sesión. Como recuperación, guardar el trabajo y abrir kanban-ejercicio/03-tdd-rojo. Ejecutar npm run test:session desde frontend. Mostrar qué observa cada caso, sin pegar inmediatamente la solución.

**Pregunta a la clase**

¿Está fallando por el requisito o por una importación rota? Revisar el mensaje real.

**Transición**

«Ahora implementamos el componente más pequeño que responde a esos criterios.»

## Slide 20. Construcción de CandidateSearch (75–90)

**Qué decir**

«La pareja construye la molécula controlada y la página calcula resultados. Primero etiqueta, input y acción de limpiar; después conteo, vacío y foco. Luego conectamos la proyección filtrada al tablero y resolvemos la identidad del arrastre. La conducta existente debe permanecer verde.»

**Qué mostrar o hacer**

Minutos 75–80: contrato de props y composición. 80–85: query, normalización, conteo y foco. 85–90: identidad, rollback y tests. Referencia 04-tdd-verde para recuperar, no para reemplazar silenciosamente el trabajo de clase. Al final, 16 pruebas deben pasar.

**Pregunta a la clase**

Si una pareja termina, pedir que explique dónde viven los datos completos y qué componente no conoce HTTP.

**Transición**

«Vamos a convertir estos estados en ejemplos navegables.»

## Slide 21. Storybook y Chromatic (90–96)

**Qué decir**

«La molécula tiene stories propias para ready, match, no results y saving. Los conteos de esas stories son entradas fijas para inspeccionar la presentación; las stories integradas verifican que la página los calcule. Chromatic compara las capturas con la referencia, pero publicar correctamente no significa aceptar cambios.»

**Qué mostrar o hacer**

Abrir CandidateSearch.stories.tsx y las stories integradas SearchReady, SearchMatch y SearchNoResults. Usar el Storybook publicado y el build enlazado desde el PR. Comparar la base de kanban con la solución y señalar la revisión pendiente. Mostrar que un refactor puede mantener iguales las capturas existentes.

**Pregunta a la clase**

¿Qué prueba detectaría un conteo mal calculado que una story con args fijos no detecta? La integración de la página.

**Transición**

«Revisaremos también interacción, foco y ancho móvil.»

## Slide 22. Accesibilidad y móvil (96–100)

**Qué decir**

«Una captura no demuestra que pueda usar la función con teclado. Buscamos jose, limpiamos y comprobamos que el foco vuelve al input. A 375 px el botón va debajo y no debe haber desbordamiento. Durante un guardado la búsqueda permanece desactivada para mantener estable la operación.»

**Qué mostrar o hacer**

En SearchReady usar Tab, escribir, limpiar y comprobar foco. Revisar la vista móvil. Mostrar npm run test:stories: siete escenarios, incluidos arrastre filtrado y móvil. No presentar estos casos como una auditoría completa de accesibilidad.

**Pregunta a la clase**

¿Qué cambia para una persona que no usa ratón? Etiqueta, foco, orden y anuncio del resultado.

**Transición**

«Con esa evidencia podemos describir honestamente el estado del PR.»

## Slide 23. PR y aceptación (100–106)

**Qué decir**

«El PR debe contar el problema, explicar la conducta nueva y enlazar evidencia. La base del PR de búsqueda es kanban-solved para que el diff muestre el incremento. Las pruebas de navegador usan servicios simulados; la API real se verificó aparte con PostgreSQL temporal. Falta todavía el recorrido integrado navegador, API y base y la aceptación visual.»

**Qué mostrar o hacer**

Abrir https://github.com/LIDR-academy/AI4Devs-frontend-202606-senior-2/pull/11 . Revisar base, diff, Figma, build y pendientes. Mostrar la prueba backend/scripts/workshop-smoke.cjs sin ejecutarla si quedan menos de cuatro minutos. No fusionar el PR como parte de la demo.

**Pregunta a la clase**

¿Qué falta para que vosotros lo aprobarais? Separar bloqueo funcional, revisión visual y mejoras fuera de alcance.

**Transición**

«Una vez revisado, un cambio de estructura también debe conservar la trazabilidad.»

## Slide 24. Refactor y cambio funcional (106–110)

**Qué decir**

«Extraer KanbanBoard o CandidateSearch conserva el contrato observable y cambia la distribución de responsabilidades. Añadir un filtro por etapa sí cambia conducta: necesita nuevos escenarios. Atomic Design se sostiene con responsabilidades claras, no con mover archivos a carpetas llamadas atoms.»

**Qué mostrar o hacer**

Comparar la página con KanbanBoard y CandidateSearch. Verificar que los servicios siguen en la página y que las pruebas de identidad pasan. Proponer un filtro por etapa solo como siguiente incremento, sin implementarlo deprisa.

**Pregunta a la clase**

¿Buscar por email sería refactor o nueva conducta? Nueva conducta que cambia el alcance.

**Transición**

«La especificación debe reflejar qué aceptamos realmente.»

## Slide 25. Cierre de la especificación (110–113)

**Qué decir**

«Verificamos cada requisito contra su evidencia, sincronizamos lo aceptado y archivamos el cambio cuando corresponda. Una tarea de revisión pendiente sigue pendiente aunque los tests pasen. No marcaremos integración completa si solo hemos demostrado dos capas por separado.»

**Qué mostrar o hacer**

Abrir tasks.md. Mostrar las tareas realizadas y las que siguen abiertas. Si la herramienta OpenSpec instalada ofrece verify/sync/archive, explicar su equivalencia; no inventar un comando ni ejecutar un archivado mientras falte aceptación.

**Pregunta a la clase**

¿Qué evidencia enlazaríais a BS-03 y qué pendiente conservaríais?

**Transición**

«Ese mismo mecanismo permite ampliar la feature a nivel de producto.»

## Slide 26. SDD a nivel de producto (113–116)

**Qué decir**

«Ahora podemos planificar la feature más allá del componente: qué datos están cargados, qué ocurre al navegar, qué pasa con otro usuario y cómo resolvemos una respuesta de red ambigua. La IA puede ayudarnos a identificar riesgos y dividir incrementos, pero el equipo fija las reglas y la aceptación.»

**Qué mostrar o hacer**

Conectar Figma, spec, componentes, servicios y PR. Enumerar como futuros contratos paginación, búsquedas en servidor y concurrencia entre usuarios, todos fuera de este ejercicio.

**Pregunta a la clase**

¿Cuál sería el siguiente incremento de producto y cuál es su primer escenario observable?

**Transición**

«Volvemos a la idea inicial: una decisión debe dejar evidencia revisable.»

## Slide 27. Cierre (116–118)

**Qué decir**

«Hemos seguido el proceso con un ejemplo resuelto y lo hemos repetido al construir una función. Lo reutilizable es la forma de decidir: responsabilidad, criterio, prueba, estado visual y revisión. La IA acelera ejecución cuando esos límites están claros.»

**Qué mostrar o hacer**

Pedir a dos personas que nombren una decisión concreta que tomarán antes de pedir código en su siguiente tarea.

**Pregunta a la clase**

¿Qué revisión humana sigue faltando en nuestro PR?

**Transición**

«Cerramos con feedback para la siguiente sesión.»

## Slide 28. ROTI (118–120)

**Qué decir**

«¿Qué os lleváis y qué cambiaríais? Dad una puntuación de retorno del tiempo invertido y una observación concreta.»

**Qué mostrar o hacer**

Recoger ROTI sin prolongar las demos. Compartir el PR, el guion, la rama de sesión y los checkpoints.

**Pregunta a la clase**

Una idea que aplicaréis mañana y una mejora para la clase.

**Transición**

«Gracias y cierre.»

## Prompts para usar durante la clase

### 1. Análisis y SDD antes de implementar

> Lee el diseño de búsqueda y el kanban de esta rama. Identifica primitivas, moléculas, organismo, distribución y página según sus responsabilidades. Reutiliza CandidateSummary, MoveStatus y KanbanBoard. Propón el contrato controlado de CandidateSearch y explica quién posee query, columnas completas y persistencia. Después redacta alcance, criterios observables BS-01 a BS-05 y tareas. No implementes todavía. Si una decisión no está definida, señálala sin inventar reglas de producto.

### 2. Pruebas rojas

> A partir de la spec, escribe pruebas que fallen porque la búsqueda todavía no existe. Conserva las pruebas del kanban. Cubre normalización de jose/José, vacío y foco al limpiar, arrastre de José cuando su índice visible es cero y rollback con candidatos ocultos. Ejecuta las pruebas y explica por qué falla cada caso. No cambies el contrato para hacerlas pasar.

### 3. Implementación

> Implementa CandidateSearch como molécula controlada sin servicios ni conocimiento de DnD. La página mantiene query y columnas completas, deriva el filtro y el conteo y traduce el índice visible a applicationId. Reutiliza KanbanBoard. Mantén el aspecto de LTI y la conducta de guardado existente. Ejecuta tests, tipos y lint; explica el diff.

### 4. Storybook y revisión

> Añade stories aisladas de CandidateSearch y estados integrados de la página. Distingue args de presentación de reglas calculadas por la página. Revisa móvil, foco y teclado. Publica en el proyecto autorizado de Chromatic, enlaza el build y enumera cambios pendientes de aceptación sin aceptarlos automáticamente.

### 5. PR y SDD de producto

> Revisa el diff contra kanban-solved. Relaciona cada criterio con una prueba y una story, enlaza Figma y Chromatic y describe qué se comprobó con API real. Separa pruebas de navegador con mocks de una prueba completa con backend. Propón el siguiente incremento sin modificar el alcance actual ni marcar tareas pendientes como completas.

## Plan de recuperación

Si una prueba falla por entorno, dedicar como máximo tres minutos al diagnóstico. Leer la evidencia del checkpoint correspondiente y continuar con la pregunta de diseño; explicar que se usa una solución preparada. Si Chromatic tarda, abrir el último build publicado y mantener la revisión pendiente. Si faltan diez minutos, omitir la ejecución del backend y priorizar el PR con evidencia y límites. No saltar la distinción entre referencia resuelta y construcción de clase.

Si surge una nueva idea, escribir un criterio y decidir si pertenece a esta sesión. Un filtro de etapa, búsqueda por email o paginación son incrementos nuevos. No añadirlos directamente como un refactor.

## Enlaces de trabajo

- [Presentación](https://docs.google.com/presentation/d/1fFul2HwNOafVvXgCnh1Iu-DqY8HBliLpTiaao87Q430/edit)
- [Figma del ejercicio](https://www.figma.com/design/MAYDxDOTFpBPFeK0HqHbvQ)
- [Kanban resuelto](https://github.com/LIDR-academy/AI4Devs-frontend-202606-senior-2/tree/kanban-solved)
- [Rama de clase](https://github.com/LIDR-academy/AI4Devs-frontend-202606-senior-2/tree/sesion-frontend/sesion)
- [Solución y guía](https://github.com/LIDR-academy/AI4Devs-frontend-202606-senior-2/tree/kanban-ejercicio/06-chromatic-pr/docs/sesion)
- [PR de búsqueda](https://github.com/LIDR-academy/AI4Devs-frontend-202606-senior-2/pull/11)
- [Builds Chromatic](https://www.chromatic.com/builds?appId=6aa15ada6842c110d4d8a475)


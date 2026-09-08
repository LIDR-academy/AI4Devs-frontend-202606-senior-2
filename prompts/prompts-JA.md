# Prompts — AI4Devs frontend (JA)

Registro de los prompts usados durante el ejercicio "Creando la interfaz de gestión de aplicaciones de LTI".
Herramienta: Claude Code (Opus / Fable) con MCP de Figma, Context7 y navegador integrado.

## Fase 0 · Harness

> Aquí tengo un nuevo ejercicio del curso AI4Devs que tengo que realizar. Quiero que me prepares un paso a paso para ir haciéndolo juntos. La idea es que lo vaya haciendo yo con tu ayuda, es decir, quiero aprender mientras lo hacemos, es la finalidad del ejercicio, no quiero que lo resuelvas tu, si no resolverlo yo y tu ir ejecutando.
> (adjunto: enunciado .docx)

> Yo creo que tiene que haber mas preparación aqui. Vamos a intentar hacer un design to code desde un fichero Figma. Este fichero lo vamos a ir eligiendo desde una serie de propuestas que haré yo. Una vez que tengamos eso lo que haremos sería trasladar los tokens de diseño a codigo para tener los foundations. Luego las pantallas las haremos en dos pasos, uno primero generaremos la maqueta a partir del diseño y luego haremos la implementación. También deberíamos tener un paso inicial para construir el harness, que skills y MCP voy a necesitar. Tambien debemos de decidir que libraria de UI queremos usar MUI, chakra, shadcn....etc. Añade todo esto al plan de ejecución.

> Para el punto 3, si renombra tu. Fase 0: haz tu los pasos a y b, el claude.md lo hacemos via /init

> /init

> De hecho no quiero añadir nada a mano, yo te diria que, despues de ejecutarse el init, deberías de mejorarlo con lo que has comentado

> sip, dale, ¿has incluido los prompts?

## Fase 1 · Decisiones (Figma + UI library)

> Si, prefiero entregar tarde. Aqui van las propuestas de UI:
> - https://www.figma.com/es-es/comunidad/file/1219324524301236507/simple-kanban-by-pratyush
> - https://www.figma.com/es-es/comunidad/file/1291667577858062539/kanban-board-task-management
> - https://www.figma.com/es-es/comunidad/file/865289207653754816/kanban-board

> Te parece si importo los 3 a mi espacio y asi puedes analizarlos mejor?

> (URLs de los tres ficheros duplicados en el team MDIUW)

> 1- Te confirmo el fichero
> 2- Yo creo que migrar es overkill, necesitamos encontrar una que se adapte al stack que tenemos ahora y que facilite adaptar el diseño. Creo que seria Chakra, pero si puedes buscar mas opciones y evaluarlas estaría bien
> 3- No entiendo muy bien que quieres que renombre

**Decisiones tomadas:**
- Fichero Figma: *Simple Kanban by Pratyush* (variables semánticas con modos Light/Dark, tablero completo en un frame).
- UI library: **Chakra UI v2** (compatible con CRA 5 + TS 4.9; `semanticTokens` mapea 1:1 con las variables de Figma).
- Limpieza en Figma vía `use_figma`: instancias `Frame 3/4/5` → `Card`, columnas `Frame 6..11` → `Column`, para que `get_design_context` genere nombres de componente útiles.

## Fase 2 · Entorno

> estan arriba, creo

> hecho, comprueba los endpoints


## Fase 3 · Foundations (tokens)

> vale, la fuente vamos a Montserrat. Vuelve a presentarme la fase 3. Primero tienes que hablarme de la fase y de su objetivo, luego presentarme los hallazgos, a partir de ahi yo tomo decisiones y cuando esté todo decidido y no haya nada bloqueante ejecutamos

> d1- a · d2- a · d3- si · d4- lo hacemos ya · d5- quitamos ya · d7- Si hacemos el housekeeping, incluido el commit antes de nada.
> Hay una pregunta sobre esto, porque estamos definiendo todos los foundations en .ts y no en .css? Yo hubiera dicho que todo esto iría a custom properties

> D8- a · D9- No, las huérfanas no generan token. Como dicta la D8 vamos a hacer fidelidad a Figma, si en figma no hay variable, en código se mete el valor tal cual. Ya tendrías todo desbloqueado con esto y podríamos empezar a ejecutar?

**Decisiones:** primitivas por modo con nombres Figma (`light.indigo.primary`); semánticas `{ default, _dark }`; huérfanas → hex literal en `semanticTokens.ts`; Montserrat sustituye a Proxima Nova; Bootstrap fuera desde ya; spacing 4/8/12/16/24.

> Te he pasado al modo plan. Yo no voy a escribir código, el desarrollo es todo agéntico, yo solo tomo decisiones. Crea un plan para hacerlo y luego ejecutamos
> (plan mode: alcance = solo Fase 3; la página /foundations se queda en el repo)

**Resultado:** `scripts/figma-to-tokens.mjs` genera `foundations/colors.ts` e imprime el cruce semántico (21 huérfanas); `typography/space/radii/shadows`, `semanticTokens.ts`, `theme/index.ts`; `ChakraProvider` en `App.js` sin Bootstrap; página `/foundations`. Hallazgo en ejecución: `default` es clave reservada en semantic tokens de Chakra → estado CTA renombrado a `base`.


## Fase 4 · Maquetas

> sí, preséntame la fase 4

> pero no vamos a ir pantalla a pantalla? esto es para hacer las 3 de golpe?

> ok · D10- a · D11- a · D12- si · D13- b · D14- b · D15- b
> (plan mode: Fase 4a = maqueta `Position`/kanban; 4b = `Positions` después)

**Hallazgos de `get_design_context`:** el tablero usa Inter en crudo (no los text styles del fichero); radios/sombra reales distintos de lo medido en Fase 3 (tarjeta 4/8, swimlane 8, tablero 24; sombra 0 1px 2px); varios colores pintados a mano sin token semántico; assets con URL que caducan; solo diseño desktop.

**Decisiones:** textStyles del theme (Inter→title/bodyLgEmphasis/bodySm); semántica más cercana para valores sin token; corregir foundations; tarjeta fiel (avatar iniciales + nombre, chip fase, tag puntuación); tinte por ciclo posicional; `Positions` → port a Chakra en 4b.

> sí, preséntame la 4b

> D16 - b · D17 - abierto bg.info, contratado success, resto igual · D18 - a · D19 - si · D20 - no generar pantalla

**Hallazgos 4b:** no hay `GET /positions` (mock permanente); el mock antiguo no tenía `id` ni coincidía con el seed; badge *Cerrado* con el mismo color que *Abierto* (bug); `Positions` vivía en `components/`.

**Resultado 4a:** `components/kanban/{types,mock,tints,CandidateCard,KanbanColumn,KanbanBoard}.tsx`, `pages/PositionDetail.tsx`, ruta `/positions/:id`; `sizes.ts` nuevo; radios/sombras/space corregidos.

**Resultado 4b:** `pages/Positions.tsx` reescrito con Chakra (filtros visuales, grid responsive, tarjeta con badge por tokens, botones CTA primario/secundario), mock alineado con el seed (ids 1, 2 reales + 3 ficticio).

## Fase 5 · Implementación

> sí, preséntame la fase 5

> D21-a · D22- no se puede toast con nuestro theme? · D23-¿seguro que no hay un campo de la ddbb que podamos usar, tipo prioridad, fecha o algo asi? · D24.- ok

> D22- c, D23- c. De esto aprendemos que en las decisiones déjame mejor preguntas abiertas, no busques tú opciones a menos que te lo pida explícitamente

**Hallazgos:** desajuste nombre/id de fase entre `GET candidates` y `PUT`; `interviewflow` doblemente envuelto; `id=3` → 404; `@hello-pangea/dnd` (ids string, `placeholder`, teclado/táctil, StrictMode OK); sin campo de orden en `Application` → orden por `averageScore`; `Alert` es temable → toasts con tokens.

**Decisiones:** Skeleton de carga; `Alert` temado con tokens (toast estándar); soltar en misma columna = no-op + orden por puntuación; optimista con rollback.

**Resultado:** `services/api.ts` + `positionService.ts`, `hooks/usePositionBoard.ts`, `theme/components/alert.ts`, `BoardSkeleton`, dnd en `KanbanBoard/Column/CandidateCard`, `PositionDetail` por estados (`/positions/3` y `/positions/abc` → "Posición no encontrada"), "Ver proceso" navega; `mock.ts` eliminado.

## Fase 6 · Entrega

> Yo creo que hemos eliminado bootstrap de manera prematura, hay páginas que se han quedado sin estilo, por ejemplo la home

> Yo aquí veo tres posibilidades. a) Poner y quitar Bootstrap dependiendo de la pantalla b) Migrar todo a Chakra c) Rehacer las pantallas nuevas con Bootstrap. Me inclino más por la última ya que Bootstrap estaba en el proyecto inicialmente. Por favor valora blast radius, pros y cons de cada una de ellas

> Vamos con la b, empieza por la home

**Hallazgos:** `/` y `/add-candidate` (384 líneas) quedaron sin estilo tras D5; recargar Bootstrap global rompe la geometría de las pantallas Chakra (reboot: `p { margin-bottom: 1rem }`); Bootstrap 5.3 permite theming por CSS vars pero con menos granularidad que `semanticTokens`.

**Decisión:** (b) migrar a Chakra; primero la home (`pages/RecruiterDashboard.tsx`, tokens, `sizes.logo`), formulario de alta pendiente.

> La idea en este último paso es reestilar tocándolo funcionalmente lo mínimo posible. Teniendo esto en cuenta vuelve a replantearlo porque veo muchas preguntas que son de ámbito funcional

> (¿popup del datepicker con su propio CSS?) sí

**Resultado:** `pages/AddCandidateForm.js` y `components/FileUploader.js` restilados con Chakra + tokens, bloque de estado/handlers/fetch byte-idéntico (verificado con `diff`); `bootstrap` y `react-bootstrap` desinstalados; `CI=true npm run build` vuelve a pasar. Verificado E2E: alta de candidato con CV → 201 y `Alert` de éxito; error 400 → `Alert` con tokens. Bugs preexistentes del formulario (fechas UTC + Prisma, CV sin subir, `description`, `uploads/` inexistente) documentados como deuda en `CLAUDE.md`, sin tocar.

### Revisión previa al PR

> 1- Sí, ambas [`/code-review frontend-JA high` y `/security-review`] · 2- Yo diría que [la deuda del formulario] está fuera de scope, pero verifica en el enunciado · 3- De momento esperamos para la PR · 4- Eran pruebas, resetea todo al terminar

> antes de ponerte a ejecutar nada genera un plan

> y no arregles nada que no sea de código que hayamos escrito nosotros

> Apply these 10 code-review findings with the minimal edits [desde la UI de la revisión]

**Hallazgos:** security review sin vulnerabilidades. Code review (8 ángulos, 16 candidatos verificados, 0 refutados, 10 reportados): `/positions/2` (flujo sin fases) quedaba en blanco y los candidatos con fase desconocida desaparecían; cualquier 404 del backend se mostraba como "no existe"; un PUT antiguo fallido podía deshacer un movimiento posterior; agrupación por *nombre* de fase (no único en el esquema) → tarjetas duplicadas; swatches de `space` en `/foundations` resolvían contra `sizes` (`2xs` = 256px); `@chakra-ui/anatomy` sin declarar; "Sin candidatos" se desmontaba en mitad del drag; enlaces convertidos en `onClick={navigate}` y títulos sin jerarquía; estilos de CTA y de campos copiados en 7 y 3 sitios, sin focus/disabled tokenizados; px crudos en `Foundations.tsx`.

**Resultado (solo código nuestro, backend y lógica heredada sin tocar):** `KanbanBoard` agrupa por id resolviendo cada nombre a su primera fase, lista los candidatos "Fuera del flujo" y avisa si no hay fases; `usePositionBoard` solo mapea a `notFound` el 404 con `error: "Position not found"` y descarta el rollback de un movimiento superado (`latestMove`); `theme/components/button.ts` (`primary | secondary | danger`) e `input.ts` (`Input`/`Select` `outline`) con `shadows.focus` y estados disabled, aplicados en todas las páginas (en el formulario heredado solo cambian props de estilo); enlaces reales con `Button as={RouterLink}`; `Foundations` sin px crudos y con swatches por valor; `@chakra-ui/anatomy` declarado. Verificado: `tsc`, `CI=true npm run build`, auditoría de tokens limpia, `/positions/2` muestra el aviso, enlaces con `href`, anillo de foco 2px brand; guard del hook, mapeo 404 y agrupación cubiertos con un test Jest temporal (4/4, eliminado después: CRA no resuelve los `exports` de Chakra sin mocks). DnD no verificable en el navegador con el panel oculto (rAF parado). BD intacta (seed).

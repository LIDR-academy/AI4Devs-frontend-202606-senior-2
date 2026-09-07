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

## Fase 5 · Implementación

## Fase 6 · Entrega

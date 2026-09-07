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

## Fase 3 · Foundations (tokens)

## Fase 4 · Maquetas

## Fase 5 · Implementación

## Fase 6 · Entrega

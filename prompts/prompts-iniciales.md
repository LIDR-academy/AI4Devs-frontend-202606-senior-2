# Prompts iniciales

Registro de todos los prompts usados con el asistente de IA en este proyecto, en orden cronológico.
Cada entrada recoge el prompt literal, su objetivo y lo que se hizo como resultado.

---

## Prompt 1 — Usar OpenSpec (opsx) en el proyecto

- **Fecha:** 2026-09-15
- **Rama:** `frontend-JP`

### Prompt

> Quiero usar opsx en este proyecto

### Objetivo

Configurar OpenSpec en el repositorio para poder usar el flujo de comandos `/opsx` (propuestas de cambio, aplicación y archivado de especificaciones) desde Claude Code.

### Resultado

- Se comprobó que la CLI de OpenSpec ya está instalada globalmente (`openspec` 1.4.1, Node v23.6.0).
- Se verificó que el proyecto aún no tiene ni la carpeta `openspec/` ni `.claude/`, por lo que hay que ejecutar `openspec init`.
- El usuario interrumpió la tarea antes de inicializar OpenSpec para pedir primero el registro de prompts (Prompt 2).

---

## Prompt 2 — Crear el registro de prompts

- **Fecha:** 2026-09-15
- **Rama:** `frontend-JP`

### Prompt

> Debes crear la carpeta prompts y el archivo prompts-inicales.md cada prompt debe esatr detallado en ese archivo, entiendo que se tiene que poner esa norma en CLAUDE.md

### Objetivo

Dejar trazabilidad de todos los prompts del proyecto en un único archivo y convertirlo en una norma permanente para el asistente.

### Resultado

- Se creó la carpeta `prompts/` en la raíz del repositorio.
- Se creó este archivo, `prompts/prompts-iniciales.md`, con el Prompt 1 y el Prompt 2 documentados.
- Se añadió a `CLAUDE.md` una sección "Registro de prompts" que obliga a registrar cada prompt nuevo en este archivo con el mismo formato.
- A continuación se completó lo pendiente del Prompt 1 con `openspec init --tools claude`:
  - `openspec/` con `specs/`, `changes/` y `changes/archive/` (carpetas vacías; git no las rastrea hasta que contengan archivos).
  - `.claude/commands/opsx/`: `propose`, `explore`, `apply`, `verify`, `sync` y `archive`.
  - `.claude/skills/`: las 6 skills de OpenSpec correspondientes.
  - La configuración opcional (`config`) se omitió porque la inicialización fue no interactiva.
- Pendiente: reiniciar el IDE para que aparezcan los comandos `/opsx:*`.

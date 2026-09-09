---
name: lti-atomic-design
description: Define or review Atomic Design responsibilities and controlled component contracts in the LTI kanban and candidate-search exercises before implementation or during a behavior-preserving refactor.
---

# Atomic Design para LTI

Skill propia del taller, no una distribución oficial de Atomic Design.

## Antes de proponer componentes

Leer la rama actual, el diseño disponible, la spec y los componentes existentes. Diferenciar lo implementado de lo propuesto. En el checkpoint de inicio todavía no existe CandidateSearch; no asumir que un archivo del checkpoint resuelto está presente.

## Decisiones del proyecto

- Reutilizar las primitivas Bootstrap como átomos. No envolver cada etiqueta, botón o texto en otro componente sin una responsabilidad concreta.
- CandidateSummary presenta una candidatura; MoveStatus anuncia guardado. No cargar datos dentro de estas moléculas.
- KanbanBoard compone columnas y tarjetas, recibe steps, columns, disabled y onDragEnd y emite el gesto. La página decide qué movimiento aplicar y cómo persistirlo.
- CandidateSearch, cuando se implemente, es una molécula controlada: query, visibleCount, totalCount, disabled y onQueryChange. Gestiona el foco del campo al limpiar; no conoce servicios ni drag and drop.
- PositionKanbanDetail posee ruta, datos completos, consulta y persistencia. Derivar resultados filtrados; mantener applicationId al mover y conservar datos ocultos para rollback.
- La disposición de cabecera, mensajes y tablero cumple el papel de plantilla. No crear un archivo de plantilla solo para completar una taxonomía.

## Entrega esperada

1. Inventario de piezas existentes y propuestas, con archivo y responsabilidad.
2. Contratos de props y eventos; propietario de cada estado y de los servicios.
3. Relación entre decisión de composición, criterio observable y prueba/story.
4. Plan mínimo de implementación o refactor con límites explícitos.

Actualizar design.md cuando la tarea incluya SDD. Si solo se pide análisis, no implementar. Si se pide refactor, conservar la conducta y verificar las pruebas existentes. Si se pide una nueva conducta, actualizar primero el criterio correspondiente. La skill no autoriza instalaciones, publicaciones ni cambios de alcance.

## Context

### Atomic Design primero

| Nivel | Pieza | Responsabilidad y contrato |
| --- | --- | --- |
| Átomos existentes | Form.Label, Form.Control y Button de Bootstrap | Etiqueta, entrada y acción accesibles; reutilizar sin wrappers artificiales. |
| Molécula nueva | CandidateSearch | Props query:string, visibleCount:number, totalCount:number, disabled:boolean, onQueryChange:(value:string)=>void. Controlada, con ref interna para recuperar foco al limpiar; sin HTTP ni conocimiento de DnD. |
| Moléculas existentes | CandidateSummary y MoveStatus | Nombre/puntuación y anuncio de guardado; no poseen las columnas. |
| Organismo existente | KanbanBoard | Recibe steps, columns, disabled y onDragEnd; presenta la proyección visible y emite gestos. |
| Plantilla | Distribución del detalle | Cabecera, búsqueda, feedback y tablero; no exige extraer otro archivo. |
| Página | PositionKanbanDetail | Posee query, columnas completas, ruta, servicios, guardado y rollback. Deriva proyección y conteos. |

El código actual usa source.index sobre columns completas. Después de filtrar esos índices ya no coinciden; no basta con añadir un input. Las pruebas existentes usan servicios inyectados y la aplicación dispone de una prueba real contra PostgreSQL. Ver proposal.md para motivación y alcance. Se conserva React 18, Bootstrap y Storybook 7.6.

## Goals / Non-Goals

**Goals:** conservar una única fuente de datos, identidad estable y todas las fases; reproducir estados desktop/móvil; completar la búsqueda sin cambiar la API.

**Non-Goals:** duplicar columnas filtradas en estado, introducir un almacén global, ordenar dentro de una misma fase, persistir orden entre recargas o consulta entre visitas. La base solo persiste la fase, no el orden.

## Decisions

1. **Datos completos y proyección.** Mantener query como estado; normalizar consulta y nombres con trim, minúsculas y eliminación de diacríticos. Filtrar cada columna por subcadena, conservando orden. Calcular total del conjunto completo y visibles de la proyección. No usar otro setState para columnas filtradas ni hacer GET al escribir; no hay debounce de red ni endpoint search.
2. **Identidad de origen.** Resolver la tarjeta en la columna visible con source.index, obtener applicationId y buscarla en la columna completa. Verificar coherencia con draggableId; si no existe o no coincide, ignorar el gesto. No usar nombre ni índice visible directamente sobre datos completos.
3. **Inserción de destino.** Resolver la tarjeta visible situada en destination.index como ancla. Insertar antes de esa candidatura en la columna completa; si no hay ancla, añadir al final. Conservar el orden relativo de candidatos ocultos. Las fases vacías son destinos válidos. Cancelación o misma fase mantienen la conducta actual sin PUT.
4. **Persistencia y rollback.** Mantener savingRef e isSaving de la página. Desactivar input, limpiar y arrastre durante la operación; guardar snapshot completo antes del movimiento. Error: restaurar snapshot, conservar query y anunciar error. finally libera bloqueo. El movimiento exitoso no cambia conteo global de coincidencias.
5. **Vacío y columnas.** Con cero coincidencias y total>0 mostrar «No hay candidatos que coincidan con la búsqueda», mantener fases vacías y botón limpiar. Esto concreta la omisión del fragmento vacío de Figma y conserva OR-02. Con total=0 mostrar «Esta posición todavía no tiene candidatos». Un fallo de carga conserva el error existente; no presentarlo como cero resultados válido.
6. **Foco y responsive.** Etiqueta visible «Buscar candidatos», entrada tipo search y aria-describedby al conteo con aria-live polite. Limpiar pone query vacía y devuelve foco al campo. Botón debajo y a ancho completo a 375px; desktop a la derecha. Respetar foco azul, fondos, bordes y tipografía LTI. La consulta inicial vacía muestra todos los candidatos.
7. **Datos de Figma.** «José Pérez», 1 de 2 y score 9 son fixtures visuales. La aplicación mostrará José García y 1 de 3 cuando use el seed. No modificar seed para imitar cifras; stories pueden usar fixtures explícitos. Las notas BS y el pie docente de Figma no forman parte de la UI de producto. No modificar Figma durante esta propuesta.

## Risks / Trade-offs

- Índice visible confundido con identidad → prueba José visible en índice cero con Alex oculto, tanto en origen como destino.
- Rollback elimina datos ocultos → snapshot completo y prueba de error con filtro activo.
- Stories con conteos fijos ocultan un cálculo incorrecto → stories aisladas para presentación y pruebas integradas para reglas.
- Figma carece de estados de guardado/error → adoptar las protecciones y mensajes existentes del kanban; revisar visualmente nuevas combinaciones antes de aceptar.
- API devuelve datos completos → válido para este ejercicio; paginación y búsqueda servidor requieren otro contrato.
- Una respuesta tardía al cambiar de posición y concurrencia multiusuario son riesgos heredados → no declarar que esta búsqueda los resuelve.

## Migration Plan

Sin migraciones de base ni paquetes nuevos. Preparar el incremento en una rama de trabajo y conservar checkpoints de cada etapa. Los checkpoints existentes 01–07 son soluciones previas: comparar con estos escenarios antes de usarlos, conservarlos sin sobrescribir. Para una nueva recuperación, crear ramas propias sin force/reset y registrar commit y pruebas.

Verificar Jest, tipos, stories y aplicación real; publicar commit actual en Chromatic y mantener aceptación humana separada de éxito del build. Revertir el incremento frontend mediante commit si fuera necesario; datos y contrato backend permanecen compatibles.

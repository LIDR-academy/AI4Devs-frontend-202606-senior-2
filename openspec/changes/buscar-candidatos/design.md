# Diseño técnico: empezar por Atomic Design

## 1. Inventario y composición antes de implementar

Partimos de nuestro kanban resuelto en `kanban-solved` y del diseño de LTI. Primero identificamos piezas existentes, responsabilidades y contratos. Atomic Design es una forma de razonar sobre composición; no obliga a crear carpetas o wrappers para cada elemento HTML.

| Nivel | Pieza | Responsabilidad y contrato |
| --- | --- | --- |
| Átomos | Form.Label, Form.Control, Button y texto de conteo de Bootstrap | Etiqueta asociada, entrada controlada, acción de limpiar, estado disabled y anuncio accesible. Reutilizar las primitivas existentes. |
| Molécula | CandidateSearch | Combinar etiqueta, campo, limpiar, conteo y vacío. Recibe query, visibleCount, totalCount, disabled y onQueryChange. Limpiar emite consulta vacía y devuelve el foco. No carga datos ni conoce DnD. |
| Moléculas existentes | CandidateSummary y MoveStatus | Presentar candidato y estado de guardado; conservar sus responsabilidades. |
| Organismo | KanbanBoard | Componer columnas y tarjetas, traducir índices visibles a applicationId y coordinar movimiento/rollback. |
| Plantilla | Distribución del detalle de posición | Cabecera, búsqueda, mensajes y tablero; disposición móvil y escritorio sin datos concretos. No exige un componente nuevo. |
| Página | PositionKanbanDetail | Resolver posición/ruta, cargar datos y mantener query, columnas completas y persistencia. Derivar resultados; no duplicar estado filtrado. |

CandidateSearch existe como molécula controlada en frontend/src/components/kanban/CandidateSearch.tsx. La página compone esa molécula con KanbanBoard. Las pruebas verifican la conducta observable y conservan el arrastre por identidad después de la extracción.

## 2. Convertir composición en SDD

Tras este mapa, redactar la propuesta y los criterios BS-01 a BS-05: normalización, conteo, vacío, recuperación de foco, identidad al arrastrar y móvil. Cada criterio debe indicar qué pieza responde por él y cómo se observará. La jerarquía de componentes no sustituye los requisitos del producto.

Contrato de estado: la página conserva la consulta y los datos completos; el buscador recibe valores y emite cambios; las tarjetas reciben candidatos; el tablero resuelve identidades. Las llamadas de red permanecen en los servicios existentes.

## 3. Implementación y validación

Orden de clase: Diseño → **SDD empezando por Atomic Design** → TDD → Storybook → Chromatic → PR. Empezar con pruebas fallidas de los criterios; implementar; documentar estados aislados en stories; comprobar integración y revisar las diferencias visuales. Pedir a la IA que explique qué reutiliza y qué responsabilidad añade antes de generar código.

La consulta es estado local. Las columnas completas conservan los datos; visibleColumns es una proyección derivada. Normalizar texto mediante NFD, eliminación de marcas diacríticas, trim y minúsculas. El conteo se deriva de las columnas y se anuncia con aria-live.

El índice de DnD pertenece a la lista visible. Resolver la candidatura por applicationId antes de modificar la lista completa. Traducir también el índice de destino usando la candidatura visible que sigue al punto de inserción. Conservar la serialización y el rollback existentes. Desactivar edición de consulta durante persistencia.

Figma y componentes siguen Bootstrap original de LTI. Campo con etiqueta, botón de limpiar y mensaje de cero coincidencias. En móvil, botón debajo del campo. Las búsquedas se limitan a las candidaturas cargadas de la posición actual.

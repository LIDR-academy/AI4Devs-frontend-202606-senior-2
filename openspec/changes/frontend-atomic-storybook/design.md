## Context

### Atomic Design: inventario y contratos

| Nivel | Existente | Propuesta y responsabilidad |
| --- | --- | --- |
| Átomos | Button, Form.Control, Spinner, Alert de Bootstrap | Reutilizar; una página de documentación muestra las variantes realmente usadas, sin wrappers universales. |
| Moléculas | CandidateSummary, MoveStatus | Conservar. Extraer PositionCard (position, onOpen), DashboardActionCard (title, label, href) y FileUploadField (fileName, pending, uploaded, error, onFileChange, onUpload). |
| Organismos | KanbanBoard | Añadir PositionsList (positions, onOpen) y CandidateFormView (value, status, errors, callbacks de campos/secciones/upload/submit). No tienen HTTP ni conocimiento de rutas. |
| Plantillas | Container/Row/Col repetidos | Documentar la distribución existente. Extraer PageLayout solo si al implementar hay dos usos con el mismo contrato real; no es condición de aceptación crear un archivo. |
| Páginas | RecruiterDashboard, Positions, PositionKanbanDetail, AddCandidateForm | Mantener rutas, dueño del estado y servicios; componer las piezas anteriores. |

PositionKanbanDetail ya acepta servicios inyectables; su catálogo sigue bajo LIDR/Organisms por historia. Positions llama axios directamente. AddCandidateForm y FileUploader contienen estado y llamadas de red. .storybook/main.ts descubre ts/tsx; los componentes dashboard/form/upload son js. Se necesita incluir stories js/jsx o escribir sus stories en tsx sin migrar todos los componentes.

## Goals / Non-Goals

**Goals:** catálogo del código usado por la aplicación, estados deterministas, contratos controlados, evidencia de navegación y persistencia conservadas.

**Non-Goals:** reescribir todo en TypeScript, crear otra librería visual, cambiar backend, construir búsqueda o filtros nuevos, inventar validaciones de negocio, actualizar dependencias o aceptar baselines automáticamente.

## Decisions

1. Composición por responsabilidades, no mudanza masiva de carpetas. Las extracciones permanecen junto a su funcionalidad y las stories se colocan junto al componente. Alternativa descartada: duplicar pantallas solo para Storybook, porque no verificaría el producto real.
2. Las páginas coordinan servicios inyectables con defaults de producción. Las stories usan funciones locales que resuelven, rechazan o quedan pendientes de forma controlada. Las moléculas reciben datos y callbacks. Alternativa: mocks globales de fetch/axios; se evita porque pueden contaminar otras stories y ocultar dependencias.
3. Mantener los contratos existentes de candidato, formulario y upload. El formulario conserva educación/experiencia y las validaciones actuales. Selección de archivo y resultado de subida tendrán callbacks diferentes; no tratar File y respuesta de upload como el mismo valor. La selección cancelada conserva estado sin lanzar excepción. Errores de upload actualmente solo en consola se harán visibles como feedback accesible, sin cambiar reglas de negocio.
4. Catálogo LTI/Atoms, LTI/Molecules, LTI/Organisms y LTI/Pages para entradas nuevas. Conservar títulos/IDs antiguos del kanban para evitar churn en tests y Chromatic; documentar su responsabilidad de página. No duplicar stories existentes.
5. Decoradores locales MemoryRouter donde hagan falta, estilos Bootstrap y DatePicker como en producción. Datos ficticios, fechas fijas y File fabricado localmente; no subir archivos reales ni hacer peticiones a localhost:3010 desde stories.
6. Matriz mínima: dashboard Default; posiciones Loaded/Empty/Loading/Error y título largo; kanban reutiliza sus nueve estados actuales más story directa del organismo; formulario Empty/Prefilled/ValidationError/SubmitSuccess/SubmitError; upload NoFile/Selected/Uploading/Success/Error. Estado SubmitPending solo se añade si queda representado explícitamente por la página; no simular protección que no existe.
7. Pruebas antes de extraer: caracterizar navegación, apertura por ID, eventos de formulario/upload y comportamiento de kanban. Luego rojo para contratos nuevos e implementación mínima. Probar el cálculo en la página, presentación por args y eventos en componentes; no confundirlo.

## Risks / Trade-offs

- Formulario grande con side effects → separar primero servicios y vista; revisar payload existente antes y después. No cambiar semántica de fechas.
- Stories exitosas con mocks pero aplicación rota → mantener test:app para el kanban y añadir smoke local de navegación/formulario con datos de prueba autorizados.
- Nuevos IDs alteran Chromatic → preservar IDs del kanban; nuevas stories crean una nueva referencia que debe revisarse.
- Diferencias de JSX/TSX → ampliar discovery y comprobar build con las versiones actuales.
- Alcance amplio → entregar por etapas; la búsqueda continúa como cambio independiente.

## Migration Plan

Diseño/inventario → TDD y extracción por pantalla → stories → revisión visual → PR. En cada etapa guardar un commit y crear una rama de recuperación dedicada bajo frontend-storybook; elegir nombres sin sobrescribir ramas existentes. No modificar los checkpoints del ejercicio de búsqueda con implementación de esta propuesta. Para volver atrás, guardar trabajo y cambiar a su checkpoint, sin borrar cambios. Mantener services por defecto para que la aplicación siga operativa fuera de Storybook.

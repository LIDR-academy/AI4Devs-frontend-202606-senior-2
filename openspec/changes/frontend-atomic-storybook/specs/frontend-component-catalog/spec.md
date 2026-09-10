## Purpose

Permitir a diseño y desarrollo explorar los componentes reales del frontend LTI y verificar sus estados e interacciones en un catálogo reproducible sin depender del backend.

## ADDED Requirements

### Requirement: SB-01 Catálogo del frontend existente
El catálogo SHALL incluir ejemplos navegables del dashboard, posiciones, detalle kanban y alta de candidatos, usando las mismas piezas que la aplicación y agrupando las nuevas entradas por responsabilidad Atomic Design.

#### Scenario: Explorar una pantalla
- **WHEN** una persona abre el catálogo y selecciona una pantalla o pieza
- **THEN** puede ver una representación del componente usado en la aplicación y su documentación de responsabilidad
- **AND** las entradas existentes del kanban siguen siendo accesibles por sus IDs previos

### Requirement: SB-02 Documentación de contratos
Cada pieza extraída SHALL documentar entradas, eventos, estados admitidos y ejemplos de uso; las piezas de presentación SHALL permitir modificar sus entradas y observar eventos sin acceder a la API.

#### Scenario: Revisar una tarjeta de posición
- **WHEN** se cambia el título mediante Controls y se activa Ver proceso
- **THEN** el título mostrado se actualiza y se registra un evento con el ID de esa posición
- **AND** no se realiza una petición al backend

### Requirement: SB-03 Estados reproducibles sin backend
Las stories SHALL funcionar con datos ficticios deterministas y sin peticiones al backend, incluidas las acciones de guardar y subir archivos.

#### Scenario: Servicios detenidos
- **WHEN** se navegan las stories con API y PostgreSQL detenidos
- **THEN** los ejemplos cargan y sus acciones usan respuestas simuladas de la story
- **AND** recargar una story restaura su estado inicial sin depender de otra story

### Requirement: SB-04 Cobertura de estados de las pantallas
El catálogo SHALL mostrar dashboard, listado cargado/vacío/cargando/error, estados existentes del kanban, formulario vacío/prellenado/error de validación/éxito/error de envío y archivo sin seleccionar/seleccionado/subiendo/subido/error.

#### Scenario: Revisar un error de subida
- **WHEN** se selecciona el ejemplo de fallo de upload y se ejecuta la subida simulada
- **THEN** aparece feedback de error visible y accesible sin anunciar éxito

#### Scenario: Cancelar selección
- **WHEN** se cancela el selector de archivo
- **THEN** no ocurre una excepción ni se realiza una subida y se conserva la selección anterior

### Requirement: SB-05 Interacciones y móvil
Los ejemplos SHALL permitir verificar etiquetas accesibles, foco de teclado, acciones y disposición a 375 y 1280 píxeles, sin desbordamiento horizontal del documento.

#### Scenario: Uso por teclado
- **WHEN** se recorre un formulario o tarjeta con Tab y se activa su acción
- **THEN** el foco es visible y la acción emite el evento esperado

#### Scenario: Pantalla estrecha
- **WHEN** se visualizan las pantallas a 375 píxeles con textos largos
- **THEN** los controles y tarjetas se mantienen legibles y utilizables sin desbordar el documento

### Requirement: SB-06 Conservación de la aplicación
La aplicación SHALL conservar rutas, apertura de posiciones por ID real, contratos de formulario y cambio de fase persistente al introducir componentes en el catálogo.

#### Scenario: Kanban fuera del catálogo
- **WHEN** se abre una posición en la aplicación, se mueve una candidatura y se recarga tras guardar
- **THEN** se conserva el movimiento usando la API real

### Requirement: SB-07 Evidencia visual revisable
La entrega SHALL identificar el commit, stories, viewports y resultados revisados, distinguiendo build correcto de aprobación visual humana.

#### Scenario: Revisión del PR
- **WHEN** se presenta el incremento para aceptación
- **THEN** se enlazan pruebas, catálogo y build del mismo commit, o se declara explícitamente la publicación pendiente
- **AND** no se presenta un baseline histórico como validación del cambio actual

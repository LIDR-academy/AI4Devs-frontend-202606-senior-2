## Purpose

Permitir localizar candidaturas por nombre dentro de una posición sin perder contexto, accesibilidad ni identidad al moverlas entre fases del kanban.

## ADDED Requirements

### Requirement: BS-01 Búsqueda y conteo local
La interfaz SHALL filtrar por subcadena del nombre completo, sin distinguir mayúsculas, tildes ni espacios exteriores; SHALL mostrar visibles/total de la posición cargada sin nuevas peticiones por escribir o limpiar.

#### Scenario: Consulta inicial
- **WHEN** termina de cargar una posición con tres candidaturas y la consulta está vacía
- **THEN** se muestran las tres en sus fases y el conteo indica 3 de 3 candidatos

#### Scenario: Normalización
- **WHEN** la posición contiene Alex Demo, José García y Sam Ejemplo y se escribe « JOSE »
- **THEN** solo aparece José García y el conteo indica 1 de 3 candidatos
- **AND** no se solicita de nuevo la lista a la API

#### Scenario: Solo espacios
- **WHEN** se introduce una consulta formada solo por espacios
- **THEN** se muestran todos los candidatos cargados

### Requirement: BS-02 Vacío y recuperación
La interfaz SHALL distinguir cero coincidencias de una posición sin candidatos, mantener todas las columnas y ofrecer limpiar con retorno del foco al buscador.

#### Scenario: Sin coincidencias
- **WHEN** se busca Lucía en el conjunto de tres candidatos del ejemplo
- **THEN** se anuncia 0 de 3 candidatos y «No hay candidatos que coincidan con la búsqueda»
- **AND** permanecen las fases vacías y la acción Limpiar búsqueda

#### Scenario: Limpiar
- **WHEN** se activa Limpiar búsqueda desde un resultado filtrado o vacío
- **THEN** la consulta queda vacía, regresan todos los candidatos y el foco queda en el campo

#### Scenario: Posición vacía
- **WHEN** una posición carga correctamente sin candidaturas
- **THEN** se muestra «Esta posición todavía no tiene candidatos», 0 de 0 candidatos y sus fases

#### Scenario: Error de carga
- **WHEN** falla la carga de candidaturas
- **THEN** el error permanece visible y no se presenta como una búsqueda válida sin resultados

### Requirement: BS-03 Movimiento de la candidatura correcta
La interfaz SHALL mantener la identidad de la candidatura al mover resultados filtrados, conservar candidatos ocultos y todas las fases, y persistir únicamente el cambio de fase de la candidatura movida.

#### Scenario: Índice visible diferente del original
- **WHEN** Alex precede a José en Inscritos, se filtra por jose y se arrastra José a Entrevista
- **THEN** se guarda el cambio para la candidatura de José, Alex permanece en Inscritos y se conserva la consulta
- **AND** al recargar José sigue en Entrevista

#### Scenario: Ancla de destino y datos ocultos
- **WHEN** se inserta una coincidencia antes de otra tarjeta visible en una fase que también contiene tarjetas ocultas
- **THEN** al limpiar aparece antes de esa tarjeta destino y se conserva el orden relativo de las tarjetas ocultas

#### Scenario: Destino sin coincidencias
- **WHEN** se arrastra una coincidencia a una fase sin tarjetas visibles
- **THEN** se añade al final de la fase completa sin eliminar sus tarjetas ocultas

#### Scenario: Cancelar o soltar en la misma fase
- **WHEN** se cancela el gesto o termina en la fase de origen
- **THEN** no se envía un cambio de fase

### Requirement: BS-04 Guardado y recuperación con filtro
La interfaz SHALL impedir modificar la consulta y realizar otro movimiento durante el guardado; si falla SHALL restaurar todos los datos anteriores y mantener la consulta.

#### Scenario: Operación pendiente
- **WHEN** la API aún no ha respondido al movimiento
- **THEN** se anuncia Guardando y quedan desactivados buscador, limpiar y arrastre
- **AND** no se inicia otra actualización

#### Scenario: Fallo y recuperación
- **WHEN** falla el guardado de José con filtro activo y Alex oculto
- **THEN** José vuelve a su fase anterior, Alex se conserva, la consulta permanece y se anuncia el error
- **AND** se habilitan de nuevo búsqueda y arrastre

#### Scenario: Guardado correcto
- **WHEN** se confirma la operación
- **THEN** se habilitan los controles y el conteo de coincidencias se conserva

### Requirement: BS-05 Accesibilidad y presentación adaptable
La búsqueda SHALL tener etiqueta visible, conteo anunciado, controles operables por teclado y disposición móvil sin desbordamiento horizontal.

#### Scenario: Escritorio
- **WHEN** se muestra el detalle a ancho de escritorio
- **THEN** la búsqueda queda entre cabecera y tablero, el botón a la derecha y el conteo debajo

#### Scenario: Móvil
- **WHEN** se muestra a 375 píxeles, incluso con nombres largos
- **THEN** el botón queda debajo del campo a ancho disponible, las fases se apilan y no hay scroll horizontal del documento

#### Scenario: Teclado y anuncio
- **WHEN** se recorre la búsqueda por teclado y cambia el conjunto visible
- **THEN** el foco es visible, el campo tiene nombre accesible y el nuevo conteo se anuncia sin mover el foco

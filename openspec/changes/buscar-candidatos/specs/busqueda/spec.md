## ADDED Requirements

### Requirement: BS-01 Búsqueda de candidatos
La interfaz SHALL cumplir este criterio: buscar por subcadena del nombre sin distinguir mayúsculas, tildes ni espacios exteriores. Mostrar visibles/total y no volver a pedir datos.

#### Scenario: Verificar BS-01
- **WHEN** el usuario utiliza la búsqueda del tablero en el contexto descrito
- **THEN** buscar por subcadena del nombre sin distinguir mayúsculas, tildes ni espacios exteriores. Mostrar visibles/total y no volver a pedir datos.

### Requirement: BS-02 Búsqueda de candidatos
La interfaz SHALL cumplir este criterio: con cero coincidencias, mostrar mensaje específico y permitir limpiar. Limpiar restaura las tarjetas y devuelve el foco al campo. Distinguir una posición sin candidatos.

#### Scenario: Verificar BS-02
- **WHEN** el usuario utiliza la búsqueda del tablero en el contexto descrito
- **THEN** con cero coincidencias, mostrar mensaje específico y permitir limpiar. Limpiar restaura las tarjetas y devuelve el foco al campo. Distinguir una posición sin candidatos.

### Requirement: BS-03 Búsqueda de candidatos
La interfaz SHALL cumplir este criterio: al mover una tarjeta filtrada, persistir su candidatura real, no la que ocupa su índice visual en la lista completa. Conservar las tarjetas ocultas. En destino insertar antes de la tarjeta visible indicada o al final si no hay ninguna después.

#### Scenario: Verificar BS-03
- **WHEN** el usuario utiliza la búsqueda del tablero en el contexto descrito
- **THEN** al mover una tarjeta filtrada, persistir su candidatura real, no la que ocupa su índice visual en la lista completa. Conservar las tarjetas ocultas. En destino insertar antes de la tarjeta visible indicada o al final si no hay ninguna después.

### Requirement: BS-04 Búsqueda de candidatos
La interfaz SHALL cumplir este criterio: un fallo de persistencia mantiene consulta y restaura datos completos. Durante guardado no se cambia la consulta.

#### Scenario: Verificar BS-04
- **WHEN** el usuario utiliza la búsqueda del tablero en el contexto descrito
- **THEN** un fallo de persistencia mantiene consulta y restaura datos completos. Durante guardado no se cambia la consulta.

### Requirement: BS-05 Búsqueda de candidatos
La interfaz SHALL cumplir este criterio: a 375 px el buscador, el botón y el tablero no provocan scroll horizontal. Etiqueta visible y conteo anunciado.

#### Scenario: Verificar BS-05
- **WHEN** el usuario utiliza la búsqueda del tablero en el contexto descrito
- **THEN** a 375 px el buscador, el botón y el tablero no provocan scroll horizontal. Etiqueta visible y conteo anunciado.


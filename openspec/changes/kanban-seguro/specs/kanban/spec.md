## ADDED Requirements

### Requirement: KB-01 Movimiento por teclado
El tablero SHALL permitir cambiar de fase una candidatura mediante teclado conservando su identidad.

#### Scenario: Movimiento confirmado
- **WHEN** el usuario enfoca una tarjeta, pulsa Espacio, flecha hacia otra columna y Espacio y el servicio confirma
- **THEN** la candidatura aparece en la fase destino

### Requirement: KB-02 Recuperación ante error
La página SHALL restaurar las columnas anteriores y mostrar un error si falla el guardado del movimiento.

#### Scenario: Fallo del servicio
- **WHEN** falla la petición de un movimiento optimista
- **THEN** la tarjeta vuelve a la columna original y aparece un mensaje de error

### Requirement: KB-03 Una operación en vuelo
La página SHALL impedir nuevos movimientos mientras se guarda el actual, anunciar Guardando y liberar el bloqueo cuando termina.

#### Scenario: Segundo movimiento pendiente
- **WHEN** llega un segundo gesto mientras el primero está guardándose
- **THEN** no se inicia otra petición y las tarjetas permanecen desactivadas

#### Scenario: Finalización
- **WHEN** el primer guardado termina con éxito o error
- **THEN** se vuelve a permitir mover tarjetas

### Requirement: KB-04 Estados y ajuste móvil
La interfaz SHALL ofrecer estados reproducibles de carga, vacío y error y ajustar nombres largos sin desbordamiento a 375 píxeles.

#### Scenario: Nombre largo
- **WHEN** se abre LongName a 375 píxeles
- **THEN** el documento no desborda horizontalmente y las fases se apilan

#### Scenario: Error de carga
- **WHEN** no se puede cargar el proceso de la posición
- **THEN** se muestra un error de carga en lugar de un tablero aparentemente válido

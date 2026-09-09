# Contrato del kanban

- KB-01: Dado un tablero cargado, cuando se mueve una tarjeta con teclado y el servicio responde correctamente, aparece en la columna destino.
- KB-02: Dado un movimiento optimista, cuando falla el servicio, la tarjeta vuelve a su columna original y se muestra un error.
- KB-03: Mientras un movimiento persiste, no se inicia otro; se anuncia guardado y se desactiva el arrastre. Al finalizar, se permite otra operación.
- KB-04: A 375 px, un nombre largo no provoca desbordamiento horizontal del documento. La carga, vacío y errores tienen estados reproducibles.

Stories correspondientes: MoveSuccess, MoveError, Saving y LongName, más Loaded/Empty/Loading/LoadError/CandidatesError. Pruebas de comportamiento en Jest y Chrome; revisión visual independiente en Chromatic cuando haya proyecto disponible.

# Criterios observables

- BS-01: buscar por subcadena del nombre sin distinguir mayúsculas, tildes ni espacios exteriores. Mostrar visibles/total y no volver a pedir datos.
- BS-02: con cero coincidencias, mostrar mensaje específico y permitir limpiar. Limpiar restaura las tarjetas y devuelve el foco al campo. Distinguir una posición sin candidatos.
- BS-03: al mover una tarjeta filtrada, persistir su candidatura real, no la que ocupa su índice visual en la lista completa. Conservar las tarjetas ocultas. En destino insertar antes de la tarjeta visible indicada o al final si no hay ninguna después.
- BS-04: un fallo de persistencia mantiene consulta y restaura datos completos. Durante guardado no se cambia la consulta.
- BS-05: a 375 px el buscador, el botón y el tablero no provocan scroll horizontal. Etiqueta visible y conteo anunciado.

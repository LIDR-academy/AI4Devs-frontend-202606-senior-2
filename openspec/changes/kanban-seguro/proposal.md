# Cambio de fase seguro y observable

El tablero del PR #5 realiza actualizaciones optimistas y restaura todas las columnas cuando falla una petición. Si se permite otra operación simultánea, el rollback puede eliminar cambios posteriores. Queremos que reclutamiento vea el estado de la operación y conserve un tablero consistente.

Tres incrementos: catálogo de estados en Storybook; serialización y recuperación ante errores; evidencia de pruebas y revisión visual. Se modifica el componente existente, sin migrar framework ni cambiar contratos backend. Quedan fuera concurrencia entre usuarios, reintentos automáticos y comprobación de persistencia real.

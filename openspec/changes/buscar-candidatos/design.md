# Diseño técnico

La consulta es estado local. Las columnas completas conservan los datos; visibleColumns es una proyección derivada. Normalizar texto mediante NFD, eliminación de marcas diacríticas, trim y minúsculas. El conteo se deriva de las columnas y se anuncia con aria-live.

El índice de DnD pertenece a la lista visible. Resolver la candidatura por applicationId antes de modificar la lista completa. Traducir también el índice de destino usando la candidatura visible que sigue al punto de inserción. Conservar la serialización y el rollback existentes. Desactivar edición de consulta durante persistencia.

Figma y componentes siguen Bootstrap original de LTI. Campo con etiqueta, botón de limpiar y mensaje de cero coincidencias. En móvil, botón debajo del campo. Las búsquedas se limitan a las candidaturas cargadas de la posición actual.

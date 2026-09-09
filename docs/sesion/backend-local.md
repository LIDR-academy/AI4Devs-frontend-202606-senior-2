# Aplicación lista antes de clase

Requisitos: Docker en ejecución, Node y dependencias instaladas con `npm ci` en backend y frontend. No se usa ninguna base compartida.

En backend:

```sh
npm run session:setup
npm run session:start
```

En otra terminal, desde frontend:

```sh
npm start
```

Abrir http://localhost:3000/positions y pulsar Ver proceso. También se permite http://127.0.0.1:3000. La lista usa IDs reales de la API. Ya no contiene enlaces ficticios ni controles sin implementar.

`session:setup` crea o inicia el contenedor dedicado `lidr-frontend-session-db`, aplica migraciones y crea Frontend Engineer con Alex Demo, José García y Sam Ejemplo. Una segunda ejecución conserva los datos y movimientos. PostgreSQL escucha solo en 127.0.0.1:55439, sin contraseña (trust), exclusivamente para estos datos ficticios de clase. No usar esta configuración en una red compartida ni producción. El contenedor conserva los datos al detenerse. Para detenerlo: `docker stop lidr-frontend-session-db`.

La conexión está fijada por los scripts locales; el backend normal usa DATABASE_URL. No hay que editar el schema ni credenciales para dar la clase.

## Contrato de búsqueda: solo frontend

GET /position/:id/candidates devuelve el conjunto completo del tablero con `id`, `applicationId`, `fullName`, `currentInterviewStep` y `averageScore`. No hay paginación en este ejercicio. La página conserva ese conjunto; deriva los resultados por nombre normalizando mayúsculas y tildes. `Jose` debe encontrar `José García`; `Lucía` debe dar cero resultados. Limpiar restaura todas las tarjetas sin pedir datos nuevos. La búsqueda no requiere cambios del backend, migraciones ni un endpoint search.

El movimiento sigue usando PUT /candidates/:id con applicationId y currentInterviewStep. No se envía el índice del resultado filtrado como identidad. La búsqueda aún no está implementada en kanban-solved ni en sesion-frontend/sesion: es el trabajo de clase.

## Verificación reproducible

Con frontend y backend arrancados, ejecutar desde frontend `npm run test:app`. Recorre posiciones → tablero, arrastra con ratón, espera PUT 200 y recarga para confirmar persistencia. Simula un PUT fallido para comprobar rollback y restaura la fase original mediante la API al terminar. Solo usa datos ficticios del seed.

Verificación realizada: arrastre real → API → PostgreSQL → recarga, rollback visual, 17 pruebas de frontend y compilación de backend/TypeScript. Storybook sigue disponible por separado en 6006.

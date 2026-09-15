## ADDED Requirements

### Requirement: Acceso a la página de una posición
El frontend SHALL exponer la ruta `/positions/:id`, que muestra el tablero kanban de la posición con ese id. El botón "Ver proceso" de cada tarjeta del listado de posiciones SHALL navegar a `/positions/<id>` de esa posición.

#### Scenario: Navegar desde el listado de posiciones
- **WHEN** el usuario pulsa "Ver proceso" en la tarjeta de la posición con id 1 en `/positions`
- **THEN** el navegador navega a `/positions/1` y se muestra el tablero kanban de esa posición

#### Scenario: Acceso directo por URL
- **WHEN** el usuario abre directamente `/positions/1`
- **THEN** la página carga el flujo de entrevistas y los candidatos de la posición 1 sin pasar por el listado

### Requirement: Carga de datos de la posición
Al entrar en la página, el sistema SHALL pedir en paralelo `GET /position/:id/interviewflow` y `GET /position/:id/candidates`. Mientras las peticiones estén en curso, SHALL mostrar un indicador de carga. El tablero SHALL mostrarse solo cuando ambas respuestas hayan llegado correctamente.

#### Scenario: Carga correcta
- **WHEN** ambas peticiones responden con éxito
- **THEN** desaparece el indicador de carga y se muestran el título, las columnas y las tarjetas

#### Scenario: Carga en curso
- **WHEN** alguna de las dos peticiones todavía no ha respondido
- **THEN** se muestra un indicador de carga y no se muestran columnas

#### Scenario: Posición inexistente
- **WHEN** `GET /position/:id/interviewflow` responde con estado 404
- **THEN** la página muestra el mensaje "Posición no encontrada" y la flecha para volver al listado de posiciones

#### Scenario: Id no numérico
- **WHEN** el usuario abre `/positions/abc`
- **THEN** la página muestra "Posición no encontrada" sin llamar a la API

#### Scenario: Error de red o del servidor
- **WHEN** alguna de las peticiones falla por un error de red o responde con un estado distinto de 2xx y de 404
- **THEN** la página muestra un mensaje de error y un botón "Reintentar" que vuelve a lanzar ambas peticiones

### Requirement: Cabecera con título y navegación de vuelta
La página SHALL mostrar en la parte superior el nombre de la posición (`positionName`) como encabezado principal. A su izquierda SHALL mostrar una flecha que enlaza con `/positions`. La flecha SHALL tener una etiqueta accesible ("Volver a posiciones").

#### Scenario: Título visible
- **WHEN** el flujo de entrevistas se ha cargado con `positionName` "Senior Full-Stack Engineer"
- **THEN** el encabezado principal de la página muestra "Senior Full-Stack Engineer"

#### Scenario: Volver al listado
- **WHEN** el usuario pulsa la flecha situada a la izquierda del título
- **THEN** el navegador navega a `/positions`

### Requirement: Una columna por fase del proceso
El tablero SHALL mostrar exactamente una columna por cada elemento de `interviewFlow.interviewSteps`. Cada columna muestra el `name` de la fase como cabecera. Las columnas SHALL ordenarse por `orderIndex` ascendente y, a igual `orderIndex`, por `id` ascendente.

#### Scenario: Número y orden de columnas
- **WHEN** el flujo tiene las fases `{id:1, "Initial Screening", orderIndex:1}`, `{id:3, "Manager Interview", orderIndex:2}` y `{id:2, "Technical Interview", orderIndex:2}`
- **THEN** se muestran tres columnas en el orden "Initial Screening", "Technical Interview", "Manager Interview"

#### Scenario: Columna sin candidatos
- **WHEN** ninguna candidatura de la posición está en una fase
- **THEN** la columna de esa fase se muestra igualmente, con un texto indicando que no hay candidatos, y admite que se suelten tarjetas en ella

#### Scenario: Flujo sin fases
- **WHEN** `interviewSteps` es un array vacío
- **THEN** la página muestra el título y el mensaje "Esta posición no tiene fases definidas" en lugar del tablero

### Requirement: Tarjeta de candidato en su fase
Por cada elemento de `GET /position/:id/candidates`, el tablero SHALL mostrar una tarjeta en la columna cuya fase tenga el mismo `name` que `currentInterviewStep`. Si varias fases comparten nombre, se usa la primera en el orden de columnas. La tarjeta SHALL mostrar el `fullName` del candidato y su `averageScore`, representada como un número de puntos entre 0 y 5 igual a `averageScore` redondeado al entero más cercano. La puntuación SHALL tener un texto accesible con el valor ("Puntuación media: 4 de 5"). Con una puntuación de 0, la tarjeta SHALL mostrar el texto "Sin puntuación" en lugar de puntos.

#### Scenario: Tarjeta en su columna
- **WHEN** la API devuelve `{ fullName: "Jane Smith", currentInterviewStep: "Technical Interview", averageScore: 4 }`
- **THEN** en la columna "Technical Interview" aparece una tarjeta con "Jane Smith" y 4 puntos de puntuación

#### Scenario: Puntuación decimal
- **WHEN** un candidato tiene `averageScore` 3.6
- **THEN** su tarjeta muestra 4 puntos y el texto accesible "Puntuación media: 3.6 de 5"

#### Scenario: Candidato sin puntuación
- **WHEN** un candidato tiene `averageScore` 0
- **THEN** su tarjeta muestra "Sin puntuación" y ningún punto

#### Scenario: Candidato en una fase que no pertenece al flujo
- **WHEN** el `currentInterviewStep` de un candidato no coincide con el nombre de ninguna fase del flujo
- **THEN** ese candidato no aparece en ninguna columna, y la página muestra un aviso con su nombre indicando que su fase no pertenece al proceso de esta posición

### Requirement: Cambio de fase arrastrando la tarjeta
El usuario SHALL poder arrastrar la tarjeta de un candidato y soltarla en otra columna para cambiar su fase. Al soltar en una columna distinta, el sistema SHALL mover la tarjeta a esa columna inmediatamente y enviar `PUT /candidates/:candidateId` con el cuerpo `{ applicationId, currentInterviewStep: <id de la fase destino> }`. Si la petición falla, SHALL devolver la tarjeta a su columna original y mostrar un mensaje de error. El arrastre SHALL funcionar con ratón, táctil y teclado.

#### Scenario: Mover a otra fase con éxito
- **WHEN** el usuario arrastra la tarjeta de "Jane Smith" (candidato 2, aplicación 3) desde "Technical Interview" y la suelta en "Manager Interview" (fase con id 3)
- **THEN** la tarjeta aparece en "Manager Interview" sin esperar a la respuesta, se envía `PUT /candidates/2` con `{ "applicationId": 3, "currentInterviewStep": 3 }`, y tras la respuesta 200 la tarjeta permanece en "Manager Interview"

#### Scenario: El cambio persiste
- **WHEN** después de un cambio de fase con éxito el usuario recarga la página
- **THEN** la tarjeta aparece en la columna de la nueva fase

#### Scenario: Fallo al guardar
- **WHEN** el usuario suelta una tarjeta en otra columna y `PUT /candidates/:id` falla (error de red o estado distinto de 2xx)
- **THEN** la tarjeta vuelve a su columna original y se muestra un mensaje de error que el usuario puede cerrar

#### Scenario: Soltar en la misma columna o fuera del tablero
- **WHEN** el usuario suelta una tarjeta en su misma columna o fuera de cualquier columna
- **THEN** la tarjeta queda en su columna original y no se envía ninguna petición

#### Scenario: Mover con teclado
- **WHEN** el usuario enfoca una tarjeta, pulsa espacio para levantarla, usa las flechas para llevarla a otra columna y pulsa espacio para soltarla
- **THEN** el sistema se comporta igual que al soltarla con el ratón en esa columna

### Requirement: Diseño responsive
En pantallas de 768 px de ancho o más, las columnas SHALL mostrarse una al lado de la otra en horizontal. Si no caben, el tablero tiene desplazamiento horizontal propio y la página no. En pantallas de menos de 768 px, las columnas SHALL apilarse en vertical, cada una ocupando todo el ancho disponible, y las tarjetas SHALL poder arrastrarse con el dedo entre columnas.

#### Scenario: Escritorio
- **WHEN** la página se muestra en una ventana de 1280 px de ancho con cuatro fases
- **THEN** las cuatro columnas aparecen en una sola fila horizontal

#### Scenario: Móvil
- **WHEN** la página se muestra en una ventana de 390 px de ancho
- **THEN** las columnas aparecen una debajo de otra, cada una a todo el ancho, y la página no tiene desplazamiento horizontal

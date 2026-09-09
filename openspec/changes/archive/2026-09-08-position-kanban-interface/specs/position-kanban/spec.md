## ADDED Requirements

### Requirement: Ruta de la página de posición

La aplicación SHALL exponer la página de kanban en la ruta `/positions/:id`, donde `:id` es el identificador numérico de la posición, añadida al router ya existente de la aplicación sin alterar sus rutas previas (`/`, `/add-candidate`, `/positions`).

#### Scenario: Acceso directo por URL

- **WHEN** el usuario navega a `/positions/1`
- **THEN** se renderiza la página de kanban de la posición con identificador `1`

#### Scenario: Navegación desde el listado de posiciones

- **WHEN** el usuario pulsa "Ver proceso" en una tarjeta del listado de posiciones
- **THEN** la aplicación navega a `/positions/:id` con el identificador de esa posición

#### Scenario: Rutas existentes sin cambios

- **WHEN** el usuario navega a `/`
- **THEN** la aplicación sigue mostrando el dashboard del reclutador (`RecruiterDashboard`), sin cambios respecto al comportamiento previo

### Requirement: Cabecera con título de posición y retorno

La página SHALL mostrar en su parte superior el nombre de la posición obtenido del flujo de entrevistas, precedido a su izquierda por un control de flecha que devuelva al listado de posiciones.

#### Scenario: Título visible

- **WHEN** la carga del flujo de entrevistas devuelve `positionName: "Senior Backend Engineer"`
- **THEN** la cabecera muestra el texto `Senior Backend Engineer`

#### Scenario: Retorno al listado

- **WHEN** el usuario activa el control de flecha situado a la izquierda del título
- **THEN** la aplicación navega a `/positions`

#### Scenario: Flecha accesible

- **WHEN** se renderiza la cabecera
- **THEN** el control de flecha expone un nombre accesible que indica el retorno al listado de posiciones

### Requirement: Carga del flujo de entrevistas

El sistema SHALL obtener las fases del proceso mediante `GET {API_BASE_URL}/position/:id/interviewflow`, SHALL desanidar la respuesta `{ interviewFlow: { positionName, interviewFlow: { interviewSteps } } }` y SHALL ordenar las fases resultantes por `orderIndex` ascendente. `API_BASE_URL` SHALL provenir de `process.env.REACT_APP_API_URL` con `http://localhost:3010` como valor por defecto.

#### Scenario: Normalización de la respuesta anidada

- **WHEN** el endpoint responde `{ "interviewFlow": { "positionName": "QA Lead", "interviewFlow": { "id": 2, "description": "d", "interviewSteps": [{ "id": 9, "name": "Offer", "orderIndex": 3 }] } } }`
- **THEN** el servicio devuelve `{ positionName: "QA Lead", steps: [{ id: 9, name: "Offer", orderIndex: 3 }] }`

#### Scenario: Fases ordenadas por orderIndex

- **WHEN** el endpoint devuelve fases con `orderIndex` `3`, `1` y `2` en ese orden
- **THEN** el servicio devuelve las fases ordenadas `1`, `2`, `3`

#### Scenario: URL del endpoint

- **WHEN** se solicita el flujo de la posición `5`
- **THEN** la petición se emite contra `http://localhost:3010/position/5/interviewflow`

### Requirement: Carga de candidatos de la posición

El sistema SHALL obtener los candidatos mediante `GET {API_BASE_URL}/position/:id/candidates` y SHALL conservar de cada elemento el `id` de candidato, el `applicationId`, el `fullName`, el `averageScore` y el `currentInterviewStep`.

#### Scenario: URL del endpoint

- **WHEN** se solicitan los candidatos de la posición `5`
- **THEN** la petición se emite contra `http://localhost:3010/position/5/candidates`

#### Scenario: Identificadores conservados

- **WHEN** el endpoint devuelve `[{ "id": 4, "applicationId": 7, "fullName": "Ana Ruiz", "currentInterviewStep": "Technical Interview", "averageScore": 4.5 }]`
- **THEN** el candidato resultante conserva `id: 4` y `applicationId: 7`

### Requirement: Columnas del tablero por fase del proceso

El tablero SHALL renderizar exactamente una columna por cada fase del flujo de entrevistas, en el orden de `orderIndex`, y cada columna SHALL mostrar el nombre de su fase.

#### Scenario: Una columna por fase

- **WHEN** el flujo de entrevistas contiene 4 fases
- **THEN** el tablero muestra 4 columnas

#### Scenario: Orden de las columnas

- **WHEN** el flujo contiene las fases `Initial Screening` (orderIndex 1), `Technical Interview` (2) y `Offer` (3)
- **THEN** las columnas aparecen en ese mismo orden de izquierda a derecha

#### Scenario: Columna sin candidatos

- **WHEN** una fase no tiene ningún candidato asignado
- **THEN** su columna se muestra igualmente, vacía y disponible como destino de arrastre

### Requirement: Tarjeta de candidato

Cada candidato SHALL representarse como una tarjeta ubicada en la columna correspondiente a su fase actual, y la tarjeta SHALL mostrar su nombre completo y su puntuación media.

#### Scenario: Contenido de la tarjeta

- **WHEN** un candidato tiene `fullName: "Ana Ruiz"` y `averageScore: 4.5`
- **THEN** su tarjeta muestra `Ana Ruiz` y la puntuación `4.5`

#### Scenario: Ubicación en la fase actual

- **WHEN** un candidato tiene `currentInterviewStep: "Technical Interview"` y el flujo contiene esa fase
- **THEN** su tarjeta se renderiza dentro de la columna `Technical Interview`

#### Scenario: Candidato sin puntuación

- **WHEN** un candidato tiene `averageScore: 0` porque aún no tiene entrevistas puntuadas
- **THEN** su tarjeta se renderiza mostrando la puntuación `0` en lugar de omitir el dato

### Requirement: Resolución de la fase de un candidato

El sistema SHALL agrupar los candidatos por identificador de fase resolviendo su `currentInterviewStep` (nombre) contra los nombres de las fases del flujo. Un candidato cuyo `currentInterviewStep` no coincida con ninguna fase SHALL ubicarse en la primera columna y NO SHALL ser omitido del tablero.

#### Scenario: Resolución por nombre

- **WHEN** el flujo contiene la fase `{ id: 9, name: "Offer" }` y un candidato tiene `currentInterviewStep: "Offer"`
- **THEN** el candidato queda agrupado bajo el identificador de fase `9`

#### Scenario: Fase desconocida

- **WHEN** un candidato tiene `currentInterviewStep: "Fase Inexistente"` y ninguna fase del flujo lleva ese nombre
- **THEN** el candidato se ubica en la primera columna del tablero y sigue siendo visible

### Requirement: Cambio de fase mediante arrastre

El usuario SHALL poder arrastrar la tarjeta de un candidato hasta otra columna para cambiar su fase. Al soltarla, el sistema SHALL emitir `PUT {API_BASE_URL}/candidates/:candidateId` con el cuerpo `{ applicationId, currentInterviewStep }`, donde `currentInterviewStep` es el identificador numérico de la fase de destino.

#### Scenario: Petición de actualización

- **WHEN** la tarjeta del candidato `4` con `applicationId` `7` se suelta sobre la columna de la fase con identificador `9`
- **THEN** se emite `PUT http://localhost:3010/candidates/4` con el cuerpo `{ "applicationId": 7, "currentInterviewStep": 9 }`

#### Scenario: Soltar fuera de una columna

- **WHEN** el usuario suelta la tarjeta fuera de cualquier columna válida
- **THEN** no se emite ninguna petición y la tarjeta permanece en su columna original

#### Scenario: Soltar en la misma columna

- **WHEN** el usuario suelta la tarjeta en la columna en la que ya se encontraba
- **THEN** no se emite ninguna petición

### Requirement: Actualización optimista con reversión ante error

Al soltar una tarjeta en otra columna, el sistema SHALL mover la tarjeta en la interfaz de inmediato, antes de conocer el resultado de la petición. Si la petición falla, el sistema SHALL devolver la tarjeta a su columna de origen y SHALL mostrar un mensaje de error descartable.

#### Scenario: Movimiento inmediato

- **WHEN** el usuario suelta la tarjeta sobre otra columna y la petición aún no ha respondido
- **THEN** la tarjeta ya aparece renderizada en la columna de destino

#### Scenario: Reversión ante fallo

- **WHEN** la petición de actualización de fase falla
- **THEN** la tarjeta vuelve a mostrarse en su columna de origen y se muestra un mensaje de error

#### Scenario: Descarte del mensaje de error

- **WHEN** el usuario descarta el mensaje de error mostrado tras un fallo
- **THEN** el mensaje desaparece y el tablero sigue siendo operable

### Requirement: Estados de carga y de error de la página

La página SHALL mostrar un indicador de carga mientras se obtienen el flujo de entrevistas y los candidatos, y SHALL mostrar un mensaje de error en lugar del tablero si alguna de las dos cargas falla.

#### Scenario: Indicador de carga

- **WHEN** las peticiones iniciales están en curso
- **THEN** la página muestra un indicador de carga y no muestra el tablero

#### Scenario: Fallo de carga inicial

- **WHEN** la petición del flujo de entrevistas o la de candidatos falla
- **THEN** la página muestra un mensaje de error en lugar del tablero

### Requirement: Presentación responsive del tablero

El tablero SHALL disponer las columnas en horizontal, con desplazamiento horizontal cuando no quepan, en anchuras de pantalla iguales o superiores al punto de corte `md` de Bootstrap, y SHALL apilarlas en vertical ocupando todo el ancho disponible por debajo de ese punto de corte.

#### Scenario: Disposición en escritorio

- **WHEN** el tablero se renderiza en una anchura igual o superior al punto de corte `md`
- **THEN** las columnas se disponen en fila y el contenedor permite desplazamiento horizontal

#### Scenario: Disposición en móvil

- **WHEN** el tablero se renderiza en una anchura inferior al punto de corte `md`
- **THEN** las columnas se apilan verticalmente y cada una ocupa el ancho completo del contenedor

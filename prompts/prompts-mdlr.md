# Especificación de la Solución y Prompts - Interfaz Kanban de Posición (`frontend-mdlr`)

Este documento define la especificación completa de la solución implementada para la interfaz de visualización y gestión de candidatos por posición en formato Kanban, desglosada por **ingeniería de prompts**, **matriz de tareas técnicas** y **escenarios de usuario**.

---

## 1. Resumen Ejecutivo y Alcance

La solución dota a la plataforma de reclutamiento LTI de un módulo visual interactivo tipo **Kanban Board** ubicado en la ruta `/positions/:id`. Permite a reclutadores y hiring managers supervisar el flujo de entrevistas de una posición específica, examinar a los candidatos en cada fase con su puntuación media y trasladarlos de etapa de manera intuitiva mediante Drag & Drop o menús de acción rápida accesibles.

---

## 2. Registro de Prompts e Ingeniería de Desarrollo

A continuación se detallan los prompts iterativos estructurados utilizados durante el desarrollo de la solución:

### Prompt 1: Análisis de Requerimientos y Modelado TypeScript
> *"Actúa como Senior Frontend Engineer. Analiza la especificación de los endpoints del backend (`GET /positions/:id/interviewFlow`, `GET /positions/:id/candidates`, `PUT /candidates/:id/stage`) y define las interfaces TypeScript para el modelo de datos de posición, fases de entrevista, candidatos y payloads de actualización en `frontend/src/types/position.ts`."*

### Prompt 2: Creación del Servicio de API con Resiliencia
> *"Crea `frontend/src/services/positionService.ts` implementando las funciones `getInterviewFlow`, `getCandidatesByPosition` y `updateCandidateStage`. El servicio debe manejar fallos de red o backend desconectado mediante datos mock coherentes para desarrollo y pruebas, además de tolerar variaciones de rutas como `/positions/:id/interviewFlow` y `/position/:id/interviewflow`."*

### Prompt 3: Componentes del Tablero Kanban (Separación de Responsabilidades)
> *"Diseña e implementa los componentes del tablero Kanban en `frontend/src/components/PositionKanban/`:*
> *- `PositionKanban.tsx`: Componente contenedor principal con cabecera, botón de regreso, buscador en tiempo real, resumen de candidatos y notificaciones toast.*
> *- `KanbanColumn.tsx`: Columna para cada fase con indicador de color, conteo de candidatos, zona de drop y estado vacío.*
> *- `CandidateCard.tsx`: Tarjeta de candidato arrastrable con avatar de iniciales, visualización destacada de puntuación media (con estrellas) y menú desplegable para mover de fase (accesibilidad para teclado y móvil).*
> *- `PositionKanban.css`: Estilos visuales modernos, animaciones suaves, efectos de arrastre (`is-dragging`, `is-drag-over`) y diseño responsivo para móviles con columnas verticales al 100% de ancho."*

### Prompt 4: Integración de Rutas y Navegación
> *"Actualiza `frontend/src/App.tsx` para registrar la ruta `/positions/:id` apuntando a `PositionKanban`. Modifica `frontend/src/components/Positions.tsx` para que el botón 'Ver proceso' de cada tarjeta navegue a `/positions/${position.id}` con filtros interactivos de búsqueda."*

### Prompt 5: Testing Automatizado y Calidad
> *"Escribe una suite de tests exhaustiva en `PositionKanban.test.tsx` utilizando React Testing Library y Jest. Verifica el renderizado de la cabecera, la distribución de candidatos en fases, la búsqueda en tiempo real, el flujo de Drag & Drop con llamada al endpoint PUT, y el manejo de errores con alertas visuales."*

---

## 3. Matriz de Tareas Técnicas Ejecutadas

| ID Tarea | Componente / Archivo | Descripción Técnica |
| :--- | :--- | :--- |
| **TASK-01** | `frontend/src/types/position.ts` | Modelado de tipos TypeScript para `InterviewStep`, `InterviewFlow`, `Candidate`, `PositionFlowResponse` y payloads de actualización. |
| **TASK-02** | `frontend/src/services/positionService.ts` | Servicio API asíncrono con tolerancia a fallos, soporte de endpoints plural/singular y mocks de respaldo para entorno offline. |
| **TASK-03** | `frontend/src/components/PositionKanban/CandidateCard.tsx` | Componente de tarjeta de candidato arrastrable (`draggable`), avatar con iniciales, rating visual con estrellas y menú accesible de cambio de fase. |
| **TASK-04** | `frontend/src/components/PositionKanban/KanbanColumn.tsx` | Componente de columna de fase con zona de drop (`onDragOver`, `onDrop`), realce visual al arrastrar, conteo de candidatos y estado vacío. |
| **TASK-05** | `frontend/src/components/PositionKanban/PositionKanban.tsx` | Componente principal contenedor: cabecera con botón de retorno, buscador en tiempo real, renderizado de columnas, optimistic updates y toasts. |
| **TASK-06** | `frontend/src/components/PositionKanban/PositionKanban.css` | Sistema de diseño moderno, variables CSS, efectos hover, animaciones suaves y media queries para layout vertical móvil (100% ancho). |
| **TASK-07** | `frontend/src/components/Positions.tsx` | Conexión del botón "Ver proceso" de cada tarjeta hacia `/positions/:id` y filtros interactivos de búsqueda. |
| **TASK-08** | `frontend/src/App.tsx` | Configuración unificada de enrutamiento con `react-router-dom` para `/positions/:id`. |
| **TASK-09** | `frontend/src/components/PositionKanban/PositionKanban.test.tsx` | Suite completa de tests automatizados unitarios y de integración con Jest y `@testing-library/react`. |

---

## 4. Especificación Detallada por Escenarios de Usuario

### Escenario 1: Visualización y Navegación de la Posición
- **Dado** que un reclutador se encuentra en el listado de posiciones (`/positions`),
- **Cuando** hace clic en el botón *"Ver proceso"* de una posición (ej. ID `1`),
- **Entonces**:
  1. La aplicación navega a `/positions/1`.
  2. La cabecera muestra el título de la posición (ej. *"Senior Backend Engineer"*).
  3. Se muestra una flecha de retorno (`ArrowLeft`) a la izquierda del título que permite regresar a `/positions`.
  4. Se muestra la descripción del flujo de entrevistas y un indicador con el total de candidatos activos.

---

### Escenario 2: Carga Dinámica de Columnas y Distribución de Candidatos
- **Dado** que se carga la página de la posición con un flujo de entrevistas con $N$ fases (obtenido de `GET /positions/:id/interviewFlow`),
- **Cuando** la API responde con la lista de fases y la lista de candidatos (`GET /positions/:id/candidates`),
- **Entonces**:
  1. Se renderizan tantas columnas como fases existan en `interviewSteps`, ordenadas según `orderIndex`.
  2. Cada columna tiene una cabecera con un indicador de color distintivo, el nombre de la fase y un badge con el número de candidatos en dicha etapa.
  3. Cada candidato se ubica automáticamente en la columna correspondiente a su `currentInterviewStep`.
  4. La tarjeta del candidato muestra:
     - Nombre completo (`fullName`).
     - Avatar circular con sus iniciales.
     - Puntuación media (`averageScore`) formateada con un decimal e icono de estrella dorada.
     - Identificador único del candidato.
  5. Si una fase no tiene candidatos, muestra un estado visual vacío amigable (*"Sin candidatos en esta fase"*).

---

### Escenario 3: Transición de Candidatos entre Fases vía Drag & Drop
- **Dado** que un reclutador desea avanzar o retroceder a un candidato en el proceso de selección,
- **Cuando** arrastra la tarjeta de un candidato desde su columna de origen y la suelta en una columna de destino diferente,
- **Entonces**:
  1. Durante el arrastre, la tarjeta activa la clase `.is-dragging` (opacidad y borde discontinuo) y la columna destino activa `.is-drag-over` (borde azul y fondo iluminado).
  2. Al soltar, se ejecuta una **actualización optimista (Optimistic UI Update)**: la tarjeta se traslada inmediatamente a la nueva columna y el contador de ambas columnas se actualiza en tiempo real.
  3. Se realiza una llamada HTTP al backend:
     - Método: `PUT`
     - Endpoint: `/candidates/:candidateId` (o `/candidates/:candidateId/stage`)
     - Payload:
       ```json
       {
         "applicationId": 101,
         "currentInterviewStep": 2
       }
       ```
  4. Se despliega una notificación Toast confirmando: *"Candidato [Nombre] movido a [Fase] con éxito"*.

---

### Escenario 4: Accesibilidad y Gestión Alternativa (Touch & Keyboard Friendly)
- **Dado** que un usuario interactúa desde un dispositivo táctil (donde el drag nativo puede ser incómodo) o usa navegación por teclado,
- **Cuando** abre el menú contextual de opciones (icono de tres puntos `...` en la tarjeta del candidato),
- **Entonces**:
  1. Se despliega una lista con todas las fases disponibles del proceso.
  2. La fase actual aparece deshabilitada con el badge *"Actual"*.
  3. Al seleccionar cualquier otra fase, se ejecuta la misma transición de etapa, actualización optimista y llamada a la API que en el escenario de Drag & Drop.

---

### Escenario 5: Búsqueda y Filtrado en Tiempo Real de Candidatos
- **Dado** que una posición tiene múltiples candidatos en diferentes fases,
- **Cuando** el usuario escribe en el campo de búsqueda de la cabecera (*"Buscar candidato..."*),
- **Entonces**:
  1. La interfaz filtra en tiempo real las tarjetas que coincidan parcialmente con el nombre ingresado (búsqueda sin distinción de mayúsculas/minúsculas).
  2. Los contadores de cada columna se actualizan reflejando los candidatos filtrados.
  3. Al borrar el texto de búsqueda, se restablecen todos los candidatos.

---

### Escenario 6: Adaptabilidad Responsiva en Dispositivos Móviles
- **Dado** que el usuario accede a la interfaz desde un smartphone o tablet con ancho de pantalla menor a `992px`,
- **Cuando** se visualiza el tablero Kanban,
- **Entonces**:
  1. Las columnas de las fases se reorganizan en una disposición vertical, ocupando el 100% del ancho de la pantalla (`w-100`).
  2. La cabecera y el buscador se adaptan al ancho disponible sin desbordamientos horizontales indeseados.
  3. Todas las acciones de Drag & Drop y el menú contextual táctil permanecen 100% operativos.

---

### Escenario 7: Manejo de Errores, Resiliencia y Rollback
- **Dado** que ocurre un fallo de red o el servidor responde con un código de error (ej. `400`, `500`),
- **Cuando** se intenta mover un candidato a otra fase,
- **Entonces**:
  1. El sistema detecta el fallo en la petición `PUT`.
  2. Se realiza un **Rollback automático**: la tarjeta del candidato regresa a su columna y etapa previa en la UI.
  3. Se muestra una notificación Toast de error: *"Error al mover a [Nombre]. Se ha revertido el cambio."*.
  4. Si la carga inicial de datos falla por completo, se muestra una alerta visual destacada informando del problema sin romper la aplicación.

---

## 5. Especificación de Endpoints API Integrados

### 1. `GET /positions/:id/interviewFlow`
Devuelve el nombre de la posición y los pasos del flujo de entrevistas.
```json
{
  "positionName": "Senior backend engineer",
  "interviewFlow": {
    "id": 1,
    "description": "Standard development interview process",
    "interviewSteps": [
      {
        "id": 1,
        "interviewFlowId": 1,
        "interviewTypeId": 1,
        "name": "Initial Screening",
        "orderIndex": 1
      },
      {
        "id": 2,
        "interviewFlowId": 1,
        "interviewTypeId": 2,
        "name": "Technical Interview",
        "orderIndex": 2
      },
      {
        "id": 3,
        "interviewFlowId": 1,
        "interviewTypeId": 3,
        "name": "Manager Interview",
        "orderIndex": 3
      }
    ]
  }
}
```

### 2. `GET /positions/:id/candidates`
Devuelve la lista de candidatos que aplican a la posición.
```json
[
  {
    "id": 1,
    "applicationId": 101,
    "fullName": "Jane Smith",
    "currentInterviewStep": "Technical Interview",
    "averageScore": 4.5
  },
  {
    "id": 2,
    "applicationId": 102,
    "fullName": "Carlos García",
    "currentInterviewStep": "Initial Screening",
    "averageScore": 3.8
  }
]
```

### 3. `PUT /candidates/:id` / `PUT /candidates/:id/stage`
Actualiza la fase del candidato en la base de datos.
- **Request Body**:
```json
{
  "applicationId": 101,
  "currentInterviewStep": 3
}
```
- **Response**:
```json
{
  "message": "Candidate stage updated successfully",
  "data": {
    "id": 1,
    "positionId": 1,
    "candidateId": 1,
    "currentInterviewStep": 3
  }
}
```

---

## 6. Verificación de Calidad

- **Tests Unitarios e Integración**: Ejecutados con `CI=true npm test` en la suite `PositionKanban.test.tsx` (100% de tests pasando).
- **Compilación de Producción**: Verificada con `npm run build` sin errores de compilación ni advertencias de tipos.
- **Rama de Entrega**: `frontend-mdlr`.

## Prompt 01  para inicializar CLAUDE.md
/init

## Prompt 02  

Tu rol es de un Senior Frontend Engineer especializado en React y TypeScript.
Tienes que crear la interfaz "position", una página en la que poder visualizar y gestionar los diferentes candidatos de una posición específica. Tienes un ejemplo en imagen @kanban.png
Limítate a modificar solamente el frontend.

Los requisitos a cumplir:

    - Mostrar el título de la posición en la parte superior izquierda
    - Añadir una flecha a la izquierda del título que permita volver al listado de posiciones
    - Mostrar una columnas por cada fase que haya en el proceso
    - La tarjeta de cada candidato debe situarse en la fase correspondiente, y debe mostrar su nombre completo y su puntuación media
    - Debe mostrarse adecuadamente en móvil (las fases en vertical ocupando todo el ancho)

Consideraciones adicionales:

    - Asume que la página de posiciones se encuentra en http://localhost:3000/positions
    - Asume que existe la estructura global de la página, la cual incluye los elementos comunes como menú superior y footer. Lo que estás creando es el contenido interno de la página.

Endpoints disponibles en el API del backend con ejemplos de respuesta:

- Información del proceso de contratación

  - Request:
    GET /positions/:id/interviewFlow

  - Response example:
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
                    "orderIndex": 2
                }
            ]
        }
    }

- Candidatos en proceso para una determinada posición

  - Request:
    GET /positions/:id/candidates

  - Response example:
    [
        {
            "fullName": "Jane Smith",
            "currentInterviewStep": "Technical Interview",
            "averageScore": 4
        },
        {
            "fullName": "Carlos García",
            "currentInterviewStep": "Initial Screening",
            "averageScore": 0            
        },        
        {
            "fullName": "John Doe",
            "currentInterviewStep": "Manager Interview",
            "averageScore": 5            
        }
    ]

- Modificar la fase actual del proceso de entrevista en la que se encuentra un candidato específico
  
  - Request:
    PUT /candidates/:id/stage

  - Request Payload:
    {
        "applicationId": "1",
        "currentInterviewStep": "3"
    }

  - Response example:
    {
      "message": "Candidate stage updated successfully",
      "data": {
        "id": 1,
        "positionId": 1,
        "candidateId": 1,
        "applicationDate": "2024-06-04T13:34:58.304Z",
        "currentInterviewStep": 3,
        "notes": null,
        "interviews": []    
      }
    }

### Nota

Durante la ejecución de este plan, Calude ha propuesto (y yo he aceptado) la implementación de Drag & Drop con esta opción:

- Drag-and-drop completo
    Añade lib DnD (@dnd-kit/core, no instalada), arrastrar tarjeta entre columnas dispara PUT /candidates/:id/stage. Más alcance, no pedido explícito.

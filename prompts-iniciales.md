# Rol y contexto
Actua como un experto en desarrollo frontend con React.

# Tarea: Creación de la interfaz Position
Vamos a añadir una nueva página "position" que se abrira al darle al botón "Ver proceso" en la pagina positions.
Esta nueva interfaz tiene que cumplir varios criterios:
  - Tiene que ser una interfaz tipo kanban
  - Tiene que mostrar a los candidatos como tarjetas en diferentes columnas que representan las fases del proceso de contratación
  - Tenemos que poder hacer drag and drop de los canditatos entre columnas para cambiar la fase en la que están.
  - El titulo de la posición se tiene que ver en el top de la pagina.
  - Tenemos que tener una flecha a la izquierda para poder volver al listado.
  - Hay que mostrar tantas columnas como fases.
  - La tarjeta de cada candidato debe aparecer en la fase a la que corresponde y mostrar su nombre completo y su puntuación media.
  - La puntuación media queremos que se represente con bolas verdes, una por punto.
  - Tiene que ser responsive y poder mostrarse bien en móvil. (las fases en vertical ocupando todo el ancho)
Asumimos que:
  - La página de posiciones esta ya desarrollada
  - Y que existe la estructura global de la página, la cual incluye los elementos comunes. Vamos a crear solo el contenido interno de la página nueva.


# API Endpoints
El backend ya tiene varios endpoints que vamos a usar para esta nueva interfaz:
GET /positions/:id/interviewFlow
Este endpoint devuelve información sobre el proceso de contratación para una determinada posición:
positionName: Título de la posición
interviewSteps: id y nombre de las diferentes fases de las que consta el proceso de contratación

GET /positions/:id/candidates
Este endpoint devuelve todos los candidatos en proceso para una determinada posición, es decir, todas las aplicaciones para un determinado
positionID. Proporciona la siguiente información:
name: Nombre completo del candidato
current_interview_step: en qué fase del proceso está el candidato.
score: La puntuación media del candidato

PUT /candidates/:id/stage
Este endpoint actualiza la etapa del candidato movido. Permite modificar la fase actual del proceso de entrevista en la que se encuentra un candidato específico, a través del parámetro "new_interview_step" y proporionando el interview_step_id correspondiente a la columna en la cual se encuentra ahora el candidato.

Puedes encontrar estos endpoints en backend\src\application\services\positionService.ts para tener referencia.

# Otros

- El backend no se tiene que modificar
- Hay que verificar la funcionalidad con tests.
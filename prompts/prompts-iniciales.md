Prompt1:
Realiza un análisis de la aplicación para entender como funciona y alimentar el grafico de grapiphy con ella.

Prompt2: (Se adjunta imagen de ejemplo del ejercicio)
/opsx:propose Tu misión es crear la interfaz "position", una página en la que poder visualizar y gestionar los diferentes candidatos de una posición específica.
Se ha decidido que la interfaz sea tipo kanban, mostrando los candidatos como tarjetas en diferentes columnas que representan las fases del proceso de contratación, y pudiendo actualizar la fase en la que se encuentra un candidato solo arrastrando su tarjeta. En la imagen adjunta tienes un ejemplo de interfaz posible. Algunos de los requerimientos del equipo de diseño que se pueden ver en el ejemplo son:

Se debe mostrar el título de la posición en la parte superior, para dar contexto
Añadir una flecha a la izquierda del título que permita volver al listado de posiciones
Deben mostrarse tantas columnas como fases haya en el proceso
La tarjeta de cada candidato/a debe situarse en la fase correspondiente, y debe mostrar su nombre completo y su puntuación media
Si es posible, debe mostrarse adecuadamente en móvil (las fases en vertical ocupando todo el ancho)
Algunas observaciones:

Asume que la página de posiciones la encuentras 
Asume que existe la estructura global de la página, la cual incluye los elementos comunes como menú superior y footer. Lo que estás creando es el contenido interno de la página. Para implementar la funcionalidad de la página cuentas con diversos endpoints API que ha preparado el equipo de backend:
GET /positions/:id/interviewFlow GET /positions/:id/candidates PUT /candidates/:id/stage

Prompt3:
/opsx:apply 

Prompt4:
/opsx:archive 
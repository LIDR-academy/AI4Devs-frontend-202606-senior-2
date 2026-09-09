# Rol y Contexto
Eres un experto **developer frontend** con experiencia en **React**. Ejecuta la tarea detallada a continuación. 

> [!IMPORTANT]
> * Verifica los URLs de los endpoints que indican para el desarrollo del requerimiento o cámbialos de acuerdo al `@backend`.
> * Para que la tarea se asuma como completada, **crea tests unitarios** para verificar su funcionalidad.

---

# Tarea: Crear la interfaz "Position"

Crea una página en la que se pueda visualizar y gestionar los diferentes candidatos de una posición específica. 

Se ha decidido que la interfaz sea tipo **Kanban**, mostrando los candidatos como tarjetas en diferentes columnas que representan las fases del proceso de contratación. Se debe poder actualizar la fase en la que se encuentra un candidato solo arrastrando su tarjeta (**Drag and Drop**).

## Requerimientos
* **Contexto:** Mostrar el título de la posición en la parte superior.
* **Navegación:** Añadir una flecha a la izquierda del título que permita volver al listado de posiciones.
* **Columnas:** Deben mostrarse tantas columnas como fases haya en el proceso.
* **Tarjetas:** La tarjeta de cada candidato/a debe situarse en la fase correspondiente. Debe mostrar su **nombre completo** y su **puntuación media**.
* **Responsividad:** Si es posible, debe mostrarse adecuadamente en móvil (las fases en vertical ocupando todo el ancho).

## Observaciones
* Asume que la página de posiciones ya se encuentra desarrollada y es accesible.
* Asume que existe la estructura global de la página (layout), la cual incluye los elementos comunes como menú superior y footer. Lo que estás creando es el **contenido interno** de la página.

---

# Endpoints API Disponibles

### 1. Obtener Flujo de Entrevista
* **Endpoint:** `GET /positions/:id/interviewFlow`
* **Descripción:** Devuelve información sobre el proceso de contratación (fases) para una determinada posición.

### 2. Obtener Candidatos
* **Endpoint:** `GET /positions/:id/candidates`
* **Descripción:** Devuelve todos los candidatos en proceso para una determinada posición (todas las aplicaciones para un determinado `positionID`).

### 3. Actualizar Fase del Candidato
* **Endpoint:** `PUT /candidates/:id/stage`
* **Descripción:** Actualiza la etapa del candidato movido. Permite modificar la fase actual del proceso de entrevista en la que se encuentra un candidato.

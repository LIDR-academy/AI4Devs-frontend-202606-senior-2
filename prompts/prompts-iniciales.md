##Prompt 1  para crear CLAUDE.md en base a lo existente
/init

##Prompt 2 Para dar contexto del proyecto y revisar la fuente de código coincida con la documentación
Actúa como un Senior Frontend Engineer especializado en React + TypeScript.
Contexto
Ya existe un proyecto funcional con backend operativo y base de datos PostgreSQL.
NO debes modificar ni crear funcionalidades de backend.
Tu trabajo está limitado exclusivamente al frontend existente.
Stack frontend obligatorio
* React 18.3.1
* React DOM 18.3.1
* TypeScript 4.9.5
* react-router-dom 6.23.1
* Bootstrap 5.3.3
* react-bootstrap 2.10.2
Backend / persistencia existente
* Backend ya implementado y funcionando.
* PostgreSQL como base de datos.
* Los endpoints requeridos ya existen.
* NO modificar backend, PostgreSQL, modelos, migraciones ni contratos API.
Testing
El proyecto utiliza Jest para pruebas.
Debes respetar la infraestructura de testing existente y reutilizar la configuración actual de Jest.

Antes de implementar
Primero inspecciona el proyecto existente y determina:
1. Estructura de carpetas.
2. Cómo están implementadas actualmente las rutas con react-router-dom.
3. Dónde está actualmente el botón "Ver proceso".
4. Cómo se realizan actualmente las llamadas HTTP al backend.
5. Si existe un servicio/API client reutilizable.
6. Cómo están definidos actualmente los tipos/interfaces TypeScript.
7. Cómo está configurado Jest.
8. Dónde están ubicados los tests.
9. Qué estrategia utiliza el proyecto para mockear llamadas HTTP/API.
10. Si existen tests de componentes, hooks, servicios o routing que puedan utilizarse como referencia.
11. Qué convenciones de naming y estructura utiliza el proyecto.
12. Cómo se representa actualmente la información que proviene del backend/PostgreSQL.
Importante
NO debes:
* modificar PostgreSQL
* crear migraciones
* modificar tablas
* crear endpoints
* modificar services backend
Al finalizar, presenta:
* Archivos relevantes encontrados.
* Arquitectura actual relevante para esta funcionalidad.
* Configuración de Jest encontrada.
* Tests existentes relacionados que puedan servir de referencia.
* Posibles riesgos o incompatibilidades.

##Prompt 3
Ahora implementa la funcionalidad descrita a continuación utilizando el análisis previo del proyecto.
Restricción principal
Trabaja EXCLUSIVAMENTE en frontend.
El backend y PostgreSQL ya existen y funcionan correctamente.
NO modifiques:
* Backend.
* PostgreSQL.
* Base de datos.
* Migraciones.
* Controllers.
* Backend services.
* API contracts.
* Configuración del servidor.
* Versiones de dependencias.
Utiliza únicamente las tecnologías ya existentes:
* React 18.3.1
* React DOM 18.3.1
* TypeScript 4.9.5
* react-router-dom 6.23.1
* Bootstrap 5.3.3
* react-bootstrap 2.10.2
* Jest para testing
No agregues dependencias nuevas salvo que sea estrictamente necesario.
No agregues una librería de drag & drop si puedes implementar el comportamiento utilizando las capacidades nativas del navegador y React.

1. Navegación desde posiciones
Modificar el botón existente:
"Ver proceso"
para que navegue a:
/position/1
El 1 representa temporalmente el :id de la posición.
La implementación debe estar preparada para que posteriormente el ID real provenga de la posición seleccionada.
La vista debe obtener el :id utilizando useParams() de react-router-dom.
Tests requeridos
Crear pruebas Jest que verifiquen:
* El botón "Ver proceso" existe.
* Al hacer clic, navega a /position/1.
* La ruta /position/:id renderiza correctamente la vista Position.
Utiliza las herramientas de testing ya presentes en el proyecto.

2. Nueva vista Position
Crear la página/componente correspondiente a:
/position/:id
Esta página representa el proceso de contratación de una posición específica.
La aplicación ya dispone de una estructura global que contiene elementos como:
* menú superior
* footer
NO recrees estos elementos.
La nueva vista debe implementar únicamente el contenido interno.

3. Obtener las fases del proceso
Para determinar las columnas del Kanban utilizar:
GET
/position/:id/interviewflow
Para esta primera implementación:
id = 1
La respuesta del endpoint debe utilizarse como fuente de verdad para determinar:
* número de columnas
* nombre de cada columna
* orden de las columnas
* identificador de cada fase
NO hardcodees las fases si la información puede obtenerse del endpoint.
Tests requeridos
Mockear la llamada HTTP y verificar:
* El endpoint se llama con el ID correcto.
* Las fases recibidas se renderizan.
* Se genera una columna por cada fase.
* Se respeta el orden recibido por el backend.
* El componente funciona con diferente cantidad de fases.
* Una fase sin candidatos sigue renderizándose.

4. Obtener candidatos
Obtener los candidatos mediante:
GET
/positions/:id/candidates
Utilizar:
id = 1
Cada candidato debe aparecer en la columna correspondiente a su fase actual.
No asumas una cantidad fija de candidatos.
Tests requeridos
Mockear la respuesta del endpoint y verificar:
* El endpoint se llama con /positions/1/candidates.
* Los candidatos se renderizan.
* Cada candidato aparece en la fase/stage correspondiente.
* Múltiples candidatos pueden aparecer en una misma fase.
* Un candidato con datos incompletos manejables por el contrato no rompe la interfaz.

5. Kanban
Construir una interfaz Kanban donde:
* cada fase sea una columna
* cada candidato sea una tarjeta
* las tarjetas se ubiquen inicialmente en función de su stage/fase actual
* las columnas se muestren en el orden recibido por el backend
La estructura conceptual debe ser:
Position title
← Back
┌────────────┬────────────┬────────────┬────────────┐│ Phase 1 │ Phase 2 │ Phase 3 │ Phase 4 ││ │ │ │ ││ Candidate │ Candidate │ Candidate │ Candidate ││ Candidate │ Candidate │ │ Candidate │└────────────┴────────────┴────────────┴────────────┘
Tests requeridos
Crear pruebas que verifiquen:
* Render de todas las columnas.
* Render de todas las tarjetas.
* Correcta asociación candidato → fase.
* Columnas sin candidatos.
* Diferentes cantidades de fases.
* Diferentes cantidades de candidatos.

6. Título de la posición
En la parte superior debe aparecer el título/nombre de la posición.
A la izquierda debe existir una flecha de navegación hacia atrás.
Al hacer clic en la flecha debe regresar al listado de posiciones existente.
Preferentemente utiliza la navegación de react-router-dom.
Si el endpoint de candidatos ya devuelve información de la posición, reutilízala.
NO hagas una llamada adicional innecesaria para obtener el título si ya está disponible.
Tests requeridos
Verificar:
* El título se muestra correctamente.
* La flecha de back se renderiza.
* Al hacer clic se navega al listado de posiciones.

7. Tarjeta del candidato
Cada tarjeta debe mostrar como mínimo:
* nombre completo
* puntuación media
La puntuación debe representarse visualmente mediante 5 puntos/bullets.
Reglas:
averageScore = 0
→ los 5 puntos deben aparecer en gris.
Si averageScore > 0:
→ los puntos correspondientes a la puntuación deben aparecer en verde.
Ejemplo:
averageScore = 0
● ● ● ● ●
averageScore = 3
● ● ● ○ ○
averageScore = 4.5
● ● ● ● ◐
Si el backend utiliza una escala diferente, inspecciona los datos reales y adapta la representación de forma coherente.
No inventes datos.
Tests requeridos
Crear pruebas unitarias para la lógica de representación del score:
* score 0 → 5 puntos grises.
* score 1 → 1 punto verde.
* score 3 → 3 puntos verdes.
* score 5 → 5 puntos verdes.
* score decimal → representación coherente según la escala real.
La lógica del score debe ser testeable de forma independiente si resulta razonable extraerla a una función/utilidad.

8. Drag & Drop
Los candidatos deben poder arrastrarse entre columnas.
Cuando un candidato sea soltado en otra fase:
1. Detectar la nueva fase.
2. Actualizar inmediatamente la UI.
3. Ejecutar:
PUT
/candidates/:id/stage
donde :id corresponde al ID real del candidato.
El payload debe ajustarse al contrato existente del backend.
Antes de implementarlo, inspecciona cómo están definidos los servicios/API actuales y reutiliza ese patrón.
NO inventes el payload.
Tests funcionales requeridos
Crear pruebas que verifiquen el comportamiento completo:
Caso exitoso
Simular:
1. Candidato inicialmente en Phase A.
2. Drag & Drop hacia Phase B.
3. La tarjeta aparece en Phase B.
4. Se ejecuta PUT /candidates/:id/stage.
5. Se envía el payload correcto.
6. La nueva fase permanece después de finalizar el request.
Misma fase
Verificar que:
* Si el candidato se suelta en su misma fase.
* No se realiza ningún PUT innecesario.
Error
Simular que el PUT falla.
Verificar que:
1. El candidato inicialmente se mueve visualmente.
2. El PUT falla.
3. El candidato vuelve a su fase original.
4. Se muestra el mensaje de error correspondiente.

9. Manejo del PUT
El cambio de stage debe tener comportamiento optimista:
1. Mover visualmente la tarjeta.
2. Ejecutar el PUT.
3. Si el PUT funciona, mantener el nuevo estado.
4. Si el PUT falla:
    * revertir el candidato a su columna anterior
    * mostrar un mensaje de error utilizando el mecanismo existente del proyecto.
Evitar duplicar requests.
No realizar el PUT si el candidato se suelta nuevamente en la misma columna.
Los tests deben cubrir tanto el flujo exitoso como el rollback.

10. Estados de UI
Implementar correctamente:
* Loading mientras se obtienen las fases/candidatos.
* Error si falla alguna llamada.
* Empty state si no existen candidatos.
* Columnas vacías cuando una fase no tiene candidatos.
* Estado visual durante el drag & drop.
* Feedback cuando falla la actualización de stage.
Tests requeridos
Crear pruebas Jest para:
Loading
Verificar que el estado de loading aparece mientras las llamadas están pendientes.
Error
Simular error en la carga de datos y verificar el mensaje correspondiente.
Empty
Simular una respuesta sin candidatos y verificar el empty state.
Empty column
Simular fases donde alguna no tenga candidatos y verificar que la columna se muestra correctamente.
PUT error
Verificar rollback y mensaje de error.

11. Diseño responsive
Desktop:
Las fases deben aparecer como columnas horizontales.
Mobile:
Las fases deben aparecer verticalmente.
Cada fase debe ocupar aproximadamente todo el ancho disponible.
No debe producirse overflow horizontal innecesario en móviles.
Utiliza Bootstrap 5 / React-Bootstrap y CSS existente cuando sea apropiado.
Tests
No es necesario intentar validar visualmente el responsive únicamente mediante Jest.
Sin embargo:
* Las clases CSS deben permitir explícitamente el comportamiento responsive.
* Si el proyecto utiliza alguna estrategia existente para testing de estilos, reutilízala.
* No agregues herramientas visuales nuevas únicamente para esta funcionalidad.

12. TypeScript
Crear interfaces/types apropiados para:
* Position
* InterviewFlow / Stage
* Candidate
Utiliza tipos explícitos.
Evita:
any
salvo que sea absolutamente necesario y esté justificado.
Tests / calidad
El código debe compilar correctamente con la versión actual de TypeScript.
No modifiques la configuración TypeScript global salvo que sea estrictamente necesario.

13. Arquitectura y separación de responsabilidades
Mantén separadas, cuando sea apropiado:
* componentes de presentación
* lógica del Kanban
* API/services
* tipos/interfaces
* utilidades de score
* lógica de drag & drop
No sobrearquitectures la solución.
El objetivo es que la funcionalidad sea sencilla de mantener y posteriormente pueda evolucionar para utilizar IDs reales.

14. Testing — requisito obligatorio
IMPORTANTE:
Actualmente no existen pruebas unitarias ni pruebas funcionales para esta nueva funcionalidad. Debes crearlas como parte de esta implementación.
No asumas que ya existen.
Debes crear los tests necesarios utilizando Jest y la infraestructura existente del proyecto.
La implementación NO se considera terminada si únicamente funciona manualmente.
Debe existir cobertura de comportamiento para:
* navegación
* routing
* carga de fases
* carga de candidatos
* render del Kanban
* render de tarjetas
* score
* loading
* error
* empty state
* drag & drop
* PUT de stage
* rollback del PUT
* no PUT cuando no cambia la fase
Prioriza tests de comportamiento sobre tests que simplemente comprueben detalles internos de implementación.
Evita tests excesivamente acoplados a:
* nombres internos de variables
* estructura interna de componentes
* implementación específica de hooks
Los tests deberían validar lo que un usuario puede observar y las interacciones importantes con la API.

15. Reutilización
Antes de crear:
* botones
* alerts
* spinners
* cards
* headers
* API services
* test utilities
revisa si ya existen componentes/utilidades reutilizables.
Respeta las convenciones existentes.

16. Validación durante la implementación
Después de implementar cada parte importante, ejecuta los tests Jest relacionados.
Al finalizar ejecuta la suite completa disponible.
Si existen errores:
1. Identifica si el problema está en la implementación.
2. Corrígelo.
3. Ejecuta nuevamente los tests.
No des por terminada la implementación con tests fallando.

17. Criterios de aceptación
La funcionalidad se considera terminada únicamente cuando:
* /position/:id funciona.
* /position/1 funciona.
* "Ver proceso" navega correctamente.
* Las fases provienen del backend.
* Los candidatos provienen del backend.
* Cada candidato aparece en su fase correcta.
* El score se representa correctamente.
* El drag & drop funciona.
* El PUT se ejecuta al cambiar de fase.
* El PUT no se ejecuta si no cambia la fase.
* Existe rollback ante error.
* Loading/error/empty states funcionan.
* Responsive funciona.
* Los tests unitarios están implementados.
* Los tests funcionales están implementados.
* Jest pasa correctamente.
* TypeScript compila.
* No se rompe ninguna funcionalidad existente.
Implementa ahora la funcionalidad completa incluyendo obligatoriamente las pruebas unitarias y funcionales.

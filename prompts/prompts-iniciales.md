# Prompts iniciales — Interfaz "Position" (Kanban)

**Alumno:** Antonio Orozco
**Herramienta:** Claude Code (Opus 5)
**Fecha:** 2026-09-09

---

## 1. Prompt inicial (enunciado del ejercicio)

> Lee y entiende el ejercicio y realízalo a la perfección.
>
> Tu misión en este ejercicio es crear la interfaz "position", una página en la que poder
> visualizar y gestionar los diferentes candidatos de una posición específica.
>
> Se ha decidido que la interfaz sea tipo kanban, mostrando los candidatos como tarjetas en
> diferentes columnas que representan las fases del proceso de contratación, y pudiendo
> actualizar la fase en la que se encuentra un candidato solo arrastrando su tarjeta.
>
> Requerimientos del equipo de diseño:
> - Mostrar el título de la posición en la parte superior, para dar contexto.
> - Añadir una flecha a la izquierda del título que permita volver al listado de posiciones.
> - Deben mostrarse tantas columnas como fases haya en el proceso.
> - La tarjeta de cada candidato/a debe situarse en la fase correspondiente, y debe mostrar
>   su nombre completo y su puntuación media.
> - Si es posible, debe mostrarse adecuadamente en móvil (las fases en vertical ocupando
>   todo el ancho).
>
> Observaciones:
> - Asume que la página de posiciones ya la encuentras.
> - Asume que existe la estructura global de la página (menú superior y footer). Lo que estás
>   creando es el contenido interno de la página.
>
> Endpoints disponibles: `GET /positions/:id/interviewFlow`,
> `GET /positions/:id/candidates`, `PUT /candidates/:id/stage`.
>
> Entrega: cambios en `/frontend`, un fichero `prompts/prompts-iniciales.md`, rama
> `frontend-iniciales`, commit, push y pull request.

---

## 2. Prompt de exploración

> Antes de escribir nada, explora el repositorio: estructura de `frontend/` y `backend/`,
> punto de entrada de React, componentes existentes, rutas de Express, controladores y
> servicios de `position` y `candidate`, el `schema.prisma` y el `seed.ts`.
> Necesito saber la forma **real** de las respuestas de la API antes de tipar nada.

**Hallazgos que cambiaron la implementación** (la API real diverge del enunciado):

| Enunciado | API real (`backend/src`) |
|---|---|
| `GET /positions/:id/interviewFlow` | `GET /position/:id/interviewflow` — router montado en `/position` (singular), path en minúsculas |
| Respuesta `{ positionName, interviewFlow }` | Doble anidado: el controller hace `res.json({ interviewFlow })` sobre un servicio que ya devuelve `{ positionName, interviewFlow }` → se lee `data.interviewFlow.interviewFlow.interviewSteps` |
| `GET /positions/:id/candidates` | `GET /position/:id/candidates` — además devuelve `id` (candidato) y `applicationId`, no documentados |
| `PUT /candidates/:id/stage` | `PUT /candidates/:id` — sin sufijo `/stage`; `:id` es el **candidateId** y el `applicationId` va en el body |

**La asimetría clave:** `GET /candidates` devuelve `currentInterviewStep` como el **nombre**
de la fase (`app.interviewStep.name`), pero `PUT /candidates/:id` espera el **id** numérico
del step. Por tanto: se agrupa por nombre, se envía el id, y tras el PUT se escribe de vuelta
el **nombre** en el estado local (si se guardara el id, la tarjeta desaparecería de todas las
columnas).

Decisión: implementar contra la API **real** y no tocar el backend, ya que el entregable es
la carpeta `/frontend`.

---

## 3. Prompt de diseño / implementación

> Implementa la página como componente interno (sin menú ni footer, ya existen).
> Criterios:
> - **Sin dependencias nuevas.** `axios` no está instalado en `frontend` → usa `fetch` nativo.
>   Para el drag & drop usa la HTML5 Drag and Drop API nativa en vez de `react-beautiful-dnd`.
> - Reutiliza `react-bootstrap` y `react-bootstrap-icons`, que ya son dependencias.
> - `tsconfig` está en `strict: true`: tipa los handlers explícitamente
>   (`React.DragEvent<HTMLDivElement>`), sin `any` implícitos.
> - Actualización **optimista** con rollback y mensaje de error si el PUT falla.
> - Estados de carga y error, para que un fetch fallido no deje la página en blanco.
> - Responsive: `<Col xs={12} md>` → columnas en móvil apiladas a ancho completo.

**Detalles de la Drag and Drop API nativa que había que acertar:**
- `onDragOver` **debe** llamar a `e.preventDefault()` en la columna, o `onDrop` nunca dispara.
- `draggable` en la tarjeta + `e.dataTransfer.setData('text/plain', ...)`: Safari y Firefox
  no inician el arrastre sin payload.
- Soltar en la misma columna → no-op, sin llamada a la API.

---

## 4. Prompt de accesibilidad y móvil

> El requisito de móvil del enunciado es de **layout** (fases en vertical a ancho completo),
> no de arrastre táctil. Aun así, el drag & drop nativo no funciona con touch ni con teclado:
> añade un `<select>` por tarjeta con las fases, como alternativa accesible y táctil.
> Que no crezca más allá de eso.

---

## 5. Prompt de verificación

> No declares el ejercicio terminado sin verificarlo:
> 1. `npx tsc --noEmit` en `frontend` debe pasar limpio.
> 2. Levanta postgres con `docker compose up -d`, aplica migraciones y el seed, arranca el
>    backend y comprueba con `curl` la forma real de las tres respuestas.
> 3. Prueba el round-trip completo nombre→id→nombre con un `PUT` real y confirma que el
>    `GET` posterior refleja el cambio. Es el bug que una revisión visual no detecta.
> 4. Abre la página en un navegador real y comprueba el tablero de punta a punta.

Verificado en **Firefox Developer Edition 156** conduciéndolo por **WebDriver BiDi**
(el MCP de chrome-devtools es solo para Chrome/CDP; Firefox abandonó CDP en favor de BiDi).
Cliente BiDi propio de ~40 líneas sobre el `WebSocket` global de node 22, sin dependencias:

| Comprobación | Resultado |
|---|---|
| Título, flecha con `aria-label` y `href="/positions"` | correcto |
| 3 columnas = 3 fases; cada tarjeta en su columna con nombre y nota | correcto |
| Móvil 390px: 3 columnas apiladas a ancho completo, sin scroll horizontal | correcto |
| Drag & drop: `dragover.defaultPrevented=true`, payload `applicationId` | correcto |
| Tras soltar: UI y backend coinciden (`GET` confirma la fase nueva) | correcto |
| `<select>` accesible: mismo camino que el arrastre | correcto |
| Soltar en la misma columna | 0 peticiones |
| PUT fallido: mueve optimista → revierte → muestra el error | correcto |
| Navegación listado ⇄ detalle sin recarga | correcto |
| Posición inexistente (404) | mensaje de error, no página en blanco |

**Hallazgo durante la verificación:** la posición 2 del seed tiene un flujo con
`interviewSteps: []` pero una aplicación activa. Sin fases no hay columnas, y el candidato
desaparecía sin rastro. Añadidos dos avisos (proceso sin fases, y candidatos cuya fase no
pertenece al flujo) para que ningún dato quede invisible.

---

## 6. Archivos entregados

| Archivo | Cambio |
|---|---|
| `frontend/src/components/PositionDetail.tsx` | **Nuevo.** Tablero kanban: cabecera con flecha de vuelta y título, una columna por fase, tarjetas arrastrables con nombre y puntuación media, select accesible, estados de carga/error y avisos de datos fuera del proceso. |
| `frontend/src/services/positionService.ts` | **Nuevo.** Capa de API con `fetch` nativo, tipos, desanidado de `interviewFlow` y ordenación de fases por `orderIndex`. |
| `frontend/src/App.js` | Ruta `/positions/:id`. |
| `frontend/src/components/Positions.tsx` | `id` en los mocks (alineados con el seed) y "Ver proceso" enlazando al detalle. |

## 7. Simplificaciones deliberadas

- **Sin `react-beautiful-dnd`/`dnd-kit`:** la API nativa cubre el caso en ~10 líneas.
  Se añadiría si hiciera falta reordenar dentro de la columna o animaciones de arrastre.
- **Sin `axios`:** `fetch` nativo, cero dependencias nuevas.
- **Sin gestor de estado ni React Query:** dos llamadas y un `useState`.
- **Sin tests:** el script `test` de `frontend` apunta a un `jest.config.js` inexistente;
  montar la infraestructura queda fuera del alcance. La verificación se hizo end-to-end
  contra el backend real y en un navegador real (sección 5).

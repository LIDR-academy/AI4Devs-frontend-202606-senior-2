# Prompts adicionales — Vista Position (Kanban)

Ejercicio AI4Devs Frontend. Stack real: Create React App, React 18, TypeScript, React Bootstrap, react-router-dom v6.

Cada bloque es un prompt independiente. Pegar uno por turno. No ejecutar el siguiente hasta que el anterior esté aplicado.

---

## Prompt 3 — Refactor visual de la página Position (alineado al mockup)

Refactoriza **solo la interfaz** de `/positions/:id` para que se parezca al mockup adjunto (Kanban de reclutamiento). No cambies contratos de API, rutas, ni la lógica de mover candidatos.

Fuente de verdad visual: la imagen del mockup (título de posición + columnas grises + tarjetas blancas + puntuación en círculos verdes).

### Estado actual (qué hay que dejar de parecer Bootstrap “por defecto”)

Hoy la página es funcional pero no coincide con el mockup:

- `PositionHeader.tsx`: botón outline “Volver” + título. En el mockup el título va arriba a la izquierda, grande y en negrita; la flecha de volver es un icono a su izquierda, no un `btn btn-outline-secondary` con texto.
- `KanbanColumn.tsx`: `Card` + `Card.Header` de Bootstrap. En el mockup cada fase es un **contenedor gris claro de esquinas redondeadas**, sin chrome de card (sin borde/header Bootstrap). Título de fase en negrita, arriba.
- `CandidateCard.tsx`: muestra “Puntuación media: 3” y un `<select>` visible. En el mockup la tarjeta es **blanca, redondeada, con sombra suave**; nombre en negrita; debajo **una fila de círculos verdes** (rating), sin label numérico ni select a la vista.
- Fondo de página: el mockup usa un gris neutro un poco más oscuro que las columnas. Las columnas son más claras; las tarjetas, blancas.

### Look & feel objetivo (píxel-sentido, no pixel-perfect)

1. **Cabecera**
   - Flecha a la izquierda (icono, `ArrowLeft` ya está en el proyecto) + título de la posición (`positionName`).
   - El enlace “volver” sigue yendo a `/positions`. Accesible: el control debe tener nombre accesible (“Volver al listado de posiciones”), aunque visualmente sea solo la flecha.
   - Tipografía del título: grande, negrita, sans-serif. Sin botón con relleno/borde de Bootstrap.

2. **Tablero**
   - Columnas en fila en desktop, apiladas a todo el ancho en móvil (el CSS de `KanbanBoard.css` ya hace esto; ajústalo al nuevo look, no lo tires).
   - Cada columna: fondo gris claro, `border-radius` generoso, padding interno, título de fase en negrita. Sin `Card.Header`.
   - Si hay más columnas de las que caben: scroll horizontal en desktop.

3. **Tarjeta de candidato**
   - Fondo blanco, esquinas redondeadas, sombra suave, padding holgado.
   - Primera línea: `fullName` en negrita.
   - Segunda línea: puntuación media como **rating de círculos verdes** (como en el mockup: John Doe 3, Alice Johnson 4, etc.).
   - Escala visual: **5 círculos**. Rellena `Math.round(averageScore)` (clamp 0–5). Círculos vacíos en gris claro para el resto, para que todas las tarjetas ocupen el mismo ancho de rating.
   - No pongas el texto “Puntuación media:”. El número debe seguir existiendo para lectores de pantalla (`aria-label` tipo “Puntuación media: 3 de 5”).
   - El `<select>` de cambio de fase **no puede desaparecer** (teclado / touch / WCAG): muévelo a un control discreto (p. ej. `visually-hidden` + sigue funcionando, o un control compacto que no rompa el look de la tarjeta). Drag and drop HTML5 se queda.

4. **Vacío / loading / error**
   - Mantén los tres estados. El vacío por columna puede ser más sutil (texto muted, sin card extra). No rediseñes alerts/spinner; sí que no rompan el nuevo layout.

### Archivos a tocar (y no más)

Toca solo lo de la vista Position:

- `frontend/src/components/PositionPage.tsx`
- `frontend/src/components/PositionHeader.tsx`
- `frontend/src/components/KanbanBoard.tsx`
- `frontend/src/components/KanbanColumn.tsx`
- `frontend/src/components/CandidateCard.tsx`
- `frontend/src/components/KanbanBoard.css` (o CSS colindante de estos componentes)

Si el rating de círculos ensucia `CandidateCard.tsx`, extrae un componente pequeño (`ScoreDots.tsx` o similar) en el mismo directorio.

### Qué no tocar

- Backend entero.
- `App.js` / `App.tsx`, rutas, `Positions.tsx`, servicios, tipos, `usePositionKanban.ts`.
- Contratos GET/PUT. No cambies el mapeo candidato → columna ni el body del PUT.
- No añadas dependencias (`@dnd-kit`, Tailwind, MUI, shadcn, librerías de rating).
- No rediseñes header/footer/menú global de la app.
- No inventes un design system ni tokens de color en un archivo aparte: CSS de componente + utilidades Bootstrap que ya uses (`d-flex`, `mb-0`, etc.).
- Cero animaciones decorativas. Cero `any`. TypeScript estricto.

### Restricciones de implementación

- Sigue con React Bootstrap donde ayude (layout, `Alert`, `Spinner`, `Container` si encaja). Si `Card` pelea con el mockup, sustitúyelo por `div`/`section` + CSS; no fuerces `Card` para que “se parezca”.
- Colores: neutros (grises) + verde vivo para los círculos rellenos. Sin degradados innecesarios; el mockup se ve “glossy” — un círculo sólido verde basta (KISS).
- Mobile first: columnas 100% ancho; en `md+` fila horizontal.
- WCAG 2.2 AA: semántica (`h1` título, `h2` fase, `article`/`section` tarjeta), contraste de los círculos y del texto sobre gris, focus visible en flecha y en el control de fase.

Muestra el diff mental (archivos) en 5 líneas y luego aplica. Al terminar, describe en 3 viñetas qué cambió visualmente respecto a antes.

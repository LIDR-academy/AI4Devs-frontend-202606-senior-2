# LTI Frontend Workshop

Plugin del repositorio para OpenSpec, Atomic Design, Storybook y Chromatic. Contiene 14 skills; no inicia servidores ni publica builds automáticamente.

Las skills también están en `.agents/skills` para trabajar directamente en el repo. El plugin empaqueta una copia portátil. Antes de aplicar una recomendación genérica, leer `openspec/config.yaml` y `docs/sesion/prompts.md`: React 18, Bootstrap, Jest y Storybook 7.6, sin migraciones de framework. Backend preparado; búsqueda en frontend.

## Procedencia

- Seis skills OpenSpec generadas por CLI 1.12.0, licencia MIT adjunta. En el plugin, `compatibility` se mueve a metadata para compatibilidad del validador Codex.
- atomic-design-atoms, atomic-design-integration y storybook-component-documentation: thebushidocollective/han, commit 19caa51d5fd144ef6b2764f2332f4c856aa5d1af. Licencia original FSL-1.1-ALv2 adjunta. Se elimina `user-invocable: false` para permitir invocación explícita en Codex; el contenido se conserva.
- lti-atomic-design: skill propia del laboratorio.
- storybook y las tres skills Chromatic: materiales ya instalados en el repositorio, conservados con sus referencias.

Consultar `docs/sesion/skills-y-comandos.md` desde la raíz del repositorio para instalación y comandos. Las skills dan instrucciones a la IA; los comandos npm ejecutan herramientas. No hay un CLI independiente de Atomic Design.

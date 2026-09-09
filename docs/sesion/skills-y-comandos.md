# Skills y comandos disponibles

## Terminal: desde la raíz del repositorio

```sh
npm ci
npm run openspec -- list
npm run spec:status
npm run spec:validate
npm run openspec -- new change nombre-del-cambio
npm run openspec -- instructions proposal --change nombre-del-cambio
npm run openspec -- instructions apply --change nombre-del-cambio
npm run storybook
npm run storybook:build
npm run test:session
npm run test:stories
npm run test:app
```

Los comandos frontend requieren sus dependencias instaladas con `npm ci --prefix frontend`. Para la aplicación completa: `npm run backend:setup`, `npm run backend:start` y, en otra terminal, `npm run frontend:start`. Backend requiere `npm ci --prefix backend`.

Para que los ejemplos oficiales de skills que ejecutan `openspec` directamente funcionen en tu terminal, desde la raíz:

```sh
export PATH="$PWD/node_modules/.bin:$PATH"
openspec status --change kanban-seguro
```

`npm run openspec -- ...` es la alternativa que no modifica PATH. No archivar un cambio con aceptación pendiente.

## Pedir trabajo a la IA

Las skills locales están en `.agents/skills`. En Codex, seleccionarlas con `$` o pedir explícitamente leer el SKILL.md; si no aparecen en el selector, abrir una nueva tarea en este repositorio. No son comandos de terminal.

- `$openspec-propose`: propuesta y artefactos de un cambio.
- `$openspec-explore`: explorar decisiones.
- `$openspec-apply-change`: implementar tareas acordadas.
- `$openspec-update-change`: revisar artefactos ante cambios de alcance.
- `$openspec-sync-specs`: sincronizar lo aceptado.
- `$openspec-archive-change`: archivar cuando corresponda.
- `$lti-atomic-design`: responsabilidades y contratos propios de LTI.
- `$atomic-design-integration` y `$atomic-design-atoms`: referencias generales de composición.
- `$storybook` y `$storybook-component-documentation`: stories y documentación.
- `$chromatic-setup-ci`, `$chromatic-viewports`, `$chromatic-troubleshoot-diff`: publicación/configuración y diagnóstico; revisar compatibilidad antes de aplicar ejemplos.

Ejemplo: «Lee .agents/skills/lti-atomic-design/SKILL.md y .agents/skills/atomic-design-integration/SKILL.md. Propón las responsabilidades y props de CandidateSearch según openspec/config.yaml; no implementes todavía».

## Plugin

El plugin `lti-frontend-workshop` está en `plugins/lti-frontend-workshop`, con manifiesto Codex y 15 skills. El catálogo local está en `.agents/plugins/marketplace.json`.

Para instalar en otra máquina con Codex CLI compatible, desde este repo:

```sh
codex plugin marketplace add .
codex plugin add lti-frontend-workshop@personal
```

El nombre del catálogo de este repo es `personal`. Si ese nombre ya está registrado con otro origen, resolver el conflicto antes de instalar; no reemplazar otro catálogo. En este Mac se utiliza el CLI incluido en `/Applications/ChatGPT.app/Contents/Resources/codex` porque el comando global de Homebrew está incompleto.

Después de instalar el plugin, abrir una nueva tarea para cargar sus skills. Las copias del repositorio siguen disponibles sin el plugin. Los prompts públicos están en docs/sesion/prompts.md; el guion docente no forma parte del plugin.

## Ejecutar el flujo completo

Invoca `$frontend-sdd-workflow` con el diseño, característica y base. Ejemplo: «Usa $frontend-sdd-workflow para implementar esta característica desde Figma hasta PR, con checkpoints por etapa». También admite «solo propuesta», «hasta TDD rojo» y «continúa desde Storybook».

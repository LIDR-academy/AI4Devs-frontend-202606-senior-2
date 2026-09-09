# OpenSpec del laboratorio

OpenSpec 1.12.0 está fijado en package.json y package-lock.json de la raíz. Instalar allí con `npm ci` (independiente de frontend y backend). Node debe cumplir el requisito de la herramienta: >=20.19.0.

Desde la raíz:

```sh
npm run openspec -- list
npm run openspec -- status --change kanban-seguro
npm run spec:validate
npm run openspec -- instructions apply --change kanban-seguro
```

- `openspec/config.yaml`: contexto LTI, Atomic Design, backend preparado y reglas de evidencia.
- `openspec/specs/position-kanban/spec.md`: requisitos del enunciado original, escenarios y adaptaciones del repo.
- `openspec/changes/kanban-seguro/`: propuesta, diseño, escenarios y tareas del ejemplo resuelto.
- `.agents/skills/openspec-*`: seis skills oficiales generadas por `openspec init --tools agents` para proponer, explorar, aplicar, actualizar, sincronizar y archivar. Recargar el agente si no las detecta en su sesión actual.

`status` indica artefactos escritos, no pruebas aprobadas ni aceptación de producto. `validate --all --strict` comprueba estructura; no ejecuta tests de aplicación. El cambio sigue abierto porque falta publicar el commit actual en Chromatic y aceptar visualmente el resultado. No ejecutar archive como parte automática de la preparación.

La base no incluye implementación de búsqueda. Los checkpoints de SDD y posteriores tienen buscar-candidatos. La búsqueda es frontend sobre el conjunto de candidatos ya servido por API.

Documentación oficial: https://github.com/Fission-AI/OpenSpec/blob/main/docs/cli.md

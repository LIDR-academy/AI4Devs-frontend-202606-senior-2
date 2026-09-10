# Evidencia del catálogo frontend

Base: d9ef43f (ya tenía búsqueda). Trabajo aislado en frontend-storybook/desarrollo; no se modificaron los cambios locales de la rama de sesión.

## Resultados

- 8 capturas iniciales y 8 posteriores: cuatro pantallas a 375/1280. El código de la aplicación conserva estilos LTI; cambios intencionales: enlace de dashboard sin botón anidado, upload desactivado sin archivo y error visible.
- Caracterización inicial: 4 pruebas pasan; kanban actual: 19 pasan; test:app: 1 pasa.
- Contratos rojos: fallo por ausencia de PositionCard, previo a la extracción (checkpoint 02); los contratos nuevos también verifican cancelación y error de upload.
- Tras implementación: 31 pruebas pasan (5 suites); typecheck correcto. ESLint sin errores, con avisos de exports anónimos en stories y dependencias heredadas.
- Build Storybook correcto: 37 stories, incluidos estados históricos del kanban. Los archivos JSX tienen extensión .jsx para Vite.
- Catálogo estático: 4 pruebas Chrome aprobadas, matriz de 18 stories a dos anchos, bloqueo y detección de peticiones a 3010, recarga sin estado residual, envío simulado y teclado.
- Aplicación real: test:app pasó contra PostgreSQL y API (arrastre, PUT, recarga, rollback simulado). Alta manual automatizada de candidato ficticio: POST 201 y mensaje de éxito. Datos example.test exclusivos de la base local.

La inspección visual del agente revisó las capturas posteriores. Falta aceptación humana; no equivale a aprobación Chromatic.

## Ejecutar

Desde raíz: npm ci; npm ci --prefix frontend. npm run storybook inicia en 6006 por defecto (en este Mac el catálogo nuevo usa 6007). npm run storybook:build genera frontend/storybook-static.

Para probar el build: servir frontend/storybook-static en 6008 y ejecutar `CATALOG_URL=http://127.0.0.1:6008 npm run test:catalog`. Para probar desarrollo en 6007: `npm run test:catalog`.

Pruebas de componentes: desde frontend `npm test -- --watchAll=false --runInBand --testPathPattern='Catalog|Positions|PositionKanbanDetail'`. Aplicación real: desde raíz `npm run test:app` con servicios en 3000/3010.

## Matriz de aceptación

| Criterio | Evidencia |
| --- | --- |
| SB-01 catálogo real | cuatro páginas, nuevas piezas y build de 37 stories |
| SB-02 contratos | props/Actions/autodocs y CatalogContracts.test.js |
| SB-03 aislamiento | e2e-catalog bloquea y cuenta peticiones a 3010; reinicio del formulario |
| SB-04 estados | matriz de stories, tests de upload cancelado/error |
| SB-05 teclado/móvil | pruebas a 375/1280 y capturas; no es una auditoría integral de accesibilidad |
| SB-06 aplicación | CatalogBaseline, test:app y POST 201 real |
| SB-07 revisión | evidencia local presente; publicación actual en Chromatic pendiente de autorización de uso del token y aceptación humana |

## Recuperación

- frontend-storybook/01-diseno: spec y caracterización inicial.
- frontend-storybook/02-tdd-rojo: contratos nuevos fallando.
- frontend-storybook/03-implementacion: componentes extraídos.
- frontend-storybook/04-storybook: catálogo y tests.
- frontend-storybook/05-revision: evidencia y pendientes visuales.
- frontend-storybook/06-pr: entrega para revisión.

Guardar trabajo antes de cambiar de rama. Cada rama es una referencia; no usar reset --hard. No sincronizar ni archivar la spec hasta resolver aceptación visual.

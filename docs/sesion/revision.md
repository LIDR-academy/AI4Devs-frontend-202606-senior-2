# Cierre del ejercicio: Chromatic y PR

## Evidencia comprobada

- Checkpoint 03: cuatro escenarios nuevos fallan y doce existentes pasan.
- Checkpoint 04: dieciséis pruebas unitarias pasan.
- Checkpoint 05: siete pruebas reales en Chrome pasan, incluido arrastre filtrado y móvil a 375 px.
- TypeScript y lint del alcance pasan.
- Los servicios están simulados: esto no demuestra integración con el backend real.

## Chromatic: ejecutar en clase

Esta preparación no dispone de CHROMATIC_PROJECT_TOKEN. No hay build ni baseline remoto aprobado. Configurar el secreto en el entorno, nunca en Git.

1. En kanban-solved, ejecutar desde frontend: `npm run chromatic -- --branch-name=kanban-solved`. Revisar y aprobar visualmente la base en el proyecto autorizado.
2. En la rama del ejercicio, ejecutar `npm run chromatic`. Abrir el build y comparar Loaded, SearchReady, SearchMatch y SearchNoResults; comprobar también teclado, foco y viewport móvil con las pruebas de navegador.
3. Introducir un cambio visual pequeño en directo, repetir la publicación y decidir si el diff es intencional. No usar auto-accept para ocultar regresiones.
4. Añadir al PR el enlace real del build y el resultado de la revisión humana. Mientras falten, el paso sigue pendiente.

## PR de la característica

Base: kanban-solved. Head: kanban-ejercicio/06-chromatic-pr. Así el diff enseña búsqueda, sin mezclar la implementación previa del tablero.

Problema: el reclutador necesita encontrar un candidato sin perder el contexto del tablero. Buscar «jose» encuentra «José Pérez», muestra el conteo y permite limpiar. Arrastrar el primer resultado mueve esa candidatura, aunque no fuera la primera de la columna original. Un fallo de guardado restaura todas las candidaturas y conserva el filtro.

Revisar el mapeo entre índice visible e identidad, la normalización, el foco, el mensaje vacío, el rollback y los escenarios BS-01 a BS-05. No aceptar integración de producto hasta verificar el backend real y revisar Chromatic.

## Cambios sobre la marcha con IA

Usar sesion-frontend/sesion para construir en directo. Antes de cada cambio: actualizar el diseño y criterio observable, pedir una prueba que falle por ese criterio, implementar lo mínimo y revisar el diff. Después añadir el estado a Storybook y comprobar navegador/Chromatic. Los checkpoints son referencias acumulativas, no pasos que deban copiarse sin entenderlos.

Propuesta de variación durante clase: buscar también por apellido compuesto o añadir un filtro de etapa. Definir primero cómo combina con el nombre, el conteo y el arrastre; no implementar sin actualizar el contrato.


## Verificación adicional con API real y PostgreSQL

Comprobado el 9 de septiembre: las cuatro migraciones se aplican a PostgreSQL 17 vacío; el backend compila; la API carga Alex y José, persiste solo el movimiento de José, devuelve la nueva etapa al recargar y rechaza una candidatura que pertenece a Alex. La prueba usa datos ficticios y una base temporal. Todavía falta una prueba integrada de navegador → API → base; las siete pruebas de navegador anteriores usan servicios simulados.

Prisma ahora obtiene la conexión de DATABASE_URL, conforme al README, para elegir explícitamente la base de pruebas. No hay que modificar la conexión en el esquema.

Reproducción desde la raíz, con Node en PATH y el puerto 3010 libre:

```sh
docker run -d --rm --name lidr-workshop-pg-20260909 -e POSTGRES_HOST_AUTH_METHOD=trust -e POSTGRES_USER=workshop -e POSTGRES_DB=workshop -p 127.0.0.1:55439:5432 postgres:17
export DATABASE_URL=postgresql://workshop@127.0.0.1:55439/workshop
npm ci --prefix backend
backend/node_modules/.bin/prisma migrate deploy --schema backend/prisma/schema.prisma
backend/node_modules/.bin/prisma generate --schema backend/prisma/schema.prisma
npm run build --prefix backend
node backend/scripts/workshop-smoke.cjs
docker stop lidr-workshop-pg-20260909
```

El contenedor es desechable, sin volumen persistente, y solo expone el puerto en loopback. El script rechaza otra dirección de base y no reutiliza un backend ya iniciado. Los datos desaparecen al detener ese contenedor.

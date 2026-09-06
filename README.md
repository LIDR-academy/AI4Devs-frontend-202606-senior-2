# LTI - Talent Tracking System  | EN

This project is a full-stack application with a React frontend and an Express backend using Prisma as an ORM. The frontend is initiated with Create React App, and the backend is written in TypeScript.

## Directory and File Explanation

- `backend/`: Contains the server-side code written in Node.js.
  - `src/`: Contains the source code for the backend.
    - `index.ts`: The entry point for the backend server.
    - `application/`: Contains the application logic.
    - `domain/`: Contains the business logic.
    - `infrastructure/`: Contains code that communicates with the database.
    - `presentation/`: Contains code related to the presentation layer (such as controllers).
    - `routes/`: Contains the route definitions for the API.
    - `tests/`: Contains test files.
  - `prisma/`: Contains the Prisma schema file for ORM.
  - `tsconfig.json`: TypeScript configuration file.
- `frontend/`: Contains the client-side code written in React.
  - `src/`: Contains the source code for the frontend.
  - `public/`: Contains static files such as the HTML file and images.
  - `build/`: Contains the production-ready build of the frontend.
- `.env.example`: Template for the environment variables. Copy to `.env`, which is gitignored.
- `docker-compose.yml`: Docker Compose configuration for the whole stack (database, backend, frontend).
- `backend/Dockerfile`, `frontend/Dockerfile`: Dev images for each service.
- `backend/docker-entrypoint.sh`, `frontend/docker-entrypoint.sh`: Container startup scripts (dependency install, migrations, seeding).
- `.docker-cache/npm/`: npm's download cache, kept in the project root so image rebuilds never re-download packages.
- `uploads/`: Destination for files uploaded through the API.
- `CODE_QUALITY.md`: Review of the frontend against the Módulo 10 best-practices guide.
- `README.md`: This file contains information about the project and instructions on how to run it.

## Project Structure

The project is divided into two main directories: `frontend` and `backend`.

### Frontend


The frontend is a React application, and its main files are located in the `src` directory. The `public` directory contains static assets, and the build directory contains the production `build` of the application.

### Backend

The backend is an Express application written in TypeScript. The `src` directory contains the source code, divided into several subdirectories:

- `application`:Contains the application logic.
- `domain`: Contains the domain models.
- `infrastructure`: Contains code related to the infrastructure.
- `presentation`: Contains code related to the presentation layer.
- `routes`: Contains the application's routes.
- `tests`: Contains the application's tests.

The `prisma` directory contains the Prisma schema.

## Getting started

Everything runs in containers &mdash; you only need Docker with the Compose plugin.
Nothing is installed or executed directly on your machine.

1. Clone the repo.
2. Create your local environment files from the templates:
```sh
cp .env.example .env
cp backend/.env.example backend/.env
```
Then set `DB_PASSWORD` to the same value in both (e.g. `openssl rand -hex 16`).
Neither `.env` is tracked by git — never commit real credentials.
3. Start the whole stack:
```sh
docker compose up
```

That single command brings up three services:

| Service    | What it runs                          | Available at            |
| ---------- | ------------------------------------- | ----------------------- |
| `db`       | PostgreSQL 16                         | `localhost:5432`        |
| `backend`  | Express + Prisma (`npm run dev`)      | http://localhost:3010   |
| `frontend` | Create React App dev server           | http://localhost:3000   |

On first start the `backend` container installs its dependencies, generates the
Prisma client, applies all migrations and seeds the database with example data.
Later starts skip whatever is already done, so they take a few seconds.

Both `backend` and `frontend` mount the source tree, so edits on your machine are
picked up by the running dev servers without a rebuild.

To stop everything:
```sh
docker compose down
```

Add `-v` to also drop the database volume, which makes the next `docker compose up`
re-run migrations and re-seed from scratch:
```sh
docker compose down -v
```

### Dependency caching

npm packages are cached inside the project root, so rebuilding an image never
re-downloads them:

```
.docker-cache/npm/       # npm's download cache, shared by both services
backend/node_modules/    # backend dependencies
frontend/node_modules/   # frontend dependencies
```

The images themselves contain no `npm install` step at all. Dependencies are
installed by each container's entrypoint into the mounted project directory, and
reinstalled only when the corresponding `package-lock.json` changes &mdash; and
even then they are unpacked from `.docker-cache/npm` rather than downloaded. To
force a clean install, delete the relevant `node_modules` directory and start
the stack again.

### Configuration

Ports, database credentials and the uid:gid the containers run as all come from
the `.env` file in the project root, created from `.env.example`:

```
DB_PASSWORD=...
DB_USER=...
DB_NAME=...
DB_PORT=5432
DOCKER_USER=1000:1000   # set to `id -u`:`id -g` if yours differs
```

`DOCKER_USER` keeps files the containers write to the mounted project directory
(uploads, caches, build output) owned by you rather than by root.

### Running commands inside the containers

Use `docker compose exec` for a running service, or `docker compose run --rm` for
a one-off:

```sh
docker compose exec backend npm test          # backend test suite
docker compose exec backend npx prisma studio # inspect the data
docker compose exec db psql -U "$DB_USER" -d "$DB_NAME"
docker compose run --rm backend npx prisma migrate dev --name my_migration
```

## Database

The `db` service stores its data in the `db-data` named volume, so it survives
`docker compose down`. To connect with an external PostgreSQL client, use the
credentials from `.env`:

- Host: localhost
- Port: 5432
- User: the value of `DB_USER`
- Password: the value of `DB_PASSWORD`
- Database: the value of `DB_NAME`

Migrations and seeding are handled automatically by the backend entrypoint
(`backend/docker-entrypoint.sh`). The seed script is not idempotent, so it only
runs against a database that has never been seeded.

## API example

Once the stack is up, you should be able to save new candidates, both via the web and API, view them in the database, and retrieve them via GET by ID.

```
POST http://localhost:3010/candidates
{
    "firstName": "Albert",
    "lastName": "Saelices",
    "email": "albert.saelices@gmail.com",
    "phone": "656874937",
    "address": "Calle Sant Dalmir 2, 5ºB. Barcelona",
    "educations": [
        {
            "institution": "UC3M",
            "title": "Computer Science",
            "startDate": "2006-12-31",
            "endDate": "2010-12-26"
        }
    ],
    "workExperiences": [
        {
            "company": "Coca Cola",
            "position": "SWE",
            "description": "",
            "startDate": "2011-01-13",
            "endDate": "2013-01-17"
        }
    ],
    "cv": {
        "filePath": "uploads/1715760936750-cv.pdf",
        "fileType": "application/pdf"
    }
}
```
-------------------------------------------------------------------------------


# LTI - Sistema de Seguimiento de Talento  | ES

Este proyecto es una aplicación full-stack con un frontend en React y un backend en Express usando Prisma como un ORM. El frontend se inicia con Create React App y el backend está escrito en TypeScript.

## Explicación de Directorios y Archivos

- `backend/`: Contiene el código del lado del servidor escrito en Node.js.
  - `src/`: Contiene el código fuente para el backend.
    - `index.ts`: El punto de entrada para el servidor backend.
    - `application/`: Contiene la lógica de aplicación.
    - `domain/`: Contiene la lógica de negocio.
    - `infrastructure/`: Contiene código que se comunica con la base de datos.
    - `presentation/`: Contiene código relacionado con la capa de presentación (como controladores).
    - `routes/`: Contiene las definiciones de rutas para la API.
    - `tests/`: Contiene archivos de prueba.
  - `prisma/`: Contiene el archivo de esquema de Prisma para ORM.
  - `tsconfig.json`: Archivo de configuración de TypeScript.
- `frontend/`: Contiene el código del lado del cliente escrito en React.
  - `src/`: Contiene el código fuente para el frontend.
  - `public/`: Contiene archivos estáticos como el archivo HTML e imágenes.
  - `build/`: Contiene la construcción lista para producción del frontend.
- `.env.example`: Plantilla de las variables de entorno. Cópiala a `.env`, que está en el gitignore.
- `docker-compose.yml`: Configuración de Docker Compose para todo el stack (base de datos, backend, frontend).
- `backend/Dockerfile`, `frontend/Dockerfile`: Imágenes de desarrollo de cada servicio.
- `backend/docker-entrypoint.sh`, `frontend/docker-entrypoint.sh`: Scripts de arranque de los contenedores (instalación de dependencias, migraciones, seeding).
- `.docker-cache/npm/`: Caché de descargas de npm, dentro de la raíz del proyecto para que reconstruir las imágenes nunca vuelva a descargar paquetes.
- `uploads/`: Destino de los ficheros subidos a través de la API.
- `CODE_QUALITY.md`: Revisión del frontend frente a la guía de buenas prácticas del Módulo 10.
- `README.md`: Este archivo, contiene información sobre el proyecto e instrucciones sobre cómo ejecutarlo.

## Estructura del Proyecto

El proyecto está dividido en dos directorios principales: `frontend` y `backend`.

### Frontend

El frontend es una aplicación React y sus archivos principales están ubicados en el directorio `src`. El directorio `public` contiene activos estáticos y el directorio `build` contiene la construcción de producción de la aplicación.

### Backend

El backend es una aplicación Express escrita en TypeScript. El directorio `src` contiene el código fuente, dividido en varios subdirectorios:

- `application`: Contiene la lógica de aplicación.
- `domain`: Contiene los modelos de dominio.
- `infrastructure`: Contiene código relacionado con la infraestructura.
- `presentation`: Contiene código relacionado con la capa de presentación.
- `routes`: Contiene las rutas de la aplicación.
- `tests`: Contiene las pruebas de la aplicación.

El directorio `prisma` contiene el esquema de Prisma.

Tienes más información sobre buenas prácticas utilizadas en la [guía de buenas prácticas](./backend/ManifestoBuenasPracticas.md).

Las especificaciones de todos los endpoints de API los tienes en [api-spec.yaml](./backend/api-spec.yaml).

La descripción y diagrama del modelo de datos los tienes en [ModeloDatos.md](./backend/ModeloDatos.md).


## Primeros Pasos

Todo se ejecuta en contenedores: solo necesitas Docker con el plugin Compose.
No se instala ni se ejecuta nada directamente en tu máquina.

1. Clona el repositorio.
2. Crea tus ficheros de entorno locales a partir de las plantillas:
```sh
cp .env.example .env
cp backend/.env.example backend/.env
```
Después pon el mismo `DB_PASSWORD` en ambos (por ejemplo `openssl rand -hex 16`).
Ninguno de los `.env` está en git: nunca subas credenciales reales.
3. Levanta el stack completo:
```sh
docker compose up
```

Ese único comando arranca tres servicios:

| Servicio   | Qué ejecuta                           | Disponible en           |
| ---------- | ------------------------------------- | ----------------------- |
| `db`       | PostgreSQL 16                         | `localhost:5432`        |
| `backend`  | Express + Prisma (`npm run dev`)      | http://localhost:3010   |
| `frontend` | Servidor de desarrollo de CRA         | http://localhost:3000   |

En el primer arranque, el contenedor `backend` instala sus dependencias, genera
el cliente de Prisma, aplica todas las migraciones y puebla la base de datos con
datos de ejemplo. Los arranques posteriores omiten lo que ya está hecho, así que
tardan unos pocos segundos.

Tanto `backend` como `frontend` montan el código fuente, de modo que los cambios
que hagas en tu máquina los recogen los servidores de desarrollo sin reconstruir
la imagen.

Para detenerlo todo:
```sh
docker compose down
```

Añade `-v` para eliminar también el volumen de la base de datos, lo que hará que
el siguiente `docker compose up` vuelva a migrar y poblar desde cero:
```sh
docker compose down -v
```

### Caché de dependencias

Los paquetes npm se cachean dentro de la raíz del proyecto, de forma que
reconstruir una imagen nunca vuelve a descargarlos:

```
.docker-cache/npm/       # caché de descargas de npm, compartida por ambos servicios
backend/node_modules/    # dependencias del backend
frontend/node_modules/   # dependencias del frontend
```

Las imágenes no contienen ningún paso `npm install`. Las dependencias las instala
el entrypoint de cada contenedor en el directorio montado del proyecto, y solo se
reinstalan cuando cambia el `package-lock.json` correspondiente &mdash; y aun así
se desempaquetan desde `.docker-cache/npm` en lugar de descargarse. Para forzar
una instalación limpia, borra el directorio `node_modules` correspondiente y
vuelve a levantar el stack.

### Configuración

Los puertos, las credenciales de la base de datos y el uid:gid con el que se
ejecutan los contenedores salen del fichero `.env` en la raíz del proyecto, creado
a partir de `.env.example`:

```
DB_PASSWORD=...
DB_USER=...
DB_NAME=...
DB_PORT=5432
DOCKER_USER=1000:1000   # pon `id -u`:`id -g` si el tuyo es distinto
```

`DOCKER_USER` hace que los ficheros que los contenedores escriben en el
directorio montado del proyecto (subidas, cachés, build) sigan siendo tuyos y no
de root.

### Ejecutar comandos dentro de los contenedores

Usa `docker compose exec` para un servicio en marcha, o `docker compose run --rm`
para algo puntual:

```sh
docker compose exec backend npm test          # tests del backend
docker compose exec backend npx prisma studio # inspeccionar los datos
docker compose exec db psql -U "$DB_USER" -d "$DB_NAME"
docker compose run --rm backend npx prisma migrate dev --name mi_migracion
```

## Base de datos

El servicio `db` guarda sus datos en el volumen con nombre `db-data`, así que
sobreviven a `docker compose down`. Para conectarte con un cliente PostgreSQL
externo, usa las credenciales de `.env`:

- Host: localhost
- Puerto: 5432
- Usuario: el valor de `DB_USER`
- Contraseña: el valor de `DB_PASSWORD`
- Base de datos: el valor de `DB_NAME`

Las migraciones y el seeding los gestiona automáticamente el entrypoint del
backend (`backend/docker-entrypoint.sh`). El script de seed no es idempotente,
por lo que solo se ejecuta contra una base de datos que nunca se ha poblado.

## Ejemplo de API

Una vez levantado el stack, deberías poder guardar nuevos candidatos, tanto via web, como via API, verlos en la base de datos y obtenerlos mediante GET por id. 

```
POST http://localhost:3010/candidates
{
    "firstName": "Albert",
    "lastName": "Saelices",
    "email": "albert.saelices@gmail.com",
    "phone": "656874937",
    "address": "Calle Sant Dalmir 2, 5ºB. Barcelona",
    "educations": [
        {
            "institution": "UC3M",
            "title": "Computer Science",
            "startDate": "2006-12-31",
            "endDate": "2010-12-26"
        }
    ],
    "workExperiences": [
        {
            "company": "Coca Cola",
            "position": "SWE",
            "description": "",
            "startDate": "2011-01-13",
            "endDate": "2013-01-17"
        }
    ],
    "cv": {
        "filePath": "uploads/1715760936750-cv.pdf",
        "fileType": "application/pdf"
    }
}
```



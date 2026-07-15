# Kuentas

Kuentas es una aplicación web en desarrollo para administrar información financiera personal desde un panel privado. El sistema está construido con Next.js, React, Prisma y PostgreSQL, con autenticación propia, protección de sesiones y una interfaz preparada para español e inglés.

## Estado actual

El proyecto ya cuenta con estas bases funcionales:

- Registro e inicio de sesión con validaciones de formulario.
- Hash de contraseñas con `bcryptjs`.
- Sesiones persistidas en base de datos mediante tokens hasheados y cookies `httpOnly`.
- Límite de intentos fallidos de acceso por correo/IP.
- Recuperación de contraseña mediante tokens temporales hasheados.
- Panel privado con navegación lateral y barra superior.
- Vistas iniciales para inicio, pagos, calendario, estadísticas y configuración.
- Cambio de idioma con `i18next` y recursos en `public/locales`.
- Preferencia de tema claro/oscuro y transiciones visuales.
- Pruebas unitarias con Vitest para autenticación, i18n, navegación y preferencias.

## Tecnologías principales

- Next.js 16 y React 19.
- TypeScript.
- Prisma 7 con PostgreSQL.
- Docker Compose para levantar PostgreSQL en desarrollo.
- Vitest para pruebas.
- ESLint para revisión estática.
- i18next y react-i18next para internacionalización.

## Requisitos

- Node.js compatible con el proyecto.
- npm.
- Docker Desktop o una instancia local/remota de PostgreSQL.

## Configuración local

1. Instala dependencias:

```bash
npm install
```

2. Crea tu archivo de variables de entorno:

```bash
copy .env.example .env
```

3. Cambia los valores de `.env` antes de usar datos reales. Como mínimo revisa:

```env
POSTGRES_PASSWORD="kuentas_dev_password"
DATABASE_URL="postgresql://kuentas:kuentas_dev_password@localhost:5432/kuentas?schema=public"
SESSION_SECRET="replace-with-at-least-32-random-characters"
```

`SESSION_SECRET` debe tener al menos 32 caracteres. Para producción usa valores únicos, aleatorios y gestionados fuera del repositorio.

4. Levanta PostgreSQL local:

```bash
docker compose up -d
```

5. Ejecuta las migraciones y genera el cliente de Prisma:

```bash
npm run prisma:migrate
npm run prisma:generate
```

6. Inicia el servidor de desarrollo:

```bash
npm run dev
```

La aplicación queda disponible en `http://localhost:3000`.

## Scripts disponibles

```bash
npm run dev              # Servidor de desarrollo
npm run build            # Build de producción
npm run start            # Servidor de producción después del build
npm run lint             # Revisión con ESLint
npm run test             # Pruebas unitarias con Vitest
npm run prisma:migrate   # Migraciones de Prisma en desarrollo
npm run prisma:generate  # Generación del cliente Prisma
```

## Estructura del proyecto

- `app/`: rutas, layouts y vistas de la aplicación.
- `app/(auth)/`: pantallas y acciones de login, registro y recuperación.
- `app/(dashboard)/`: layout privado, navegación y páginas del panel.
- `components/ui/`: componentes reutilizables de interfaz.
- `lib/auth/`: reglas de autenticación, sesiones, rate limit y recuperación de contraseña.
- `lib/dashboard/`: navegación, configuración, tema y datos de usuario.
- `lib/i18n/`: registro y recursos de internacionalización.
- `prisma/`: esquema y migraciones de base de datos.
- `public/locales/`: traducciones en español e inglés.
- `docs/`: notas y planes técnicos del proyecto.

## Seguridad y manejo de secretos

El repositorio está configurado para no versionar archivos `.env`, builds locales, dependencias, cachés, certificados, llaves privadas ni bases de datos locales. Solo se versiona `.env.example` como plantilla.

Antes de subir cambios al remoto:

```bash
git status --short
git ls-files --others --exclude-standard
git log --all --oneline -- .env .env.local .env.development .env.production .env.test
```

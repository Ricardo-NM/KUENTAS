# Kuentas

Kuentas es una aplicación web en desarrollo para administrar información financiera personal desde un panel privado. El sistema está construido con Next.js, React, TypeScript, Prisma y PostgreSQL, con autenticación propia, protección de sesiones, configuración de cuenta y una interfaz preparada para español e inglés.

## Estado actual

El proyecto ya cuenta con estas bases funcionales:

- Registro e inicio de sesión con validaciones de formulario.
- Verificación de cuenta mediante código temporal enviado por correo.
- Hash de contraseñas con `bcryptjs`.
- Sesiones persistidas en base de datos mediante tokens hasheados y cookies `httpOnly`.
- Registro de actividad de sesión con dispositivo, fecha de acceso y vencimiento.
- Revocación de sesiones individuales o cierre de todas las demás sesiones.
- Límite de intentos fallidos de acceso por correo/IP.
- Recuperación de contraseña mediante tokens temporales hasheados.
- Cambio de contraseña protegido con código de verificación.
- Eliminación de cuenta con confirmación de contraseña y código temporal.
- Panel privado con navegación lateral y barra superior.
- Panel de inicio con tarjetas de total a pagar, progreso, porcentaje pagado, próximos pagos, calendario y distribución por categoría.
- Vistas iniciales para inicio, pagos, calendario, estadísticas y configuración.
- Configuración de perfil con edición de nombre, foto de perfil, preferencias generales, notificaciones y seguridad.
- Carga, recorte y eliminación de foto de perfil.
- Cambio de idioma con `i18next` y recursos en `public/locales`.
- Preferencia de tema claro/oscuro y transiciones visuales.
- Pruebas unitarias con Vitest para autenticación, i18n, navegación, configuración, preferencias y seguridad de cuenta.

## Capturas del avance

### Inicio de sesión

![Pantalla de inicio de sesión](docs/screenshots/login.png)

### Creación de cuenta

![Pantalla de registro](docs/screenshots/registro.png)

### Panel de inicio

![Panel de inicio con resumen financiero](docs/screenshots/dashboard-inicio.png)

### Panel de configuración

![Configuración - General](docs/screenshots/configuracion-general.png)

![Configuración - Perfil de usuario](docs/screenshots/configuracion-perfil.png)

![Configuración - Notificaciones](docs/screenshots/configuracion-notificaciones.png)

![Configuración - Seguridad de la cuenta](docs/screenshots/configuracion-seguridad.png)

## Tecnologías principales

- Next.js 16 y React 19.
- TypeScript.
- Prisma 7 con PostgreSQL.
- Docker Compose para levantar PostgreSQL en desarrollo.
- Vitest para pruebas.
- ESLint para revisión estática.
- i18next y react-i18next para internacionalización.
- Motion, lucide-react/lucide-animated y MUI Date Pickers para la interfaz.

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
PASSWORD_RESET_EMAIL_USER="your-sender-email@gmail.com"
PASSWORD_RESET_EMAIL_APP_PASSWORD="your-gmail-app-password"
```

`SESSION_SECRET` debe tener al menos 32 caracteres. Para el envío de códigos de verificación en desarrollo se usa una cuenta personal de Gmail configurada con contraseña de aplicación, por eso se requieren `PASSWORD_RESET_EMAIL_USER` y `PASSWORD_RESET_EMAIL_APP_PASSWORD`. Para producción usa valores únicos, aleatorios y gestionados fuera del repositorio.

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
- `app/api/profile-photo/`: carga y eliminación de foto de perfil.
- `components/ui/`: componentes reutilizables de interfaz.
- `lib/auth/`: reglas de autenticación, sesiones, rate limit, verificación, recuperación, cambio de contraseña y eliminación de cuenta.
- `lib/dashboard/`: navegación, configuración, tema, foto de perfil y datos de usuario.
- `lib/i18n/`: registro y recursos de internacionalización.
- `prisma/`: esquema y migraciones de base de datos.
- `public/locales/`: traducciones en español e inglés.
- `docs/screenshots/`: capturas del avance visual del sistema.
- `docs/`: notas y planes técnicos del proyecto.

## Seguridad y manejo de secretos

El repositorio está configurado para no versionar archivos `.env`, builds locales, dependencias, cachés, certificados, llaves privadas ni bases de datos locales. Solo se versiona `.env.example` como plantilla.

Las credenciales de correo usadas para enviar códigos de verificación (`PASSWORD_RESET_EMAIL_USER` y `PASSWORD_RESET_EMAIL_APP_PASSWORD`) deben mantenerse únicamente en variables de entorno locales o del proveedor de despliegue. No deben subirse al repositorio.

Antes de subir cambios al remoto:

```bash
git status --short
git ls-files --others --exclude-standard
git log --all --oneline -- .env .env.local .env.development .env.production .env.test
```

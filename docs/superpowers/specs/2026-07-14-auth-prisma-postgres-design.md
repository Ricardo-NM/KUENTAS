# Autenticacion con Prisma y PostgreSQL

## Objetivo

Implementar el flujo completo de autenticacion para KUENTAS:

- Crear cuentas desde `/registro`.
- Guardar usuarios en PostgreSQL ejecutado con Docker.
- Encriptar contrasenas antes de persistirlas.
- Iniciar sesion desde `/login`.
- Mantener la sesion abierta cuando el usuario marque `Recordar`.
- Proteger una nueva ruta `/inicio`.
- Cerrar sesion de forma segura desde `/inicio`.

## Arquitectura

La aplicacion usara Next.js App Router con Server Actions para las mutaciones de autenticacion. Los formularios seguiran siendo Client Components para conservar validaciones y estados visuales, pero toda validacion sensible se repetira en el servidor.

Componentes principales:

- `prisma/schema.prisma`: modelos `User` y `Session`.
- `lib/prisma.ts`: cliente Prisma singleton para desarrollo.
- `lib/auth/validation.ts`: esquemas y helpers de validacion compartidos.
- `lib/auth/password.ts`: hashing y comparacion de contrasenas con bcrypt.
- `lib/auth/session.ts`: creacion, verificacion y eliminacion de sesiones.
- `app/(auth)/actions.ts`: Server Actions de registro y login.
- `app/(auth)/registro/register-form.tsx`: envio real de registro y modal de exito.
- `app/(auth)/login/login-form.tsx`: envio real de login, error de credenciales y `Recordar`.
- `app/inicio/page.tsx`: pagina protegida.
- `app/inicio/logout-button.tsx`: boton cliente que invoca logout.
- `app/inicio/actions.ts`: Server Action para cerrar sesion.

## Base de Datos

PostgreSQL se ejecutara mediante `docker-compose.yml`. La configuracion local estara documentada con `.env.example`; `.env` no debe versionarse.

Modelo `User`:

- `id`: string cuid o uuid.
- `email`: unico, normalizado en minusculas.
- `firstName`: string.
- `lastName`: string.
- `passwordHash`: string.
- `createdAt` y `updatedAt`.

Modelo `Session`:

- `id`: string.
- `userId`: relacion con `User`.
- `tokenHash`: hash del token opaco entregado en cookie.
- `expiresAt`: expiracion.
- `createdAt`.

La cookie nunca guardara credenciales ni datos sensibles de usuario. Guardara un token opaco aleatorio; el servidor guardara solo su hash.

## Registro

El formulario de `/registro` mantendra las validaciones actuales:

- Correo con formato valido.
- Contrasena con al menos una mayuscula.
- Contrasena con al menos un numero.
- Contrasena de al menos 8 caracteres.
- Contrasena con al menos un caracter especial.
- Contrasena sin espacios.
- Repetir contrasena debe coincidir.

El servidor repetira esas reglas con Zod antes de tocar la base de datos. Si el correo ya existe, se devolvera un error sin crear la cuenta.

Al crear la cuenta:

1. Se normaliza el correo.
2. Se genera `passwordHash` con bcrypt.
3. Se crea el usuario con Prisma.
4. El cliente muestra un modal centrado con check blanco, fondo verde y texto `Cuenta creada correctamente`.
5. El modal se cierra automaticamente despues de 3 segundos.
6. Se redirige a `/login`.

## Login

El login validara los campos en cliente y servidor. El servidor buscara el usuario por correo normalizado y comparara la contrasena con bcrypt.

Si el correo no existe o la contrasena no coincide, se devolvera un error generico:

`Alguno de los campos es incorrecto`

El cliente mostrara ese texto en rojo y aplicara borde rojo a los inputs de correo y contrasena. El mensaje sera generico para evitar enumeracion de usuarios.

Si las credenciales son correctas:

1. Se crea una sesion en la tabla `Session`.
2. Se guarda una cookie `httpOnly`, `sameSite=lax`, `path=/`, `secure` en produccion.
3. Si `Recordar` esta marcado, la sesion dura 30 dias.
4. Si `Recordar` no esta marcado, la sesion dura 8 horas.
5. Se redirige a `/inicio`.

## Ruta Protegida `/inicio`

`/inicio` verificara la cookie en el servidor:

- Si no hay cookie, token valido o sesion vigente, redirige a `/login`.
- Si hay sesion valida, muestra el texto `Aquí ira el inicio`.
- Incluye un boton `Cerrar sesión`.

El boton de cierre de sesion invocara una Server Action que:

1. Lee la cookie actual.
2. Borra la sesion correspondiente de la base de datos.
3. Elimina la cookie del navegador.
4. Redirige a `/login`.

## Seguridad

Medidas incluidas:

- Validacion del servidor en todas las Server Actions.
- Hash de contrasenas con bcrypt.
- Mensaje de login generico para evitar confirmar si existe un correo.
- Sesiones con tokens opacos aleatorios.
- Hash del token en base de datos, no token plano.
- Cookies `httpOnly`, `sameSite=lax`, `secure` en produccion.
- Expiracion diferenciada para `Recordar`.
- Eliminacion de sesiones expiradas al verificarlas.
- No retorno de registros completos de usuario al cliente.

## Pruebas

Se agregaran pruebas unitarias para:

- Validacion de registro.
- Validacion de login.
- Hash y verificacion de contrasenas.
- Creacion y verificacion de sesiones.

Tambien se ejecutaran:

- `npm run lint`
- `npm run build`
- Comandos Prisma necesarios para generar cliente y aplicar migracion local.


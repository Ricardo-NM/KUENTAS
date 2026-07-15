# Guía de internacionalización

El cambio de idioma es global para toda la aplicación. Aunque el botón para cambiar idioma solo debe mostrarse en /login, /registro y /recuperacion, el idioma seleccionado se guarda en `localStorage`, se aplica desde `app/i18n-provider.tsx` y debe afectar todas las rutas actuales y futuras.

## Reglas obligatorias

- Todo texto visible para usuarios debe salir de `public/locales/es.json` y `public/locales/en.json`.
- Al agregar una ruta, componente, formulario, botón, mensaje, estado vacío o validación visible, agrega la clave en ambos JSON en el mismo cambio.
- Español (`es`) es el idioma por defecto y fallback. Los textos de `public/locales/es.json` deben conservar la redacción base de la app.
- Inglés (`en`) debe contener la traducción equivalente de cada clave.
- No dejes textos visibles hardcodeados en componentes client. Usa `useTranslation()` y `t("ruta.de.la.clave")`.
- En Server Components que necesiten texto dinámico por idioma, mueve la parte textual a un Client Component envuelto por `I18nProvider` o pasa una key traducible a un componente client.
- Server Actions deben devolver `messageKey` para mensajes visibles siempre que sea posible. El cliente traduce esa key con `t(messageKey)` y puede conservar `message` como fallback.
- Mantén paridad estricta entre claves de `public/locales/es.json` y `public/locales/en.json`; la prueba `lib/i18n/resources.test.ts` debe seguir pasando.

## Selector de idioma

- El selector visual de idioma pertenece al grupo `app/(auth)` y solo debe mostrarse en /login, /registro y /recuperacion.
- No coloques el botón en `/`, `/inicio` ni en rutas futuras fuera de auth, salvo que se cambie explícitamente esta regla.
- El selector debe cambiar el idioma con `i18n.changeLanguage("es")` o `i18n.changeLanguage("en")`.
- El icono `LanguagesIcon` debe ir a la izquierda del texto del botón.
- El icono solo debe animarse al hacer hover o foco sobre el botón. Hacer hover sobre la ventana de selección de idioma debe mantener el menú abierto, pero no debe animar el icono.

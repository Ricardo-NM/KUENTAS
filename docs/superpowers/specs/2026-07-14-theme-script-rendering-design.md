# Theme Script Rendering Design

## Goal

Eliminar el aviso de React 19 que aparece al renderizar el script de inicialización del tema desde `app/layout.tsx`, sin perder la aplicación del tema antes de la hidratación.

## Design

`RootLayout` usará el componente `Script` de `next/script` con `strategy="beforeInteractive"`. Next.js 16 documenta esta estrategia para scripts críticos del sitio y exige que se coloquen en el layout raíz; el componente se encargará de integrar el script en el HTML inicial sin que React trate el `<script>` nativo como contenido de un componente hidratado.

La función `getDashboardThemeInitScript()` permanecerá sin cambios: seguirá generando el código síncrono que lee `kuentas:dashboard-theme` y añade o elimina la clase `dark` de `document.documentElement`. No se cambia el comportamiento del selector de tema ni se añade lógica de cliente.

## Testing

Se añadirá una prueba de regresión que inspeccione el layout y confirme que importa y usa `Script` de Next.js, y que no renderiza un tag `<script>` nativo. Se ejecutarán esa prueba, la suite Vitest, ESLint y el build de Next.js.

## Scope

Archivos previstos:

- `app/layout.tsx`: sustituir el elemento nativo por `Script`.
- `app/layout.test.tsx`: prueba de regresión del contrato de integración.

No se modificarán la generación del script, las preferencias almacenadas ni los estilos del tema.

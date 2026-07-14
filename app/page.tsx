import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-12 sm:px-8">
      <section className="w-full max-w-xl rounded-2xl border border-border bg-surface px-6 py-10 text-center shadow-[0_4px_6px_-1px_rgb(0_0_0/0.05),0_2px_4px_-2px_rgb(0_0_0/0.05)] sm:px-10 sm:py-12">
        <p className="mb-3 font-mono text-xs font-medium uppercase text-muted">
          Sistema de cuentas
        </p>
        <h1 className="font-heading text-4xl font-bold text-foreground sm:text-5xl">
          KUENTAS
        </h1>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#2d3133] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/registro"
            className="inline-flex min-h-12 items-center justify-center rounded-lg border border-border bg-surface px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Registrarse
          </Link>
        </div>
      </section>
    </main>
  );
}

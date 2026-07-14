"use client";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import {
  LockIcon,
  type LockIconHandle,
  MailCheckIcon,
  type MailCheckIconHandle,
} from "lucide-animated";
import { useRef, useState } from "react";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const emailIconRef = useRef<MailCheckIconHandle>(null);
  const passwordIconRef = useRef<LockIconHandle>(null);

  return (
    <form className="auth-form-reveal mb-2 w-full rounded-2xl border border-white/12 bg-white/10 px-6 py-8 shadow-[0_24px_70px_rgb(0_0_0/0.32)] backdrop-blur-md sm:px-8 lg:mb-20">
      <h1 className="auth-form-reveal auth-form-delay-1 font-heading text-2xl font-bold leading-8 text-white">
        Inicia sesión
      </h1>

      <div className="mt-7 space-y-5">
        <div className="auth-form-reveal auth-form-delay-2 space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-semibold text-[#eff1f3]"
          >
            Correo electrónico
          </label>
          <div className="relative">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="correo@kuentas.com"
              onFocus={() => emailIconRef.current?.startAnimation()}
              onBlur={() => emailIconRef.current?.stopAnimation()}
              className="min-h-12 w-full rounded-lg border border-white/14 bg-white/8 px-4 pl-12 text-sm text-white outline-none transition placeholder:text-[#c8c5cb]/55 focus:border-[#d0e1fb]/70 focus:bg-white/12 focus:ring-2 focus:ring-[#d0e1fb]/20"
            />
            <MailCheckIcon
              ref={emailIconRef}
              aria-hidden="true"
              size={20}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#d0e1fb]"
            />
          </div>
        </div>

        <div className="auth-form-reveal auth-form-delay-3 space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-semibold text-[#eff1f3]"
          >
            Contraseña
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••••••"
              onFocus={() => passwordIconRef.current?.startAnimation()}
              onBlur={() => passwordIconRef.current?.stopAnimation()}
              className="min-h-12 w-full rounded-lg border border-white/14 bg-white/8 px-4 pl-12 pr-14 text-sm text-white outline-none transition placeholder:text-[#c8c5cb]/55 focus:border-[#d0e1fb]/70 focus:bg-white/12 focus:ring-2 focus:ring-[#d0e1fb]/20"
            />
            <LockIcon
              ref={passwordIconRef}
              aria-hidden="true"
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#d0e1fb]"
            />
            <button
              type="button"
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-2 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-[#d0e1fb] transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d0e1fb]"
            >
              <span className="relative size-[18px]">
                <Eye
                  aria-hidden="true"
                  size={18}
                  strokeWidth={1.8}
                  className={`absolute inset-0 transition duration-200 ease-out ${
                    showPassword
                      ? "scale-75 opacity-0"
                      : "scale-100 opacity-100"
                  }`}
                />
                <EyeOff
                  aria-hidden="true"
                  size={18}
                  strokeWidth={1.8}
                  className={`absolute inset-0 transition duration-200 ease-out ${
                    showPassword
                      ? "scale-100 opacity-100"
                      : "scale-75 opacity-0"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="auth-form-reveal auth-form-delay-4 mt-4 flex items-center justify-between gap-4 text-xs text-[#eff1f3]/80">
        <label className="inline-flex min-h-11 items-center gap-2">
          <input
            type="checkbox"
            name="remember"
            className="size-4 rounded border-white/20 bg-white/10 accent-[#d0e1fb]"
          />
          <span>Recordar</span>
        </label>
        <button
          type="button"
          className="min-h-11 text-right font-medium text-[#d0e1fb] transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d0e1fb]"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <button
        type="button"
        className="auth-form-reveal auth-form-delay-5 mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-[#d0e1fb] px-5 text-sm font-bold text-[#0b1c30] transition hover:bg-[#b7c8e1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d0e1fb]"
      >
        Iniciar sesión
      </button>

      <p className="auth-form-reveal auth-form-delay-6 mt-6 text-center text-xs font-medium text-[#eff1f3]/75">
        ¿No tienes cuenta?
      </p>

      <Link
        href="/registro"
        className="auth-form-reveal auth-form-delay-7 mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-lg border border-white/16 bg-white/8 px-5 text-sm font-bold text-white transition hover:bg-white/12 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d0e1fb]"
      >
        Registrarse
      </Link>
    </form>
  );
}

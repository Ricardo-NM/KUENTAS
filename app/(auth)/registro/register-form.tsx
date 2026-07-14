"use client";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import {
  LockIcon,
  type LockIconHandle,
  MailCheckIcon,
  type MailCheckIconHandle,
  UserIcon,
  type UserIconHandle,
} from "lucide-animated";
import { useMemo, useRef, useState } from "react";

const inputBaseClass =
  "min-h-12 w-full rounded-lg border bg-white/8 px-4 pl-12 text-sm text-white outline-none transition placeholder:text-[#c8c5cb]/55 focus:bg-white/12 focus:ring-2";
const normalInputClass =
  "border-white/14 focus:border-[#d0e1fb]/70 focus:ring-[#d0e1fb]/20";
const errorInputClass =
  "field-error-pulse border-[#ffdad6] bg-[#ba1a1a]/10 focus:border-[#ffdad6] focus:ring-[#ffdad6]/20";

function RequirementItem({ isMet, label }: { isMet: boolean; label: string }) {
  return (
    <li
      className={`flex items-center gap-2 transition-colors duration-200 ${
        isMet ? "text-[#10b981]" : "text-[#c8c5cb]/70"
      }`}
    >
      <span
        className={`size-1.5 rounded-full transition-colors duration-200 ${
          isMet ? "bg-[#10b981]" : "bg-[#c8c5cb]/45"
        }`}
      />
      <span>{label}</span>
    </li>
  );
}

function VisibilityButton({
  isVisible,
  label,
  onClick,
}: {
  isVisible: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="absolute right-2 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-[#d0e1fb] transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d0e1fb]"
    >
      <span className="relative size-[18px]">
        <Eye
          aria-hidden="true"
          size={18}
          strokeWidth={1.8}
          className={`absolute inset-0 transition duration-200 ease-out ${
            isVisible ? "scale-75 opacity-0" : "scale-100 opacity-100"
          }`}
        />
        <EyeOff
          aria-hidden="true"
          size={18}
          strokeWidth={1.8}
          className={`absolute inset-0 transition duration-200 ease-out ${
            isVisible ? "scale-100 opacity-100" : "scale-75 opacity-0"
          }`}
        />
      </span>
    </button>
  );
}

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [repeatPasswordTouched, setRepeatPasswordTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const firstNameIconRef = useRef<UserIconHandle>(null);
  const lastNameIconRef = useRef<UserIconHandle>(null);
  const emailIconRef = useRef<MailCheckIconHandle>(null);
  const passwordIconRef = useRef<LockIconHandle>(null);
  const repeatPasswordIconRef = useRef<LockIconHandle>(null);

  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const showEmailError = emailTouched && !emailIsValid;
  const repeatPasswordDoesNotMatch =
    repeatPasswordTouched && repeatPassword !== password;

  const passwordRequirements = useMemo(
    () => [
      {
        label: "Al menos una letra mayúscula",
        isMet: /[A-ZÁÉÍÓÚÑ]/.test(password),
      },
      {
        label: "Al menos un número",
        isMet: /\d/.test(password),
      },
      {
        label: "Al menos 8 caracteres",
        isMet: password.length >= 8,
      },
      {
        label: "Al menos un carácter especial",
        isMet: /[^A-Za-z0-9ÁÉÍÓÚáéíóúÑñ]/.test(password),
      },
      {
        label: "Sin espacios",
        isMet: password.length > 0 && !/\s/.test(password),
      },
    ],
    [password],
  );

  return (
    <form
      onSubmit={(event) => event.preventDefault()}
      className="auth-form-reveal mb-2 w-full rounded-2xl border border-white/12 bg-white/10 px-6 py-7 shadow-[0_24px_70px_rgb(0_0_0/0.32)] backdrop-blur-md sm:px-8 lg:mb-12"
    >
      <h1 className="auth-form-reveal auth-form-delay-1 font-heading text-2xl font-bold leading-8 text-white">
        Crear cuenta
      </h1>

      <div className="mt-6 space-y-4">
        <div className="auth-form-reveal auth-form-delay-2 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="firstName"
              className="text-sm font-semibold text-[#eff1f3]"
            >
              Nombre
            </label>
            <div className="relative">
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="Tu nombre"
                onFocus={() => firstNameIconRef.current?.startAnimation()}
                onBlur={() => firstNameIconRef.current?.stopAnimation()}
                className={`${inputBaseClass} ${normalInputClass}`}
              />
              <UserIcon
                ref={firstNameIconRef}
                aria-hidden="true"
                size={19}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#d0e1fb]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="lastName"
              className="text-sm font-semibold text-[#eff1f3]"
            >
              Apellidos
            </label>
            <div className="relative">
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="Tus apellidos"
                onFocus={() => lastNameIconRef.current?.startAnimation()}
                onBlur={() => lastNameIconRef.current?.stopAnimation()}
                className={`${inputBaseClass} ${normalInputClass}`}
              />
              <UserIcon
                ref={lastNameIconRef}
                aria-hidden="true"
                size={19}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#d0e1fb]"
              />
            </div>
          </div>
        </div>

        <div className="auth-form-reveal auth-form-delay-3 space-y-2">
          <label
            htmlFor="registerEmail"
            className="text-sm font-semibold text-[#eff1f3]"
          >
            Correo electrónico
          </label>
          <div className="relative">
            <input
              id="registerEmail"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="correo@kuentas.com"
              value={email}
              aria-invalid={showEmailError}
              aria-describedby={
                showEmailError ? "registerEmail-error" : undefined
              }
              onChange={(event) => setEmail(event.target.value)}
              onFocus={() => emailIconRef.current?.startAnimation()}
              onBlur={() => {
                setEmailTouched(true);
                emailIconRef.current?.stopAnimation();
              }}
              className={`${inputBaseClass} ${
                showEmailError ? errorInputClass : normalInputClass
              }`}
            />
            <MailCheckIcon
              ref={emailIconRef}
              aria-hidden="true"
              size={20}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#d0e1fb]"
            />
          </div>
          <p
            id="registerEmail-error"
            className={`text-xs font-medium text-[#ffdad6] transition duration-200 ${
              showEmailError
                ? "translate-y-0 opacity-100"
                : "-translate-y-1 opacity-0"
            }`}
          >
            Ingresa un correo electrónico válido.
          </p>
        </div>

        <div className="auth-form-reveal auth-form-delay-4 space-y-2">
          <label
            htmlFor="registerPassword"
            className="text-sm font-semibold text-[#eff1f3]"
          >
            Contraseña
          </label>
          <div className="relative">
            <input
              id="registerPassword"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onFocus={() => passwordIconRef.current?.startAnimation()}
              onBlur={() => passwordIconRef.current?.stopAnimation()}
              className={`${inputBaseClass} ${normalInputClass} pr-14`}
            />
            <LockIcon
              ref={passwordIconRef}
              aria-hidden="true"
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#d0e1fb]"
            />
            <VisibilityButton
              isVisible={showPassword}
              label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              onClick={() => setShowPassword((current) => !current)}
            />
          </div>

          <ul className="grid gap-2 pt-1 text-xs font-medium sm:grid-cols-2">
            {passwordRequirements.map((requirement) => (
              <RequirementItem
                key={requirement.label}
                isMet={requirement.isMet}
                label={requirement.label}
              />
            ))}
          </ul>
        </div>

        <div className="auth-form-reveal auth-form-delay-5 space-y-2">
          <label
            htmlFor="repeatPassword"
            className="text-sm font-semibold text-[#eff1f3]"
          >
            Repetir contraseña
          </label>
          <div className="relative">
            <input
              id="repeatPassword"
              name="repeatPassword"
              type={showRepeatPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••••••"
              value={repeatPassword}
              aria-invalid={repeatPasswordDoesNotMatch}
              aria-describedby={
                repeatPasswordDoesNotMatch ? "repeatPassword-error" : undefined
              }
              onChange={(event) => setRepeatPassword(event.target.value)}
              onFocus={() => repeatPasswordIconRef.current?.startAnimation()}
              onBlur={() => {
                setRepeatPasswordTouched(true);
                repeatPasswordIconRef.current?.stopAnimation();
              }}
              className={`${inputBaseClass} ${
                repeatPasswordDoesNotMatch ? errorInputClass : normalInputClass
              } pr-14`}
            />
            <LockIcon
              ref={repeatPasswordIconRef}
              aria-hidden="true"
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#d0e1fb]"
            />
            <VisibilityButton
              isVisible={showRepeatPassword}
              label={
                showRepeatPassword
                  ? "Ocultar repetir contraseña"
                  : "Mostrar repetir contraseña"
              }
              onClick={() => setShowRepeatPassword((current) => !current)}
            />
          </div>
          <p
            id="repeatPassword-error"
            className={`text-xs font-medium text-[#ffdad6] transition duration-200 ${
              repeatPasswordDoesNotMatch
                ? "translate-y-0 opacity-100"
                : "-translate-y-1 opacity-0"
            }`}
          >
            Las contraseñas no coinciden.
          </p>
        </div>
      </div>

      <button
        type="submit"
        className="auth-form-reveal auth-form-delay-6 mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-[#d0e1fb] px-5 text-sm font-bold text-[#0b1c30] transition hover:bg-[#b7c8e1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d0e1fb]"
      >
        Crear cuenta
      </button>

      <p className="auth-form-reveal auth-form-delay-7 mt-5 text-center text-xs font-medium text-[#eff1f3]/75">
        ¿Ya tienes cuenta?
      </p>

      <Link
        href="/login"
        className="auth-form-reveal auth-form-delay-7 mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-lg border border-white/16 bg-white/8 px-5 text-sm font-bold text-white transition hover:bg-white/12 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d0e1fb]"
      >
        Iniciar sesión
      </Link>
    </form>
  );
}

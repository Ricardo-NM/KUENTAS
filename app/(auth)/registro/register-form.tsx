"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import {
  KeyIcon,
  type KeyIconHandle,
  LockKeyholeIcon,
  type LockIconHandle,
  MailCheckIcon,
  type MailCheckIconHandle,
  UserIcon,
  type UserIconHandle,
} from "lucide-animated";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getPasswordRequirements } from "@/lib/auth/password-requirements";
import { AnimatedFormMessage } from "../animated-form-message";
import { AuthNoticeModal } from "../auth-notice-modal";
import {
  registerAction,
  verifyRegistrationCodeAction,
  type AuthActionState,
} from "../actions";

const inputBaseClass =
  "min-h-12 w-full rounded-lg border bg-white/8 px-4 pl-12 text-sm text-white outline-none transition placeholder:text-[#c8c5cb]/55 focus:bg-white/12 focus:ring-2";
const normalInputClass =
  "border-white/14 focus:border-[#d0e1fb]/70 focus:ring-[#d0e1fb]/20";
const errorInputClass =
  "field-error-pulse border-[#ff453a] bg-[#ba1a1a]/10 focus:border-[#ff453a] focus:ring-[#ff453a]/20";

const initialState: AuthActionState = {
  status: "idle",
  step: "register",
};

function translateActionMessage(
  t: (key: string) => string,
  key: string | undefined,
  fallback: string | undefined,
) {
  if (!key) {
    return fallback;
  }

  const translated = t(key);

  return translated === key ? fallback : translated;
}

function useRemainingSeconds(until?: string) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!until) {
      return;
    }

    const interval = window.setInterval(() => setNow(Date.now()), 1000);

    return () => window.clearInterval(interval);
  }, [until]);

  return until
    ? Math.max(0, Math.ceil((new Date(until).getTime() - now) / 1000))
    : 0;
}

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

function VerifyRegistrationCodeForm({
  email,
  initialModalMessageKey,
}: {
  email: string;
  initialModalMessageKey?: string;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const [state, formAction, isPending] = useActionState(
    verifyRegistrationCodeAction,
    {
      ...initialState,
      step: "verify",
      email,
    },
  );
  const [code, setCode] = useState("");
  const [showInitialNotice, setShowInitialNotice] = useState(
    Boolean(initialModalMessageKey),
  );
  const codeIconRef = useRef<KeyIconHandle>(null);
  const normalizedCode = code.replace(/\D/g, "").slice(0, 6);
  const codeIsValid = normalizedCode.length === 6;
  const codeError = state.errors?.code?.[0];
  const formMessage =
    state.status === "error"
      ? translateActionMessage(t, state.messageKey, state.message)
      : undefined;
  const verifiedModalIsOpen =
    state.status === "success" && state.step === "verified";

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!codeIsValid) {
          event.preventDefault();
        }
      }}
      className="auth-form-reveal mb-2 w-full rounded-2xl border border-white/12 bg-white/10 px-6 py-8 shadow-[0_24px_70px_rgb(0_0_0/0.32)] backdrop-blur-md sm:px-8 lg:mb-20"
    >
      <h1 className="auth-form-reveal auth-form-delay-1 font-heading text-2xl font-bold leading-8 text-white">
        {t("recovery.verificationTitle")}
      </h1>

      <p className="auth-form-reveal auth-form-delay-2 mt-3 rounded-lg border border-white/14 bg-white/8 px-4 py-3 text-sm font-medium leading-6 text-[#eff1f3]">
        {t("register.codeSentMessage", { email })}
      </p>

      <input type="hidden" name="email" value={email} />

      <div className="auth-form-reveal auth-form-delay-2 mt-5">
        <label
          htmlFor="registrationVerificationCode"
          className="text-sm font-semibold text-[#eff1f3]"
        >
          {t("recovery.verificationCode")}
        </label>
        <div className="relative mt-2">
          <input
            id="registrationVerificationCode"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder={t("recovery.verificationCodePlaceholder")}
            value={normalizedCode}
            required
            maxLength={6}
            aria-invalid={Boolean(codeError)}
            aria-describedby={
              codeError ? "registration-verification-code-error" : undefined
            }
            onChange={(event) => setCode(event.target.value)}
            onFocus={() => codeIconRef.current?.startAnimation()}
            onBlur={() => codeIconRef.current?.stopAnimation()}
            className={`${inputBaseClass} ${
              codeError ? errorInputClass : normalInputClass
            } font-mono tracking-[0.16em]`}
          />
          <KeyIcon
            ref={codeIconRef}
            aria-hidden="true"
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#d0e1fb]"
          />
        </div>
        <AnimatedFormMessage
          id="registration-verification-code-error"
          message={codeError}
          tone="error"
          spacingClassName="pt-2"
        />
      </div>

      <AnimatedFormMessage
        id="registration-verification-message"
        message={formMessage}
        tone="error"
        align="center"
        spacingClassName="pt-5"
      />

      <button
        type="submit"
        disabled={isPending || !codeIsValid || verifiedModalIsOpen}
        className="auth-form-reveal auth-form-delay-3 mt-5 inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-lg bg-[#d0e1fb] px-5 text-sm font-bold text-[#0b1c30] transition hover:bg-[#b7c8e1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d0e1fb] disabled:cursor-not-allowed disabled:opacity-55"
      >
        {isPending ? t("recovery.verifyingCode") : t("recovery.verifyCode")}
      </button>

      <Link
        href="/login"
        className="auth-form-reveal auth-form-delay-4 mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-lg border border-white/16 bg-white/8 px-5 text-sm font-bold text-white transition hover:bg-white/12 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d0e1fb]"
      >
        {t("recovery.backToLogin")}
      </Link>

      <AuthNoticeModal
        isOpen={showInitialNotice && Boolean(initialModalMessageKey)}
        title={t("recovery.verificationTitle")}
        body={t(initialModalMessageKey ?? "register.codeSentMessage", {
          email,
        })}
        actionLabel={t("recovery.requestNoticeAction")}
        onClose={() => setShowInitialNotice(false)}
      />
      <AuthNoticeModal
        isOpen={verifiedModalIsOpen}
        title={t("register.accountVerifiedTitle")}
        body={t(state.modalMessageKey ?? "register.accountVerifiedMessage")}
        actionLabel={t("register.accountVerifiedAction")}
        onClose={() => router.push("/login")}
      />
    </form>
  );
}

export function RegisterForm() {
  const { i18n, t } = useTranslation();
  const [state, formAction, isPending] = useActionState(
    registerAction,
    initialState,
  );
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
  const repeatPasswordDoesNotMatch =
    repeatPasswordTouched && repeatPassword !== password;

  const passwordRequirements = useMemo(
    () => getPasswordRequirements(password),
    [password],
  );

  const passwordIsValid = passwordRequirements.every(
    (requirement) => requirement.isMet,
  );
  const remainingSeconds = useRemainingSeconds(state.cooldownUntil);
  const cooldownIsActive = remainingSeconds > 0;
  const serverEmailError =
    state.messageKey === "validation.emailRegistered"
      ? translateActionMessage(t, state.messageKey, state.message)
      : state.errors?.email?.[0];
  const serverGeneralError =
    state.messageKey && state.messageKey !== "validation.emailRegistered"
      ? state.messageKey === "validation.accountVerificationCooldown"
        ? translateActionMessage(
            (key) => t(key, { seconds: remainingSeconds }),
            state.messageKey,
            state.message,
          )
        : translateActionMessage(t, state.messageKey, state.message)
      : state.message;
  const showEmailError =
    (emailTouched && !emailIsValid) || Boolean(serverEmailError);
  const canSubmit =
    emailIsValid &&
    passwordIsValid &&
    repeatPassword.length > 0 &&
    repeatPassword === password;

  if (state.step === "verify" && state.email) {
    return (
      <VerifyRegistrationCodeForm
        email={state.email}
        initialModalMessageKey={state.modalMessageKey}
      />
    );
  }

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        setEmailTouched(true);
        setRepeatPasswordTouched(true);

        if (!canSubmit || cooldownIsActive) {
          event.preventDefault();
        }
      }}
      className="auth-form-reveal mb-2 w-full rounded-2xl border border-white/12 bg-white/10 px-6 py-7 shadow-[0_24px_70px_rgb(0_0_0/0.32)] backdrop-blur-md sm:px-8 lg:mb-12"
    >
      <h1 className="auth-form-reveal auth-form-delay-1 font-heading text-2xl font-bold leading-8 text-white">
        {t("register.title")}
      </h1>

      <input
        type="hidden"
        name="language"
        value={i18n.resolvedLanguage ?? i18n.language}
      />

      <div className="mt-6 space-y-4">
        <div className="auth-form-reveal auth-form-delay-2 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="firstName"
              className="text-sm font-semibold text-[#eff1f3]"
            >
              {t("register.firstName")}
            </label>
            <div className="relative">
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                placeholder={t("register.firstNamePlaceholder")}
                required
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
              {t("register.lastName")}
            </label>
            <div className="relative">
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                placeholder={t("register.lastNamePlaceholder")}
                required
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

        <div className="auth-form-reveal auth-form-delay-3">
          <label
            htmlFor="registerEmail"
            className="text-sm font-semibold text-[#eff1f3]"
          >
            {t("common.email")}
          </label>
          <div className="relative mt-2">
            <input
              id="registerEmail"
              name="email"
              type="email"
              autoComplete="email"
              placeholder={t("common.submitEmailPlaceholder")}
              value={email}
              required
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
          <AnimatedFormMessage
            id="registerEmail-error"
            message={
              showEmailError
                ? (serverEmailError ?? t("validation.invalidEmail"))
                : undefined
            }
            tone="error"
            spacingClassName="pt-2"
          />
        </div>

        <div className="auth-form-reveal auth-form-delay-4 space-y-2">
          <label
            htmlFor="registerPassword"
            className="text-sm font-semibold text-[#eff1f3]"
          >
            {t("common.password")}
          </label>
          <div className="relative">
            <input
              id="registerPassword"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder={t("common.passwordPlaceholder")}
              value={password}
              required
              onChange={(event) => setPassword(event.target.value)}
              onFocus={() => passwordIconRef.current?.startAnimation()}
              onBlur={() => passwordIconRef.current?.stopAnimation()}
              className={`${inputBaseClass} ${normalInputClass} pr-14`}
            />
            <LockKeyholeIcon
              ref={passwordIconRef}
              aria-hidden="true"
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#d0e1fb]"
            />
            <VisibilityButton
              isVisible={showPassword}
              label={
                showPassword
                  ? t("common.hidePassword")
                  : t("common.showPassword")
              }
              onClick={() => setShowPassword((current) => !current)}
            />
          </div>

          <ul className="grid gap-2 pt-1 text-xs font-medium sm:grid-cols-2">
            {passwordRequirements.map((requirement) => (
              <RequirementItem
                key={requirement.labelKey}
                isMet={requirement.isMet}
                label={t(requirement.labelKey)}
              />
            ))}
          </ul>
        </div>

        <div className="auth-form-reveal auth-form-delay-5">
          <label
            htmlFor="repeatPassword"
            className="text-sm font-semibold text-[#eff1f3]"
          >
            {t("register.repeatPassword")}
          </label>
          <div className="relative mt-2">
            <input
              id="repeatPassword"
              name="repeatPassword"
              type={showRepeatPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder={t("common.passwordPlaceholder")}
              value={repeatPassword}
              required
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
            <LockKeyholeIcon
              ref={repeatPasswordIconRef}
              aria-hidden="true"
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#d0e1fb]"
            />
            <VisibilityButton
              isVisible={showRepeatPassword}
              label={
                showRepeatPassword
                  ? t("register.hideRepeatPassword")
                  : t("register.showRepeatPassword")
              }
              onClick={() => setShowRepeatPassword((current) => !current)}
            />
          </div>
          <AnimatedFormMessage
            id="repeatPassword-error"
            message={
              repeatPasswordDoesNotMatch
                ? t("validation.passwordMismatch")
                : undefined
            }
            tone="error"
            spacingClassName="pt-2"
          />
        </div>
      </div>

      <AnimatedFormMessage
        message={serverGeneralError}
        tone="error"
        align="center"
        spacingClassName="pt-4"
        textClassName="text-sm font-semibold"
      />

      <button
        type="submit"
        disabled={isPending || !canSubmit || cooldownIsActive}
        className="auth-form-reveal auth-form-delay-6 mt-5 inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-lg bg-[#d0e1fb] px-5 text-sm font-bold text-[#0b1c30] transition hover:bg-[#b7c8e1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d0e1fb] disabled:cursor-not-allowed disabled:opacity-55"
      >
        {isPending
          ? t("register.submitting")
          : cooldownIsActive
            ? t("recovery.cooldownButton", { seconds: remainingSeconds })
            : t("register.submit")}
      </button>

      <p className="auth-form-reveal auth-form-delay-7 mt-5 text-center text-xs font-medium text-[#eff1f3]/75">
        {t("register.alreadyAccount")}
      </p>

      <Link
        href="/login"
        className="auth-form-reveal auth-form-delay-7 mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-lg border border-white/16 bg-white/8 px-5 text-sm font-bold text-white transition hover:bg-white/12 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d0e1fb]"
      >
        {t("common.login")}
      </Link>
    </form>
  );
}

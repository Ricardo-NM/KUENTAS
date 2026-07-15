"use client";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import {
  LockIcon,
  type LockIconHandle,
  MailCheckIcon,
  type MailCheckIconHandle,
} from "lucide-animated";
import { useActionState, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  getPasswordRequirements,
  shouldShowPasswordMismatch,
} from "@/lib/auth/password-requirements";
import {
  requestPasswordResetAction,
  resetPasswordAction,
  type RecoveryActionState,
} from "./actions";
import { AnimatedFormMessage } from "../animated-form-message";

const inputBaseClass =
  "min-h-12 w-full rounded-lg border bg-white/8 px-4 pl-12 text-sm text-white outline-none transition placeholder:text-[#c8c5cb]/55 focus:bg-white/12 focus:ring-2";
const normalInputClass =
  "border-white/14 focus:border-[#d0e1fb]/70 focus:ring-[#d0e1fb]/20";
const errorInputClass =
  "field-error-pulse border-[#ff453a] bg-[#ba1a1a]/10 focus:border-[#ff453a] focus:ring-[#ff453a]/20";
const initialState: RecoveryActionState = {
  status: "idle",
};

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

function RequestResetForm() {
  const { t } = useTranslation();
  const [state, formAction, isPending] = useActionState(
    requestPasswordResetAction,
    initialState,
  );
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const emailIconRef = useRef<MailCheckIconHandle>(null);
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const emailError = state.errors?.email?.[0];
  const showEmailError = (emailTouched && !emailIsValid) || Boolean(emailError);
  const formMessage = state.messageKey ? t(state.messageKey) : state.message;

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        setEmailTouched(true);

        if (!emailIsValid) {
          event.preventDefault();
        }
      }}
      className="auth-form-reveal mb-2 w-full rounded-2xl border border-white/12 bg-white/10 px-6 py-8 shadow-[0_24px_70px_rgb(0_0_0/0.32)] backdrop-blur-md sm:px-8 lg:mb-20"
    >
      <h1 className="auth-form-reveal auth-form-delay-1 font-heading text-2xl font-bold leading-8 text-white">
        {t("recovery.requestTitle")}
      </h1>

      <div className="auth-form-reveal auth-form-delay-2 mt-7">
        <label
          htmlFor="recoveryEmail"
          className="text-sm font-semibold text-[#eff1f3]"
        >
          {t("common.email")}
        </label>
        <div className="relative mt-2">
          <input
            id="recoveryEmail"
            name="email"
            type="email"
            autoComplete="email"
            placeholder={t("common.submitEmailPlaceholder")}
            value={email}
            required
            aria-invalid={showEmailError}
            aria-describedby={showEmailError ? "recovery-email-error" : undefined}
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
          id="recovery-email-error"
          message={
            showEmailError
              ? emailError ?? t("validation.invalidEmail")
              : undefined
          }
          tone="error"
          spacingClassName="pt-2"
        />
      </div>

      <AnimatedFormMessage
        id="recovery-message"
        message={formMessage}
        tone={state.status === "error" ? "error" : "success"}
        align="center"
        spacingClassName="pt-5"
      />
      {state.devResetUrl ? (
        <Link
          href={state.devResetUrl}
          className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-white/16 bg-white/8 px-5 text-sm font-bold text-white transition hover:bg-white/12 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d0e1fb]"
        >
          {t("recovery.openResetLink")}
        </Link>
      ) : null}

      <button
        type="submit"
        disabled={isPending || !emailIsValid}
        className="auth-form-reveal auth-form-delay-3 mt-5 inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-lg bg-[#d0e1fb] px-5 text-sm font-bold text-[#0b1c30] transition hover:bg-[#b7c8e1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d0e1fb] disabled:cursor-not-allowed disabled:opacity-55"
      >
        {isPending ? t("recovery.submittingRequest") : t("recovery.sendLink")}
      </button>

      <Link
        href="/login"
        className="auth-form-reveal auth-form-delay-4 mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-lg border border-white/16 bg-white/8 px-5 text-sm font-bold text-white transition hover:bg-white/12 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d0e1fb]"
      >
        {t("recovery.backToLogin")}
      </Link>
    </form>
  );
}

function ResetPasswordForm({ token }: { token: string }) {
  const { t } = useTranslation();
  const [state, formAction, isPending] = useActionState(
    resetPasswordAction,
    initialState,
  );
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const passwordIconRef = useRef<LockIconHandle>(null);
  const repeatPasswordIconRef = useRef<LockIconHandle>(null);
  const passwordRequirements = useMemo(
    () => getPasswordRequirements(password),
    [password],
  );
  const passwordIsValid = passwordRequirements.every(
    (requirement) => requirement.isMet,
  );
  const repeatPasswordDoesNotMatch = shouldShowPasswordMismatch(
    password,
    repeatPassword,
  );
  const canSubmit =
    passwordIsValid && repeatPassword.length > 0 && repeatPassword === password;
  const formMessage =
    state.status === "success"
      ? t("validation.passwordUpdated")
      : state.messageKey
        ? t(state.messageKey)
        : state.message ??
          state.errors?.repeatPassword?.[0] ??
          state.errors?.password?.[0];

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!canSubmit) {
          event.preventDefault();
        }
      }}
      className="auth-form-reveal mb-2 w-full rounded-2xl border border-white/12 bg-white/10 px-6 py-8 shadow-[0_24px_70px_rgb(0_0_0/0.32)] backdrop-blur-md sm:px-8 lg:mb-20"
    >
      <h1 className="auth-form-reveal auth-form-delay-1 font-heading text-2xl font-bold leading-8 text-white">
        {t("recovery.resetTitle")}
      </h1>

      <input type="hidden" name="token" value={token} />

      <div className="mt-7 space-y-5">
        <div className="auth-form-reveal auth-form-delay-2 space-y-2">
          <label
            htmlFor="newPassword"
            className="text-sm font-semibold text-[#eff1f3]"
          >
            {t("common.password")}
          </label>
          <div className="relative">
            <input
              id="newPassword"
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
            <LockIcon
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

        <div className="auth-form-reveal auth-form-delay-3">
          <label
            htmlFor="repeatNewPassword"
            className="text-sm font-semibold text-[#eff1f3]"
          >
            {t("recovery.repeatNewPassword")}
          </label>
          <div className="relative mt-2">
            <input
              id="repeatNewPassword"
              name="repeatPassword"
              type={showRepeatPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder={t("common.passwordPlaceholder")}
              value={repeatPassword}
              required
              aria-invalid={repeatPasswordDoesNotMatch}
              aria-describedby={
                repeatPasswordDoesNotMatch
                  ? "repeatNewPassword-error"
                  : undefined
              }
              onChange={(event) => setRepeatPassword(event.target.value)}
              onFocus={() => repeatPasswordIconRef.current?.startAnimation()}
              onBlur={() => repeatPasswordIconRef.current?.stopAnimation()}
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
                  ? t("register.hideRepeatPassword")
                  : t("register.showRepeatPassword")
              }
              onClick={() => setShowRepeatPassword((current) => !current)}
            />
          </div>
          <AnimatedFormMessage
            id="repeatNewPassword-error"
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
        id="reset-message"
        message={formMessage}
        tone={state.status === "success" ? "success" : "error"}
        align="center"
        spacingClassName="pt-5"
      />

      <button
        type="submit"
        disabled={isPending || !canSubmit || state.status === "success"}
        className="auth-form-reveal auth-form-delay-4 mt-5 inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-lg bg-[#d0e1fb] px-5 text-sm font-bold text-[#0b1c30] transition hover:bg-[#b7c8e1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d0e1fb] disabled:cursor-not-allowed disabled:opacity-55"
      >
        {isPending ? t("recovery.submittingReset") : t("recovery.updatePassword")}
      </button>

      <Link
        href="/login"
        className="auth-form-reveal auth-form-delay-5 mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-lg border border-white/16 bg-white/8 px-5 text-sm font-bold text-white transition hover:bg-white/12 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d0e1fb]"
      >
        {t("recovery.backToLogin")}
      </Link>
    </form>
  );
}

export function RecoveryForm({ token }: { token?: string }) {
  return token ? <ResetPasswordForm token={token} /> : <RequestResetForm />;
}

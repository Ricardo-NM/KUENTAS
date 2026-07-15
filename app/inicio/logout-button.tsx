"use client";

import { LogOut } from "lucide-react";
import { useFormStatus } from "react-dom";
import { useTranslation } from "react-i18next";
import { logoutAction } from "./actions";

function SubmitButton() {
  const { t } = useTranslation();
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#111827] px-5 text-sm font-semibold text-white transition hover:bg-[#1f2937] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111827] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <LogOut aria-hidden="true" size={18} />
      {pending ? t("inicio.loggingOut") : t("inicio.logout")}
    </button>
  );
}

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <SubmitButton />
    </form>
  );
}

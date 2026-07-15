"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";

export function AuthBrandPanel() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[280px] flex-col justify-end pb-2 lg:min-h-[520px] lg:pb-20">
      <div className="max-w-md">
        <Image
          src="/graphics/kuentas-login-graphic.svg"
          alt=""
          aria-hidden="true"
          width={320}
          height={320}
          unoptimized
          priority
          className="login-reveal login-delay-2 mb-7 h-56 w-56 object-contain sm:h-72 sm:w-72 lg:h-80 lg:w-80"
        />
        <p className="login-reveal login-delay-3 font-heading text-5xl font-bold leading-none tracking-normal text-white sm:text-6xl">
          {t("common.appName")}
        </p>
        <p className="login-reveal login-delay-4 mt-5 max-w-sm text-balance text-2xl font-semibold leading-8 text-[#eff1f3] sm:text-3xl sm:leading-10">
          {t("brand.slogan")}
        </p>
      </div>
    </div>
  );
}

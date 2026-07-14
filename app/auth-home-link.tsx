"use client";

import Link from "next/link";
import { HomeIcon, type HomeIconHandle } from "lucide-animated";
import { useRef } from "react";

export function HomeLink() {
  const homeIconRef = useRef<HomeIconHandle>(null);

  return (
    <Link
      href="/"
      aria-label="Volver al inicio"
      onMouseEnter={() => homeIconRef.current?.startAnimation()}
      onMouseLeave={() => homeIconRef.current?.stopAnimation()}
      onFocus={() => homeIconRef.current?.startAnimation()}
      onBlur={() => homeIconRef.current?.stopAnimation()}
      className="login-reveal login-delay-1 absolute left-4 top-4 z-10 inline-flex size-12 items-center justify-center rounded-2xl border border-white/12 bg-white/10 text-[#d0e1fb] shadow-[0_16px_48px_rgb(0_0_0/0.24)] backdrop-blur-md transition hover:bg-white/14 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d0e1fb] sm:left-8 sm:top-8"
    >
      <HomeIcon ref={homeIconRef} aria-hidden="true" size={22} />
    </Link>
  );
}

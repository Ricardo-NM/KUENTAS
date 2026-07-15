import { AuthBrandPanel } from "../auth-brand-panel";
import { HomeLink } from "../auth-home-link";
import { LanguageSwitcher } from "./language-switcher";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#0d0d12] px-4 py-8 text-[#eff1f3] sm:px-8 lg:px-12">
      <HomeLink />
      <LanguageSwitcher />

      <section className="relative mx-auto grid min-h-[calc(100dvh-4rem)] w-full max-w-6xl items-end gap-10 lg:grid-cols-[1fr_500px] lg:gap-16">
        <AuthBrandPanel />
        {children}
      </section>
    </main>
  );
}

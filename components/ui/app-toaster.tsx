"use client";

import type { CSSProperties } from "react";
import { Toaster } from "react-hot-toast";

const sharedToastStyle: CSSProperties = {
  width: "fit-content",
  maxWidth: "min(420px, calc(100vw - 32px))",
  borderRadius: "0.75rem",
  border: "1px solid var(--outline-variant)",
  background: "var(--popover)",
  color: "var(--popover-foreground)",
  boxShadow: "0 18px 40px rgb(13 13 18 / 0.16)",
  fontFamily: "var(--font-inter), Arial, Helvetica, sans-serif",
  fontSize: "0.875rem",
  fontWeight: 700,
  lineHeight: 1.4,
  padding: "0.75rem 1rem",
  textAlign: "center",
  wordBreak: "break-word",
};

export function AppToaster() {
  return (
    <Toaster
      position="bottom-center"
      gutter={8}
      containerStyle={{
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)",
        left: "1rem",
        right: "1rem",
      }}
      toastOptions={{
        duration: 3000,
        style: sharedToastStyle,
        success: {
          iconTheme: {
            primary: "var(--chart-1)",
            secondary: "var(--background)",
          },
          style: {
            ...sharedToastStyle,
            borderColor:
              "color-mix(in srgb, var(--chart-1) 35%, var(--outline-variant))",
            background:
              "color-mix(in srgb, var(--chart-1) 10%, var(--popover))",
            color: "var(--chart-1)",
          },
        },
        error: {
          iconTheme: {
            primary: "var(--destructive)",
            secondary: "var(--background)",
          },
          style: {
            ...sharedToastStyle,
            borderColor:
              "color-mix(in srgb, var(--destructive) 35%, var(--outline-variant))",
            background:
              "color-mix(in srgb, var(--destructive) 10%, var(--popover))",
            color: "var(--destructive)",
          },
        },
      }}
    />
  );
}

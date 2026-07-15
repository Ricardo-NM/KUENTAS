"use client";

import { useEffect, useRef, useState } from "react";
import { formMessageAnimationMs } from "@/lib/ui/form-message-animation";

type AnimationPhase = "hidden" | "closed" | "open";

type AnimatedFormMessageProps = {
  id?: string;
  message?: string;
  tone: "error" | "success";
  align?: "left" | "center";
  className?: string;
  spacingClassName?: string;
  textClassName?: string;
  role?: "alert" | "status";
};

export function AnimatedFormMessage({
  id,
  message,
  tone,
  align = "left",
  className = "",
  spacingClassName = "",
  textClassName = "text-xs font-medium",
  role,
}: AnimatedFormMessageProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [renderedMessage, setRenderedMessage] = useState(message);
  const [phase, setPhase] = useState<AnimationPhase>(
    message ? "open" : "hidden",
  );
  const [height, setHeight] = useState<number | undefined>(undefined);
  const isOpen = phase === "open";

  useEffect(() => {
    let renderFrame = 0;
    let measureFrame = 0;
    let closeTimeout = 0;

    if (message) {
      renderFrame = window.requestAnimationFrame(() => {
        setRenderedMessage(message);
        setHeight(0);
        setPhase("closed");

        measureFrame = window.requestAnimationFrame(() => {
          const contentHeight = contentRef.current?.scrollHeight ?? 0;
          setHeight(contentHeight);
          setPhase("open");
        });
      });

      return () => {
        window.cancelAnimationFrame(renderFrame);
        window.cancelAnimationFrame(measureFrame);
      };
    }

    renderFrame = window.requestAnimationFrame(() => {
      setHeight(contentRef.current?.scrollHeight ?? 0);

      measureFrame = window.requestAnimationFrame(() => {
        setHeight(0);
        setPhase("closed");
        closeTimeout = window.setTimeout(() => {
          setPhase("hidden");
          setRenderedMessage(undefined);
          setHeight(undefined);
        }, formMessageAnimationMs);
      });
    });

    return () => {
      window.cancelAnimationFrame(renderFrame);
      window.cancelAnimationFrame(measureFrame);
      window.clearTimeout(closeTimeout);
    };
  }, [message]);

  if (phase === "hidden") {
    return null;
  }

  return (
    <div
      style={{
        height,
        transitionDuration: `${formMessageAnimationMs}ms`,
      }}
      className={`overflow-hidden transition-[height,opacity,transform] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
        isOpen
          ? "translate-y-0 opacity-100"
          : "-translate-y-0.5 opacity-0"
      } ${className}`}
    >
      <div ref={contentRef} className={spacingClassName}>
        <p
          id={id}
          role={role}
          aria-live="polite"
          className={`${textClassName} ${
            align === "center" ? "text-center" : "text-left"
          } ${tone === "error" ? "text-[#ff453a]" : "text-[#10b981]"}`}
        >
          {message ?? renderedMessage}
        </p>
      </div>
    </div>
  );
}

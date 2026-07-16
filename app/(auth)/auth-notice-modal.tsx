"use client";

import { AnimatePresence, motion } from "motion/react";
import { createPortal } from "react-dom";

export function AuthNoticeModal({
  isOpen,
  title,
  body,
  actionLabel,
  onClose,
}: {
  isOpen: boolean;
  title: string;
  body: string;
  actionLabel: string;
  onClose: () => void;
}) {
  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          role="presentation"
          className="fixed inset-0 z-50 grid place-items-center bg-inverse-surface/45 px-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-notice-title"
            aria-describedby="auth-notice-description"
            className="w-full max-w-sm rounded-2xl border border-white/14 bg-[#eff1f3] p-6 text-[#0b1c30] shadow-[0_24px_70px_rgb(0_0_0/0.36)]"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <h2
              id="auth-notice-title"
              className="font-heading text-xl font-bold leading-7"
            >
              {title}
            </h2>
            <p
              id="auth-notice-description"
              className="mt-3 text-sm leading-6 text-[#38485d]"
            >
              {body}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-lg bg-[#0d0d12] px-4 text-sm font-bold text-white transition hover:bg-[#1b1b20] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d0d12]"
            >
              {actionLabel}
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

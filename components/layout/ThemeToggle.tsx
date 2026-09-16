"use client";

import { AnimatePresence, motion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/layout/Providers";
import { useMounted } from "@/lib/hooks";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const mounted = useMounted();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light mode" : "Dark mode"}
      className="relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-sm border border-border bg-surface text-fg transition-colors duration-300 hover:border-border-strong hover:bg-surface-hover"
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={mounted ? theme : "ssr"}
          initial={{ y: 10, opacity: 0, rotate: -30 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -10, opacity: 0, rotate: 30 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex"
        >
          {isDark ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

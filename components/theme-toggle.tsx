"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className="w-9 h-9 rounded-full border border-[var(--border)] flex items-center justify-center opacity-50">
        <span className="text-xs font-body">○</span>
      </button>
    )
  }

  const isDark = theme === "dark" || (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches)

  return (
    <motion.button
      className="w-9 h-9 rounded-full border border-[var(--border)] flex items-center justify-center overflow-hidden hover:bg-[var(--surface-hover)] transition-colors"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={isDark ? "dark" : "light"}
          initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.2 }}
          className="text-xs font-body"
        >
          {isDark ? "○" : "●"}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}

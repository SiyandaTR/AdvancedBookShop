"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Settings } from "lucide-react"

interface SettingsPopupProps {
  settings: {
    fontSize: number; fontColor: string; fontType: string; cursorStyle: string
    readingMode: boolean; ignoreCapitalization: boolean; skipPunctuation: boolean; stopCursorAfterMistake: boolean
  }
  setSettings: React.Dispatch<React.SetStateAction<SettingsPopupProps["settings"]>>
}

export function SettingsPopup({ settings, setSettings }: SettingsPopupProps) {
  const [open, setOpen] = useState(false)

  const handleChange = (key: keyof SettingsPopupProps["settings"], value: string | number | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-7 h-7 rounded-full flex items-center justify-center border border-[var(--border)] hover:bg-[var(--surface-hover)] hover:border-[var(--fg-subtle)] transition-all"
      >
        <Settings className="h-3.5 w-3.5 text-fg-muted" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/20 z-[100]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="fixed inset-0 z-[101] flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-full max-w-sm bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-xl"
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-heading text-lg font-bold">Settings</h3>
                  <button onClick={() => setOpen(false)} className="text-fg-muted hover:text-[var(--fg)] transition-colors text-lg leading-none">&times;</button>
                </div>

                <div className="space-y-5">
                  {/* Font Size */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-body text-fg-muted">Font size</label>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleChange("fontSize", Math.max(12, settings.fontSize - 1))} className="w-7 h-7 rounded-full border border-[var(--border)] flex items-center justify-center text-sm hover:bg-[var(--surface-hover)] transition-colors">−</button>
                      <span className="text-sm font-body tabular-nums w-8 text-center">{settings.fontSize}</span>
                      <button onClick={() => handleChange("fontSize", Math.min(28, settings.fontSize + 1))} className="w-7 h-7 rounded-full border border-[var(--border)] flex items-center justify-center text-sm hover:bg-[var(--surface-hover)] transition-colors">+</button>
                    </div>
                  </div>

                  {/* Font Type */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-body text-fg-muted">Font</label>
                    <select
                      value={settings.fontType}
                      onChange={(e) => handleChange("fontType", e.target.value)}
                      className="text-sm font-body bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-1.5 outline-none focus:border-[var(--fg-muted)]"
                    >
                      <option value="Roboto">Roboto</option>
                      <option value="Rufina">Rufina</option>
                      <option value="monospace">Monospace</option>
                      <option value="Arial">Arial</option>
                    </select>
                  </div>

                  {/* Cursor Style */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-body text-fg-muted">Cursor</label>
                    <select
                      value={settings.cursorStyle}
                      onChange={(e) => handleChange("cursorStyle", e.target.value)}
                      className="text-sm font-body bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-1.5 outline-none focus:border-[var(--fg-muted)]"
                    >
                      <option value="line">Line</option>
                      <option value="block">Block</option>
                      <option value="underline">Underline</option>
                    </select>
                  </div>

                  {/* Font Color */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-body text-fg-muted">Color</label>
                    <input
                      type="color"
                      value={settings.fontColor || "#111111"}
                      onChange={(e) => handleChange("fontColor", e.target.value)}
                      className="w-8 h-8 rounded-lg border border-[var(--border)] cursor-pointer bg-transparent"
                    />
                  </div>

                  <div className="border-t border-[var(--border)] pt-4 space-y-3">
                    <ToggleRow label="Reading mode" checked={settings.readingMode} onChange={(v) => handleChange("readingMode", v)} />
                    <ToggleRow label="Ignore caps" checked={settings.ignoreCapitalization} onChange={(v) => handleChange("ignoreCapitalization", v)} />
                    <ToggleRow label="Skip punctuation" checked={settings.skipPunctuation} onChange={(v) => handleChange("skipPunctuation", v)} />
                    <ToggleRow label="Stop after mistake" checked={settings.stopCursorAfterMistake} onChange={(v) => handleChange("stopCursorAfterMistake", v)} />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-body text-fg-muted">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${checked ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`}
      >
        <motion.span
          className="absolute top-0.5 w-4 h-4 rounded-full bg-[var(--bg)] shadow-sm"
          animate={{ left: checked ? "18px" : "2px" }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  )
}

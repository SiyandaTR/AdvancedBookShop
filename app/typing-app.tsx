"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { PDFUploader } from "./routs/pdf-uploader"
import { TypingInterface } from "./routs/typing-interface"
import { AnalyticsPanel } from "./routs/analytics-panel"
import { ThemeToggle } from "@/components/theme-toggle"
import { BookOpen, FileText, BarChart3, LogOut } from "lucide-react"

export interface PDFData {
  id?: string
  name: string
  text: string
}

export interface SessionData {
  id: string
  wpm: number
  accuracy: number
  source: string
  chars_typed: number
  time_spent_seconds: number
  correct_keystrokes: number
  total_mistakes: number
  completed_at: string
}

const ANALYTICS_CACHE_KEY = "typing_analytics_cache"

function loadCachedSessions(): SessionData[] {
  if (typeof window === "undefined") return []
  try {
    const cached = localStorage.getItem(ANALYTICS_CACHE_KEY)
    if (cached) return JSON.parse(cached)
  } catch {}
  return []
}

function saveSessionsToCache(sessions: SessionData[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(ANALYTICS_CACHE_KEY, JSON.stringify(sessions))
  } catch {}
}

const tabs = [
  { id: "typing", label: "Type", icon: BookOpen },
  { id: "pdfs", label: "PDFs", icon: FileText },
  { id: "analytics", label: "Stats", icon: BarChart3 },
]

const pageVariants = {
  initial: { opacity: 0, y: 10, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, y: -6, filter: "blur(4px)", transition: { duration: 0.2 } },
}

export default function TypingApp({ email }: { email: string }) {
  const [currentPDF, setCurrentPDF] = useState<PDFData | null>(null)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [activeTab, setActiveTab] = useState("typing")
  const hasFetched = useRef(false)

  const fetchSessions = useCallback(async () => {
    const cached = loadCachedSessions()
    if (cached.length > 0) setSessions(cached)
    try {
      const res = await fetch("/api/analytics")
      if (res.ok) {
        const data = await res.json()
        setSessions(data)
        saveSessionsToCache(data)
      }
    } catch {
      if (cached.length === 0) setSessions([])
    }
  }, [])

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true
      fetchSessions()
    }
  }, [fetchSessions])

  const handlePDFSelect = (pdf: PDFData) => {
    setCurrentPDF(pdf)
    setActiveTab("typing")
  }

  const handleRemovePDF = () => setCurrentPDF(null)

  const updateAnalytics = async (metrics: {
    wpm: number; accuracy: number; charsTyped: number; timeSpentSeconds: number; correctKeystrokes: number; totalMistakes: number
  }) => {
    setWpm(metrics.wpm)
    setAccuracy(metrics.accuracy)
    const source = currentPDF ? currentPDF.name : "default"
    try {
      const res = await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wpm: metrics.wpm, accuracy: metrics.accuracy, source,
          chars_typed: metrics.charsTyped, time_spent_seconds: metrics.timeSpentSeconds,
          correct_keystrokes: metrics.correctKeystrokes, total_mistakes: metrics.totalMistakes,
        }),
      })
      if (res.ok) {
        const newSession = await res.json()
        setSessions((prev) => {
          const updated = [newSession, ...prev]
          saveSessionsToCache(updated)
          return updated
        })
      }
    } catch {}
  }

  return (
    <motion.div className="min-h-screen flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      {/* Header */}
      <motion.header
        className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-sm"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="max-w-5xl mx-auto flex h-14 items-center justify-between px-6">
          <Link href="/app" className="font-heading text-lg font-bold tracking-tight hover:opacity-70 transition-opacity">
            typeloft
          </Link>

          <div className="flex items-center gap-1">
            <nav className="flex items-center border border-[var(--border)] rounded-full p-0.5 mr-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-body font-medium transition-colors ${
                    activeTab === tab.id ? "text-[var(--accent-fg)]" : "text-fg-muted hover:text-[var(--fg)]"
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.div layoutId="active-tab" className="absolute inset-0 bg-[var(--accent)] rounded-full" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <tab.icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </span>
                </button>
              ))}
            </nav>
            <span className="text-xs text-fg-subtle font-body hidden md:inline mr-2">{email}</span>
            <ThemeToggle />
            <Link href="/auth/sign-out" className="w-9 h-9 rounded-full border border-[var(--border)] flex items-center justify-center hover:bg-[var(--surface-hover)] transition-colors">
              <LogOut className="h-3.5 w-3.5 text-fg-muted" />
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === "typing" && (
            <motion.div key="typing" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <TypingInterface updateAnalytics={updateAnalytics} pdfText={currentPDF?.text ?? null} pdfName={currentPDF?.name ?? null} onClearPDF={handleRemovePDF} />
            </motion.div>
          )}
          {activeTab === "pdfs" && (
            <motion.div key="pdfs" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <PDFUploader currentPDF={currentPDF} onPDFSelect={handlePDFSelect} onRemovePDF={handleRemovePDF} />
            </motion.div>
          )}
          {activeTab === "analytics" && (
            <motion.div key="analytics" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <AnalyticsPanel wpm={wpm} accuracy={accuracy} sessions={sessions} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-[var(--border)] py-4">
        <div className="max-w-5xl mx-auto px-6 text-center text-xs text-fg-subtle font-body">typeloft</div>
      </footer>
    </motion.div>
  )
}

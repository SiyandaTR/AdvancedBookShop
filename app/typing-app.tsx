"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { PDFUploader } from './routs/pdf-uploader'
import { TypingInterface } from './routs/typing-interface'
import { AnalyticsPanel } from './routs/analytics-panel'
import { ThemeToggle } from '@/components/theme-toggle'
import { BookOpen, FileText, BarChart3, LogOut } from 'lucide-react'

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
  } catch {
    // Ignore corrupt cache
  }
  return []
}

function saveSessionsToCache(sessions: SessionData[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(ANALYTICS_CACHE_KEY, JSON.stringify(sessions))
  } catch {
    // Ignore storage errors
  }
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
    if (cached.length > 0) {
      setSessions(cached)
    }

    try {
      const res = await fetch("/api/analytics")
      if (res.ok) {
        const data = await res.json()
        setSessions(data)
        saveSessionsToCache(data)
      }
    } catch {
      // Use cached data if API fails
      if (cached.length === 0) {
        setSessions([])
      }
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

  const handleRemovePDF = () => {
    setCurrentPDF(null)
  }

  const updateAnalytics = async (metrics: {
    wpm: number
    accuracy: number
    charsTyped: number
    timeSpentSeconds: number
    correctKeystrokes: number
    totalMistakes: number
  }) => {
    setWpm(metrics.wpm)
    setAccuracy(metrics.accuracy)

    const source = currentPDF ? currentPDF.name : "default"
    const payload = {
      wpm: metrics.wpm,
      accuracy: metrics.accuracy,
      source,
      chars_typed: metrics.charsTyped,
      time_spent_seconds: metrics.timeSpentSeconds,
      correct_keystrokes: metrics.correctKeystrokes,
      total_mistakes: metrics.totalMistakes,
    }

    try {
      const res = await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const newSession = await res.json()
        setSessions((prev) => {
          const updated = [newSession, ...prev]
          saveSessionsToCache(updated)
          return updated
        })
      }
    } catch {
      // Saving is best-effort
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold tracking-tight">Advanced Book Shop</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">{email}</span>
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/sign-out">
                <LogOut className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="typing" className="gap-1.5">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Typing</span>
            </TabsTrigger>
            <TabsTrigger value="pdfs" className="gap-1.5">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">PDFs</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1.5">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="typing" className="mt-0">
            <TypingInterface
              updateAnalytics={updateAnalytics}
              pdfText={currentPDF?.text ?? null}
              pdfName={currentPDF?.name ?? null}
              onClearPDF={handleRemovePDF}
            />
          </TabsContent>
          <TabsContent value="pdfs" className="mt-0">
            <PDFUploader
              currentPDF={currentPDF}
              onPDFSelect={handlePDFSelect}
              onRemovePDF={handleRemovePDF}
            />
          </TabsContent>
          <TabsContent value="analytics" className="mt-0">
            <AnalyticsPanel wpm={wpm} accuracy={accuracy} sessions={sessions} />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Advanced Book Shop — Typing Practice Tool
        </div>
      </footer>
    </div>
  )
}

"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { PDFUploader } from './routs/pdf-uploader'
import { TypingInterface } from './routs/typing-interface'
import { AnalyticsPanel } from './routs/analytics-panel'
import { ThemeToggle } from '@/components/theme-toggle'
import { BookOpen, FileText, BarChart3, LogOut } from 'lucide-react'

export default function TypingApp({ email }: { email: string }) {
  const [currentPDF, setCurrentPDF] = useState<string | null>(null)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)

  const updateAnalytics = (newWpm: number, newAccuracy: number) => {
    setWpm(newWpm)
    setAccuracy(newAccuracy)
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
        <Tabs defaultValue="typing" className="space-y-6">
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
            <TypingInterface updateAnalytics={updateAnalytics} />
          </TabsContent>
          <TabsContent value="pdfs" className="mt-0">
            <PDFUploader setCurrentPDF={setCurrentPDF} />
          </TabsContent>
          <TabsContent value="analytics" className="mt-0">
            <AnalyticsPanel wpm={wpm} accuracy={accuracy} />
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

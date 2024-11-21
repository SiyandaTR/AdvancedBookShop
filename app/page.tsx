"use client"

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PDFUploader } from './components/pdf-uploader'
import { TypingInterface } from './components/typing-interface'
import { AnalyticsPanel } from './components/analytics-panel'

export default function TypingApp() {
  const [currentPDF, setCurrentPDF] = useState<string | null>(null)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)

  const updateAnalytics = (newWpm: number, newAccuracy: number) => {
    setWpm(newWpm)
    setAccuracy(newAccuracy)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Typing App</h1>
      <Tabs defaultValue="typing">
        <TabsList>
          <TabsTrigger value="typing">Typing</TabsTrigger>
          <TabsTrigger value="pdfs">PDFs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="typing">
          <TypingInterface updateAnalytics={updateAnalytics} />
        </TabsContent>
        <TabsContent value="pdfs">
          <PDFUploader setCurrentPDF={setCurrentPDF} />
        </TabsContent>
        <TabsContent value="analytics">
          <AnalyticsPanel wpm={wpm} accuracy={accuracy} />
        </TabsContent>
      </Tabs>
    </div>
  )
}


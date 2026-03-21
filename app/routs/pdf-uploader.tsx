"use client"

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, Trash2, Loader2 } from 'lucide-react'
import type { PDFData } from '../typing-app'

interface PDFUploaderProps {
  currentPDF: PDFData | null
  setCurrentPDF: (pdf: PDFData) => void
  onRemovePDF: () => void
}

async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist')
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise

  let fullText = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const pageText = textContent.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
    fullText += pageText + '\n\n'
  }

  return fullText.trim()
}

export function PDFUploader({ currentPDF, setCurrentPDF, onRemovePDF }: PDFUploaderProps) {
  const [pdfs, setPDFs] = useState<PDFData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    try {
      const text = await extractTextFromPDF(file)
      const newPDF: PDFData = { name: file.name, text }
      setPDFs((prev) => [...prev, newPDF])
      setCurrentPDF(newPDF)
    } catch (error) {
      console.error('Failed to parse PDF:', error)
    } finally {
      setIsLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = (index: number) => {
    const removed = pdfs[index]
    setPDFs((prev) => prev.filter((_, i) => i !== index))
    if (currentPDF?.name === removed.name) {
      onRemovePDF()
    }
  }

  return (
    <div className="space-y-4 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload PDF</CardTitle>
          <CardDescription>Upload a PDF to practice typing from</CardDescription>
        </CardHeader>
        <CardContent>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {isLoading ? (
                <Loader2 className="h-8 w-8 text-muted-foreground mb-2 animate-spin" />
              ) : (
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              )}
              <p className="text-sm text-muted-foreground">
                {isLoading ? 'Processing PDF...' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-muted-foreground">PDF files only</p>
            </div>
            <Input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isLoading}
            />
          </label>
        </CardContent>
      </Card>

      {pdfs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Uploaded Files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pdfs.map((pdf, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  currentPDF?.name === pdf.name
                    ? 'bg-primary/10 border-primary'
                    : 'bg-card hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm truncate">{pdf.name}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant={currentPDF?.name === pdf.name ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPDF(pdf)}
                    disabled={currentPDF?.name === pdf.name}
                  >
                    {currentPDF?.name === pdf.name ? 'Selected' : 'Select'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

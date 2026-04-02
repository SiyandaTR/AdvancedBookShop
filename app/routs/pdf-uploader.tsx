"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, FileText, Trash2, Loader2, BookOpen } from "lucide-react"
import type { PDFData } from "../typing-app"

interface PDFUploaderProps {
  currentPDF: PDFData | null
  onPDFSelect: (pdf: PDFData) => void
  onRemovePDF: () => void
}

async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist")
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
  let fullText = ""
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const pageText = textContent.items.map((item) => ("str" in item ? item.str : "")).join(" ")
    fullText += pageText + "\n\n"
  }
  return fullText.trim()
}

const stagger = {
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
}

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export function PDFUploader({ currentPDF, onPDFSelect, onRemovePDF }: PDFUploaderProps) {
  const [pdfs, setPDFs] = useState<PDFData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingList, setIsLoadingList] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function loadPDFs() {
      try {
        const res = await fetch("/api/pdfs")
        if (res.ok) setPDFs(await res.json())
      } catch {}
      finally { setIsLoadingList(false) }
    }
    loadPDFs()
  }, [])

  const handleFileUpload = async (file: File) => {
    setIsLoading(true)
    try {
      const text = await extractTextFromPDF(file)
      const res = await fetch("/api/pdfs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, text }),
      })
      if (res.ok) {
        const saved: PDFData = await res.json()
        setPDFs((prev) => [saved, ...prev])
        onPDFSelect(saved)
      }
    } catch (e) {
      console.error("Failed to parse PDF:", e)
    } finally {
      setIsLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileUpload(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type === "application/pdf") handleFileUpload(file)
  }

  const handleRemove = async (pdf: PDFData, index: number) => {
    if (pdf.id) {
      try { await fetch(`/api/pdfs/${pdf.id}`, { method: "DELETE" }) } catch {}
    }
    setPDFs((prev) => prev.filter((_, i) => i !== index))
    if (currentPDF?.id === pdf.id || currentPDF?.name === pdf.name) onRemovePDF()
  }

  return (
    <motion.div className="space-y-6" variants={stagger} initial="initial" animate="animate">
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h2 className="font-heading text-2xl font-bold">PDFs</h2>
        <p className="text-sm text-fg-muted font-body font-light mt-1">Upload documents to practice typing from.</p>
      </motion.div>

      {/* Drop Zone */}
      <motion.div variants={fadeUp}>
        <label
          className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
            isDragging
              ? "border-[var(--fg)] bg-[var(--surface-hover)]"
              : isLoading
                ? "border-[var(--border)] bg-[var(--surface)]"
                : "border-[var(--border)] hover:border-[var(--fg-subtle)] hover:bg-[var(--surface-hover)]"
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center">
            {isLoading ? (
              <Loader2 className="h-8 w-8 text-fg-muted mb-3 animate-spin" />
            ) : (
              <Upload className={`h-8 w-8 mb-3 transition-colors ${isDragging ? "text-[var(--fg)]" : "text-fg-muted"}`} />
            )}
            <p className="text-sm text-fg-muted font-body">
              {isLoading ? "Extracting text..." : isDragging ? "Drop to upload" : "Drop a PDF or click to browse"}
            </p>
            {!isLoading && <p className="text-xs text-fg-subtle font-body mt-1">PDF files only</p>}
          </div>
          <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleInputChange} className="hidden" disabled={isLoading} />
        </label>
      </motion.div>

      {/* PDF List */}
      {isLoadingList ? (
        <motion.div variants={fadeUp} className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-fg-muted" />
        </motion.div>
      ) : pdfs.length > 0 ? (
        <motion.div className="space-y-2" variants={stagger}>
          <motion.span variants={fadeUp} className="text-xs text-fg-subtle font-body uppercase tracking-[0.15em]">
            Uploaded ({pdfs.length})
          </motion.span>
          {pdfs.map((pdf, index) => (
            <motion.div
              key={pdf.id ?? index}
              variants={fadeUp}
              layout
              className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                currentPDF?.id === pdf.id
                  ? "border-[var(--fg)] bg-[var(--surface)]"
                  : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--fg-subtle)]"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="h-4 w-4 text-fg-muted shrink-0" />
                <span className="text-sm font-body truncate">{pdf.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onPDFSelect(pdf)}
                  className={`flex items-center gap-1.5 text-xs font-body px-3 py-1.5 rounded-full transition-all ${
                    currentPDF?.id === pdf.id
                      ? "bg-[var(--accent)] text-[var(--accent-fg)]"
                      : "border border-[var(--border)] text-fg-muted hover:text-[var(--fg)] hover:border-[var(--fg-subtle)]"
                  }`}
                >
                  <BookOpen className="h-3 w-3" />
                  {currentPDF?.id === pdf.id ? "Typing" : "Use"}
                </button>
                <button
                  onClick={() => handleRemove(pdf, index)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-fg-subtle hover:text-[var(--error)] hover:bg-[var(--error)]/10 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} className="text-center py-8 text-sm text-fg-subtle font-body">
          No PDFs uploaded yet. Drop one above to get started.
        </motion.div>
      )}
    </motion.div>
  )
}

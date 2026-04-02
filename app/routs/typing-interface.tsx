"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { defaultBook } from "../data/default-book"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { SettingsPopup } from "./settings-popup"

interface TypingMetrics {
  wpm: number; accuracy: number; charsTyped: number; timeSpentSeconds: number; correctKeystrokes: number; totalMistakes: number
}

interface TypingInterfaceProps {
  updateAnalytics: (metrics: TypingMetrics) => void
  pdfText?: string | null
  pdfName?: string | null
  onClearPDF?: () => void
}

function splitTextIntoPages(text: string, maxChars = 1500): string[] {
  const pages: string[] = []
  const paragraphs = text.split(/\n\s*\n/)
  let currentPage = ""
  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim()
    if (!trimmed) continue
    if (currentPage.length + trimmed.length + 2 > maxChars && currentPage.length > 0) {
      pages.push(currentPage.trim())
      currentPage = trimmed
    } else {
      currentPage = currentPage ? currentPage + "\n\n" + trimmed : trimmed
    }
  }
  if (currentPage.trim()) pages.push(currentPage.trim())
  return pages.length > 0 ? pages : [text]
}

export function TypingInterface({ updateAnalytics, pdfText, pdfName, onClearPDF }: TypingInterfaceProps) {
  const [currentChapter, setCurrentChapter] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [text, setText] = useState("")
  const [typedText, setTypedText] = useState("")
  const [startTime, setStartTime] = useState<number | null>(null)
  const [totalMistakes, setTotalMistakes] = useState(0)
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0)
  const [isFocused, setIsFocused] = useState(false)
  const [settings, setSettings] = useState({
    fontSize: 16, fontColor: "", fontType: "Roboto", cursorStyle: "line",
    readingMode: false, ignoreCapitalization: false, skipPunctuation: false, stopCursorAfterMistake: true,
  })

  const pdfPages = pdfText ? splitTextIntoPages(pdfText) : null
  const isPDFMode = pdfPages !== null
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setCurrentChapter(0); setCurrentPage(0); setTypedText(""); setStartTime(null); setTotalMistakes(0); setCorrectKeystrokes(0)
  }, [pdfText])

  useEffect(() => {
    if (isPDFMode && pdfPages) setText(pdfPages[currentPage] || "")
    else setText(defaultBook.chapters[currentChapter].pages[currentPage])
    setTypedText(""); setStartTime(null); setTotalMistakes(0); setCorrectKeystrokes(0)
  }, [currentChapter, currentPage, pdfText])

  useEffect(() => { if (inputRef.current) inputRef.current.focus() }, [])

  const isCharPunctuation = (char: string): boolean => /[^\w\s]/.test(char)

  const charsMatch = (typed: string, expected: string): boolean => {
    if (settings.ignoreCapitalization) return typed.toLowerCase() === expected.toLowerCase()
    return typed === expected
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (settings.readingMode) return
    const newValue = event.target.value
    if (!startTime) setStartTime(Date.now())

    if (newValue.length > typedText.length) {
      const newCharIndex = newValue.length - 1
      const newChar = newValue[newCharIndex]
      let textIndex = 0, typedCount = 0
      while (typedCount < newCharIndex && textIndex < text.length) {
        if (settings.skipPunctuation && isCharPunctuation(text[textIndex])) textIndex++
        else { textIndex++; typedCount++ }
      }
      if (textIndex < text.length) {
        if (settings.skipPunctuation && isCharPunctuation(text[textIndex])) { setTypedText(typedText + newChar); return }
        if (!charsMatch(newChar, text[textIndex])) {
          setTotalMistakes((p) => p + 1)
          if (settings.stopCursorAfterMistake) { setTypedText(newValue); return }
        } else setCorrectKeystrokes((p) => p + 1)
      }
    }

    setTypedText(newValue)
    if (newValue.length >= text.length) {
      const endTime = Date.now()
      const timeSpentSeconds = Math.round((endTime - (startTime || endTime)) / 1000)
      const wpm = timeSpentSeconds > 0 ? Math.round(text.trim().split(/\s+/).length / (timeSpentSeconds / 60)) : 0
      const mistakes = getCurrentMistakeCount(newValue)
      const accuracy = Math.round(((text.length - mistakes) / text.length) * 100)
      updateAnalytics({ wpm, accuracy, charsTyped: text.length, timeSpentSeconds, correctKeystrokes, totalMistakes })
    }
  }

  const getCurrentMistakeCount = (ct: string) => {
    let m = 0
    for (let i = 0; i < ct.length && i < text.length; i++) { if (!charsMatch(ct[i], text[i])) m++ }
    return m
  }

  const navigatePage = (dir: "prev" | "next") => {
    if (isPDFMode && pdfPages) {
      if (dir === "prev" && currentPage > 0) setCurrentPage((p) => p - 1)
      else if (dir === "next" && currentPage < pdfPages.length - 1) setCurrentPage((p) => p + 1)
    } else {
      if (dir === "prev") {
        if (currentPage > 0) setCurrentPage((p) => p - 1)
        else if (currentChapter > 0) { setCurrentChapter((p) => p - 1); setCurrentPage(defaultBook.chapters[currentChapter - 1].pages.length - 1) }
      } else {
        if (currentPage < defaultBook.chapters[currentChapter].pages.length - 1) setCurrentPage((p) => p + 1)
        else if (currentChapter < defaultBook.chapters.length - 1) { setCurrentChapter((p) => p + 1); setCurrentPage(0) }
      }
    }
  }

  const getCursorElement = () => {
    const base = { fontFamily: settings.fontType, fontSize: `${settings.fontSize}px`, lineHeight: "1.7" }
    switch (settings.cursorStyle) {
      case "block": return <span className="inline-block bg-[var(--fg)]/20 animate-cursor-blink" style={{ ...base, width: "0.5em", height: "1em", verticalAlign: "baseline" }}>&nbsp;</span>
      case "underline": return <span className="inline-block border-b-2 border-[var(--fg)] animate-cursor-blink" style={{ ...base, width: "0.5em", height: "1em", verticalAlign: "baseline" }}>&nbsp;</span>
      default: return <span className="inline-block w-[2px] bg-[var(--fg)] animate-cursor-blink align-baseline" style={{ ...base, height: "1em", verticalAlign: "baseline" }} />
    }
  }

  const renderText = () => {
    if (settings.readingMode) return <div className="whitespace-pre-wrap leading-relaxed">{text}</div>
    const result = []
    for (let i = 0; i < typedText.length; i++) {
      const isCorrect = charsMatch(typedText[i], text[i])
      result.push(
        <span key={`t-${i}`} className={isCorrect ? "text-[var(--success)]" : "text-[var(--error)] bg-[var(--error)]/10 rounded-[1px]"}>
          {typedText[i]}
        </span>
      )
    }
    if (typedText.length < text.length) result.push(<span key="cur">{getCursorElement()}</span>)
    for (let i = typedText.length; i < text.length; i++) result.push(<span key={`u-${i}`} className="text-fg-muted">{text[i]}</span>)
    return result
  }

  const currentMistakes = getCurrentMistakeCount(typedText)
  const progressPercent = text.length > 0 ? Math.round((typedText.length / text.length) * 100) : 0
  const totalPages = isPDFMode && pdfPages ? pdfPages.length : defaultBook.chapters[currentChapter].pages.length

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <motion.div className="flex items-center justify-between" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
        <div className="flex items-center gap-3 min-w-0">
          <h2 className="font-heading text-xl md:text-2xl font-bold truncate">
            {isPDFMode && pdfName ? pdfName : defaultBook.chapters[currentChapter].title}
          </h2>
          {isPDFMode && onClearPDF && (
            <button onClick={onClearPDF} className="flex items-center gap-1 text-xs text-fg-muted hover:text-[var(--fg)] transition-colors font-body shrink-0 border border-[var(--border)] px-2 py-1 rounded-full hover:border-[var(--fg-subtle)]">
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border border-[var(--border)] rounded-full px-1 py-0.5">
            <button onClick={() => navigatePage("prev")} disabled={currentPage === 0 && (isPDFMode || currentChapter === 0)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[var(--surface-hover)] disabled:opacity-30 transition-all">
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="text-xs font-body text-fg-muted px-2 tabular-nums">{currentPage + 1} / {totalPages}</span>
            <button onClick={() => navigatePage("next")} disabled={isPDFMode && pdfPages ? currentPage === pdfPages.length - 1 : currentChapter === defaultBook.chapters.length - 1 && currentPage === defaultBook.chapters[currentChapter].pages.length - 1} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[var(--surface-hover)] disabled:opacity-30 transition-all">
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <SettingsPopup settings={settings} setSettings={setSettings} />
        </div>
      </motion.div>

      {/* HERO Typing Box */}
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.2 }}>
        <div
          className={`relative border rounded-2xl min-h-[280px] md:min-h-[340px] p-6 md:p-8 bg-[var(--surface)] transition-all duration-500 cursor-text ${isFocused ? "border-[var(--fg)] shadow-[0_0_0_1px_var(--fg)]" : "border-[var(--border)] hover:border-[var(--fg-subtle)]"}`}
          onClick={() => inputRef.current?.focus()}
        >
          <div className="whitespace-pre-wrap leading-[1.7] relative z-10 select-none" style={{ fontSize: `${settings.fontSize}px`, fontFamily: settings.fontType, color: settings.fontColor || undefined }}>
            {renderText()}
          </div>
          <textarea
            ref={inputRef}
            value={typedText}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={settings.readingMode}
            className={`absolute inset-0 w-full h-full bg-transparent text-transparent resize-none outline-none z-20 caret-transparent p-6 md:p-8 ${settings.readingMode ? "hidden" : ""}`}
            style={{ fontSize: `${settings.fontSize}px`, fontFamily: settings.fontType, lineHeight: "1.7" }}
            spellCheck={false}
          />
        </div>
      </motion.div>

      {/* Progress */}
      <motion.div className="space-y-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <div className="h-[2px] bg-[var(--border)] rounded-full overflow-hidden">
          <motion.div className="h-full bg-[var(--fg)] rounded-full" initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.3, ease: "easeOut" }} />
        </div>
        <div className="flex justify-between text-xs text-fg-subtle font-body">
          {settings.readingMode ? <span>Reading mode</span> : (
            <>
              <span className="tabular-nums">{progressPercent}% complete</span>
              <div className="flex gap-4 tabular-nums">
                <span className="text-[var(--error)]">{currentMistakes} errors</span>
                <span className="text-[var(--success)]">{correctKeystrokes} correct</span>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

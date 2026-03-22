"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { defaultBook } from "../data/default-book"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { SettingsPopup } from "./settings-popup"

interface TypingMetrics {
  wpm: number
  accuracy: number
  charsTyped: number
  timeSpentSeconds: number
  correctKeystrokes: number
  totalMistakes: number
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
  let currentPage = ''

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim()
    if (!trimmed) continue

    if (currentPage.length + trimmed.length + 2 > maxChars && currentPage.length > 0) {
      pages.push(currentPage.trim())
      currentPage = trimmed
    } else {
      currentPage = currentPage ? currentPage + '\n\n' + trimmed : trimmed
    }
  }

  if (currentPage.trim()) {
    pages.push(currentPage.trim())
  }

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
  const [settings, setSettings] = useState({
    fontSize: 16,
    fontColor: "",
    fontType: "Arial",
    cursorStyle: "line",
    readingMode: false,
    ignoreCapitalization: false,
    skipPunctuation: false,
    stopCursorAfterMistake: true,
  })

  const pdfPages = pdfText ? splitTextIntoPages(pdfText) : null
  const isPDFMode = pdfPages !== null

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const textDisplayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCurrentChapter(0)
    setCurrentPage(0)
    setTypedText("")
    setStartTime(null)
    setTotalMistakes(0)
    setCorrectKeystrokes(0)
  }, [pdfText])

  useEffect(() => {
    if (isPDFMode && pdfPages) {
      setText(pdfPages[currentPage] || '')
    } else {
      setText(defaultBook.chapters[currentChapter].pages[currentPage])
    }
    setTypedText("")
    setStartTime(null)
    setTotalMistakes(0)
    setCorrectKeystrokes(0)
  }, [currentChapter, currentPage, pdfText])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const isCharPunctuation = (char: string): boolean => {
    return /[^\w\s]/.test(char)
  }

  const charsMatch = (typed: string, expected: string): boolean => {
    if (settings.ignoreCapitalization) {
      return typed.toLowerCase() === expected.toLowerCase()
    }
    return typed === expected
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (settings.readingMode) return

    const newValue = event.target.value

    if (!startTime) {
      setStartTime(Date.now())
    }

    // Handle new character input (when new value is longer)
    if (newValue.length > typedText.length) {
      const newCharIndex = newValue.length - 1
      const newChar = newValue[newCharIndex]

      // Map input index to text index, accounting for auto-skipped punctuation
      let textIndex = 0
      let typedCount = 0
      while (typedCount < newCharIndex && textIndex < text.length) {
        if (settings.skipPunctuation && isCharPunctuation(text[textIndex])) {
          textIndex++
        } else {
          textIndex++
          typedCount++
        }
      }

      if (textIndex < text.length) {
        // Skip punctuation characters automatically
        if (settings.skipPunctuation && isCharPunctuation(text[textIndex])) {
          setTypedText(typedText + newChar)
          return
        }

        const correctChar = text[textIndex]
        const isCorrect = charsMatch(newChar, correctChar)

        if (!isCorrect) {
          setTotalMistakes((prev) => prev + 1)

          if (settings.stopCursorAfterMistake) {
            setTypedText(newValue)
            return
          }
        } else {
          setCorrectKeystrokes((prev) => prev + 1)
        }
      }
    }

    setTypedText(newValue)

    // Check if typing is complete
    if (newValue.length >= text.length) {
      const endTime = Date.now()
      const timeSpentSeconds = Math.round((endTime - (startTime || endTime)) / 1000)
      const timeElapsedMinutes = timeSpentSeconds / 60
      const wordsTyped = text.trim().split(/\s+/).length
      const wpm = timeElapsedMinutes > 0 ? Math.round(wordsTyped / timeElapsedMinutes) : 0

      const currentMistakes = getCurrentMistakeCount(newValue)
      const accuracy = Math.round(((text.length - currentMistakes) / text.length) * 100)

      updateAnalytics({
        wpm,
        accuracy,
        charsTyped: text.length,
        timeSpentSeconds,
        correctKeystrokes,
        totalMistakes,
      })
    }
  }

  const getCurrentMistakeCount = (currentTypedText: string) => {
    let mistakes = 0
    for (let i = 0; i < currentTypedText.length && i < text.length; i++) {
      if (!charsMatch(currentTypedText[i], text[i])) {
        mistakes++
      }
    }
    return mistakes
  }

  const handleChapterChange = (value: string) => {
    const newChapter = Number.parseInt(value, 10)
    setCurrentChapter(newChapter)
    setCurrentPage(0)
  }

  const handlePageChange = (value: string) => {
    setCurrentPage(Number.parseInt(value, 10))
  }

  const navigatePage = (direction: "prev" | "next") => {
    if (isPDFMode && pdfPages) {
      if (direction === "prev" && currentPage > 0) {
        setCurrentPage((prev) => prev - 1)
      } else if (direction === "next" && currentPage < pdfPages.length - 1) {
        setCurrentPage((prev) => prev + 1)
      }
    } else {
      if (direction === "prev") {
        if (currentPage > 0) {
          setCurrentPage((prev) => prev - 1)
        } else if (currentChapter > 0) {
          setCurrentChapter((prev) => prev - 1)
          setCurrentPage(defaultBook.chapters[currentChapter - 1].pages.length - 1)
        }
      } else {
        if (currentPage < defaultBook.chapters[currentChapter].pages.length - 1) {
          setCurrentPage((prev) => prev + 1)
        } else if (currentChapter < defaultBook.chapters.length - 1) {
          setCurrentChapter((prev) => prev + 1)
          setCurrentPage(0)
        }
      }
    }
  }

  const getCursorElement = () => {
    const baseStyle = {
      fontFamily: settings.fontType,
      fontSize: `${settings.fontSize}px`,
      lineHeight: "1.5",
    }

    switch (settings.cursorStyle) {
      case "line":
        return (
          <span
            className="inline-block w-0.5 bg-foreground animate-pulse align-baseline"
            style={{
              ...baseStyle,
              height: "1em",
              verticalAlign: "baseline",
            }}
          />
        )
      case "block":
        return (
          <span
            className="inline-block bg-foreground/30 animate-pulse"
            style={{
              ...baseStyle,
              width: "0.5em",
              height: "1em",
              verticalAlign: "baseline",
            }}
          >
            &nbsp;
          </span>
        )
      case "underline":
        return (
          <span
            className="inline-block border-b-2 border-foreground animate-pulse"
            style={{
              ...baseStyle,
              width: "0.5em",
              height: "1em",
              verticalAlign: "baseline",
            }}
          >
            &nbsp;
          </span>
        )
      default:
        return (
          <span
            className="inline-block w-0.5 bg-foreground animate-pulse align-baseline"
            style={{
              ...baseStyle,
              height: "1em",
              verticalAlign: "baseline",
            }}
          />
        )
    }
  }

  const renderText = () => {
    if (settings.readingMode) {
      return (
        <div className="whitespace-pre-wrap leading-relaxed">
          {text}
        </div>
      )
    }

    const result = []

    // Render typed characters (correct and incorrect)
    for (let i = 0; i < typedText.length; i++) {
      const typedChar = typedText[i]
      const correctChar = text[i]
      const isCorrect = charsMatch(typedChar, correctChar)

      result.push(
        <span
          key={`typed-${i}`}
          className={
            isCorrect
              ? "text-green-600 dark:text-green-400"
              : "bg-red-200 text-red-700 dark:bg-red-900/50 dark:text-red-300"
          }
        >
          {typedChar}
        </span>,
      )
    }

    // Add cursor at current position
    if (typedText.length < text.length) {
      result.push(<span key="cursor">{getCursorElement()}</span>)
    }

    // Render remaining untyped characters
    for (let i = typedText.length; i < text.length; i++) {
      result.push(
        <span key={`untyped-${i}`} className="text-muted-foreground">
          {text[i]}
        </span>,
      )
    }

    return result
  }

  const currentMistakes = getCurrentMistakeCount(typedText)
  const progressPercent = text.length > 0 ? Math.round((typedText.length / text.length) * 100) : 0

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-2xl font-bold truncate">
            {isPDFMode && pdfName ? pdfName : defaultBook.chapters[currentChapter].title}
          </h2>
          {isPDFMode && onClearPDF && (
            <Button variant="ghost" size="sm" onClick={onClearPDF} className="shrink-0 text-muted-foreground">
              <X className="h-4 w-4 mr-1" />
              Clear PDF
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigatePage("prev")}
            disabled={currentPage === 0 && (isPDFMode || currentChapter === 0)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {isPDFMode && pdfPages ? (
            <Select value={currentPage.toString()} onValueChange={handlePageChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select page" />
              </SelectTrigger>
              <SelectContent>
                {pdfPages.map((_, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    Page {index + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <>
              <Select value={currentChapter.toString()} onValueChange={handleChapterChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select chapter" />
                </SelectTrigger>
                <SelectContent>
                  {defaultBook.chapters.map((chapter, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      Chapter {index + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={currentPage.toString()} onValueChange={handlePageChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select page" />
                </SelectTrigger>
                <SelectContent>
                  {defaultBook.chapters[currentChapter].pages.map((_, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      Page {index + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigatePage("next")}
            disabled={
              isPDFMode && pdfPages
                ? currentPage === pdfPages.length - 1
                : currentChapter === defaultBook.chapters.length - 1 &&
                  currentPage === defaultBook.chapters[currentChapter].pages.length - 1
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <SettingsPopup settings={settings} setSettings={setSettings} />
        </div>
      </div>

      <div className="relative border rounded min-h-[200px] p-4 bg-background">
        {/* Text Display Layer */}
        <div
          ref={textDisplayRef}
          className="absolute inset-4 whitespace-pre-wrap pointer-events-none z-10"
          style={{
            fontSize: `${settings.fontSize}px`,
            fontFamily: settings.fontType,
            lineHeight: "1.5",
            color: settings.fontColor || undefined,
          }}
        >
          {renderText()}
        </div>

        {/* Invisible Input Layer */}
        <textarea
          ref={inputRef}
          value={typedText}
          onChange={handleInputChange}
          disabled={settings.readingMode}
          className={`absolute inset-4 w-full h-full bg-transparent text-transparent resize-none outline-none z-20 caret-transparent ${settings.readingMode ? 'hidden' : ''}`}
          style={{
            fontSize: `${settings.fontSize}px`,
            fontFamily: settings.fontType,
            lineHeight: "1.5",
          }}
          spellCheck={false}
        />
      </div>

      <div className="flex justify-between text-sm text-muted-foreground">
        {settings.readingMode ? (
          <span>Reading Mode — Text displayed for reading only</span>
        ) : (
          <span>
            Progress: {typedText.length} / {text.length} characters ({progressPercent}%)
          </span>
        )}
        {!settings.readingMode && (
          <div className="flex space-x-4">
            <span>Errors: {currentMistakes}</span>
            <span>Correct: {correctKeystrokes}</span>
          </div>
        )}
      </div>
    </div>
  )
}

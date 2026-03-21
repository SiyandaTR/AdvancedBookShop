"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { defaultBook } from "../data/default-book"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { SettingsPopup } from "./settings-popup"

interface TypingInterfaceProps {
  updateAnalytics: (wpm: number, accuracy: number) => void
  pdfText?: string | null
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

export function TypingInterface({ updateAnalytics, pdfText }: TypingInterfaceProps) {
  const [currentChapter, setCurrentChapter] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [text, setText] = useState("")
  const [typedText, setTypedText] = useState("")
  const [startTime, setStartTime] = useState<number | null>(null)
  const [totalMistakes, setTotalMistakes] = useState(0)
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
  }, [currentChapter, currentPage, pdfText])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value

    if (!startTime) {
      setStartTime(Date.now())
    }

    // Handle new character input (when new value is longer)
    if (newValue.length > typedText.length) {
      const newCharIndex = newValue.length - 1
      const newChar = newValue[newCharIndex]
      const correctChar = text[newCharIndex]

      // Only count as mistake if the new character is wrong
      if (newChar !== correctChar) {
        setTotalMistakes((prev) => prev + 1)
      }
    }

    setTypedText(newValue)

    // Check if typing is complete
    if (newValue.length >= text.length) {
      const endTime = Date.now()
      const timeElapsed = (endTime - (startTime || endTime)) / 60000 // in minutes
      const wordsTyped = text.trim().split(/\s+/).length
      const wpm = Math.round(wordsTyped / timeElapsed)

      // Calculate current mistakes (characters that are currently wrong)
      const currentMistakes = getCurrentMistakeCount(newValue)
      const accuracy = Math.round(((text.length - currentMistakes) / text.length) * 100)

      updateAnalytics(wpm, accuracy)
    }
  }

  const getCurrentMistakeCount = (currentTypedText: string) => {
    let mistakes = 0
    for (let i = 0; i < currentTypedText.length && i < text.length; i++) {
      if (currentTypedText[i] !== text[i]) {
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
    const result = []

    // Render typed characters (correct and incorrect)
    for (let i = 0; i < typedText.length; i++) {
      const typedChar = typedText[i]
      const correctChar = text[i]
      const isCorrect = typedChar === correctChar

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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {isPDFMode ? 'PDF Document' : defaultBook.chapters[currentChapter].title}
        </h2>
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
          className="absolute inset-4 w-full h-full bg-transparent text-transparent resize-none outline-none z-20 caret-transparent"
          style={{
            fontSize: `${settings.fontSize}px`,
            fontFamily: settings.fontType,
            lineHeight: "1.5",
          }}
          spellCheck={false}
        />
      </div>

      <div className="flex justify-between text-sm text-muted-foreground">
        <span>
          Progress: {typedText.length} / {text.length} characters
        </span>
        <div className="flex space-x-4">
          <span>Current Mistakes: {currentMistakes}</span>
          <span>Total Mistakes: {totalMistakes}</span>
        </div>
      </div>
    </div>
  )
}

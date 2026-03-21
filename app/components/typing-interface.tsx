"use client"

import React, { useState, useEffect, useRef } from 'react'
import { defaultBook } from '../data/default-book'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SettingsPopup } from './settings-popup'

interface TypingInterfaceProps {
  updateAnalytics: (wpm: number, accuracy: number) => void;
}

export function TypingInterface({ updateAnalytics }: TypingInterfaceProps) {
  const [currentChapter, setCurrentChapter] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [text, setText] = useState("")
  const [typedText, setTypedText] = useState("")
  const [cursorPosition, setCursorPosition] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const [mistakePositions, setMistakePositions] = useState<number[]>([])
  const [settings, setSettings] = useState({
    fontSize: 16,
    fontColor: '#000000',
    fontType: 'Arial',
    cursorStyle: 'line',
    readingMode: false,
    ignoreCapitalization: false,
    skipPunctuation: false,
    stopCursorAfterMistake: true,
  })

  const inputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setText(defaultBook.chapters[currentChapter].pages[currentPage])
    setTypedText("")
    setCursorPosition(0)
    setStartTime(null)
    setMistakes(0)
    setMistakePositions([])
  }, [currentChapter, currentPage])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!startTime) {
      setStartTime(Date.now())
    }

    if (event.key === 'Backspace') {
      event.preventDefault()
      if (cursorPosition > 0) {
        setTypedText(prev => prev.slice(0, -1))
        setCursorPosition(prev => prev - 1)
        setMistakePositions(prev => prev.filter(pos => pos !== cursorPosition - 1))
      }
    } else if (event.key.length === 1) {
      event.preventDefault()
      const newTypedText = typedText + event.key
      setTypedText(newTypedText)
      setCursorPosition(prev => prev + 1)

      if (event.key !== text[cursorPosition]) {
        setMistakes(prev => prev + 1)
        setMistakePositions(prev => [...prev, cursorPosition])
      }

      if (newTypedText.length >= text.length) {
        const endTime = Date.now()
        const timeElapsed = (endTime - (startTime || endTime)) / 60000 // in minutes
        const wordsTyped = text.trim().split(/\s+/).length
        const wpm = Math.round(wordsTyped / timeElapsed)
        const accuracy = Math.round(((text.length - mistakes) / text.length) * 100)
        updateAnalytics(wpm, accuracy)
      }
    }
  }

  const getCursorStyle = () => {
    switch (settings.cursorStyle) {
      case 'line':
        return 'w-0.5 h-6 bg-foreground animate-blink'
      case 'block':
        return 'w-2 h-6 bg-foreground/50 animate-blink'
      case 'underline':
        return 'w-2 h-0.5 bg-foreground -bottom-1 animate-blink'
      default:
        return 'w-0.5 h-6 bg-foreground animate-blink'
    }
  }

  const handleChapterChange = (value: string) => {
    const newChapter = parseInt(value, 10)
    setCurrentChapter(newChapter)
    setCurrentPage(0)
  }

  const handlePageChange = (value: string) => {
    setCurrentPage(parseInt(value, 10))
  }

  const navigatePage = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentPage > 0) {
        setCurrentPage(prev => prev - 1)
      } else if (currentChapter > 0) {
        setCurrentChapter(prev => prev - 1)
        setCurrentPage(defaultBook.chapters[currentChapter - 1].pages.length - 1)
      }
    } else {
      if (currentPage < defaultBook.chapters[currentChapter].pages.length - 1) {
        setCurrentPage(prev => prev + 1)
      } else if (currentChapter < defaultBook.chapters.length - 1) {
        setCurrentChapter(prev => prev + 1)
        setCurrentPage(0)
      }
    }
  }

  const renderText = () => {
    return text.split('').map((char, index) => {
      let className = 'text-muted-foreground/60'
      if (index < typedText.length) {
        if (mistakePositions.includes(index)) {
          className = 'bg-red-500/20 text-red-600 dark:text-red-400'
        } else {
          className = 'text-foreground'
        }
      } else if (index === cursorPosition) {
        className = 'text-foreground'
      }
      return (
        <span key={index} className={className}>
          {char}
        </span>
      )
    })
  }

  const progress = text.length > 0 ? Math.round((typedText.length / text.length) * 100) : 0

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-semibold">{defaultBook.chapters[currentChapter].title}</h2>
          <p className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {defaultBook.chapters[currentChapter].pages.length}
            {typedText.length > 0 && ` — ${progress}% complete`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigatePage('prev')}
            disabled={currentChapter === 0 && currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Select value={currentChapter.toString()} onValueChange={handleChapterChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Chapter" />
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
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Page" />
            </SelectTrigger>
            <SelectContent>
              {defaultBook.chapters[currentChapter].pages.map((_, index) => (
                <SelectItem key={index} value={index.toString()}>
                  Page {index + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigatePage('next')}
            disabled={currentChapter === defaultBook.chapters.length - 1 &&
                      currentPage === defaultBook.chapters[currentChapter].pages.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <SettingsPopup settings={settings} setSettings={setSettings} />
        </div>
      </div>

      <div className="relative">
        <div className="h-1 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div
        ref={inputRef}
        className="relative border rounded-lg p-6 min-h-[240px] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background cursor-text bg-card leading-relaxed selection:bg-primary/20"
        style={{
          fontSize: `${settings.fontSize}px`,
          fontFamily: settings.fontType,
          color: settings.fontColor !== '#000000' ? settings.fontColor : undefined,
        }}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {renderText()}
        <span
          className={`absolute ${getCursorStyle()}`}
          style={{ left: `${cursorPosition * 0.6}em`, top: '1em' }}
        />
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{typedText.length} / {text.length} characters</span>
        <span>{mistakes} mistake{mistakes !== 1 ? 's' : ''}</span>
      </div>
    </div>
  )
}

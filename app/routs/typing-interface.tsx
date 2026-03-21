"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
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

  const inputRef = useRef<HTMLInputElement>(null)
  const prevValueRef = useRef("")

  useEffect(() => {
    setText(defaultBook.chapters[currentChapter].pages[currentPage])
    setTypedText("")
    setCursorPosition(0)
    setStartTime(null)
    setMistakes(0)
    setMistakePositions([])
    prevValueRef.current = ""
  }, [currentChapter, currentPage])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleInput = useCallback((event: React.FormEvent<HTMLInputElement>) => {
    const input = event.currentTarget
    const newValue = input.value
    const prevValue = prevValueRef.current
    prevValueRef.current = newValue

    if (!startTime) {
      setStartTime(Date.now())
    }

    if (newValue.length < prevValue.length) {
      // Backspace
      const deletedPos = prevValue.length - 1
      setTypedText(newValue)
      setCursorPosition(newValue.length)
      setMistakePositions(prev => prev.filter(pos => pos !== deletedPos))
      return
    }

    if (newValue.length === prevValue.length) {
      return
    }

    // New character typed
    const newChar = newValue[newValue.length - 1]
    const pos = newValue.length - 1

    setTypedText(newValue)
    setCursorPosition(newValue.length)

    const expectedChar = text[pos]
    if (newChar !== expectedChar) {
      setMistakes(prev => prev + 1)
      setMistakePositions(prev => [...prev, pos])
    }

    if (newValue.length >= text.length) {
      const charAdded = newChar !== expectedChar ? 1 : 0
      const finalMistakes = mistakes + charAdded
      const endTime = Date.now()
      const timeElapsed = (endTime - (startTime || endTime)) / 60000
      const wordsTyped = text.trim().split(/\s+/).length
      const wpm = Math.round(wordsTyped / timeElapsed)
      const accuracy = Math.round(((text.length - finalMistakes) / text.length) * 100)
      updateAnalytics(wpm, accuracy)
    }
  }, [typedText, text, startTime, mistakes, updateAnalytics])

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent backspace when nothing is typed
    if (event.key === 'Backspace' && typedText.length === 0) {
      event.preventDefault()
    }
    // Prevent typing beyond the text length
    if (event.key.length === 1 && typedText.length >= text.length) {
      event.preventDefault()
    }
  }, [typedText, text])

  const getCursorStyle = () => {
    switch (settings.cursorStyle) {
      case 'line':
        return 'inline-block w-0.5 h-[1.2em] bg-foreground animate-blink align-text-bottom'
      case 'block':
        return 'inline-block w-[0.6em] h-[1.2em] bg-foreground/50 animate-blink align-text-bottom'
      case 'underline':
        return 'inline-block w-[0.6em] h-0.5 bg-foreground animate-blink align-bottom'
      default:
        return 'inline-block w-0.5 h-[1.2em] bg-foreground animate-blink align-text-bottom'
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
    const elements: React.ReactNode[] = []

    text.split('').forEach((char, index) => {
      if (index === cursorPosition) {
        elements.push(
          <span key={`cursor-${index}`} className={getCursorStyle()} />
        )
      }

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

      elements.push(
        <span key={index} className={className}>
          {char === ' ' ? '\u00A0' : char}
        </span>
      )
    })

    if (cursorPosition >= text.length) {
      elements.push(
        <span key="cursor-end" className={getCursorStyle()} />
      )
    }

    return elements
  }

  const handleAreaClick = () => {
    inputRef.current?.focus()
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

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value=""
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          className="absolute opacity-0 w-0 h-0 pointer-events-none"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
        <div
          onClick={handleAreaClick}
          className="relative border rounded-lg p-6 min-h-[240px] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background cursor-text bg-card leading-relaxed selection:bg-primary/20 whitespace-pre-wrap break-words"
          style={{
            fontSize: `${settings.fontSize}px`,
            fontFamily: settings.fontType,
            color: settings.fontColor !== '#000000' ? settings.fontColor : undefined,
          }}
          tabIndex={-1}
        >
          {renderText()}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{typedText.length} / {text.length} characters</span>
        <span>{mistakes} mistake{mistakes !== 1 ? 's' : ''}</span>
      </div>
    </div>
  )
}

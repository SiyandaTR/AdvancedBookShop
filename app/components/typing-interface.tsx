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
        return 'w-0.5 h-6 bg-black animate-blink'
      case 'block':
        return 'w-2 h-6 bg-black bg-opacity-50 animate-blink'
      case 'underline':
        return 'w-2 h-0.5 bg-black -bottom-1 animate-blink'
      default:
        return 'w-0.5 h-6 bg-black animate-blink'
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
      let className = ''
      if (index < typedText.length) {
        if (mistakePositions.includes(index)) {
          className = 'bg-red-200 text-red-700'
        } else {
          className = 'text-green-600'
        }
      }
      return (
        <span key={index} className={className}>
          {char}
        </span>
      )
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{defaultBook.chapters[currentChapter].title}</h2>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigatePage('prev')}
            disabled={currentChapter === 0 && currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
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
      <div 
        ref={inputRef}
        className="relative border p-4 rounded min-h-[200px] focus:outline-none cursor-text"
        style={{
          fontSize: `${settings.fontSize}px`,
          color: settings.fontColor,
          fontFamily: settings.fontType,
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
    </div>
  )
}


"use client"

import { useState, useEffect } from 'react'

interface AnalyticsPanelProps {
  wpm: number;
  accuracy: number;
}

export function AnalyticsPanel({ wpm, accuracy }: AnalyticsPanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Words per Minute</h2>
        <p>{wpm}</p>
      </div>
      <div>
        <h2 className="text-xl font-bold">Accuracy</h2>
        <p>{accuracy}%</p>
      </div>
    </div>
  )
}


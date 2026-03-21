"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Gauge, Target } from "lucide-react"

interface AnalyticsPanelProps {
  wpm: number;
  accuracy: number;
}

export function AnalyticsPanel({ wpm, accuracy }: AnalyticsPanelProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 max-w-lg">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Words per Minute</CardTitle>
          <Gauge className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{wpm}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {wpm === 0 ? "Start typing to see your speed" : "Current typing speed"}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{accuracy}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            {accuracy === 100 ? "Perfect score" : "Keep practicing!"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

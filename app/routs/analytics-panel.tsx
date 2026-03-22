"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Gauge, Target, Clock, Keyboard, Zap, TrendingUp, AlertTriangle } from "lucide-react"
import type { SessionData } from "../typing-app"

interface AnalyticsPanelProps {
  wpm: number
  accuracy: number
  sessions?: SessionData[]
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`
}

export function AnalyticsPanel({ wpm, accuracy, sessions = [] }: AnalyticsPanelProps) {
  const totalSessions = sessions.length
  const avgWpm = totalSessions > 0
    ? Math.round(sessions.reduce((sum, s) => sum + s.wpm, 0) / totalSessions)
    : 0
  const avgAccuracy = totalSessions > 0
    ? Math.round(sessions.reduce((sum, s) => sum + s.accuracy, 0) / totalSessions)
    : 0
  const totalCharsTyped = sessions.reduce((sum, s) => sum + (s.chars_typed || 0), 0)
  const totalTimeSpent = sessions.reduce((sum, s) => sum + (s.time_spent_seconds || 0), 0)
  const bestWpm = totalSessions > 0 ? Math.max(...sessions.map((s) => s.wpm)) : 0
  const totalMistakesAll = sessions.reduce((sum, s) => sum + (s.total_mistakes || 0), 0)
  const totalCorrectAll = sessions.reduce((sum, s) => sum + (s.correct_keystrokes || 0), 0)

  return (
    <div className="space-y-6">
      {/* Current Session */}
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

      {/* All-Time Stats */}
      {totalSessions > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSessions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg WPM</CardTitle>
              <Gauge className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgWpm}</div>
              <p className="text-xs text-muted-foreground">Best: {bestWpm} WPM</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Accuracy</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgAccuracy}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Practice</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(totalTimeSpent)}</div>
              <p className="text-xs text-muted-foreground">{totalCharsTyped.toLocaleString()} chars typed</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Keystroke Breakdown */}
      {totalSessions > 0 && (totalCorrectAll > 0 || totalMistakesAll > 0) && (
        <div className="grid gap-4 sm:grid-cols-3 max-w-2xl">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Correct Keystrokes</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{totalCorrectAll.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{totalMistakesAll.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              <Keyboard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalCorrectAll + totalMistakesAll > 0
                  ? `${Math.round((totalMistakesAll / (totalCorrectAll + totalMistakesAll)) * 100)}%`
                  : "0%"}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Session History */}
      {totalSessions > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Session History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">WPM</TableHead>
                  <TableHead className="text-right">Accuracy</TableHead>
                  <TableHead className="text-right">Chars</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">{session.source}</TableCell>
                    <TableCell className="text-right">{session.wpm}</TableCell>
                    <TableCell className="text-right">{session.accuracy}%</TableCell>
                    <TableCell className="text-right text-muted-foreground">{session.chars_typed || "—"}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {session.time_spent_seconds ? formatDuration(session.time_spent_seconds) : "—"}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      <Clock className="mr-1 inline h-3 w-3" />
                      {new Date(session.completed_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

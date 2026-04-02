"use client"

import { motion } from "framer-motion"
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

const stagger = {
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
}

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export function AnalyticsPanel({ wpm, accuracy, sessions = [] }: AnalyticsPanelProps) {
  const totalSessions = sessions.length
  const avgWpm = totalSessions > 0 ? Math.round(sessions.reduce((sum, s) => sum + s.wpm, 0) / totalSessions) : 0
  const avgAccuracy = totalSessions > 0 ? Math.round(sessions.reduce((sum, s) => sum + s.accuracy, 0) / totalSessions) : 0
  const totalCharsTyped = sessions.reduce((sum, s) => sum + (s.chars_typed || 0), 0)
  const totalTimeSpent = sessions.reduce((sum, s) => sum + (s.time_spent_seconds || 0), 0)
  const bestWpm = totalSessions > 0 ? Math.max(...sessions.map((s) => s.wpm)) : 0
  const totalMistakesAll = sessions.reduce((sum, s) => sum + (s.total_mistakes || 0), 0)
  const totalCorrectAll = sessions.reduce((sum, s) => sum + (s.correct_keystrokes || 0), 0)

  return (
    <motion.div className="space-y-8" variants={stagger} initial="initial" animate="animate">
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h2 className="font-heading text-2xl font-bold">Stats</h2>
        <p className="text-sm text-fg-muted font-body font-light mt-1">Your typing performance at a glance.</p>
      </motion.div>

      {/* Current Session */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4 max-w-lg">
        <StatCard label="Speed" value={wpm} unit="WPM" accent={wpm > 0} />
        <StatCard label="Accuracy" value={accuracy} unit="%" accent={accuracy < 100} />
      </motion.div>

      {/* All-Time Stats */}
      {totalSessions > 0 && (
        <>
          <motion.div variants={fadeUp}>
            <span className="text-xs text-fg-subtle font-body uppercase tracking-[0.15em]">All time</span>
          </motion.div>
          <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Sessions" value={totalSessions} />
            <StatCard label="Avg Speed" value={avgWpm} unit="WPM" sub={`Best: ${bestWpm}`} />
            <StatCard label="Avg Accuracy" value={avgAccuracy} unit="%" />
            <StatCard label="Practice" value={formatDuration(totalTimeSpent)} sub={`${totalCharsTyped.toLocaleString()} chars`} />
          </motion.div>

          {/* Keystroke Breakdown */}
          {(totalCorrectAll > 0 || totalMistakesAll > 0) && (
            <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4 max-w-2xl">
              <StatCard label="Correct" value={totalCorrectAll.toLocaleString()} color="text-[var(--success)]" />
              <StatCard label="Errors" value={totalMistakesAll.toLocaleString()} color="text-[var(--error)]" />
              <StatCard
                label="Error Rate"
                value={totalCorrectAll + totalMistakesAll > 0 ? `${Math.round((totalMistakesAll / (totalCorrectAll + totalMistakesAll)) * 100)}%` : "0%"}
              />
            </motion.div>
          )}

          {/* Session History */}
          <motion.div variants={fadeUp}>
            <span className="text-xs text-fg-subtle font-body uppercase tracking-[0.15em]">Recent sessions</span>
            <div className="mt-3 border border-[var(--border)] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-body">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs text-fg-subtle uppercase tracking-wider">
                      <th className="text-left p-3 font-medium">Source</th>
                      <th className="text-right p-3 font-medium">WPM</th>
                      <th className="text-right p-3 font-medium">Accuracy</th>
                      <th className="text-right p-3 font-medium hidden md:table-cell">Chars</th>
                      <th className="text-right p-3 font-medium hidden md:table-cell">Time</th>
                      <th className="text-right p-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.slice(0, 20).map((session, i) => (
                      <motion.tr
                        key={session.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + i * 0.03 }}
                        className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-hover)] transition-colors"
                      >
                        <td className="p-3 max-w-[180px] truncate text-fg-muted">{session.source}</td>
                        <td className="p-3 text-right tabular-nums font-medium">{session.wpm}</td>
                        <td className="p-3 text-right tabular-nums">{session.accuracy}%</td>
                        <td className="p-3 text-right tabular-nums text-fg-muted hidden md:table-cell">{session.chars_typed || "—"}</td>
                        <td className="p-3 text-right text-fg-muted hidden md:table-cell">{session.time_spent_seconds ? formatDuration(session.time_spent_seconds) : "—"}</td>
                        <td className="p-3 text-right text-fg-subtle">{new Date(session.completed_at).toLocaleDateString()}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </>
      )}

      {totalSessions === 0 && (
        <motion.div variants={fadeUp} className="text-center py-12 text-sm text-fg-subtle font-body">
          No sessions yet. Start typing to see your stats.
        </motion.div>
      )}
    </motion.div>
  )
}

function StatCard({ label, value, unit, sub, accent, color }: {
  label: string; value: string | number; unit?: string; sub?: string; accent?: boolean; color?: string
}) {
  return (
    <div className="border border-[var(--border)] rounded-xl p-4 bg-[var(--surface)] hover:border-[var(--fg-subtle)] transition-colors">
      <span className="text-xs text-fg-subtle font-body">{label}</span>
      <div className={`text-2xl font-bold font-body mt-1 tabular-nums ${color || ""}`}>
        {value}{unit && <span className="text-sm text-fg-muted ml-1">{unit}</span>}
      </div>
      {sub && <p className="text-xs text-fg-subtle font-body mt-1">{sub}</p>}
    </div>
  )
}

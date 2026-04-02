"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ThemeToggle } from "@/components/theme-toggle"
import * as React from "react"

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Three.js Background */}
      <ThreeScene />

      {/* Navigation */}
      <motion.header
        className="relative z-50 border-b border-[var(--border)]"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="max-w-5xl mx-auto flex h-14 items-center justify-between px-6">
          <Link href="/" className="font-heading text-lg font-bold tracking-tight hover:opacity-70 transition-opacity">
            typeloft
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login" className="text-sm text-fg-muted hover:text-[var(--fg)] transition-colors font-body">
              Sign in
            </Link>
            <Link
              href="/login"
              className="text-sm bg-[var(--accent)] text-[var(--accent-fg)] px-4 py-1.5 rounded-full font-medium hover:opacity-90 transition-opacity font-body"
            >
              Start
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <motion.section
        className="flex-1 flex items-center justify-center relative z-10"
        variants={stagger}
        initial="initial"
        animate="animate"
      >
        <div className="max-w-3xl mx-auto px-6 py-20 md:py-32 text-center">
          <motion.span variants={fadeUp} className="inline-block text-xs uppercase tracking-[0.2em] text-fg-muted font-body mb-6">
            typing · pdfs · focus
          </motion.span>

          <motion.h1 variants={fadeUp} className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95]">
            Type with
            <br />
            <span className="text-fg-muted">purpose.</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-6 text-base md:text-lg text-fg-muted max-w-md mx-auto font-body font-light leading-relaxed">
            Upload any PDF. Practice typing from real content.
            <br className="hidden md:block" />
            Track your speed, accuracy, progress.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="bg-[var(--accent)] text-[var(--accent-fg)] px-8 py-3 rounded-full text-sm font-medium font-body hover:opacity-90 transition-opacity"
            >
              Start typing free
            </Link>
            <a
              href="#how"
              className="text-sm text-fg-muted hover:text-[var(--fg)] transition-colors font-body border border-[var(--border)] px-6 py-2.5 rounded-full hover:border-[var(--fg-subtle)]"
            >
              How it works
            </a>
          </motion.div>

          {/* Typing preview */}
          <motion.div variants={fadeUp} className="mt-16 md:mt-20">
            <TypingPreview />
          </motion.div>
        </div>
      </motion.section>

      {/* How it works */}
      <section id="how" className="relative z-10 border-t border-[var(--border)] py-20 md:py-28">
        <motion.div
          className="max-w-4xl mx-auto px-6"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
        >
          <motion.h2 variants={fadeUp} className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-center mb-16">
            Three steps. That&apos;s it.
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-12 md:gap-8">
            {[
              { step: "01", title: "Upload", desc: "Drop a PDF or use built-in texts. Extract content instantly." },
              { step: "02", title: "Type", desc: "Follow along and type in real-time with live error feedback." },
              { step: "03", title: "Improve", desc: "Track WPM, accuracy, and growth across every session." },
            ].map((item) => (
              <motion.div key={item.step} variants={fadeUp} className="group">
                <span className="text-xs font-body text-fg-subtle uppercase tracking-[0.15em]">{item.step}</span>
                <h3 className="font-heading text-xl font-bold mt-2 mb-2 group-hover:text-fg-muted transition-colors">{item.title}</h3>
                <p className="text-sm text-fg-muted font-body font-light leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="relative z-10 border-t border-[var(--border)] py-20 md:py-28">
        <motion.div
          className="max-w-md mx-auto px-6 text-center"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.h2 variants={fadeUp} className="font-heading text-3xl md:text-4xl font-bold tracking-tight">Ready?</motion.h2>
          <motion.p variants={fadeUp} className="mt-3 text-fg-muted font-body font-light">Free. No setup. Start in seconds.</motion.p>
          <motion.div variants={fadeUp} className="mt-8">
            <Link href="/login" className="bg-[var(--accent)] text-[var(--accent-fg)] px-8 py-3 rounded-full text-sm font-medium font-body hover:opacity-90 transition-opacity inline-block">
              Create free account
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[var(--border)] py-6">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between text-xs text-fg-subtle font-body">
          <span className="font-heading font-bold text-fg-muted">typeloft</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  )
}

function TypingPreview() {
  const text = "The quick brown fox jumps over the lazy dog..."
  const typed = "The quick brown f"

  return (
    <div className="max-w-2xl mx-auto border border-[var(--border)] rounded-2xl p-6 md:p-8 bg-[var(--surface)] text-left relative overflow-hidden group hover:border-[var(--fg-subtle)] transition-colors duration-500">
      <div className="absolute top-3 left-4 flex gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-[var(--border)]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[var(--border)]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[var(--border)]" />
      </div>
      <div className="mt-4 text-base md:text-lg leading-relaxed font-body">
        <span className="text-[var(--success)]">{typed}</span>
        <span className="inline-block w-[2px] h-5 bg-[var(--fg)] animate-cursor-blink align-middle ml-[1px]" />
        <span className="text-fg-muted">{text.slice(typed.length)}</span>
      </div>
      <div className="mt-4 flex gap-6 text-xs text-fg-subtle font-body">
        <span>0 WPM</span>
        <span>100% accuracy</span>
        <span>0 / {text.length} chars</span>
      </div>
    </div>
  )
}

function ThreeScene() {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  const { ThreeBackground } = require("@/components/three-background")
  return <ThreeBackground />
}

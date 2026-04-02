"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import type { SupabaseClient } from "@supabase/supabase-js"
import { Loader2, Check, X, Eye, EyeOff } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface PasswordCriteria {
  label: string
  test: (pw: string) => boolean
}

const PASSWORD_CRITERIA: PasswordCriteria[] = [
  { label: "At least 8 characters", test: (pw) => pw.length >= 8 },
  { label: "Uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
  { label: "Lowercase letter", test: (pw) => /[a-z]/.test(pw) },
  { label: "A number", test: (pw) => /\d/.test(pw) },
  { label: "Special character", test: (pw) => /[^A-Za-z0-9]/.test(pw) },
]

function getPasswordStrength(pw: string): { score: number; label: string } {
  const passed = PASSWORD_CRITERIA.filter((c) => c.test(pw)).length
  if (pw.length === 0) return { score: 0, label: "" }
  if (passed <= 1) return { score: 20, label: "Very weak" }
  if (passed === 2) return { score: 40, label: "Weak" }
  if (passed === 3) return { score: 60, label: "Fair" }
  if (passed === 4) return { score: 80, label: "Strong" }
  return { score: 100, label: "Very strong" }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const stagger = {
  animate: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
}

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export default function LoginPage() {
  const router = useRouter()
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null)
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [guestLoading, setGuestLoading] = useState(false)
  const [touched, setTouched] = useState({ email: false, password: false, confirmPassword: false })

  useEffect(() => { setSupabase(createClient()) }, [])

  const emailError = useMemo(() => {
    if (!touched.email) return null
    if (!email) return "Email is required"
    if (!isValidEmail(email)) return "Invalid email"
    return null
  }, [email, touched.email])

  const passwordError = useMemo(() => {
    if (!touched.password) return null
    if (!password) return "Password is required"
    if (activeTab === "signup" && password.length < 8) return "Min 8 characters"
    return null
  }, [password, touched.password, activeTab])

  const confirmPasswordError = useMemo(() => {
    if (activeTab !== "signup" || !touched.confirmPassword) return null
    if (!confirmPassword) return "Confirm your password"
    if (confirmPassword !== password) return "Passwords don't match"
    return null
  }, [confirmPassword, password, touched.confirmPassword, activeTab])

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password])
  const allCriteriaPassed = useMemo(() => PASSWORD_CRITERIA.every((c) => c.test(password)), [password])
  const isSignInFormValid = email && password && isValidEmail(email)
  const isSignUpFormValid = email && password && confirmPassword && isValidEmail(email) && allCriteriaPassed && password === confirmPassword

  const resetState = useCallback(() => { setError(null); setMessage(null); setTouched({ email: false, password: false, confirmPassword: false }) }, [])
  const handleTabChange = useCallback((value: "signin" | "signup") => { setActiveTab(value); resetState() }, [resetState])

  const handleGoogleSignIn = async () => {
    if (!supabase) return
    setGoogleLoading(true); setError(null)
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/confirm` } })
    if (error) { setError(error.message); setGoogleLoading(false) }
  }

  const handleGuestLogin = () => {
    setGuestLoading(true)
    router.push("/trying")
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ email: true, password: true, confirmPassword: false })
    if (!isSignInFormValid || !supabase) return
    setLoading(true); setError(null); setMessage(null)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) { setError(signInError.message); setLoading(false); return }
    router.push("/app"); router.refresh()
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ email: true, password: true, confirmPassword: true })
    if (!isSignUpFormValid || !supabase) return
    setLoading(true); setError(null); setMessage(null)
    const { error: signUpError } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth/confirm` } })
    if (signUpError) { setError(signUpError.message); setLoading(false); return }
    setMessage("Account created! Check your email for a confirmation link.")
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <motion.header
        className="border-b border-[var(--border)]"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-5xl mx-auto flex h-14 items-center justify-between px-6">
          <Link href="/" className="font-heading text-lg font-bold tracking-tight hover:opacity-70 transition-opacity">typeloft</Link>
          <ThemeToggle />
        </div>
      </motion.header>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div className="w-full max-w-sm" variants={stagger} initial="initial" animate="animate">
          <motion.div variants={fadeUp} className="text-center mb-8">
            <h1 className="font-heading text-3xl font-bold">
              {activeTab === "signin" ? "Welcome back" : "Get started"}
            </h1>
            <p className="text-sm text-fg-muted font-body font-light mt-2">
              {activeTab === "signin" ? "Sign in to continue typing." : "Create your free account."}
            </p>
          </motion.div>

          {!supabase && (
            <motion.p variants={fadeUp} className="text-sm text-[var(--error)] text-center mb-4">
              Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
            </motion.p>
          )}

          {/* Google */}
          <motion.button
            variants={fadeUp}
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-2 border border-[var(--border)] rounded-full py-2.5 text-sm font-body hover:bg-[var(--surface-hover)] transition-colors disabled:opacity-50"
          >
            {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Continue with Google
          </motion.button>

          {/* Login as Guest */}
          <motion.button
            variants={fadeUp}
            onClick={handleGuestLogin}
            disabled={guestLoading}
            className="w-full flex items-center justify-center gap-2 border border-[var(--border)] rounded-full py-2.5 text-sm font-body hover:bg-[var(--surface-hover)] transition-colors disabled:opacity-50 mt-3"
          >
            {guestLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Login as Guest
          </motion.button>

          {/* Divider */}
          <motion.div variants={fadeUp} className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border)]" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-[var(--bg)] px-3 text-fg-subtle font-body">or</span></div>
          </motion.div>

          {/* Tab Switcher */}
          <motion.div variants={fadeUp} className="flex border border-[var(--border)] rounded-full p-0.5 mb-6">
            {(["signin", "signup"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`relative flex-1 py-1.5 text-sm font-body font-medium rounded-full transition-colors ${activeTab === tab ? "text-[var(--accent-fg)]" : "text-fg-muted hover:text-[var(--fg)]"}`}
              >
                {activeTab === tab && (
                  <motion.div layoutId="auth-tab" className="absolute inset-0 bg-[var(--accent)] rounded-full" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                )}
                <span className="relative z-10">{tab === "signin" ? "Sign in" : "Sign up"}</span>
              </button>
            ))}
          </motion.div>

          {/* Form */}
          <motion.form variants={fadeUp} onSubmit={activeTab === "signin" ? handleSignIn : handleSignUp} className="space-y-4">
            {/* Email */}
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                className={cn(
                  "w-full bg-transparent border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm font-body outline-none transition-colors focus:border-[var(--fg-muted)] placeholder:text-fg-subtle",
                  emailError && "border-[var(--error)] focus:border-[var(--error)]"
                )}
                required
              />
              {emailError && <p className="text-xs text-[var(--error)] mt-1 font-body">{emailError}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  className={cn(
                    "w-full bg-transparent border border-[var(--border)] rounded-xl px-4 py-2.5 pr-10 text-sm font-body outline-none transition-colors focus:border-[var(--fg-muted)] placeholder:text-fg-subtle",
                    passwordError && "border-[var(--error)] focus:border-[var(--error)]"
                  )}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-subtle hover:text-[var(--fg)]">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordError && <p className="text-xs text-[var(--error)] mt-1 font-body">{passwordError}</p>}

              {/* Password Strength */}
              {activeTab === "signup" && password.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-fg-subtle font-body">Strength</span>
                    <span className="text-xs font-body font-medium text-fg-muted">{passwordStrength.label}</span>
                  </div>
                  <div className="h-[2px] bg-[var(--border)] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[var(--fg)] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${passwordStrength.score}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <ul className="space-y-1">
                    {PASSWORD_CRITERIA.map((c) => {
                      const passed = c.test(password)
                      return (
                        <li key={c.label} className={cn("flex items-center gap-2 text-xs font-body", passed ? "text-[var(--success)]" : "text-fg-subtle")}>
                          {passed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          {c.label}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            {activeTab === "signup" && (
              <div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, confirmPassword: true }))}
                    className={cn(
                      "w-full bg-transparent border border-[var(--border)] rounded-xl px-4 py-2.5 pr-10 text-sm font-body outline-none transition-colors focus:border-[var(--fg-muted)] placeholder:text-fg-subtle",
                      confirmPasswordError && "border-[var(--error)] focus:border-[var(--error)]",
                      touched.confirmPassword && confirmPassword && !confirmPasswordError && "border-[var(--success)] focus:border-[var(--success)]"
                    )}
                    required
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-subtle hover:text-[var(--fg)]">
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPasswordError && <p className="text-xs text-[var(--error)] mt-1 font-body">{confirmPasswordError}</p>}
                {touched.confirmPassword && confirmPassword && !confirmPasswordError && (
                  <p className="flex items-center gap-1 text-xs text-[var(--success)] mt-1 font-body"><Check className="h-3 w-3" /> Passwords match</p>
                )}
              </div>
            )}

            {error && <p className="text-sm text-[var(--error)] font-body">{error}</p>}
            {message && <p className="text-sm text-[var(--success)] font-body">{message}</p>}

            <button
              type="submit"
              disabled={loading || (activeTab === "signin" ? !isSignInFormValid : !isSignUpFormValid)}
              className="w-full bg-[var(--accent)] text-[var(--accent-fg)] rounded-full py-2.5 text-sm font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />{activeTab === "signin" ? "Signing in..." : "Creating..."}</span>
              ) : activeTab === "signin" ? "Sign in" : "Create account"}
            </button>
          </motion.form>
        </motion.div>
      </div>
    </div>
  )
}

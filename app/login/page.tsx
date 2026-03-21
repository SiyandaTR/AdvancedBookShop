"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { SupabaseClient } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { BookOpen, Loader2, Check, X, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

// --- Password strength logic ---
interface PasswordCriteria {
  label: string
  test: (pw: string) => boolean
}

const PASSWORD_CRITERIA: PasswordCriteria[] = [
  { label: "At least 8 characters", test: (pw) => pw.length >= 8 },
  { label: "Contains an uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
  { label: "Contains a lowercase letter", test: (pw) => /[a-z]/.test(pw) },
  { label: "Contains a number", test: (pw) => /\d/.test(pw) },
  { label: "Contains a special character", test: (pw) => /[^A-Za-z0-9]/.test(pw) },
]

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  const passed = PASSWORD_CRITERIA.filter((c) => c.test(pw)).length
  if (pw.length === 0) return { score: 0, label: "", color: "" }
  if (passed <= 1) return { score: 20, label: "Very Weak", color: "bg-red-500" }
  if (passed === 2) return { score: 40, label: "Weak", color: "bg-orange-500" }
  if (passed === 3) return { score: 60, label: "Fair", color: "bg-yellow-500" }
  if (passed === 4) return { score: 80, label: "Strong", color: "bg-lime-500" }
  return { score: 100, label: "Very Strong", color: "bg-green-500" }
}

// --- Email validation ---
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function LoginPage() {
  const router = useRouter()
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null)

  useEffect(() => {
    setSupabase(createClient())
  }, [])

  // Form state
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
  const [touched, setTouched] = useState<{ email: boolean; password: boolean; confirmPassword: boolean }>({
    email: false,
    password: false,
    confirmPassword: false,
  })

  // Derived validation
  const emailError = useMemo(() => {
    if (!touched.email) return null
    if (!email) return "Email is required"
    if (!isValidEmail(email)) return "Please enter a valid email address"
    return null
  }, [email, touched.email])

  const passwordError = useMemo(() => {
    if (!touched.password) return null
    if (!password) return "Password is required"
    if (activeTab === "signup" && password.length < 8) return "Password must be at least 8 characters"
    return null
  }, [password, touched.password, activeTab])

  const confirmPasswordError = useMemo(() => {
    if (activeTab !== "signup" || !touched.confirmPassword) return null
    if (!confirmPassword) return "Please confirm your password"
    if (confirmPassword !== password) return "Passwords do not match"
    return null
  }, [confirmPassword, password, touched.confirmPassword, activeTab])

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password])
  const allCriteriaPassed = useMemo(
    () => PASSWORD_CRITERIA.every((c) => c.test(password)),
    [password]
  )

  const isSignInFormValid = email && password && isValidEmail(email)
  const isSignUpFormValid = email && password && confirmPassword && isValidEmail(email) && allCriteriaPassed && password === confirmPassword

  const resetState = useCallback(() => {
    setError(null)
    setMessage(null)
    setTouched({ email: false, password: false, confirmPassword: false })
  }, [])

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as "signin" | "signup")
    resetState()
  }, [resetState])

  const handleGoogleSignIn = async () => {
    if (!supabase) return
    setGoogleLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/confirm`,
      },
    })

    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ email: true, password: true, confirmPassword: false })
    if (!isSignInFormValid || !supabase) return

    setLoading(true)
    setError(null)
    setMessage(null)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    router.push("/app")
    router.refresh()
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ email: true, password: true, confirmPassword: true })
    if (!isSignUpFormValid || !supabase) return

    setLoading(true)
    setError(null)
    setMessage(null)

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    setMessage("Account created! Check your email for a confirmation link.")
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Advanced Book Shop</CardTitle>
          <CardDescription>
            {activeTab === "signin"
              ? "Welcome back! Sign in to your account"
              : "Create a new account to get started"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Google OAuth */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or with email
              </span>
            </div>
          </div>

          {/* Sign In / Sign Up Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* --- Sign In Tab --- */}
            <TabsContent value="signin" className="mt-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    className={cn(emailError && "border-destructive focus-visible:ring-destructive")}
                    aria-invalid={!!emailError}
                    aria-describedby={emailError ? "signin-email-error" : undefined}
                    required
                  />
                  {emailError && (
                    <p id="signin-email-error" className="text-sm text-destructive">
                      {emailError}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                      className={cn(
                        "pr-10",
                        passwordError && "border-destructive focus-visible:ring-destructive"
                      )}
                      aria-invalid={!!passwordError}
                      aria-describedby={passwordError ? "signin-password-error" : undefined}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordError && (
                    <p id="signin-password-error" className="text-sm text-destructive">
                      {passwordError}
                    </p>
                  )}
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading || !isSignInFormValid}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* --- Sign Up Tab --- */}
            <TabsContent value="signup" className="mt-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    className={cn(emailError && "border-destructive focus-visible:ring-destructive")}
                    aria-invalid={!!emailError}
                    aria-describedby={emailError ? "signup-email-error" : undefined}
                    required
                  />
                  {emailError && (
                    <p id="signup-email-error" className="text-sm text-destructive">
                      {emailError}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                      className={cn(
                        "pr-10",
                        passwordError && "border-destructive focus-visible:ring-destructive"
                      )}
                      aria-invalid={!!passwordError}
                      aria-describedby="signup-password-strength"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-sm text-destructive">{passwordError}</p>
                  )}

                  {/* Password Strength Indicator */}
                  {password.length > 0 && (
                    <div id="signup-password-strength" className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Password strength</span>
                        <span
                          className={cn(
                            "text-xs font-medium",
                            passwordStrength.score <= 20 && "text-red-500",
                            passwordStrength.score === 40 && "text-orange-500",
                            passwordStrength.score === 60 && "text-yellow-600",
                            passwordStrength.score === 80 && "text-lime-600",
                            passwordStrength.score === 100 && "text-green-600"
                          )}
                        >
                          {passwordStrength.label}
                        </span>
                      </div>
                      <Progress
                        value={passwordStrength.score}
                        className="h-2"
                        indicatorClassName={passwordStrength.color}
                      />
                      <ul className="space-y-1 pt-1">
                        {PASSWORD_CRITERIA.map((criteria) => {
                          const passed = criteria.test(password)
                          return (
                            <li
                              key={criteria.label}
                              className={cn(
                                "flex items-center gap-2 text-xs",
                                passed ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                              )}
                            >
                              {passed ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <X className="h-3 w-3" />
                              )}
                              {criteria.label}
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, confirmPassword: true }))}
                      className={cn(
                        "pr-10",
                        confirmPasswordError && "border-destructive focus-visible:ring-destructive",
                        touched.confirmPassword && confirmPassword && !confirmPasswordError && "border-green-500 focus-visible:ring-green-500"
                      )}
                      aria-invalid={!!confirmPasswordError}
                      aria-describedby={confirmPasswordError ? "signup-confirm-error" : undefined}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPasswordError && (
                    <p id="signup-confirm-error" className="text-sm text-destructive">
                      {confirmPasswordError}
                    </p>
                  )}
                  {touched.confirmPassword && confirmPassword && !confirmPasswordError && (
                    <p className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                      <Check className="h-3 w-3" /> Passwords match
                    </p>
                  )}
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                {message && (
                  <p className="text-sm text-green-600 dark:text-green-400">{message}</p>
                )}
                <Button type="submit" className="w-full" disabled={loading || !isSignUpFormValid}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

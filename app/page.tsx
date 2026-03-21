import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { ThemeProvider } from "@/components/theme-provider"
import {
  BookOpen,
  FileText,
  BarChart3,
  Keyboard,
  Upload,
  Zap,
  ArrowRight,
  CheckCircle,
} from "lucide-react"

export default function LandingPage() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-14 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="text-lg font-semibold tracking-tight">
                Advanced Book Shop
              </span>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/login">Get Started</Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="flex-1">
          <div className="container mx-auto px-4 py-20 md:py-32">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center rounded-full border px-4 py-1.5 text-sm text-muted-foreground">
                <Zap className="mr-2 h-3.5 w-3.5 text-primary" />
                Practice typing with any book or PDF
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Master your typing
                <span className="text-primary"> with books</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground md:text-xl">
                Upload any PDF and turn it into a typing exercise. Track your
                speed, accuracy, and progress over time.
              </p>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Button size="lg" asChild>
                  <Link href="/login">
                    Start Typing Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#features">See Features</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-t bg-muted/40 py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need to type faster
              </h2>
              <p className="mt-4 text-muted-foreground">
                Import real content, practice in a focused interface, and track
                your improvement with detailed analytics.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Upload className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">PDF Upload</CardTitle>
                  <CardDescription>
                    Import any PDF and extract its text to use as typing
                    material.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Keyboard className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Typing Practice</CardTitle>
                  <CardDescription>
                    Real-time feedback as you type with highlighted errors and
                    current position.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Analytics</CardTitle>
                  <CardDescription>
                    Track words per minute, accuracy, and progress across
                    sessions.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                How it works
              </h2>
            </div>
            <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
              {[
                {
                  step: "1",
                  title: "Upload a PDF",
                  desc: "Drag and drop any PDF document into the app.",
                  icon: FileText,
                },
                {
                  step: "2",
                  title: "Start typing",
                  desc: "Follow the extracted text and type along in real time.",
                  icon: Keyboard,
                },
                {
                  step: "3",
                  title: "Track progress",
                  desc: "Review your WPM, accuracy, and improvement over time.",
                  icon: BarChart3,
                },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary text-lg font-bold text-primary">
                    {item.step}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t bg-muted/40 py-20 md:py-28">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to improve your typing?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Sign up for free and start practicing with your own books and
              documents.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/login">
                  Create Free Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-6">
          <div className="container mx-auto flex items-center justify-between px-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Advanced Book Shop
            </div>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  )
}

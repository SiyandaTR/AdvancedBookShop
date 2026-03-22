"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Shield,
  Users,
  BookOpen,
  FileText,
  BarChart3,
  LogOut,
  Activity,
  Clock,
  Server,
  Database,
  HardDrive,
  Loader2,
} from "lucide-react"

interface ActivityItem {
  id: number
  action: string
  user: string
  time: string
  status: "success" | "error" | "info"
}

interface AdminStats {
  totalUsers: number
  pdfsUploaded: number
  recentActivity: ActivityItem[]
}

const systemMetrics = [
  { label: "CPU Usage", value: "N/A", icon: Server, trend: "unknown" },
  { label: "Memory", value: "N/A", icon: Database, trend: "unknown" },
  { label: "Storage", value: "N/A", icon: HardDrive, trend: "unknown" },
]

export default function AdminDashboardClient() {
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats")
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/admin/login")
            return
          }
          throw new Error("Failed to fetch stats")
        }
        const data = await res.json()
        setStats(data)
      } catch {
        setError("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [router])

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold tracking-tight">
              Admin Dashboard
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="hidden sm:inline-flex">
              Admin
            </Badge>
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 container mx-auto px-4 py-6 space-y-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-destructive">{error}</div>
        ) : (
          <>
            {/* Stats row */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalUsers ?? 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Users with uploaded PDFs
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">PDFs Uploaded</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.pdfsUploaded ?? 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Total PDF documents
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">System Status</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">Online</div>
                  <p className="text-xs text-muted-foreground">
                    All services operational
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Middle row */}
            <div className="grid gap-4 lg:grid-cols-3">
              {/* Recent Activity */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Latest actions across the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Action</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stats.recentActivity.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.action}</TableCell>
                            <TableCell className="text-muted-foreground max-w-[150px] truncate">{item.user}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  item.status === "success"
                                    ? "default"
                                    : item.status === "error"
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {item.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              <Clock className="mr-1 inline h-3 w-3" />
                              {item.time}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No recent activity
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* System Health */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-4 w-4" />
                    System Health
                  </CardTitle>
                  <CardDescription>Current server status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {systemMetrics.map((metric) => {
                    const Icon = metric.icon
                    return (
                      <div key={metric.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{metric.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{metric.value}</span>
                        </div>
                      </div>
                    )
                  })}
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Supabase</span>
                    <Badge variant="default">Connected</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button variant="outline" asChild>
                  <Link href="/app">
                    <BookOpen className="mr-2 h-4 w-4" />
                    View App
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/admin/dashboard">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/admin/dashboard">
                    <FileText className="mr-2 h-4 w-4" />
                    View PDFs
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/admin/dashboard">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Full Analytics
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Advanced Book Shop — Admin Panel
        </div>
      </footer>
    </div>
  )
}

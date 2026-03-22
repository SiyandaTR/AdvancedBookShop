import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getAdminCookieName, validateAdminToken } from "@/lib/admin/config"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get(getAdminCookieName())

  if (!token?.value || !validateAdminToken(token.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = await createClient()

  // Get PDF count
  const { count: pdfCount } = await supabase
    .from("pdfs")
    .select("*", { count: "exact", head: true })

  // Get distinct user count from pdfs (best proxy for active users)
  const { data: pdfs } = await supabase
    .from("pdfs")
    .select("user_id, created_at, name")
    .order("created_at", { ascending: false })
    .limit(20)

  const distinctUsers = new Set(pdfs?.map((p) => p.user_id) || []).size

  // Build recent activity from PDF uploads
  const recentActivity = (pdfs || []).slice(0, 5).map((pdf, index) => ({
    id: index + 1,
    action: `PDF uploaded: ${pdf.name}`,
    user: pdf.user_id,
    time: formatTimeAgo(pdf.created_at),
    status: "success" as const,
  }))

  return NextResponse.json({
    totalUsers: distinctUsers,
    pdfsUploaded: pdfCount || 0,
    recentActivity,
  })
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins} min ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
}

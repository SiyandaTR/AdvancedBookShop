import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getAdminCookieName } from "@/lib/admin/config"
import AdminDashboardClient from "./dashboard-client"

export default async function AdminDashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(getAdminCookieName())

  if (!token?.value) {
    redirect("/admin/login")
  }

  return <AdminDashboardClient />
}

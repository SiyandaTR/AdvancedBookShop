import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { getAdminCookieName } from "@/lib/admin/config"

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get(getAdminCookieName())

  if (!token?.value) {
    redirect("/admin/login")
  }

  return <>{children}</>
}

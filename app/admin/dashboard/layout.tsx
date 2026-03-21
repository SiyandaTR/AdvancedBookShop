import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { getAdminCookieName, validateAdminToken } from "@/lib/admin/config"

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get(getAdminCookieName())

  if (!token?.value || !validateAdminToken(token.value)) {
    redirect("/admin/login")
  }

  return <>{children}</>
}

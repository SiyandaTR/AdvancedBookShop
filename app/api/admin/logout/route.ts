import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import {
  getAdminCookieName,
  validateAdminToken,
  revokeAdminToken,
} from "@/lib/admin/config"

export async function POST() {
  const cookieStore = await cookies()
  const token = cookieStore.get(getAdminCookieName())

  if (token?.value) {
    revokeAdminToken(token.value)
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set(getAdminCookieName(), "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: 0,
  })
  return response
}

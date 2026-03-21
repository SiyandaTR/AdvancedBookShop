import { NextResponse } from "next/server"
import { getAdminCookieName } from "@/lib/admin/config"

export async function POST() {
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

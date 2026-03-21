import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import TypingApp from "./typing-app"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return <TypingApp email={user.email ?? ""} />
}

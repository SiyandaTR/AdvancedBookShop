import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string }>
}) {
  const params = await searchParams
  const token_hash = params.token_hash
  const type = params.type

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      type: type as
        | "signup"
        | "invite"
        | "magiclink"
        | "recovery"
        | "email_change",
      token_hash,
    })

    if (!error) {
      redirect("/")
    }
  }

  redirect("/login")
}

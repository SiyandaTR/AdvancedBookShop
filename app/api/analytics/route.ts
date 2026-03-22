import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data, error } = await supabase
    .from("typing_sessions")
    .select("id, wpm, accuracy, source, chars_typed, time_spent_seconds, correct_keystrokes, total_mistakes, completed_at")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false })
    .limit(100)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const {
    wpm,
    accuracy,
    source,
    chars_typed,
    time_spent_seconds,
    correct_keystrokes,
    total_mistakes,
  } = body

  if (typeof wpm !== "number" || typeof accuracy !== "number") {
    return NextResponse.json({ error: "wpm and accuracy are required" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("typing_sessions")
    .insert({
      user_id: user.id,
      wpm,
      accuracy,
      source: source || "default",
      chars_typed: chars_typed || 0,
      time_spent_seconds: time_spent_seconds || 0,
      correct_keystrokes: correct_keystrokes || 0,
      total_mistakes: total_mistakes || 0,
    })
    .select("id, wpm, accuracy, source, chars_typed, time_spent_seconds, correct_keystrokes, total_mistakes, completed_at")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

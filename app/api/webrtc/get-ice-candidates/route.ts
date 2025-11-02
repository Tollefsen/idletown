import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL ?? "",
      process.env.SUPABASE_ANON_KEY ?? "",
    );

    const { searchParams } = new URL(request.url);
    const roomCode = searchParams.get("roomCode");
    const sender = searchParams.get("sender");
    const since = searchParams.get("since");

    if (!roomCode || typeof roomCode !== "string") {
      return NextResponse.json({ error: "Invalid room code" }, { status: 400 });
    }

    if (sender !== "host" && sender !== "peer") {
      return NextResponse.json({ error: "Invalid sender" }, { status: 400 });
    }

    let query = supabase
      .from("webrtc_ice_candidates")
      .select("id, candidate, created_at")
      .eq("room_code", roomCode.toUpperCase())
      .eq("sender", sender)
      .order("created_at", { ascending: true });

    // If 'since' timestamp is provided, only get candidates after that time
    if (since) {
      query = query.gt("created_at", since);
    }

    const { data: candidates, error } = await query;

    if (error) {
      console.error("Failed to get ICE candidates:", error);
      return NextResponse.json(
        { error: "Failed to get ICE candidates" },
        { status: 500 },
      );
    }

    return NextResponse.json({ candidates: candidates || [] });
  } catch (error) {
    console.error("Error getting ICE candidates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

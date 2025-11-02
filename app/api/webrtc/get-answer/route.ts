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

    if (!roomCode || typeof roomCode !== "string") {
      return NextResponse.json({ error: "Invalid room code" }, { status: 400 });
    }

    const { data: room, error } = await supabase
      .from("webrtc_rooms")
      .select("peer_answer, status")
      .eq("room_code", roomCode.toUpperCase())
      .single();

    if (error || !room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json({
      answer: room.peer_answer,
      status: room.status,
    });
  } catch (error) {
    console.error("Error getting answer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

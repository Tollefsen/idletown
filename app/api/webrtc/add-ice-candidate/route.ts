import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL ?? "",
      process.env.SUPABASE_ANON_KEY ?? "",
    );

    const { roomCode, candidate, sender } = await request.json();

    if (!roomCode || typeof roomCode !== "string") {
      return NextResponse.json({ error: "Invalid room code" }, { status: 400 });
    }

    if (!candidate || typeof candidate !== "string") {
      return NextResponse.json({ error: "Invalid candidate" }, { status: 400 });
    }

    if (sender !== "host" && sender !== "peer") {
      return NextResponse.json({ error: "Invalid sender" }, { status: 400 });
    }

    // Verify room exists
    const { data: room, error: roomError } = await supabase
      .from("webrtc_rooms")
      .select("room_code")
      .eq("room_code", roomCode.toUpperCase())
      .single();

    if (roomError || !room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Insert ICE candidate
    const { error: insertError } = await supabase
      .from("webrtc_ice_candidates")
      .insert({
        room_code: roomCode.toUpperCase(),
        candidate,
        sender,
      });

    if (insertError) {
      console.error("Failed to insert ICE candidate:", insertError);
      return NextResponse.json(
        { error: "Failed to add ICE candidate" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding ICE candidate:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL ?? "",
      process.env.SUPABASE_ANON_KEY ?? "",
    );

    const { roomCode, answer } = await request.json();

    if (!roomCode || typeof roomCode !== "string") {
      return NextResponse.json({ error: "Invalid room code" }, { status: 400 });
    }

    if (!answer || typeof answer !== "string") {
      return NextResponse.json({ error: "Invalid answer" }, { status: 400 });
    }

    const { data: room, error: fetchError } = await supabase
      .from("webrtc_rooms")
      .select()
      .eq("room_code", roomCode.toUpperCase())
      .single();

    if (fetchError || !room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.peer_answer) {
      return NextResponse.json(
        { error: "Room already has a peer" },
        { status: 409 },
      );
    }

    const { error: updateError } = await supabase
      .from("webrtc_rooms")
      .update({
        peer_answer: answer,
        status: "connected",
      })
      .eq("room_code", roomCode.toUpperCase());

    if (updateError) {
      console.error("Failed to update room:", updateError);
      return NextResponse.json(
        { error: "Failed to join room" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error joining room:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

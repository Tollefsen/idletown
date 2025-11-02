import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL ?? "",
      process.env.SUPABASE_ANON_KEY ?? "",
    );

    const {
      offer,
      isPublic = false,
      roomName = "Game Room",
    } = await request.json();

    if (!offer || typeof offer !== "string") {
      return NextResponse.json({ error: "Invalid offer" }, { status: 400 });
    }

    if (typeof isPublic !== "boolean") {
      return NextResponse.json(
        { error: "Invalid isPublic value" },
        { status: 400 },
      );
    }

    if (typeof roomName !== "string" || roomName.trim().length === 0) {
      return NextResponse.json({ error: "Invalid room name" }, { status: 400 });
    }

    let roomCode: string;
    let inserted = false;
    let attempts = 0;
    const maxAttempts = 5;

    while (!inserted && attempts < maxAttempts) {
      roomCode = generateRoomCode();
      attempts++;

      const { data, error } = await supabase
        .from("webrtc_rooms")
        .insert({
          room_code: roomCode,
          host_offer: offer,
          room_name: roomName.trim(),
          is_public: isPublic,
          status: "waiting",
        })
        .select()
        .single();

      if (!error) {
        inserted = true;
        return NextResponse.json({
          roomCode,
          roomId: data.id,
        });
      }

      if (error.code !== "23505") {
        console.error("Failed to create room:", error);
        return NextResponse.json(
          { error: "Failed to create room" },
          { status: 500 },
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to generate unique room code" },
      { status: 500 },
    );
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

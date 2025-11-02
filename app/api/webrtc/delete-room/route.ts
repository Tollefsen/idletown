import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
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

    const { error } = await supabase
      .from("webrtc_rooms")
      .delete()
      .eq("room_code", roomCode.toUpperCase());

    if (error) {
      console.error("Failed to delete room:", error);
      return NextResponse.json(
        { error: "Failed to delete room" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting room:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL ?? "",
      process.env.SUPABASE_ANON_KEY ?? "",
    );

    const { data: rooms, error } = await supabase
      .from("webrtc_rooms")
      .select("id, room_code, room_name, created_at, status")
      .eq("is_public", true)
      .eq("status", "waiting")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Failed to fetch rooms:", error);
      return NextResponse.json(
        { error: "Failed to fetch rooms" },
        { status: 500 },
      );
    }

    return NextResponse.json({ rooms: rooms || [] });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

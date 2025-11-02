-- WebRTC Signaling Database Schema
-- Run this in your Supabase SQL editor

-- Create rooms table for WebRTC signaling
CREATE TABLE IF NOT EXISTS webrtc_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code TEXT UNIQUE NOT NULL,
  room_name TEXT NOT NULL DEFAULT 'Game Room',
  host_offer TEXT NOT NULL,
  peer_answer TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 hour'),
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'connected', 'expired'))
);

-- Create index for fast room code lookups
CREATE INDEX IF NOT EXISTS idx_room_code ON webrtc_rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_expires_at ON webrtc_rooms(expires_at);

-- Enable Row Level Security
ALTER TABLE webrtc_rooms ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert new rooms
CREATE POLICY "Anyone can create rooms" ON webrtc_rooms
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to read rooms
CREATE POLICY "Anyone can read rooms" ON webrtc_rooms
  FOR SELECT
  USING (true);

-- Allow anyone to update rooms (for adding peer answer)
CREATE POLICY "Anyone can update rooms" ON webrtc_rooms
  FOR UPDATE
  USING (true);

-- Function to clean up expired rooms (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_rooms()
RETURNS void AS $$
BEGIN
  DELETE FROM webrtc_rooms
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to run cleanup daily
-- This requires the pg_cron extension to be enabled in Supabase
-- SELECT cron.schedule('cleanup-expired-rooms', '0 0 * * *', 'SELECT cleanup_expired_rooms()');

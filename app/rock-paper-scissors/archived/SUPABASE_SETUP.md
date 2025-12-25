# Supabase WebRTC Signaling Setup

This document explains how to set up Supabase for WebRTC signaling in the Rock Paper Scissors game.

## Prerequisites

1. A Supabase project
2. Environment variables set in `.env.local`:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Database Setup

### Step 1: Run the SQL Schema

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Open `app/rock-paper-scissors/db-schema.sql`
4. Copy the contents and run it in the SQL Editor

This will create:
- `webrtc_rooms` table for storing WebRTC offers and answers
- Support for public/private rooms with room names
- Indexes for fast lookups
- Row Level Security policies allowing public read/write
- A cleanup function for expired rooms

### Step 2: Database Migration (if upgrading from previous version)

If you already have the `webrtc_rooms` table from a previous version, run this migration:

```sql
-- Add new columns for public rooms feature
ALTER TABLE webrtc_rooms 
  ADD COLUMN IF NOT EXISTS room_name TEXT NOT NULL DEFAULT 'Game Room',
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false;
```

### Step 3: Enable Realtime (Optional)

For better performance, you can enable Supabase Realtime on the `webrtc_rooms` table:

1. Go to Database → Replication
2. Enable replication for the `webrtc_rooms` table

This will make the connection process faster by using websockets instead of polling.

## How It Works

### Connection Flow

1. **Host creates a room:**
   - Host clicks "Host Game"
   - Optionally enters a room name and marks it as public
   - WebRTC offer is generated
   - API creates a room in Supabase with a 6-character room code (e.g., "ABC123")
   - If public, the room appears in the waiting room for others to join
   - If private, the host shares the room code with their friend

2. **Peer joins the room:**
   - Peer can either:
     - Browse public rooms in the waiting room and click "Join"
     - Click "Join with Room Code" and enter a private room code
   - API fetches the host's offer from Supabase
   - Peer generates a WebRTC answer
   - API stores the answer in Supabase

3. **Connection completes:**
   - Host polls Supabase every 2 seconds for the peer's answer
   - Once the answer is received, the WebRTC connection establishes
   - Both players can now play!

### API Routes

- `POST /api/webrtc/create-room` - Creates a new room and returns a room code (supports public/private rooms)
- `POST /api/webrtc/join-room` - Stores the peer's answer for a room
- `GET /api/webrtc/get-offer` - Fetches the host's offer for a room
- `GET /api/webrtc/get-answer` - Polls for the peer's answer (used by host)
- `GET /api/webrtc/list-rooms` - Lists all public rooms that are waiting for players

### Database Schema

```sql
webrtc_rooms {
  id: UUID (primary key)
  room_code: TEXT (unique, 6 characters)
  room_name: TEXT (display name for the room)
  host_offer: TEXT (base64-encoded WebRTC offer)
  peer_answer: TEXT (base64-encoded WebRTC answer, nullable)
  is_public: BOOLEAN (whether the room appears in the public waiting room)
  created_at: TIMESTAMP
  expires_at: TIMESTAMP (1 hour after creation)
  status: TEXT ('waiting' | 'connected' | 'expired')
}
```

## Maintenance

Rooms expire after 1 hour to prevent database bloat. The `cleanup_expired_rooms()` function can be run manually or scheduled:

```sql
-- Run manually
SELECT cleanup_expired_rooms();

-- Or set up a cron job (requires pg_cron extension)
SELECT cron.schedule('cleanup-expired-rooms', '0 0 * * *', 'SELECT cleanup_expired_rooms()');
```

## Security Considerations

1. **Public Access**: The current setup allows anyone to create and join rooms. This is acceptable for a simple game but consider adding rate limiting for production.

2. **No Authentication**: Users don't need to sign in. This keeps the game simple but means anyone with a room code can join.

3. **Expiration**: Rooms expire after 1 hour, preventing long-term storage of WebRTC data.

4. **Server-Side Only**: The Supabase client is only used in API routes (server-side), never exposed to the client.

## Future Improvements

1. **Realtime Subscriptions**: Replace polling with Supabase Realtime for instant updates
2. **Rate Limiting**: Add rate limiting to prevent abuse
3. **Room Expiration UI**: Show countdown timer for room expiration
4. **Turn Server Support**: Add TURN server for better connectivity in restrictive networks
5. **Room Filtering**: Add search and filter options in the waiting room
6. **Player Count**: Show number of available rooms in the waiting room

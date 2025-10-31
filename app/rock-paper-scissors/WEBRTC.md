# WebRTC Connection Explained

## Overview

This Rock Paper Scissors game uses WebRTC (Web Real-Time Communication) to establish a peer-to-peer connection between two players. No server is required for the actual gameplay - players connect directly to each other.

## Connection Flow

### 1. Host Creates an Offer

When Player 1 (the host) clicks "Host Game":

1. A new `RTCPeerConnection` is created with STUN servers for NAT traversal
2. A data channel named "game" is created for sending game messages
3. The peer connection creates an SDP (Session Description Protocol) offer
4. ICE (Interactive Connectivity Establishment) candidates are gathered
5. Once all ICE candidates are collected, a complete offer JSON is generated
6. This offer contains all the information needed for Player 2 to connect

**Code reference:** `useWebRTC.ts:createOffer()`

### 2. Peer Accepts the Offer

Player 2 receives the offer JSON from Player 1 (via copy/paste):

1. Player 2 creates their own `RTCPeerConnection`
2. The offer is parsed and set as the remote description
3. An SDP answer is generated in response
4. ICE candidates are gathered for Player 2's connection
5. The complete answer JSON is generated
6. Player 2 shares this answer back to Player 1

**Code reference:** `useWebRTC.ts:acceptOffer()`

### 3. Host Completes Connection

Player 1 receives the answer JSON from Player 2:

1. The answer is parsed and set as the remote description
2. The peer connection establishes using the exchanged ICE candidates
3. The data channel opens, and both players are now connected

**Code reference:** `useWebRTC.ts:acceptAnswer()`

## Data Channel

Once connected, all game communication happens through the WebRTC data channel:

- **Choice messages**: When a player selects rock, paper, or scissors
- **Reset messages**: When a player wants to play another round

The data channel provides:
- Low latency communication
- Reliable, ordered delivery
- No server costs or infrastructure

**Code reference:** `useWebRTC.ts:sendMessage()`

## Why Manual Exchange?

This implementation uses manual copy/paste of connection codes because:

1. **No server required**: A signaling server would be needed to automate the exchange
2. **Simple and educational**: Shows exactly what data is being exchanged
3. **Privacy**: No intermediary sees the connection details
4. **Works anywhere**: No need to deploy additional infrastructure

## Code Encoding

To make connection codes more user-friendly, the SDP data is encoded using Base64:

- Raw SDP JSON can be 2000+ characters
- Base64 encoding reduces this by ~30% and removes whitespace
- Encoded strings are easier to copy/paste without formatting issues
- The `btoa()` function encodes, `atob()` decodes

**Before encoding (example):**
```json
{"type":"offer","sdp":"v=0\r\no=- 123456789 2 IN IP4 127.0.0.1\r\n..."}
```

**After encoding:**
```
eyJ0eXBlIjoib2ZmZXIiLCJzZHAiOiJ2PTBccm5vPS0gMTIzNDU2Nzg5...
```

This makes the codes significantly shorter and easier to handle for non-technical users.

**Code reference:** `useWebRTC.ts:encodeConnectionData()` and `decodeConnectionData()`

## Connection States

The connection goes through several states:

1. **new**: Initial state when `RTCPeerConnection` is created
2. **connecting**: ICE agents are gathering candidates and attempting connection
3. **connected**: At least one working connection established
4. **disconnected**: Connection lost (can recover)
5. **failed**: Connection attempts failed
6. **closed**: Connection closed permanently

**Code reference:** `useWebRTC.ts:peerConnection.onconnectionstatechange`

## STUN Servers

The connection uses Google's public STUN servers:
- `stun:stun.l.google.com:19302`
- `stun:stun1.l.google.com:19302`

STUN servers help peers discover their public IP address and port for NAT traversal. This allows connections even when both players are behind routers/firewalls.

## Technical Components

### RTCPeerConnection
The core WebRTC API that handles the peer-to-peer connection.

### RTCDataChannel
A bi-directional communication channel for sending game data as JSON strings.

### SDP (Session Description Protocol)
Text-based format describing connection parameters, media capabilities, and network information.

### ICE (Interactive Connectivity Establishment)
Protocol for finding the best path to connect two peers, including NAT traversal.

## Message Format

All messages sent through the data channel follow this structure:

```typescript
interface Message {
  type: "choice" | "reveal" | "reset";
  choice?: Choice;
}
```

**Code reference:** `types.ts:Message`

## Limitations

- Requires manual code exchange (no signaling server)
- May fail on restrictive networks that block WebRTC
- No TURN server, so connections may fail if both peers are behind symmetric NAT

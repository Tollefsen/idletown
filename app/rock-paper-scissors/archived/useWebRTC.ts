import { useCallback, useEffect, useRef, useState } from "react";
import { STUN_SERVERS } from "../config/constants";
import type { Message } from "./types";

function encodeConnectionData(data: RTCSessionDescriptionInit): string {
  const json = JSON.stringify(data);
  return btoa(json);
}

function decodeConnectionData(encoded: string): RTCSessionDescriptionInit {
  const json = atob(encoded);
  return JSON.parse(json);
}

async function addIceCandidate(
  roomCode: string,
  candidate: RTCIceCandidate,
  sender: "host" | "peer",
): Promise<void> {
  try {
    const response = await fetch("/api/webrtc/add-ice-candidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomCode,
        candidate: JSON.stringify(candidate.toJSON()),
        sender,
      }),
    });

    if (!response.ok) {
      console.error("Failed to add ICE candidate:", await response.text());
    }
  } catch (error) {
    console.error("Error adding ICE candidate:", error);
  }
}

async function getIceCandidates(
  roomCode: string,
  sender: "host" | "peer",
  since?: string,
): Promise<Array<{ id: string; candidate: string; created_at: string }>> {
  try {
    const params = new URLSearchParams({
      roomCode,
      sender,
    });
    if (since) {
      params.set("since", since);
    }

    const response = await fetch(
      `/api/webrtc/get-ice-candidates?${params.toString()}`,
    );

    if (!response.ok) {
      console.error("Failed to get ICE candidates:", await response.text());
      return [];
    }

    const data = await response.json();
    return data.candidates || [];
  } catch (error) {
    console.error("Error getting ICE candidates:", error);
    return [];
  }
}

export function useWebRTC(onMessage: (message: Message) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const [isInitiator, setIsInitiator] = useState(false);
  const [localOffer, setLocalOffer] = useState<string>("");
  const [remoteAnswer, setRemoteAnswer] = useState<string>("");
  const [roomCode, setRoomCode] = useState<string>("");

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);
  const roomCodeRef = useRef(roomCode);
  const isInitiatorRef = useRef(isInitiator);

  // Keep refs in sync with state
  useEffect(() => {
    roomCodeRef.current = roomCode;
    isInitiatorRef.current = isInitiator;
  }, [roomCode, isInitiator]);

  const createPeerConnection = useCallback(() => {
    console.log("Creating peer connection with ICE servers:", STUN_SERVERS);
    const pc = new RTCPeerConnection({
      iceServers: STUN_SERVERS,
      iceCandidatePoolSize: 10,
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const type = event.candidate.type;
        const protocol = event.candidate.protocol;
        const address = event.candidate.address;
        const role = isInitiatorRef.current ? "Offer" : "Answer";
        console.log(
          `[${role}] ICE candidate: type=${type}, protocol=${protocol}, address=${address}`,
        );

        // Send candidate immediately to Supabase (Trickle ICE)
        if (roomCodeRef.current) {
          const sender = isInitiatorRef.current ? "host" : "peer";
          addIceCandidate(roomCodeRef.current, event.candidate, sender);
        }
      } else {
        const role = isInitiatorRef.current ? "Offer" : "Answer";
        console.log(`[${role}] All ICE candidates gathered (null candidate)`);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("Connection state changed:", pc.connectionState);
      if (pc.connectionState === "connected") {
        setIsConnected(true);
      } else if (
        pc.connectionState === "disconnected" ||
        pc.connectionState === "failed"
      ) {
        setIsConnected(false);
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log("ICE connection state changed:", pc.iceConnectionState);
      if (
        pc.iceConnectionState === "connected" ||
        pc.iceConnectionState === "completed"
      ) {
        setIsConnected(true);
      }
    };

    peerConnection.current = pc;
    return pc;
  }, []);

  const setupDataChannel = useCallback(
    (channel: RTCDataChannel) => {
      channel.onopen = () => {
        console.log("Data channel opened!");
        setIsConnected(true);
      };

      channel.onclose = () => {
        console.log("Data channel closed");
        setIsConnected(false);
      };

      channel.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as Message;
          onMessage(message);
        } catch (error) {
          console.error("Failed to parse message:", error);
        }
      };

      dataChannel.current = channel;
    },
    [onMessage],
  );

  const createOffer = useCallback(async () => {
    console.log("Creating offer...");
    const pc = createPeerConnection();
    const channel = pc.createDataChannel("game");
    setupDataChannel(channel);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    console.log("Local offer set - sending immediately (Trickle ICE)");

    // Send offer immediately, ICE candidates will be sent separately
    if (pc.localDescription) {
      setLocalOffer(encodeConnectionData(pc.localDescription));
    }
    setIsInitiator(true);
  }, [createPeerConnection, setupDataChannel]);

  const acceptOffer = useCallback(
    async (offerEncoded: string) => {
      try {
        console.log("Accepting offer...");
        const offer = decodeConnectionData(offerEncoded);
        const pc = createPeerConnection();

        pc.ondatachannel = (event) => {
          console.log("Data channel received!");
          setupDataChannel(event.channel);
        };

        await pc.setRemoteDescription(offer);
        console.log("Remote offer set");
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        console.log("Local answer set - sending immediately (Trickle ICE)");

        // Send answer immediately, ICE candidates will be sent separately
        if (pc.localDescription) {
          setRemoteAnswer(encodeConnectionData(pc.localDescription));
        }
        setIsInitiator(false);
      } catch (error) {
        console.error("Failed to accept offer:", error);
        throw error;
      }
    },
    [createPeerConnection, setupDataChannel],
  );

  const acceptAnswer = useCallback(async (answerEncoded: string) => {
    try {
      console.log("Accepting answer...");
      const answer = decodeConnectionData(answerEncoded);
      const pc = peerConnection.current;

      if (!pc) {
        console.error("No peer connection available");
        return;
      }

      if (pc.signalingState === "closed") {
        console.error("Peer connection is closed");
        return;
      }

      await pc.setRemoteDescription(answer);
      console.log("Remote answer set, connection should establish...");
    } catch (error) {
      console.error("Failed to accept answer:", error);
    }
  }, []);

  const sendMessage = useCallback((message: Message) => {
    if (dataChannel.current?.readyState === "open") {
      dataChannel.current.send(JSON.stringify(message));
    }
  }, []);

  useEffect(() => {
    if (
      remoteAnswer &&
      isInitiator &&
      peerConnection.current &&
      !peerConnection.current.remoteDescription
    ) {
      acceptAnswer(remoteAnswer);
    }
  }, [remoteAnswer, isInitiator, acceptAnswer]);

  // Poll for remote ICE candidates (Trickle ICE)
  useEffect(() => {
    if (!roomCode || !peerConnection.current) {
      return;
    }

    const pc = peerConnection.current;
    let lastFetchTime: string | undefined;

    const fetchAndAddCandidates = async () => {
      // Get remote candidates (we want the other peer's candidates)
      const remoteSender = isInitiator ? "peer" : "host";
      const candidates = await getIceCandidates(
        roomCode,
        remoteSender,
        lastFetchTime,
      );

      for (const { candidate: candidateJson, created_at } of candidates) {
        try {
          const candidateInit = JSON.parse(candidateJson);
          await pc.addIceCandidate(new RTCIceCandidate(candidateInit));
          console.log(`Added remote ICE candidate: type=${candidateInit.type}`);
          lastFetchTime = created_at;
        } catch (error) {
          console.error("Failed to add remote ICE candidate:", error);
        }
      }
    };

    // Start polling every 1 second
    const pollInterval = setInterval(fetchAndAddCandidates, 1000);

    // Fetch immediately on mount
    fetchAndAddCandidates();

    return () => {
      clearInterval(pollInterval);
    };
  }, [roomCode, isInitiator]);

  // Cleanup room and connection only on final unmount
  useEffect(() => {
    return () => {
      // Cleanup on unmount - use refs to get current values
      if (roomCodeRef.current && isInitiatorRef.current) {
        // Delete the room from Supabase when host disconnects
        fetch(`/api/webrtc/delete-room?roomCode=${roomCodeRef.current}`, {
          method: "DELETE",
        }).catch((err) => {
          console.error("Failed to delete room on cleanup:", err);
        });
      }

      // Close peer connection
      if (peerConnection.current) {
        peerConnection.current.close();
      }
    };
  }, []); // Empty deps - only run cleanup on unmount

  return {
    isConnected,
    isInitiator,
    localOffer,
    roomCode,
    createOffer,
    acceptOffer,
    setRemoteAnswer,
    setRoomCode,
    sendMessage,
  };
}

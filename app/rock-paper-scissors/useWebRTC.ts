import { useCallback, useEffect, useRef, useState } from "react";
import { LIMITS, STUN_SERVERS } from "../config/constants";
import type { Message } from "./types";

function encodeConnectionData(data: RTCSessionDescriptionInit): string {
  const json = JSON.stringify(data);
  return btoa(json);
}

function decodeConnectionData(encoded: string): RTCSessionDescriptionInit {
  const json = atob(encoded);
  return JSON.parse(json);
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
    const pc = new RTCPeerConnection({
      iceServers: STUN_SERVERS,
      iceCandidatePoolSize: 10,
    });

    let gatheringTimeout: NodeJS.Timeout;

    pc.onicecandidate = (event) => {
      console.log("ICE candidate:", event.candidate);
      if (!event.candidate && pc.localDescription) {
        clearTimeout(gatheringTimeout);
        console.log("All ICE candidates gathered");
        setLocalOffer(encodeConnectionData(pc.localDescription));
      }
    };

    pc.onicegatheringstatechange = () => {
      console.log("ICE gathering state:", pc.iceGatheringState);
      if (pc.iceGatheringState === "gathering") {
        gatheringTimeout = setTimeout(() => {
          console.log("ICE gathering timeout reached");
          if (pc.localDescription) {
            setLocalOffer(encodeConnectionData(pc.localDescription));
          }
        }, LIMITS.iceGatheringTimeout);
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
    console.log("Local offer set, waiting for ICE candidates...");

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
        console.log("Local answer set, waiting for ICE candidates...");

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

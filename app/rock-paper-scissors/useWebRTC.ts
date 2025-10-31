import { useCallback, useEffect, useRef, useState } from "react";
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

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
      iceCandidatePoolSize: 10,
    });

    let gatheringTimeout: NodeJS.Timeout;

    pc.onicecandidate = (event) => {
      if (!event.candidate && pc.localDescription) {
        clearTimeout(gatheringTimeout);
        setLocalOffer(encodeConnectionData(pc.localDescription));
      }
    };

    pc.onicegatheringstatechange = () => {
      if (pc.iceGatheringState === "gathering") {
        gatheringTimeout = setTimeout(() => {
          if (pc.localDescription) {
            setLocalOffer(encodeConnectionData(pc.localDescription));
          }
        }, 3000);
      }
    };

    pc.onconnectionstatechange = () => {
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
        setIsConnected(true);
      };

      channel.onclose = () => {
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
    const pc = createPeerConnection();
    const channel = pc.createDataChannel("game");
    setupDataChannel(channel);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    setIsInitiator(true);
  }, [createPeerConnection, setupDataChannel]);

  const acceptOffer = useCallback(
    async (offerEncoded: string) => {
      try {
        const offer = decodeConnectionData(offerEncoded);
        const pc = createPeerConnection();

        pc.ondatachannel = (event) => {
          setupDataChannel(event.channel);
        };

        await pc.setRemoteDescription(offer);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

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
      const answer = decodeConnectionData(answerEncoded);
      await peerConnection.current?.setRemoteDescription(answer);
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

  return {
    isConnected,
    isInitiator,
    localOffer,
    createOffer,
    acceptOffer,
    setRemoteAnswer,
    sendMessage,
  };
}

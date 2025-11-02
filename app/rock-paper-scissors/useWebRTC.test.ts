import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Message } from "./types";
import { useWebRTC } from "./useWebRTC";

class MockRTCDataChannel extends EventTarget {
  readyState: RTCDataChannelState = "connecting";
  private _onopen: ((this: RTCDataChannel, ev: Event) => void) | null = null;
  private _onclose: ((this: RTCDataChannel, ev: Event) => void) | null = null;
  private _onmessage:
    | ((this: RTCDataChannel, ev: MessageEvent) => void)
    | null = null;

  get onopen() {
    return this._onopen;
  }
  set onopen(handler: ((this: RTCDataChannel, ev: Event) => void) | null) {
    this._onopen = handler;
  }

  get onclose() {
    return this._onclose;
  }
  set onclose(handler: ((this: RTCDataChannel, ev: Event) => void) | null) {
    this._onclose = handler;
  }

  get onmessage() {
    return this._onmessage;
  }
  set onmessage(handler:
    | ((this: RTCDataChannel, ev: MessageEvent) => void)
    | null) {
    this._onmessage = handler;
  }

  send = vi.fn();

  simulateOpen() {
    this.readyState = "open";
    const event = new Event("open");
    if (this._onopen) {
      this._onopen.call(this as unknown as RTCDataChannel, event);
    }
    this.dispatchEvent(event);
  }

  simulateClose() {
    this.readyState = "closed";
    const event = new Event("close");
    if (this._onclose) {
      this._onclose.call(this as unknown as RTCDataChannel, event);
    }
    this.dispatchEvent(event);
  }

  simulateMessage(data: string) {
    const event = new MessageEvent("message", { data });
    if (this._onmessage) {
      this._onmessage.call(this as unknown as RTCDataChannel, event);
    }
    this.dispatchEvent(event);
  }
}

class MockRTCPeerConnection extends EventTarget {
  localDescription: RTCSessionDescription | null = null;
  remoteDescription: RTCSessionDescription | null = null;
  connectionState: RTCPeerConnectionState = "new";
  iceConnectionState: RTCIceConnectionState = "new";
  iceGatheringState: RTCIceGatheringState = "new";
  dataChannel: MockRTCDataChannel | null = null;

  onicecandidate:
    | ((this: RTCPeerConnection, ev: RTCPeerConnectionIceEvent) => void)
    | null = null;
  onicegatheringstatechange:
    | ((this: RTCPeerConnection, ev: Event) => void)
    | null = null;
  onconnectionstatechange:
    | ((this: RTCPeerConnection, ev: Event) => void)
    | null = null;
  oniceconnectionstatechange:
    | ((this: RTCPeerConnection, ev: Event) => void)
    | null = null;
  ondatachannel:
    | ((this: RTCPeerConnection, ev: RTCDataChannelEvent) => void)
    | null = null;

  createDataChannel = vi.fn((_label: string) => {
    this.dataChannel = new MockRTCDataChannel();
    return this.dataChannel as unknown as RTCDataChannel;
  });

  createOffer = vi.fn(async () => {
    return {
      type: "offer" as RTCSdpType,
      sdp: "mock-offer-sdp",
    } as RTCSessionDescriptionInit;
  });

  createAnswer = vi.fn(async () => {
    return {
      type: "answer" as RTCSdpType,
      sdp: "mock-answer-sdp",
    } as RTCSessionDescriptionInit;
  });

  setLocalDescription = vi.fn(
    async (description: RTCSessionDescriptionInit) => {
      this.localDescription = description as RTCSessionDescription;
    },
  );

  setRemoteDescription = vi.fn(
    async (description: RTCSessionDescriptionInit) => {
      this.remoteDescription = description as RTCSessionDescription;
    },
  );

  close = vi.fn();

  simulateIceCandidate(candidate: RTCIceCandidate | null = null) {
    const event = new RTCPeerConnectionIceEvent("icecandidate", { candidate });
    if (this.onicecandidate) {
      this.onicecandidate.call(
        this as unknown as RTCPeerConnection,
        event as RTCPeerConnectionIceEvent,
      );
    }
  }

  simulateConnectionState(state: RTCPeerConnectionState) {
    this.connectionState = state;
    const event = new Event("connectionstatechange");
    if (this.onconnectionstatechange) {
      this.onconnectionstatechange.call(
        this as unknown as RTCPeerConnection,
        event,
      );
    }
  }

  simulateIceConnectionState(state: RTCIceConnectionState) {
    this.iceConnectionState = state;
    const event = new Event("iceconnectionstatechange");
    if (this.oniceconnectionstatechange) {
      this.oniceconnectionstatechange.call(
        this as unknown as RTCPeerConnection,
        event,
      );
    }
  }

  simulateDataChannel(channel: RTCDataChannel) {
    const event = Object.assign(new Event("datachannel"), {
      channel,
    }) as RTCDataChannelEvent;
    if (this.ondatachannel) {
      this.ondatachannel.call(this as unknown as RTCPeerConnection, event);
    }
  }
}

describe("useWebRTC", () => {
  let mockPeerConnection: MockRTCPeerConnection;
  let originalRTCPeerConnection: typeof RTCPeerConnection;

  beforeEach(() => {
    originalRTCPeerConnection = global.RTCPeerConnection;
    mockPeerConnection = new MockRTCPeerConnection();

    const MockConstructor = function (this: RTCPeerConnection) {
      return mockPeerConnection as unknown as RTCPeerConnection;
    } as unknown as new () => RTCPeerConnection;

    global.RTCPeerConnection = MockConstructor as typeof RTCPeerConnection;
  });

  afterEach(() => {
    vi.clearAllMocks();
    global.RTCPeerConnection = originalRTCPeerConnection;
  });

  describe("initialization", () => {
    it("should initialize with default state", () => {
      const onMessage = vi.fn();
      const { result } = renderHook(() => useWebRTC(onMessage));

      expect(result.current.isConnected).toBe(false);
      expect(result.current.isInitiator).toBe(false);
      expect(result.current.localOffer).toBe("");
    });
  });

  describe("createOffer", () => {
    it("should create peer connection and data channel", async () => {
      const onMessage = vi.fn();
      const { result } = renderHook(() => useWebRTC(onMessage));

      await act(async () => {
        await result.current.createOffer();
      });

      expect(mockPeerConnection.createDataChannel).toHaveBeenCalledWith("game");
      expect(mockPeerConnection.createOffer).toHaveBeenCalled();
      expect(mockPeerConnection.setLocalDescription).toHaveBeenCalled();
      expect(result.current.isInitiator).toBe(true);
    });

    it("should set local offer when ICE gathering completes", async () => {
      const onMessage = vi.fn();
      const { result } = renderHook(() => useWebRTC(onMessage));

      await act(async () => {
        await result.current.createOffer();
      });

      act(() => {
        mockPeerConnection.simulateIceCandidate(null);
      });

      await waitFor(() => {
        expect(result.current.localOffer).toBeTruthy();
      });
    });

    it("should encode local description as base64", async () => {
      const onMessage = vi.fn();
      const { result } = renderHook(() => useWebRTC(onMessage));

      await act(async () => {
        await result.current.createOffer();
      });

      act(() => {
        mockPeerConnection.simulateIceCandidate(null);
      });

      await waitFor(() => {
        const decoded = JSON.parse(atob(result.current.localOffer));
        expect(decoded.type).toBe("offer");
        expect(decoded.sdp).toBe("mock-offer-sdp");
      });
    });
  });

  describe("acceptOffer", () => {
    it("should accept offer and create answer", async () => {
      const onMessage = vi.fn();
      const { result } = renderHook(() => useWebRTC(onMessage));

      const offerEncoded = btoa(
        JSON.stringify({ type: "offer", sdp: "mock-offer-sdp" }),
      );

      await act(async () => {
        await result.current.acceptOffer(offerEncoded);
      });

      expect(mockPeerConnection.setRemoteDescription).toHaveBeenCalled();
      expect(mockPeerConnection.createAnswer).toHaveBeenCalled();
      expect(mockPeerConnection.setLocalDescription).toHaveBeenCalled();
      expect(result.current.isInitiator).toBe(false);
    });

    it("should setup data channel when received", async () => {
      const onMessage = vi.fn();
      const { result } = renderHook(() => useWebRTC(onMessage));

      const offerEncoded = btoa(
        JSON.stringify({ type: "offer", sdp: "mock-offer-sdp" }),
      );

      await act(async () => {
        await result.current.acceptOffer(offerEncoded);
      });

      const mockChannel = new MockRTCDataChannel();

      act(() => {
        mockPeerConnection.simulateDataChannel(
          mockChannel as unknown as RTCDataChannel,
        );
      });

      act(() => {
        mockChannel.simulateOpen();
      });

      expect(mockPeerConnection.ondatachannel).toBeTruthy();
      expect(result.current.isConnected).toBe(true);
    });

    it("should throw error for invalid offer", async () => {
      const onMessage = vi.fn();
      const { result } = renderHook(() => useWebRTC(onMessage));

      await expect(
        act(async () => {
          await result.current.acceptOffer("invalid-base64");
        }),
      ).rejects.toThrow();
    });
  });

  describe("acceptAnswer", () => {
    it("should set remote description with answer", async () => {
      const onMessage = vi.fn();
      const { result } = renderHook(() => useWebRTC(onMessage));

      await act(async () => {
        await result.current.createOffer();
      });

      const answerEncoded = btoa(
        JSON.stringify({ type: "answer", sdp: "mock-answer-sdp" }),
      );

      await act(async () => {
        result.current.setRemoteAnswer(answerEncoded);
      });

      await waitFor(() => {
        expect(mockPeerConnection.setRemoteDescription).toHaveBeenCalled();
      });
    });
  });

  describe("connection state", () => {
    it("should update isConnected when connection state is connected", async () => {
      const onMessage = vi.fn();
      const { result } = renderHook(() => useWebRTC(onMessage));

      await act(async () => {
        await result.current.createOffer();
      });

      act(() => {
        mockPeerConnection.simulateConnectionState("connected");
      });

      expect(result.current.isConnected).toBe(true);
    });

    it("should update isConnected when data channel opens", async () => {
      const onMessage = vi.fn();
      const { result } = renderHook(() => useWebRTC(onMessage));

      await act(async () => {
        await result.current.createOffer();
      });

      act(() => {
        mockPeerConnection.dataChannel?.simulateOpen();
      });

      expect(result.current.isConnected).toBe(true);
    });

    it("should update isConnected to false when connection fails", async () => {
      const onMessage = vi.fn();
      const { result } = renderHook(() => useWebRTC(onMessage));

      await act(async () => {
        await result.current.createOffer();
      });

      act(() => {
        mockPeerConnection.simulateConnectionState("failed");
      });

      expect(result.current.isConnected).toBe(false);
    });
  });

  describe("sendMessage", () => {
    it("should send message through data channel when open", async () => {
      const onMessage = vi.fn();
      const { result } = renderHook(() => useWebRTC(onMessage));

      await act(async () => {
        await result.current.createOffer();
      });

      act(() => {
        mockPeerConnection.dataChannel?.simulateOpen();
      });

      const message: Message = { type: "choice", choice: "rock" };

      act(() => {
        result.current.sendMessage(message);
      });

      expect(mockPeerConnection.dataChannel?.send).toHaveBeenCalledWith(
        JSON.stringify(message),
      );
    });

    it("should not send message when data channel is not open", async () => {
      const onMessage = vi.fn();
      const { result } = renderHook(() => useWebRTC(onMessage));

      await act(async () => {
        await result.current.createOffer();
      });

      const message: Message = { type: "choice", choice: "rock" };

      act(() => {
        result.current.sendMessage(message);
      });

      expect(mockPeerConnection.dataChannel?.send).not.toHaveBeenCalled();
    });
  });

  describe("receiveMessage", () => {
    it("should call onMessage when message is received", async () => {
      const onMessage = vi.fn();
      const { result } = renderHook(() => useWebRTC(onMessage));

      await act(async () => {
        await result.current.createOffer();
      });

      act(() => {
        mockPeerConnection.dataChannel?.simulateOpen();
      });

      const message: Message = { type: "choice", choice: "paper" };

      act(() => {
        mockPeerConnection.dataChannel?.simulateMessage(
          JSON.stringify(message),
        );
      });

      expect(onMessage).toHaveBeenCalledWith(message);
    });

    it("should handle invalid message gracefully", async () => {
      const onMessage = vi.fn();
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const { result } = renderHook(() => useWebRTC(onMessage));

      await act(async () => {
        await result.current.createOffer();
      });

      act(() => {
        mockPeerConnection.dataChannel?.simulateOpen();
      });

      act(() => {
        mockPeerConnection.dataChannel?.simulateMessage("invalid-json{");
      });

      expect(onMessage).not.toHaveBeenCalled();
      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });
  });

  describe("encoding and decoding", () => {
    it("should correctly encode and decode connection data", async () => {
      const onMessage = vi.fn();
      const { result } = renderHook(() => useWebRTC(onMessage));

      await act(async () => {
        await result.current.createOffer();
      });

      act(() => {
        mockPeerConnection.simulateIceCandidate(null);
      });

      await waitFor(() => {
        expect(result.current.localOffer).toBeTruthy();
      });

      const decoded = JSON.parse(atob(result.current.localOffer));
      expect(decoded).toHaveProperty("type");
      expect(decoded).toHaveProperty("sdp");
    });

    it("should handle base64 encoding without padding", async () => {
      const onMessage = vi.fn();
      const { result } = renderHook(() => useWebRTC(onMessage));

      await act(async () => {
        await result.current.createOffer();
      });

      act(() => {
        mockPeerConnection.simulateIceCandidate(null);
      });

      await waitFor(() => {
        expect(result.current.localOffer).not.toContain("=");
      });
    });
  });
});

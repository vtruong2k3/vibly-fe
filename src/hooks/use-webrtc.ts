"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSocket } from "@/providers/socket-provider";
import { useCallStore } from "@/store/call.store";
import { callsService } from "@/lib/services/calls.service";
import { useAuthStore } from "@/store/auth.store";

export function useWebRTC() {
  const { socket } = useSocket();
  const {
    activeCall,
    setLocalStream,
    setRemoteStream,
    clearCallState,
  } = useCallStore();
  const me = useAuthStore((s) => s.user);

  const pcRef = useRef<RTCPeerConnection | null>(null);

  // Initialize Peer Connection with dynamic Google STUN servers
  const initPeerConnection = useCallback(async () => {
    if (pcRef.current) return pcRef.current;

    try {
      const { iceServers } = await callsService.getIceServers();
      const pc = new RTCPeerConnection({ iceServers });

      pc.onicecandidate = (event) => {
        if (event.candidate && activeCall && socket) {
          socket.emit("webrtc_ice", {
            targetUserId: activeCall.otherUserId,
            callSessionId: activeCall.callSessionId,
            candidate: event.candidate,
          });
        }
      };

      // Handle Remote Stream reception
      pc.ontrack = (event) => {
        // Only set remote stream if it's the first track to avoid overriding with empty streams
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
        } else {
          const stream = new MediaStream();
          stream.addTrack(event.track);
          setRemoteStream(stream);
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
          // Handle drop
          clearCallState();
        }
      };

      pcRef.current = pc;
      return pc;
    } catch (error) {
      console.error("Failed to fetch ICE servers:", error);
      return null;
    }
  }, [activeCall, socket, setRemoteStream, clearCallState]);

  // Clean up Peer Connection
  const closePeerConnection = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    setRemoteStream(null);
  }, [setRemoteStream]);

  // Setup Local Media
  const setupLocalMedia = useCallback(async (type: "AUDIO" | "VIDEO") => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === "VIDEO",
      });
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error("Failed to get local media", err);
      // Fallback to audio only if video fails (e.g. no webcam)
      if (type === "VIDEO") {
         try {
           const fallbackStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
           setLocalStream(fallbackStream);
           return fallbackStream;
         } catch (fallbackErr) {}
      }
      return null;
    }
  }, [setLocalStream]);

  // Start Call (Offer)
  const startCall = useCallback(async (targetUserId: string, type: "AUDIO" | "VIDEO", sessionId: string) => {
    const pc = await initPeerConnection();
    const stream = await setupLocalMedia(type);
    
    if (pc && stream) {
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket?.emit("webrtc_sdp", {
        targetUserId,
        callSessionId: sessionId,
        sdp: pc.localDescription,
      });
    }
  }, [initPeerConnection, setupLocalMedia, socket]);

  const pendingOfferRef = useRef<RTCSessionDescriptionInit | null>(null);
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  // Accept Call (Answer)
  const answerCall = useCallback(async (targetUserId: string, type: "AUDIO" | "VIDEO", sessionId: string) => {
    const pc = await initPeerConnection();
    const stream = await setupLocalMedia(type);
    
    if (pc && stream) {
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // If we received an offer while it was ringing, apply it now before answering
      if (pendingOfferRef.current) {
        await pc.setRemoteDescription(new RTCSessionDescription(pendingOfferRef.current));
        pendingOfferRef.current = null;

        // Apply any queued ICE candidates that arrived before the PC was ready
        for (const candidate of pendingIceCandidatesRef.current) {
          if (candidate) await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
        pendingIceCandidatesRef.current = [];
      }

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket?.emit("webrtc_sdp", {
        targetUserId,
        callSessionId: sessionId,
        sdp: pc.localDescription,
      });
    }
  }, [initPeerConnection, setupLocalMedia, socket]);

  // WebSocket listeners for WebRTC Signaling
  useEffect(() => {
    if (!socket) return;

    const handleWebRtcSdp = async (data: { senderUserId: string; callSessionId: string; sdp: RTCSessionDescriptionInit }) => {
      // Ignore SDP if it belongs to a different call
      if (activeCall?.callSessionId !== data.callSessionId && useCallStore.getState().incomingCall?.callSessionId !== data.callSessionId) return;
      
      const pc = pcRef.current;
      
      if (data.sdp.type === "offer") {
        if (!pc) {
          // If PC doesn't exist yet (still ringing), cache the offer to be used in answerCall
          pendingOfferRef.current = data.sdp;
        } else {
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        }
      } else if (data.sdp.type === "answer" && pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      }
    };

    const handleWebRtcIce = async (data: { senderUserId: string; callSessionId: string; candidate: RTCIceCandidateInit }) => {
      if (activeCall?.callSessionId !== data.callSessionId && useCallStore.getState().incomingCall?.callSessionId !== data.callSessionId) return;
      const pc = pcRef.current;
      
      if (!pc) {
        pendingIceCandidatesRef.current.push(data.candidate);
      } else if (data.candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    };

    socket.on("webrtc_sdp", handleWebRtcSdp);
    socket.on("webrtc_ice", handleWebRtcIce);

    return () => {
      socket.off("webrtc_sdp", handleWebRtcSdp);
      socket.off("webrtc_ice", handleWebRtcIce);
    };
  }, [socket, activeCall]);

  return {
    startCall,
    answerCall,
    closePeerConnection,
    pcRef
  };
}

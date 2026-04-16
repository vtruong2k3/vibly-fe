import { create } from "zustand";

export interface WebRTCCallSession {
  callSessionId: string;
  roomName: string;
  callType: "AUDIO" | "VIDEO";
  callerUserId: string;
  callerUsername: string;
  calerDisplayName?: string;
  callerAvatarUrl?: string; // or MediaId
  otherUserId: string; // The ID of the peer to relay signaling messages to
}

interface CallState {
  // Call status
  incomingCall: WebRTCCallSession | null;
  activeCall: WebRTCCallSession | null;
  
  // UI States
  isCallMinimized: boolean;
  isFloatingDockVisible: boolean;

  // Media Settings
  isMuted: boolean;
  isVideoOff: boolean;

  // Media Streams (Non-serializable but kept in Zustand for global access)
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;

  // Actions
  setIncomingCall: (call: WebRTCCallSession | null) => void;
  setActiveCall: (call: WebRTCCallSession | null) => void;
  minimizeCall: (minimized: boolean) => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  setLocalStream: (stream: MediaStream | null) => void;
  setRemoteStream: (stream: MediaStream | null) => void;
  clearCallState: () => void;
}

export const useCallStore = create<CallState>((set) => ({
  incomingCall: null,
  activeCall: null,

  isCallMinimized: false,
  isFloatingDockVisible: false,

  isMuted: false,
  isVideoOff: false,

  localStream: null,
  remoteStream: null,

  setIncomingCall: (call) => set({ incomingCall: call }),
  
  setActiveCall: (call) => set({ 
    activeCall: call, 
    isFloatingDockVisible: false,
    incomingCall: null // auto clear incoming when active
  }),

  minimizeCall: (minimized) => set({
    isCallMinimized: minimized,
    isFloatingDockVisible: minimized,
  }),

  toggleMute: () => set((state) => {
    if (state.localStream) {
      state.localStream.getAudioTracks().forEach(track => {
        track.enabled = state.isMuted; // Toggle to opposite of current state.isMuted
      });
    }
    return { isMuted: !state.isMuted };
  }),

  toggleVideo: () => set((state) => {
    if (state.localStream) {
      state.localStream.getVideoTracks().forEach(track => {
        track.enabled = state.isVideoOff; // Toggle
      });
    }
    return { isVideoOff: !state.isVideoOff };
  }),

  setLocalStream: (stream) => set({ localStream: stream }),
  
  setRemoteStream: (stream) => set({ remoteStream: stream }),

  clearCallState: () => set((state) => {
    // Stop all tracks to release camera/mic
    if (state.localStream) {
      state.localStream.getTracks().forEach(t => t.stop());
    }
    return {
      incomingCall: null,
      activeCall: null,
      isCallMinimized: false,
      isFloatingDockVisible: false,
      isMuted: false,
      isVideoOff: false,
      localStream: null,
      remoteStream: null,
    };
  }),
}));

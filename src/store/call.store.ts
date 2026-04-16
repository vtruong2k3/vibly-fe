import { create } from "zustand";

export interface WebRTCCallSession {
  callSessionId: string;
  roomName: string;
  callType: "AUDIO" | "VIDEO";
  callerUserId: string;
  callerUsername: string;
  calerDisplayName?: string;
  callerAvatarUrl?: string;
  otherUserId: string;
}

interface CallState {
  // Call status
  incomingCall: WebRTCCallSession | null;
  activeCall: WebRTCCallSession | null;

  // UI States
  isCallMinimized: boolean;
  isFloatingDockVisible: boolean;

  // Actions
  setIncomingCall: (call: WebRTCCallSession | null) => void;
  setActiveCall: (call: WebRTCCallSession | null) => void;
  minimizeCall: (minimized: boolean) => void;
  clearCallState: () => void;
}

export const useCallStore = create<CallState>((set) => ({
  incomingCall: null,
  activeCall: null,

  isCallMinimized: false,
  isFloatingDockVisible: false,

  setIncomingCall: (call) => set({ incomingCall: call }),

  setActiveCall: (call) =>
    set({
      activeCall: call,
      isFloatingDockVisible: false,
      incomingCall: null, // auto-clear incoming when active
    }),

  minimizeCall: (minimized) =>
    set({
      isCallMinimized: minimized,
      isFloatingDockVisible: minimized,
    }),

  clearCallState: () =>
    set({
      incomingCall: null,
      activeCall: null,
      isCallMinimized: false,
      isFloatingDockVisible: false,
    }),
}));

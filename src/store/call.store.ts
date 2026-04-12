import { create } from "zustand";

interface CallState {
  isReceivingCall: boolean;
  isIncomingCallOpen: boolean;
  isCallMinimized: boolean;
  isFloatingDockVisible: boolean;
  activeCallRoomId: string | null;

  setIncomingCall: (isOpen: boolean, receiving: boolean, roomId?: string) => void;
  minimizeCall: (minimized: boolean) => void;
  setActiveCall: (roomId: string | null) => void;
  clearCallState: () => void;
}

export const useCallStore = create<CallState>((set) => ({
  isReceivingCall: false,
  isIncomingCallOpen: false,
  isCallMinimized: false,
  isFloatingDockVisible: false,
  activeCallRoomId: null,

  setIncomingCall: (isOpen, receiving, roomId) =>
    set({
      isIncomingCallOpen: isOpen,
      isReceivingCall: receiving,
      activeCallRoomId: roomId || null,
    }),

  minimizeCall: (minimized) =>
    set({
      isCallMinimized: minimized,
      isFloatingDockVisible: minimized,
    }),

  setActiveCall: (roomId) =>
    set({
      activeCallRoomId: roomId,
      isFloatingDockVisible: false,
    }),

  clearCallState: () =>
    set({
      isReceivingCall: false,
      isIncomingCallOpen: false,
      isCallMinimized: false,
      isFloatingDockVisible: false,
      activeCallRoomId: null,
    }),
}));

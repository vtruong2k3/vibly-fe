import { create } from 'zustand';

interface CallState {
  isReceivingCall: boolean;
  isIncomingCallOpen: boolean;
  isCallMinimized: boolean;
  activeCallRoomId: string | null;
  isFloatingDockVisible: boolean;
  
  setReceivingCall: (status: boolean) => void;
  setIncomingCallOpen: (status: boolean) => void;
  setCallMinimized: (status: boolean) => void;
  setActiveCallRoomId: (roomId: string | null) => void;
  setFloatingDockVisible: (status: boolean) => void;
  resetCallState: () => void;
}

export const useCallStore = create<CallState>((set) => ({
  isReceivingCall: false,
  isIncomingCallOpen: false,
  isCallMinimized: false,
  activeCallRoomId: null,
  isFloatingDockVisible: false,

  setReceivingCall: (status) => set({ isReceivingCall: status }),
  setIncomingCallOpen: (status) => set({ isIncomingCallOpen: status }),
  setCallMinimized: (status) => set({ isCallMinimized: status }),
  setActiveCallRoomId: (roomId) => set({ activeCallRoomId: roomId }),
  setFloatingDockVisible: (status) => set({ isFloatingDockVisible: status }),
  resetCallState: () => set({
    isReceivingCall: false,
    isIncomingCallOpen: false,
    isCallMinimized: false,
    activeCallRoomId: null,
    isFloatingDockVisible: false,
  }),
}));

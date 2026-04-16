import { create } from "zustand";

export interface UserPresence {
  isOnline: boolean;
  lastSeenAt: string | null;
}

interface PresenceState {
  users: Record<string, UserPresence>;
  updatePresence: (id: string, data: Partial<UserPresence>) => void;
  bulkUpdate: (data: Record<string, UserPresence>) => void;
}

export const usePresenceStore = create<PresenceState>((set) => ({
  users: {},

  updatePresence: (id, data) =>
    set((state) => ({
      users: {
        ...state.users,
        [id]: { ...(state.users[id] ?? { isOnline: false, lastSeenAt: null }), ...data },
      },
    })),

  bulkUpdate: (data) =>
    set((state) => ({
      users: { ...state.users, ...data },
    })),
}));

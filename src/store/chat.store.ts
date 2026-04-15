import { create } from "zustand";

// ─── Chat Store — manages open bubble windows ─────────────────────────────────
// Stores up to 3 open chat bubbles at a time (like Facebook Messenger)

interface ChatStoreState {
  openConversationIds: string[];
  openConversation: (conversationId: string) => void;
  closeConversation: (conversationId: string) => void;
  minimizedIds: Set<string>;
  toggleMinimize: (conversationId: string) => void;
}

export const useChatStore = create<ChatStoreState>((set) => ({
  openConversationIds: [],
  minimizedIds: new Set(),

  openConversation: (id) =>
    set((state) => {
      if (state.openConversationIds.includes(id)) return state;
      // Max 3 windows at a time — drop oldest
      const next = [id, ...state.openConversationIds].slice(0, 3);
      return { openConversationIds: next };
    }),

  closeConversation: (id) =>
    set((state) => ({
      openConversationIds: state.openConversationIds.filter((c) => c !== id),
      minimizedIds: new Set([...state.minimizedIds].filter((m) => m !== id)),
    })),

  toggleMinimize: (id) =>
    set((state) => {
      const next = new Set(state.minimizedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { minimizedIds: next };
    }),
}));

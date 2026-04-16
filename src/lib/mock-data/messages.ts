import type { Conversation, Message } from "@/types";
import { MOCK_CURRENT_USER, MOCK_USERS } from "./feed";

// ─── Mock Messages ───────────────────────────────────────────────
const makeMsg = (
  id: string,
  conversationId: string,
  senderId: string,
  content: string,
  minutesAgo: number,
  status: Message["status"] = "read",
): Message => ({
  id,
  conversationId,
  senderId,
  content,
  status,
  messageType: "TEXT",
  createdAt: new Date(Date.now() - 1000 * 60 * minutesAgo).toISOString(),
});

// ─── Mock Conversations ──────────────────────────────────────────
export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "conv1",
    participant: MOCK_USERS[0], // Alex Rivers
    lastMessage: makeMsg("m1", "conv1", MOCK_USERS[0].id, "Hey! Did you see the new Vibly update?", 5),
    unreadCount: 2,
    isRequest: false,
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "conv2",
    participant: MOCK_USERS[2], // Sophia Lee
    lastMessage: makeMsg("m2", "conv2", MOCK_CURRENT_USER.id, "That photo was stunning 🌅", 32),
    unreadCount: 0,
    isRequest: false,
    updatedAt: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
  },
  {
    id: "conv3",
    participant: MOCK_USERS[1], // Minh Nguyen
    lastMessage: makeMsg("m3", "conv3", MOCK_USERS[1].id, "Let me know when you're free to review the designs.", 120),
    unreadCount: 1,
    isRequest: false,
    updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: "conv4",
    participant: MOCK_USERS[3], // David Park
    lastMessage: makeMsg("m4", "conv4", MOCK_CURRENT_USER.id, "Good luck with the launch!", 1440),
    unreadCount: 0,
    isRequest: false,
    updatedAt: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
  },
];

// ─── Mock Chat History for conv1 ────────────────────────────────
export const MOCK_MESSAGES_CONV1: Message[] = [
  makeMsg("m1-1", "conv1", MOCK_USERS[0].id, "Hey! Did you see the new Vibly update?", 30),
  makeMsg("m1-2", "conv1", MOCK_CURRENT_USER.id, "Not yet! What changed?", 28),
  makeMsg("m1-3", "conv1", MOCK_USERS[0].id, "The feed is super fast now. Infinite scroll works perfectly.", 25),
  makeMsg("m1-4", "conv1", MOCK_USERS[0].id, "Also dark mode looks amazing on the call screen 🔥", 20),
  makeMsg("m1-5", "conv1", MOCK_CURRENT_USER.id, "Nice!! I love the new color system, very clean.", 18),
  makeMsg("m1-6", "conv1", MOCK_USERS[0].id, "Right? The blue and orange combo just works.", 15),
  makeMsg("m1-7", "conv1", MOCK_CURRENT_USER.id, "Can't wait to try the calls feature when it drops.", 10),
  makeMsg("m1-8", "conv1", MOCK_USERS[0].id, "Hey! Did you see the new Vibly update?", 5, "delivered"),
];

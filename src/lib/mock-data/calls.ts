import { MOCK_CURRENT_USER, MOCK_USERS } from "./feed";
import type { CallRoom } from "@/types";

// ─── Mock Call Room ────────────────────────────────────────────────
// Used as static placeholder for LiveKit Call UI.
// In production, room data will come from LiveKit server + API.

export const MOCK_CALL_ROOM: CallRoom = {
  id: "room_dev_001",
  name: "Engineering Standup",
  startedAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(), // 8 min ago
  participants: [
    {
      id: "part_1",
      user: MOCK_CURRENT_USER,
      role: "host",
      isMicActive: true,
      isCameraActive: true,
      isSpeaking: false,
      videoTrackSid: null, // Placeholder — no real LiveKit track yet
    },
    {
      id: "part_2",
      user: MOCK_USERS[0], // Alex Rivers
      role: "guest",
      isMicActive: true,
      isCameraActive: false,
      isSpeaking: true,
      videoTrackSid: null,
    },
    {
      id: "part_3",
      user: MOCK_USERS[2], // Sophia Lee
      role: "guest",
      isMicActive: false,
      isCameraActive: true,
      isSpeaking: false,
      videoTrackSid: null,
    },
    {
      id: "part_4",
      user: MOCK_USERS[3], // David Chen
      role: "guest",
      isMicActive: false,
      isCameraActive: false,
      isSpeaking: false,
      videoTrackSid: null,
    },
  ],
};

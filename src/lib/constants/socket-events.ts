/**
 * SOCKET_EVENTS — Single source of truth for ALL Socket.IO event names.
 *
 * Mirrors: vibly-be/src/common/constants/socket-events.ts
 *
 * Usage:
 *   socket.on(SOCKET_EVENTS.NEW_MESSAGE, handler)
 *   socket.emit(SOCKET_EVENTS.JOIN_CONVERSATION, id)
 *
 * Never use raw strings for socket event names.
 */
export const SOCKET_EVENTS = {
    // ─── Presence ─────────────────────────────────────────────────────────────
    USER_PRESENCE_CHANGED: "user_presence_changed",

    // ─── Chat / Messages ──────────────────────────────────────────────────────
    JOIN_CONVERSATION: "join_conversation",
    LEAVE_CONVERSATION: "leave_conversation",
    TYPING_START: "typing_start",
    TYPING_STOP: "typing_stop",
    USER_TYPING_START: "user_typing_start",
    USER_TYPING_STOP: "user_typing_stop",
    NEW_MESSAGE: "new_message",
    MESSAGE_UPDATED: "message_updated",
    MESSAGE_DELETED: "message_deleted",

    // ─── Notifications ────────────────────────────────────────────────────────
    NEW_NOTIFICATION: "new_notification",

    // ─── Posts ────────────────────────────────────────────────────────────────
    POST_REACTION_UPDATED: "post:reaction_updated",
    POST_NEW_COMMENT: "post:new_comment",

    // ─── Calls / WebRTC ───────────────────────────────────────────────────────
    CALL_INCOMING: "call:incoming",
    CALL_ACCEPTED: "call:accepted",
    CALL_REJECTED: "call:rejected",
    CALL_ENDED: "call:ended",
    CALL_CANCEL: "call:cancel",
    CALL_CANCELED: "call:canceled",
    WEBRTC_SDP: "webrtc_sdp",
    WEBRTC_ICE: "webrtc_ice",
} as const;

export type SocketEvent = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];

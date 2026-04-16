"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, Minus, Send, Loader2, Phone, Video } from "lucide-react";
import { useStartCall } from "@/hooks/use-calls";
import { useCallStore } from "@/store/call.store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/chat.store";
import { useConversationMessages, useSendMessage, useConversations } from "@/hooks/use-chat";
import { useAuthStore } from "@/store/auth.store";
import { useSocket } from "@/providers/socket-provider";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/lib/api/constants";
import { ChatBubble } from "./chat-bubble";

// ─── Types ────────────────────────────────────────────────────────────────────
interface RawMessage {
  id: string;
  content: string;
  senderUserId: string;
  sentAt: string;
}

// ─── ChatBubbleWindow ─────────────────────────────────────────────────────────
interface ChatBubbleWindowProps {
  conversationId: string;
  index: number; // position from right (0 = rightmost)
}

export function ChatBubbleWindow({ conversationId, index }: ChatBubbleWindowProps) {
  const me = useAuthStore((s) => s.user);
  const { closeConversation, minimizedIds, toggleMinimize } = useChatStore();
  const isMinimized = minimizedIds.has(conversationId);

  const { data } = useConversations();

  // Safely extract array: cache could be [] or { data: [] } or { conversations: [] } due to dual query fns
  const conversationsArray = Array.isArray(data)
    ? data
    : (data as any)?.data ?? (data as any)?.conversations ?? [];

  const convo = conversationsArray.find((c: any) => c.id === conversationId);

  // Find the other participant's info
  const otherMember = convo?.members?.find((m: any) => m.user.id !== me?.id);
  const otherUser = otherMember?.user;
  const displayName = otherUser?.profile?.displayName || otherUser?.username || "Chat";
  const avatarUrl = otherUser?.profile?.avatarMediaId || null;

  const { joinConversation, leaveConversation } = useSocket();
  const qc = useQueryClient();

  // Join / leave socket room
  useEffect(() => {
    joinConversation(conversationId);
    return () => leaveConversation(conversationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  const { data: pages, isLoading } = useConversationMessages(isMinimized ? null : conversationId);
  const { mutateAsync: send, isPending: isSending } = useSendMessage(conversationId);

  const { setActiveCall } = useCallStore();
  const { mutateAsync: startDatabaseCall } = useStartCall();

  const handleInitiateCall = async (type: "AUDIO" | "VIDEO") => {
    if (!otherUser) return;
    try {
      const response = await startDatabaseCall({
        callType: type,
        participantIds: [otherUser.id],
        conversationId,
      });

      // Store active call — GlobalCallOverlay pops up automatically
      setActiveCall({
        callSessionId: response.callSessionId,
        roomName: response.roomName,
        callType: type,
        callerUserId: me?.id || "",
        callerUsername: "Me",
        otherUserId: otherUser.id,
        calerDisplayName: displayName,
        callerAvatarUrl: avatarUrl,
      });
    } catch (e) {
      console.error("Failed to initiate call", e);
    }
  };

  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<{ file: File; id: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Flatten infinite pages into a single list and REVERSE so newest is at the bottom!
  const messages: RawMessage[] = pages?.pages.flatMap((p) => p.data).reverse() ?? [];

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (!isMinimized) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isMinimized]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setAttachments((prev) => [
        ...prev,
        ...files.map((file) => ({
          file,
          id: URL.createObjectURL(file), // temp ID for preview
        })),
      ]);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSend = useCallback(() => {
    const textToUpload = text.trim();
    if ((!textToUpload && attachments.length === 0) || isSending) return;

    const mediaToUpload = [...attachments];
    const hasMedia = mediaToUpload.length > 0;

    // Clear instantly
    setText("");
    setAttachments([]);

    const mockId = `optimistic-${Date.now()}`;
    const messageType = hasMedia ? (mediaToUpload[0].file.type.startsWith("video/") ? "VIDEO" : "IMAGE") : "TEXT";

    // Optimistic payload
    const mockMsg = {
      id: mockId,
      conversationId,
      senderId: me?.id,
      senderUserId: me?.id,
      content: textToUpload || "",
      messageType,
      status: "sending",
      createdAt: new Date().toISOString(),
      isOptimistic: true,
      attachments: mediaToUpload.map((att) => ({
        id: att.id,
        mediaAsset: { id: att.id, url: att.id, bucket: "", objectKey: "", mimeType: att.file.type },
      })),
    };

    qc.setQueryData(QUERY_KEYS.messages(conversationId), (old: any) => {
      if (!old || !old.pages || !old.pages[0]) return old;
      const firstPage = old.pages[0];
      const newMsgList = firstPage.messages ? [mockMsg, ...firstPage.messages] : (firstPage.data ? [mockMsg, ...firstPage.data] : [mockMsg]);
      return {
        ...old,
        pages: [
          { ...firstPage, messages: firstPage.messages ? newMsgList : undefined, data: firstPage.data ? newMsgList : undefined },
          ...old.pages.slice(1),
        ],
      };
    });

    (async () => {
      try {
        const mediaIds: string[] = [];

        if (hasMedia) {
          const { chatService } = await import("@/lib/services/chat.service");

          for (const att of mediaToUpload) {
            const { file } = att;
            const isVideo = file.type.startsWith("video/");

            const { mediaAssetId, presignedUrl } = await chatService.requestPresignedUrl({
              mimeType: file.type,
              mediaType: isVideo ? "VIDEO" : "IMAGE",
              originalFilename: file.name,
              sizeBytes: file.size,
            });

            const res = await chatService.uploadToS3(presignedUrl, file);
            if (!res.ok) throw new Error("Không thể tải file lên hệ thống.");

            await chatService.confirmUpload(mediaAssetId);
            mediaIds.push(mediaAssetId);
          }
        }

        await send({
          content: textToUpload || undefined,
          messageType,
          mediaIds: mediaIds.length > 0 ? mediaIds : undefined
        });
      } catch (err: any) {
        toast.error(err.message ?? "Lỗi tải ảnh/video.");
        qc.invalidateQueries({ queryKey: QUERY_KEYS.messages(conversationId) });
      }
    })();
  }, [text, attachments, isSending, conversationId, me?.id, qc, send]);

  // Right offset: each window is 320px + 8px gap, starting from 80px (above scrollbar)
  const rightOffset = 80 + index * 328;

  return (
    <div
      style={{ right: `${rightOffset}px` }}
      className={cn(
        "fixed bottom-0 z-50 w-[320px] flex flex-col shadow-2xl rounded-t-2xl overflow-hidden border border-border bg-card transition-all",
        isMinimized ? "h-auto" : "h-[450px]"
      )}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2.5 bg-card border-b border-border cursor-pointer select-none shrink-0"
        onClick={() => toggleMinimize(conversationId)}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={avatarUrl ?? undefined} />
            <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
              {displayName[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-[13px] font-semibold truncate">{displayName}</span>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <Button
            variant="ghost" size="icon"
            className="h-7 w-7 rounded-full text-muted-foreground hover:text-green-500"
            onClick={(e) => { e.stopPropagation(); handleInitiateCall("AUDIO"); }}
          >
            <Phone className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost" size="icon"
            className="h-7 w-7 rounded-full text-muted-foreground hover:text-blue-500"
            onClick={(e) => { e.stopPropagation(); handleInitiateCall("VIDEO"); }}
          >
            <Video className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost" size="icon"
            className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
            onClick={(e) => { e.stopPropagation(); toggleMinimize(conversationId); }}
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost" size="icon"
            className="h-7 w-7 rounded-full text-muted-foreground hover:text-destructive"
            onClick={(e) => { e.stopPropagation(); closeConversation(conversationId); }}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      {!isMinimized && (
        <>
          <div className="flex flex-col flex-1 min-h-0 overflow-y-auto p-3 scrollbar-thin">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-8">
                Hãy bắt đầu cuộc trò chuyện 👋
              </p>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderUserId === me?.id;
                return (
                  <ChatBubble
                    key={msg.id}
                    message={msg as never}
                    isMine={isMe}
                    displayName={displayName}
                    isCompact={true}
                  />
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Media Previews */}
          {attachments.length > 0 && (
            <div className="flex items-center gap-2 px-3 pt-2 overflow-x-auto bg-muted/20">
              {attachments.map((att) => (
                <div key={att.id} className="relative shrink-0 group">
                  {att.file.type.startsWith("video/") ? (
                    <video src={att.id} className="h-10 w-10 object-cover rounded-md opacity-80" />
                  ) : (
                    <img src={att.id} alt="preview" className="h-10 w-10 object-cover rounded-md" />
                  )}
                  <button
                    onClick={() => removeAttachment(att.id)}
                    className="absolute -top-1.5 -right-1.5 bg-slate-800 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex items-end gap-1.5 px-2 py-2 border-t border-border bg-card">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              accept="image/*,video/*"
              onChange={handleFileChange}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-muted-foreground shrink-0 hover:text-primary hover:bg-primary/10"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-paperclip"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
            </Button>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Aa"
              rows={1}
              maxLength={2000}
              className="flex-1 resize-none rounded-2xl bg-muted/60 px-3 py-1.5 text-[14px] placeholder:text-muted-foreground focus:outline-none focus:bg-muted/80 transition-colors max-h-[80px]"
              style={{ fieldSizing: "content" } as React.CSSProperties}
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0 rounded-full text-primary hover:bg-primary/10 disabled:opacity-30"
              disabled={(!text.trim() && attachments.length === 0) || isSending}
              onClick={handleSend}
            >
              {isSending
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Send className="h-[18px] w-[18px] ml-0.5" />}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Phone, Video, MoreHorizontal, Smile, Loader2 } from "lucide-react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { UserHeader } from "@/components/shared/user-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { ChatBubble } from "./chat-bubble";
import { cn } from "@/lib/utils";
import { useMessagesQuery, useSendMessage } from "@/hooks/use-conversations";
import { QUERY_KEYS } from "@/lib/api/constants";
import type { Conversation } from "@/types";
import { useStartCall } from "@/hooks/use-calls";
import { useCallStore } from "@/store/call.store";

// ─── Props ────────────────────────────────────────────────────────────────────
interface ChatPanelProps {
  conversation: Conversation;
  // eslint-disable-next-line react/no-unused-prop-types
  messages?: unknown[]; // kept for backwards compat — panel now self-fetches
  currentUserId: string;
  onBack?: () => void;
}

// ─── ChatPanel ────────────────────────────────────────────────────────────────
export function ChatPanel({ conversation, currentUserId, onBack }: ChatPanelProps) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<{ file: File; id: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const conversationId = conversation.id;
  const backendUser: any = conversation.participant || (conversation as any).members?.[0]?.user || {};
  const participant = {
    ...backendUser,
    displayName: backendUser.profile?.displayName || backendUser.displayName || backendUser.username || "Chat",
    avatarUrl: backendUser.profile?.avatarMediaId || backendUser.avatarUrl,
  };

  const { data, isLoading } = useMessagesQuery(conversationId);
  const { mutateAsync: send, isPending: isSending } = useSendMessage(conversationId);

  // Call Hooks
  const { mutateAsync: startDatabaseCall } = useStartCall();
  const { setActiveCall } = useCallStore();

  const handleInitiateCall = async (type: "AUDIO" | "VIDEO") => {
    try {
      const response = await startDatabaseCall({
        callType: type,
        participantIds: [participant.id],
        conversationId,
      });

      // Store active call — GlobalCallOverlay will pop up automatically
      setActiveCall({
        callSessionId: response.callSessionId,
        roomName: response.roomName,
        callType: type,
        callerUserId: currentUserId,
        callerUsername: "Me",
        otherUserId: participant.id,
        calerDisplayName: participant.displayName,
      });
    } catch (e) {
      console.error("Failed to initiate call", e);
    }
  };

  // Flatten paginated messages (newest last)
  const messages = data?.pages.flatMap((p) => p.data ?? p.messages ?? []).reverse() ?? [];

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

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

  const qc = useQueryClient();

  const sendMessage = () => {
    if ((!draft.trim() && attachments.length === 0) || isSending || isUploading) return;
    
    // 1. Capture state instantly
    const textToUpload = draft.trim();
    const mediaToUpload = [...attachments];
    const hasMedia = mediaToUpload.length > 0;
    
    // 2. Optimistic UI - Clear input instantly
    setDraft("");
    setAttachments([]);

    const mockId = `optimistic-${Date.now()}`;
    const messageType = hasMedia ? (mediaToUpload[0].file.type.startsWith("video/") ? "VIDEO" : "IMAGE") : "TEXT";

    // Inject optimistic message immediately so UI updates in 0ms, including local Blob URLs for media
    const mockMsg = {
      id: mockId,
      conversationId,
      senderId: currentUserId,
      senderUserId: currentUserId,
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

    // 3. Fire and Forget Background Upload & API Call
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

        // Call API
        await send({ 
          messageType, 
          content: textToUpload || undefined,
          mediaIds: mediaIds.length > 0 ? mediaIds : undefined
        });
      } catch (err: any) {
        toast.error(err.message ?? "Lỗi tải ảnh/video. Vui lòng thử lại.");
        // Rollback optimistic message
        qc.invalidateQueries({ queryKey: QUERY_KEYS.messages(conversationId) });
      }
    })();
  };

  return (
    <div className="flex flex-col w-full h-full min-w-0 min-h-0 overflow-hidden bg-[url('/bg-chat.png')] bg-cover bg-center relative">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-2 md:px-4 py-2 md:py-3 border-b border-border bg-card/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-1 md:gap-3">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9 shrink-0 text-muted-foreground mr-1"
              onClick={onBack}
              aria-label="Back to conversations"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </Button>
          )}
          <UserHeader
            user={participant}
            size="md"
            withLink={true}
            showOnlineBadge={false}
            subtitle={participant.isOnline ? "Active now" : "Offline"}
            className="flex-1 min-w-0"
          />
        </div>

        {/* Header actions */}
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-[--color-success]" 
            aria-label="Voice call"
            onClick={() => handleInitiateCall("AUDIO")}
          >
            <Phone className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary" 
            aria-label="Video call"
            onClick={() => handleInitiateCall("VIDEO")}
          >
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground" aria-label="More options">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 min-h-0 relative bg-white/40 dark:bg-black/20">
        <ScrollArea className="h-full w-full p-4">
        <div className="space-y-4">
          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* isRequest Banner */}
          {conversation.isRequest && !isLoading && (
            <div className="flex flex-col items-center justify-center p-6 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl my-6 backdrop-blur-sm border-dashed border-2 border-slate-300 dark:border-slate-700">
              <p className="text-sm text-slate-700 dark:text-slate-300 font-medium mb-3 text-center">
                Đây là tin nhắn chờ từ <strong>{participant.displayName || participant.username || "Chat"}</strong>.
                Họ sẽ không biết bạn đã đọc tin nhắn cho đến khi bạn phản hồi.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-full shadow-sm">
                  Chặn / Báo cáo
                </Button>
                <Button className="rounded-full shadow-sm px-6">
                  Kết bạn để trò chuyện
                </Button>
              </div>
            </div>
          )}

          {messages.map((msg) => {
            if (!msg) return null;
            return (
              <ChatBubble
                key={msg.id}
                message={msg as never}
                isMine={(msg.senderUserId || msg.senderId) === currentUserId}
                displayName={participant.displayName || participant.username || "Chat"}
              />
            );
          })}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
      </div>

      {/* ── Input Bar (Liquid Glass) ── */}
      <div className="px-4 md:px-6 py-4 shrink-0 bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border-t border-white/20 dark:border-white/10">
        {conversation.isRequest ? (
          <div className="text-center p-3 text-sm text-muted-foreground">
            Bắn lời mời kết bạn để có thể gửi tin nhắn.
          </div>
        ) : (
          <div className="flex flex-col">
            {/* ── Media Preview Line ── */}
            {attachments.length > 0 && (
              <div className="flex items-center gap-2 mb-2 p-2 overflow-x-auto rounded-lg bg-background/50 border border-border/50">
                {attachments.map((att) => (
                  <div key={att.id} className="relative shrink-0 group">
                    {att.file.type.startsWith("video/") ? (
                      <video src={att.id} className="h-16 w-16 object-cover rounded-md opacity-80" />
                    ) : (
                      <img src={att.id} alt="preview" className="h-16 w-16 object-cover rounded-md" />
                    )}
                    <button
                      onClick={() => removeAttachment(att.id)}
                      className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-end gap-2 bg-white/80 dark:bg-slate-900/80 p-2 rounded-[32px] border border-white/40 dark:border-white/10 focus-within:border-primary/40 focus-within:ring-[3px] focus-within:ring-primary/10 transition-all duration-300 shadow-sm">
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
                className="h-10 w-10 text-slate-500 hover:text-primary hover:bg-primary/10 shrink-0 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-paperclip"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
              </Button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-500 hover:text-foreground shrink-0 transition-colors">
                    <Smile className="h-6 w-6" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="top" align="start" className="w-[320px] p-0 border-none shadow-2xl z-50">
                  <EmojiPicker 
                    theme={Theme.AUTO} 
                    onEmojiClick={(e) => setDraft((v) => v + e.emoji)}
                    lazyLoadEmojis={true}
                    searchPlaceHolder="Tìm kiếm emoji..."
                  />
                </PopoverContent>
              </Popover>

              <Input
                id="chat-input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Nhập tin nhắn..."
                className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 min-h-[40px] px-3 py-2 text-[15px] resize-none placeholder:text-slate-500/80 dark:placeholder:text-slate-400"
                autoComplete="off"
              />

              <Button
                size="icon"
                className={cn(
                  "h-10 w-10 rounded-full shrink-0 transition-all duration-300 shadow-md group disabled:shadow-none disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400",
                  draft.trim() || attachments.length > 0
                    ? "bg-gradient-to-br from-primary to-blue-500 text-white shadow-primary/25 hover:shadow-primary/40 hover:scale-105 active:scale-95"
                    : "",
                )}
                onClick={sendMessage}
                disabled={(!draft.trim() && attachments.length === 0) || isSending || isUploading}
                aria-label="Send message"
              >
                {isSending || isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className={cn("h-4 w-4", (draft.trim() || attachments.length > 0) && "ml-0.5")} />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

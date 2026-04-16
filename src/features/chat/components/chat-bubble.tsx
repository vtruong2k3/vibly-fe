import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Message, MediaAttachment } from "@/types";

// ─── Props ────────────────────────────────────────────────────────
interface ChatBubbleProps {
  message: Message;
  isMine: boolean;
  showAvatar?: boolean;
  avatarUrl?: string | null;
  displayName?: string;
  isCompact?: boolean;
}

// Helper to get media URL
const getMediaUrl = (asset: MediaAttachment) => {
  // If we injected a local blob URL for optimistic UX
  if ((asset as any).url && (asset as any).url.startsWith("blob:")) {
    return (asset as any).url;
  }
  // Replace with appropriate CloudFront domain if available
  const baseUrl = process.env.NEXT_PUBLIC_CDN_URL || `https://${asset.bucket}.s3.ap-southeast-1.amazonaws.com`;
  return `${baseUrl}/${asset.objectKey}`;
};

import { Phone, Video } from "lucide-react";

// ─── ChatBubble Component ─────────────────────────────────────────
export function ChatBubble({
  message,
  isMine,
  displayName = "User",
  isCompact = false,
}: ChatBubbleProps) {
  const timeFormatted = format(new Date(message.createdAt), "HH:mm");

  if (message.messageType === "CALL_EVENT") {
    let text = message.content;
    let isMissed = false;
    let isVideo = false;

    // Try parsing the JSON
    if (text?.startsWith("{")) {
      try {
        const payload = JSON.parse(text);
        isVideo = payload.callType === "VIDEO";
        
        switch (payload.event) {
          case "call_started":
            text = `Bắt đầu cuộc gọi ${isVideo ? "Video" : "Thoại"}`;
            break;
          case "call_ended":
            if (payload.durationSeconds && payload.durationSeconds > 0) {
              const m = Math.floor(payload.durationSeconds / 60);
              const s = payload.durationSeconds % 60;
              text = `Cuộc gọi kết thúc - ${m} phút ${s} giây`;
            } else {
              text = "Cuộc gọi nhỡ";
              isMissed = true;
            }
            break;
          case "call_rejected":
            text = "Từ chối cuộc gọi";
            isMissed = true;
            break;
        }
      } catch (e) {
        // Fallback to text matching if parsing fails
        isMissed = text?.includes("hủy") || text?.toLowerCase().includes("missed");
        isVideo = text?.includes("Video") || text?.toLowerCase().includes("video");
      }
    } else {
      isMissed = text?.includes("hủy") || text?.toLowerCase().includes("missed") || false;
      isVideo = text?.includes("Video") || text?.toLowerCase().includes("video") || false;
    }

    return (
      <div
        className={cn(
          "flex flex-col gap-1 w-full mb-4",
          isMine ? "items-end" : "items-start",
        )}
      >
        <div
          className={cn(
            "relative group px-4 py-3 text-[15px] leading-relaxed transition-all duration-300 flex items-center gap-3",
            isCompact ? "max-w-[90%]" : "max-w-[85%] md:max-w-[70%]",
            isMine
              ? "bg-gradient-to-br from-primary/95 to-blue-600/95 backdrop-blur-md text-white rounded-[24px] rounded-br-[4px] border border-white/20 shadow-[0_8px_16px_-6px_rgba(37,99,235,0.4)]"
              : "bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-white/10 text-slate-900 dark:text-slate-100 rounded-[24px] rounded-bl-[4px] shadow-[0_4px_12px_-4px_rgba(0,0,0,0.1)]",
          )}
        >
          <div className={cn("p-2.5 rounded-full", isMine ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300")}>
            {isVideo ? <Video className={cn("w-5 h-5", isMissed && "text-red-500/90")} /> : <Phone className={cn("w-5 h-5", isMissed && "text-red-500/90")} />}
          </div>
          <div className="flex flex-col">
            <span className={cn("font-medium", isMissed && !isMine && "text-red-500")}>
              {text}
            </span>
            <div className={cn("text-[11px] font-medium flex items-center gap-1 select-none opacity-80", isMine ? "text-white" : "text-slate-500 dark:text-slate-400 mt-1")}>
              {timeFormatted}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-1 w-full mb-4",
        isMine ? "items-end" : "items-start",
      )}
    >
      <div
        className={cn(
          "relative group px-4 py-3 text-[15px] leading-relaxed transition-all duration-300",
          isCompact ? "max-w-[90%]" : "max-w-[85%] md:max-w-[70%]",
          isMine
            ? "bg-gradient-to-br from-primary/95 to-blue-600/95 backdrop-blur-md text-white rounded-[24px] rounded-br-[4px] border border-white/20 shadow-[0_8px_16px_-6px_rgba(37,99,235,0.4)]"
            : "bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-white/10 text-slate-900 dark:text-slate-100 rounded-[24px] rounded-bl-[4px] shadow-[0_4px_12px_-4px_rgba(0,0,0,0.1)]",
        )}
        aria-label={isMine ? "Your message" : `Message from ${displayName}`}
      >
        <div className="flex flex-col gap-2">
          {/* ── Attachments ── */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-1">
              {message.attachments.map((att, i) => {
                const asset = att.mediaAsset;
                if (!asset) return null;
                const isVideo = asset.mimeType?.startsWith("video/");
                if (isVideo) {
                  return (
                    <video
                      key={asset.id ?? i}
                      src={getMediaUrl(asset)}
                      controls
                      className="max-w-full rounded-xl outline-none"
                    />
                  );
                }
                return (
                  <img
                    key={asset.id ?? i}
                    src={getMediaUrl(asset)}
                    alt="Attachment"
                    className="max-w-full max-h-[300px] object-cover rounded-xl"
                  />
                );
              })}
            </div>
          )}

          {/* ── Text Content ── */}
          {message.content && (
            <span className="whitespace-pre-wrap">{message.content}</span>
          )}

          {/* ── Timestamp & Read Receipt ── */}
          <div
            className={cn(
              "text-[10px] font-medium self-end flex items-center gap-1 select-none opacity-80",
              isMine ? "text-white" : "text-slate-500 dark:text-slate-400"
            )}
          >
            {timeFormatted}
            {isMine && (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-check text-white">
                <path d="M18 6 7 17l-5-5"/>
                <path d="m22 10-7.5 7.5L13 16"/>
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


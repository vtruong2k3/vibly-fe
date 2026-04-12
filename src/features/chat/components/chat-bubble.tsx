import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Message } from "@/types";

// ─── Props ────────────────────────────────────────────────────────
interface ChatBubbleProps {
  message: Message;
  isMine: boolean;
  showAvatar?: boolean;
  avatarUrl?: string | null;
  displayName?: string;
}

// ─── ChatBubble Component ─────────────────────────────────────────
// Server Component: purely presentational
export function ChatBubble({
  message,
  isMine,
  displayName = "User",
}: ChatBubbleProps) {
  const timeFormatted = format(new Date(message.createdAt), "HH:mm");

  return (
    <div
      className={cn(
        "flex flex-col gap-1 w-full mb-4",
        isMine ? "items-end" : "items-start",
      )}
    >
      <div
        className={cn(
          "relative group px-4 py-3 max-w-[85%] md:max-w-[70%] text-[15px] leading-relaxed transition-all duration-300",
          isMine
            ? "bg-gradient-to-br from-primary/95 to-blue-600/95 backdrop-blur-md text-white rounded-[24px] rounded-br-[4px] border border-white/20 shadow-[0_8px_16px_-6px_rgba(37,99,235,0.4)]"
            : "bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-white/10 text-slate-900 dark:text-slate-100 rounded-[24px] rounded-bl-[4px] shadow-[0_4px_12px_-4px_rgba(0,0,0,0.1)]",
        )}
        aria-label={isMine ? "Your message" : `Message from ${displayName}`}
      >
        <div className="flex flex-col gap-1.5">
          <span className="whitespace-pre-wrap">{message.content}</span>
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

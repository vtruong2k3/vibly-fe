"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Video, Image as ImageIcon, Smile, Send, X, Loader2, Film } from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useMe } from "@/hooks/use-users";
import { useCreatePost } from "@/hooks/use-feed";
import { useMediaFiles, uploadFiles } from "@/hooks/use-media";

// Lazy-load emoji picker to avoid SSR issues (it accesses the DOM)
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

const MAX_FILES = 10;
const ACCEPTED_IMAGE = "image/jpeg,image/png,image/webp,image/gif";
const ACCEPTED_VIDEO = "video/mp4,video/webm,video/quicktime";

// ─── CreatePostCard ───────────────────────────────────────────────
export function CreatePostCard() {
  const [content, setContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const { data: me } = useMe();
  const { mutate: createPost, isPending } = useCreatePost();
  const { files, addFiles, removeFile, clearFiles } = useMediaFiles(MAX_FILES);

  const isFilled = content.trim().length > 0 || files.length > 0;
  const isBusy = isPending || isUploading;

  // ── Handlers ──────────────────────────────────────────────────
  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
      // Reset input so user can pick the same file again if needed
      e.target.value = "";
    }
  };

  const handlePost = async () => {
    if (!isFilled || isBusy) return;

    try {
      setIsUploading(true);
      const mediaIds = files.length > 0 ? await uploadFiles(files) : [];
      createPost(
        { content: content.trim() || undefined, visibility: "FRIENDS", mediaIds },
        {
          onSuccess: () => {
            setContent("");
            clearFiles();
          },
        }
      );
    } catch (error) {
      console.error("[Post Upload Error]:", error);
      toast.error("Upload ảnh/video thất bại. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="vibly-card p-5 space-y-4">
      {/* ── Row 1: Avatar + Textarea ── */}
      <div className="flex gap-4">
        <UserAvatar user={me} className="shrink-0 h-[42px] w-[42px]" />
        <Textarea
          id="create-post-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`What's on your mind, ${me?.displayName?.split(" ")[0] ?? "you"}?`}
          className="resize-none rounded-3xl border-transparent bg-muted/60 focus-visible:ring-1 focus-visible:ring-border hover:bg-muted/80 min-h-[46px] max-h-40 py-3 px-5 text-[15px] font-medium leading-relaxed transition-colors shadow-none"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePost();
          }}
        />
      </div>

      {/* ── Row 2: Media Previews ── */}
      {files.length > 0 && (
        <div
          className={cn(
            "grid gap-2 pl-[58px]",
            files.length === 1 && "grid-cols-1",
            files.length === 2 && "grid-cols-2",
            files.length >= 3 && "grid-cols-3"
          )}
        >
          {files.map((mf, idx) => (
            <div
              key={mf.previewUrl}
              className="relative rounded-xl overflow-hidden bg-muted aspect-square group"
            >
              {mf.mediaType === "IMAGE" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mf.previewUrl}
                  alt={mf.file.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full gap-2 text-muted-foreground">
                  <Film className="h-8 w-8" />
                  <span className="text-[11px] font-medium truncate max-w-[80%]">{mf.file.name}</span>
                </div>
              )}

              {/* Remove button */}
              <button
                onClick={() => removeFile(idx)}
                className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                aria-label="Xoá"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Row 3: Actions + Post Button ── */}
      <div className="flex items-center justify-between pl-[58px]">
        {/* Attachment actions */}
        <div className="flex items-center gap-1">
          {/* Hidden file inputs */}
          <input
            ref={photoInputRef}
            type="file"
            multiple
            accept={ACCEPTED_IMAGE}
            className="hidden"
            onChange={handleFilesSelected}
          />
          <input
            ref={videoInputRef}
            type="file"
            multiple
            accept={ACCEPTED_VIDEO}
            className="hidden"
            onChange={handleFilesSelected}
          />

          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full text-[13px] font-semibold h-9 px-4"
            aria-label="Đính kèm ảnh"
            onClick={() => photoInputRef.current?.click()}
            disabled={isBusy || files.length >= MAX_FILES}
          >
            <ImageIcon className="h-[18px] w-[18px]" />
            Photo
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-[--color-success] hover:bg-success/10 rounded-full text-[13px] font-semibold h-9 px-4"
            aria-label="Đính kèm video"
            onClick={() => videoInputRef.current?.click()}
            disabled={isBusy || files.length >= MAX_FILES}
          >
            <Video className="h-[18px] w-[18px]" />
            Video
          </Button>

          {/* Emoji Popover */}
          <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-full text-[13px] font-semibold h-9 px-4"
                aria-label="Chọn Emoji"
                disabled={isBusy}
              >
                <Smile className="h-[18px] w-[18px]" />
                Feeling
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="p-0 border-none shadow-2xl w-auto"
              side="top"
              align="start"
            >
              <EmojiPicker
                onEmojiClick={(emojiData) => {
                  setContent((prev) => prev + emojiData.emoji);
                  setEmojiOpen(false);
                }}
                lazyLoadEmojis
                searchPlaceHolder="Tìm emoji..."
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Post button */}
        <Button
          size="default"
          className={cn(
            "rounded-full gap-2 transition-all font-bold text-sm px-6 h-10 shadow-sm",
            !isFilled && "opacity-50"
          )}
          onClick={handlePost}
          disabled={!isFilled || isBusy}
          aria-label="Đăng bài"
        >
          {isBusy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {isUploading ? "Đang tải..." : "Đang đăng..."}
            </>
          ) : (
            <>
              Post
              <Send className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

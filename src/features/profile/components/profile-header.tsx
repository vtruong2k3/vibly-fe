"use client";

import {
  Edit2,
  UserPlus,
  MessageCircle,
  UserCheck,
  Clock,
  UserMinus,
  X,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserProfile } from "@/lib/mock-data/profile";
import {
  useFriendshipStatus,
  useSendFriendRequest,
  useRemoveFriend,
  useCancelRequest,
  useAcceptRequest,
  useRejectRequest,
} from "@/hooks/use-friendships";
import { useCreateConversation } from "@/hooks/use-chat";
import { useChatStore } from "@/store/chat.store";
import { ProfileEditModal } from "./profile-edit-modal";
import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProfileHeaderProps {
  profile: UserProfile & { id?: string };
  isCurrentUser: boolean;
}

// ─── ProfileHeader ────────────────────────────────────────────────────────────
export function ProfileHeader({ profile, isCurrentUser }: ProfileHeaderProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const { status, requestId, isLoading } = useFriendshipStatus(profile.id);
  const sendRequest = useSendFriendRequest();
  const removeFriend = useRemoveFriend();
  const cancelRequest = useCancelRequest(profile.id);
  const acceptRequest = useAcceptRequest(profile.id);
  const rejectRequest = useRejectRequest(profile.id);
  const createConversation = useCreateConversation();
  const openChat = useChatStore((s) => s.openConversation);

  const handleAddFriend = () => {
    if (!profile.id) return;
    sendRequest.mutate({ addresseeId: profile.id });
  };

  const handleMessage = () => {
    if (!profile.id) return;
    createConversation.mutate(
      { participantIds: [profile.id], type: "DIRECT" },
      { onSuccess: (conv) => openChat(conv.id) }
    );
  };

  const handleRemoveFriend = () => {
    if (!profile.id) return;
    removeFriend.mutate(profile.id);
  };

  // ─── Render the correct friendship action button based on current status ──
  const renderFriendButton = () => {
    // While status is being fetched, show a neutral disabled button to prevent
    // premature "Thêm bạn bè" flash before the real status arrives.
    if (isLoading) {
      return (
        <Button className="rounded-full h-10 px-6 font-semibold" variant="secondary" disabled>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Đang tải...
        </Button>
      );
    }

    // Already friends → dropdown with unfriend option
    if (status === "friends") {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="rounded-full h-10 px-6 font-semibold" variant="secondary">
              <UserCheck className="h-4 w-4 mr-2" />
              Bạn bè
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="rounded-xl w-48">
            <DropdownMenuItem
              onClick={handleRemoveFriend}
              className="text-destructive focus:text-destructive focus:bg-destructive/10 focus:**:text-destructive cursor-pointer"
            >
              <UserMinus className="h-4 w-4 mr-2" />
              Huỷ kết bạn
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    // Current user sent a request → show pending state with cancel option
    if (status === "pending_outgoing") {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="rounded-full h-10 px-6 font-semibold"
              variant="outline"
              disabled={cancelRequest.isPending}
            >
              <Clock className="h-4 w-4 mr-2" />
              Đã gửi lời mời
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="rounded-xl w-48">
            <DropdownMenuItem
              onClick={() => requestId && cancelRequest.mutate(requestId)}
              className="text-destructive focus:text-destructive focus:bg-destructive/10 focus:**:text-destructive cursor-pointer"
            >
              <UserMinus className="h-4 w-4 mr-2" />
              Thu hồi lời mời
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    // Current user received a request → two explicit inline buttons (not hidden in dropdown)
    if (status === "pending_incoming") {
      const isBusy = acceptRequest.isPending || rejectRequest.isPending;
      return (
        <>
          <Button
            className="rounded-full h-10 px-6 font-semibold shadow-sm bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => requestId && acceptRequest.mutate(requestId)}
            disabled={isBusy}
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Xác nhận
          </Button>
          <Button
            className="rounded-full h-10 px-6 font-semibold"
            variant="secondary"
            onClick={() => requestId && rejectRequest.mutate(requestId)}
            disabled={isBusy}
          >
            <X className="h-4 w-4 mr-2" />
            Xoá lời mời
          </Button>
        </>
      );
    }

    // No relationship → add friend
    return (
      <Button
        className="rounded-full h-10 px-6 font-semibold shadow-sm bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={handleAddFriend}
        disabled={sendRequest.isPending}
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Thêm bạn bè
      </Button>
    );
  };

  return (
    <div className="bg-card w-full pb-4 relative z-0">
      {/* ── Cover Photo ── */}
      <div className="h-48 md:h-[280px] relative bg-muted w-full overflow-hidden">
        {profile.coverUrl ? (
          <img
            src={profile.coverUrl}
            alt="Cover"
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-accent/30 dark:from-primary/10 dark:to-accent/10" />
        )}
      </div>

      {/* ── Profile Info ── */}
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between mt-2">

          {/* Left: Avatar & Name */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 z-10 w-full sm:w-auto">
            <Avatar className="-mt-16 sm:-mt-24 h-32 w-32 md:h-[160px] md:w-[160px] rounded-[32px] md:rounded-[40px] ring-[8px] ring-card bg-card shrink-0 shadow-sm">
              <AvatarImage src={profile.avatarUrl ?? undefined} alt={profile.displayName} className="object-cover" />
              <AvatarFallback className="bg-secondary text-secondary-foreground text-4xl font-bold rounded-[32px] md:rounded-[40px]">
                {profile.displayName?.[0] ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div className="mb-2 sm:mb-0 sm:pt-2">
              <h1 className="text-2xl sm:text-3xl font-bold font-heading text-foreground tracking-tight">
                {profile.displayName || profile.username}
              </h1>
              <p className="text-[15px] text-muted-foreground font-medium mt-0.5">
                {profile.bio || `@${profile.username}`}
              </p>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center justify-start sm:justify-end gap-3 z-10 mb-2 mt-4 sm:mt-0">
            {isCurrentUser ? (
              <>
                <Button 
                  className="rounded-full h-10 px-6 font-semibold shadow-sm" 
                  variant="outline"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Chỉnh sửa trang cá nhân
                </Button>
                <ProfileEditModal 
                  isOpen={isEditModalOpen} 
                  onOpenChange={setIsEditModalOpen} 
                  profile={profile as any} 
                />
              </>
            ) : (
              <>
                {renderFriendButton()}

                <Button
                  className="rounded-full h-10 px-6 font-semibold shadow-sm bg-secondary text-primary hover:bg-secondary/80"
                  onClick={handleMessage}
                  disabled={createConversation.isPending}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Nhắn tin
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

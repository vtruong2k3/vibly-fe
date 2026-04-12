import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// ─── CardSkeleton ──────────────────────────────────────────────────
// Matches the general structure of PostCard
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("vibly-card p-4 space-y-4", className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 md:h-[46px] md:w-[46px] rounded-2xl shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-[120px] rounded-md" />
          <Skeleton className="h-3 w-[80px] rounded-md" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-[90%] rounded-md" />
        <Skeleton className="h-4 w-[60%] rounded-md" />
      </div>
      <Skeleton className="w-full h-[200px] rounded-2xl" />
      <div className="flex items-center gap-4 pt-2">
        <Skeleton className="h-8 w-16 rounded-xl" />
        <Skeleton className="h-8 w-16 rounded-xl" />
        <Skeleton className="h-8 w-16 rounded-xl" />
      </div>
    </div>
  );
}

// ─── ListItemSkeleton ──────────────────────────────────────────────
// Matches the structure of ConversationList or Notification items
export function ListItemSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 p-3", className)}>
      <Skeleton className="h-12 w-12 rounded-2xl shrink-0" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-[60%] rounded-md" />
        <Skeleton className="h-3 w-[80%] rounded-md" />
      </div>
    </div>
  );
}

// ─── ProfileHeaderSkeleton ─────────────────────────────────────────
export function ProfileHeaderSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("w-full relative", className)}>
      {/* Cover */}
      <Skeleton className="w-full h-48 md:h-64 object-cover" />
      <div className="px-4 md:px-8 pb-8">
        <div className="flex flex-col sm:flex-row relative -mt-16 sm:-mt-20 gap-4 sm:gap-6 sm:justify-between items-start sm:items-end">
          {/* Avatar and Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6 w-full">
            <Skeleton className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-background shrink-0" />
            <div className="space-y-2 mb-2">
              <Skeleton className="h-8 w-48 rounded-md" />
              <Skeleton className="h-4 w-32 rounded-md" />
            </div>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0 mb-2">
            <Skeleton className="h-10 w-24 rounded-xl shrink-0" />
            <Skeleton className="h-10 w-10 xl:w-28 rounded-xl shrink-0" />
          </div>
        </div>
        {/* Bio */}
        <div className="mt-6 space-y-2">
          <Skeleton className="h-4 w-full max-w-md rounded-md" />
          <Skeleton className="h-4 w-3/4 max-w-sm rounded-md" />
        </div>
      </div>
    </div>
  );
}

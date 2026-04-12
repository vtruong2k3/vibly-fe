import { Edit2, UserPlus, MessageCircle } from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { UserProfile } from "@/lib/mock-data/profile";

interface ProfileHeaderProps {
  profile: UserProfile;
  isCurrentUser: boolean;
}

export function ProfileHeader({ profile, isCurrentUser }: ProfileHeaderProps) {
  return (
    <div className="bg-card w-full pb-4 relative z-0">
      {/* ── Cover Photo ── */}
      <div className="h-48 md:h-[280px] relative bg-muted w-full overflow-hidden">
        {profile.coverUrl ? (
          <Image
            src={profile.coverUrl}
            alt="Cover"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-accent/30 dark:from-primary/10 dark:to-accent/10" />
        )}
      </div>

      {/* ── Profile Info ── */}
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between mt-2">
          
          {/* Left Side: Avatar & Name */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 z-10 w-full sm:w-auto">
            <Avatar className="-mt-16 sm:-mt-24 h-32 w-32 md:h-[160px] md:w-[160px] rounded-[32px] md:rounded-[40px] ring-[8px] ring-card bg-card shrink-0 shadow-sm">
              <AvatarImage src={profile.avatarUrl ?? undefined} alt={profile.displayName} className="object-cover" />
              <AvatarFallback className="bg-secondary text-secondary-foreground text-4xl font-bold rounded-[32px] md:rounded-[40px]">
                {profile.displayName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="mb-2 sm:mb-0 sm:pt-2">
              <h1 className="text-2xl sm:text-3xl font-bold font-heading text-foreground tracking-tight">
                {profile.displayName}
              </h1>
              <p className="text-[15px] text-muted-foreground font-medium mt-0.5">
                {/* Changed to bio preview layout based on image */}
                {profile.bio || "Digital Architect & Urban Explorer"}
              </p>
            </div>
          </div>

          {/* Right Side: Action Buttons */}
          <div className="flex items-center justify-start sm:justify-end gap-3 z-10 mb-2 mt-4 sm:mt-0">
            {isCurrentUser ? (
              <Button className="rounded-full h-10 px-6 font-semibold shadow-sm" variant="outline">
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <>
                <Button className="rounded-full h-10 px-6 font-semibold shadow-sm bg-primary text-primary-foreground hover:bg-primary/90">
                  Follow
                </Button>
                <Button className="rounded-full h-10 px-6 font-semibold shadow-sm bg-secondary text-primary hover:bg-secondary/80">
                  Message
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

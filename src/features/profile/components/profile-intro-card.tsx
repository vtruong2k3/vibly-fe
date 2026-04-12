import { MapPin, CalendarDays, Link as LinkIcon, User } from "lucide-react";
import type { UserProfile } from "@/lib/mock-data/profile";

export function ProfileIntroCard({ profile }: { profile: UserProfile }) {
  return (
    <div className="bg-card rounded-[32px] p-6 border border-border shadow-sm space-y-4">
      <h3 className="font-heading font-bold text-lg text-foreground">Intro</h3>
      
      {profile.bio && (
        <p className="text-[15px] text-foreground leading-relaxed">
          {profile.bio}
        </p>
      )}

      <ul className="space-y-3 pt-2">
        {profile.location && (
          <li className="flex items-center gap-3 text-[15px] text-muted-foreground font-medium">
            <MapPin className="h-5 w-5 text-muted-foreground/80 shrink-0" />
            <span>{profile.location}</span>
          </li>
        )}
        <li className="flex items-center gap-3 text-[15px] text-muted-foreground font-medium">
          <CalendarDays className="h-5 w-5 text-muted-foreground/80 shrink-0" />
          <span>Joined September 2023</span>
        </li>
      </ul>
    </div>
  );
}

import { MapPin, CalendarDays, Link as LinkIcon, User, GraduationCap, Heart, Home } from "lucide-react";
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
        {profile.hometown && (
          <li className="flex items-center gap-3 text-[15px] text-muted-foreground font-medium">
            <Home className="h-5 w-5 text-muted-foreground/80 shrink-0" />
            <span>Đến từ <strong className="text-foreground">{profile.hometown}</strong></span>
          </li>
        )}
        {profile.location && (
          <li className="flex items-center gap-3 text-[15px] text-muted-foreground font-medium">
            <MapPin className="h-5 w-5 text-muted-foreground/80 shrink-0" />
            <span>Sống tại <strong className="text-foreground">{profile.location}</strong></span>
          </li>
        )}
        {profile.education && (
          <li className="flex items-center gap-3 text-[15px] text-muted-foreground font-medium">
            <GraduationCap className="h-5 w-5 text-muted-foreground/80 shrink-0" />
            <span>Học tại <strong className="text-foreground">{profile.education}</strong></span>
          </li>
        )}
        {profile.maritalStatus && (
          <li className="flex items-center gap-3 text-[15px] text-muted-foreground font-medium">
            <Heart className="h-5 w-5 text-muted-foreground/80 shrink-0" />
            <strong className="text-foreground">{profile.maritalStatus}</strong>
          </li>
        )}
        {profile.gender && (
          <li className="flex items-center gap-3 text-[15px] text-muted-foreground font-medium">
            <User className="h-5 w-5 text-muted-foreground/80 shrink-0" />
            <span>Giới tính: <strong className="text-foreground">{profile.gender === 'MALE' ? 'Nam' : profile.gender === 'FEMALE' ? 'Nữ' : 'Khác'}</strong></span>
          </li>
        )}
        {profile.website && (
          <li className="flex items-center gap-3 text-[15px] text-muted-foreground font-medium">
            <LinkIcon className="h-5 w-5 text-muted-foreground/80 shrink-0" />
            <a href={profile.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">
              {profile.website.replace(/^https?:\/\//, '')}
            </a>
          </li>
        )}
        <li className="flex items-center gap-3 text-[15px] text-muted-foreground font-medium">
          <CalendarDays className="h-5 w-5 text-muted-foreground/80 shrink-0" />
          <span>Tham gia {new Date(profile.createdAt).toLocaleDateString("vi-VN", { month: "long", year: "numeric" })}</span>
        </li>
      </ul>
    </div>
  );
}

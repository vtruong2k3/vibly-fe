import type { UserProfile } from "@/lib/mock-data/profile";

interface ProfileStatsProps {
  profile: UserProfile;
}

export function ProfileStats({ profile }: ProfileStatsProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "m";
    if (num >= 1000) return (num / 1000).toFixed(1) + "k";
    return num.toString();
  };

  return (
    <div className="bg-[#f2f4f8] dark:bg-card/50 rounded-[32px] px-6 py-5 flex items-center justify-between text-center group shadow-sm">
      <div className="flex flex-col items-center gap-1.5 cursor-pointer">
        <span className="text-[19px] font-bold font-heading text-foreground group-hover:text-primary transition-colors">
          1.2k
        </span>
        <span className="text-[10px] font-bold text-[#4B6B8A] dark:text-slate-400 uppercase tracking-widest">
          Posts
        </span>
      </div>
      
      <div className="flex flex-col items-center gap-1.5 cursor-pointer">
        <span className="text-[19px] font-bold font-heading text-foreground group-hover:text-primary transition-colors">
          5.2k
        </span>
        <span className="text-[10px] font-bold text-[#4B6B8A] dark:text-slate-400 uppercase tracking-widest">
          Followers
        </span>
      </div>
      
      <div className="flex flex-col items-center gap-1.5 cursor-pointer">
        <span className="text-[19px] font-bold font-heading text-foreground group-hover:text-primary transition-colors">
          120
        </span>
        <span className="text-[10px] font-bold text-[#4B6B8A] dark:text-slate-400 uppercase tracking-widest">
          Following
        </span>
      </div>
    </div>
  );
}

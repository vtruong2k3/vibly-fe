import { MOCK_USERS } from "@/lib/mock-data/feed";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// ─── FeedRightSidebar ──────────────────────────────────────────────
export function FeedRightSidebar() {
  return (
    <aside className="space-y-6 sticky top-6">
      {/* Online Friends Widget */}
      <div className="vibly-card p-5 space-y-4 bg-muted/30">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-semibold text-lg text-foreground">Online Friends</h3>
          <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider">
            24 ACTIVE
          </span>
        </div>
        
        <div className="flex items-center gap-[-8px]">
          {MOCK_USERS.slice(0, 4).map((user, i) => (
            <div
              key={user.id}
              className="relative rounded-full border-2 border-background overflow-hidden"
              style={{ zIndex: 10 - i, marginLeft: i > 0 ? "-8px" : "0" }}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatarUrl ?? undefined} alt={user.displayName} />
                <AvatarFallback>{user.displayName[0]}</AvatarFallback>
              </Avatar>
            </div>
          ))}
        </div>
        
        <Button variant="ghost" className="w-full text-xs font-semibold tracking-wider text-muted-foreground hover:text-foreground justify-start px-0 pt-2">
          VIEW ALL
        </Button>
      </div>

      {/* Trending Sanctuary Widget */}
      <div className="vibly-card p-5 space-y-5">
        <h3 className="font-heading font-bold text-lg text-foreground">Trending Sanctuary</h3>
        
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">#Minimalism</p>
            <h4 className="font-semibold text-foreground text-sm leading-tight">Finding Peace in the Chaos</h4>
            <p className="text-xs text-muted-foreground pt-0.5">12.5k posts</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">#ViblyLive</p>
            <h4 className="font-semibold text-foreground text-sm leading-tight">Community Wellness Session</h4>
            <p className="text-xs text-muted-foreground pt-0.5">8.2k posts</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">#DigitalDetox</p>
            <h4 className="font-semibold text-foreground text-sm leading-tight">How to unplug effectively</h4>
            <p className="text-xs text-muted-foreground pt-0.5">5.1k posts</p>
          </div>
        </div>
      </div>

      {/* Suggestions Widget */}
      <div className="vibly-card p-5 space-y-4 bg-muted/30">
        <h3 className="font-heading font-bold text-lg text-foreground">Suggestions</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarImage src="https://i.pravatar.cc/150?u=chloe" />
                <AvatarFallback>C</AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold truncate">Chloe Sims</span>
                <span className="text-xs text-muted-foreground truncate">Followed by Alex</span>
              </div>
            </div>
            <Button size="sm" variant="secondary" className="h-8 rounded-full px-4 text-xs font-semibold shrink-0">
              Follow
            </Button>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarImage src="https://i.pravatar.cc/150?u=liam" />
                <AvatarFallback>L</AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold truncate">Liam Wright</span>
                <span className="text-xs text-muted-foreground truncate">Suggested for you</span>
              </div>
            </div>
            <Button size="sm" variant="secondary" className="h-8 rounded-full px-4 text-xs font-semibold shrink-0">
              Follow
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}

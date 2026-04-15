"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSearchUsers } from "@/hooks/use-users";

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Handle clicking outside to close Dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data, isLoading } = useSearchUsers(debouncedQuery);
  const results = data?.data ?? [];

  const handleSelect = (username: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/profile/${username}`);
  };

  return (
    <div className="relative w-full max-w-[300px] md:max-w-[400px]" ref={searchRef}>
      {/* Input */}
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Tìm kiếm bè bạn..."
          className="h-10 w-full rounded-full bg-muted/60 pl-10 pr-4 text-sm outline-none transition-colors focus:bg-muted/80 placeholder:text-muted-foreground"
        />
        {isLoading && query.length >= 2 && (
          <Loader2 className="absolute right-3 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && debouncedQuery.length >= 2 && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-full rounded-2xl border border-border bg-card p-2 shadow-xl">
          {isLoading && results.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Đang tìm kiếm...
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Không tìm thấy ai có tên "{debouncedQuery}"
            </div>
          ) : (
            <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto scrollbar-thin">
              {results.map((u: any) => (
                <div
                  key={u.id}
                  onClick={() => handleSelect(u.username)}
                  className="flex cursor-pointer items-center gap-3 rounded-xl p-2 hover:bg-muted transition-colors"
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={u.profile?.avatarMediaId ?? undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {(u.profile?.displayName || u.username)[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="truncate text-sm font-semibold text-foreground">
                      {u.profile?.displayName || u.username}
                    </span>
                    <span className="truncate text-[13px] text-muted-foreground">
                      @{u.username}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

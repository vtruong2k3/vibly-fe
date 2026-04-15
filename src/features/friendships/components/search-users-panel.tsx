"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, UserPlus, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/empty-state";
import {
  searchUsersSchema,
  type SearchUsersFormValues,
} from "@/features/friendships/schemas/search-users.schema";
import type { User } from "@/types";

// ─── UserSearchResult Component ───────────────────────────────────
// UI Component: renders a single search result row
function UserSearchResult({
  user,
  onAddFriend,
  isPending,
}: {
  user: User;
  onAddFriend: (userId: string) => void;
  isPending: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
      <Avatar className="h-11 w-11 shrink-0">
        <AvatarImage src={user.avatarUrl ?? undefined} alt={user.displayName} />
        <AvatarFallback className="font-semibold text-sm">
          {user.displayName.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground truncate">
          {user.displayName}
        </p>
        <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
      </div>

      <Button
        size="sm"
        variant="outline"
        className="shrink-0 rounded-lg gap-1.5 h-8"
        onClick={() => onAddFriend(user.id)}
        disabled={isPending}
        aria-label={`Add ${user.displayName} as friend`}
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <UserPlus className="h-3.5 w-3.5" />
        )}
        Add
      </Button>
    </div>
  );
}

// ─── SearchUsersPanel Component ───────────────────────────────────
// Feature Component: search form + results list + friend request action
export function SearchUsersPanel() {
  const [results, setResults] = useState<User[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();

  const form = useForm<SearchUsersFormValues>({
    resolver: zodResolver(searchUsersSchema),
    defaultValues: { q: "" },
  });

  const onSearch = async (values: SearchUsersFormValues) => {
    setIsSearching(true);
    setHasSearched(true);
    // TODO: Replace with actual API call GET /users/search?q=&limit=20
    await new Promise((resolve) => setTimeout(resolve, 800));
    console.log("[SearchUsers Mock]", values);
    setResults([]); // Will be populated from API response
    setIsSearching(false);
  };

  const onClear = () => {
    form.reset();
    setResults([]);
    setHasSearched(false);
  };

  const onAddFriend = (userId: string) => {
    startTransition(async () => {
      setPendingIds((prev) => new Set(prev).add(userId));
      // TODO: Replace with actual API call POST /friends/request
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("[AddFriend Mock]", userId);
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
      // Optionally remove from results after request sent
      setResults((prev) => prev.filter((u) => u.id !== userId));
    });
  };

  const currentQuery = form.watch("q");

  return (
    <div className="space-y-4">
      {/* ── Search Input ── */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSearch)}>
          <FormField
            control={form.control}
            name="q"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder="Search by name or username..."
                      autoComplete="off"
                      className="pl-10 pr-20 h-11 rounded-xl"
                      {...field}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {currentQuery && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={onClear}
                          aria-label="Clear search"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        type="submit"
                        size="sm"
                        className="h-7 rounded-lg px-3 text-xs font-semibold"
                        disabled={isSearching}
                      >
                        {isSearching ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          "Search"
                        )}
                      </Button>
                    </div>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>

      {/* ── Results ── */}
      {isSearching && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl animate-pulse"
            >
              <div className="h-11 w-11 rounded-full bg-muted shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-28 bg-muted rounded" />
                <div className="h-3 w-20 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isSearching && hasSearched && results.length === 0 && (
        <EmptyState
          icon={
            <Search
              className="h-6 w-6"
              aria-hidden="true"
            />
          }
          headline="No users found"
          description={`No results for "${currentQuery || "your query"}". Try a different name or username.`}
        />
      )}

      {!isSearching && results.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground px-1 mb-2">
            {results.length} result{results.length !== 1 ? "s" : ""}
          </p>
          {results.map((user) => (
            <UserSearchResult
              key={user.id}
              user={user}
              onAddFriend={onAddFriend}
              isPending={pendingIds.has(user.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

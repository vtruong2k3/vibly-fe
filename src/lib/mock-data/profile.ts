import { MOCK_CURRENT_USER, MOCK_USERS, MOCK_POSTS } from "./feed";
import type { User, Post } from "@/types";

export interface UserProfile extends User {
  followersCount: number;
  followingCount: number;
  location: string | null;
  coverUrl: string | null;
}

export const MOCK_PROFILE: UserProfile = {
  ...MOCK_CURRENT_USER,
  followersCount: 1420,
  followingCount: 384,
  location: "San Francisco, CA",
  coverUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&q=80", 
  // Abstract gradient cover
};

export const MOCK_RIVERS_PROFILE: UserProfile = {
  ...MOCK_USERS[0], // arivers
  followersCount: 5200,
  followingCount: 120,
  location: "Seattle, WA",
  coverUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&q=80",
};

// Return MOCK_POSTS filtered by author to simulate profile post tab
export const getMockPostsForUser = (userId: string): Post[] => {
  return MOCK_POSTS.filter((post) => post.author.id === userId);
};

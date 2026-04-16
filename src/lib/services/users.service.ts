import apiClient from "@/lib/api/axios";
import { ENDPOINTS } from "@/lib/api/constants";
import type { CursorPaginationParams } from "./posts.service";

// ─── DTOs ─────────────────────────────────────────────────────────────────────
export interface UpdateUserDto {
  username?: string;
}

export interface UpdateProfileDto {
  displayName?: string;
  bio?: string;
  birthday?: string;
  gender?: string;
  hometown?: string;
  currentCity?: string;
  website?: string;
  education?: string;
  maritalStatus?: string;
  avatarMediaId?: string;
  coverMediaId?: string;
}

// ─── Users Service ────────────────────────────────────────────────────────────
export const usersService = {
  getMe: () =>
    apiClient.get(ENDPOINTS.users.me).then((r) => {
      const u = r.data.data;

      const buildUrl = (media?: { bucket: string; objectKey: string }) => {
        if (!media) return null;
        const baseUrl = process.env.NEXT_PUBLIC_CDN_URL || `https://${media.bucket}.s3.ap-southeast-1.amazonaws.com`;
        return `${baseUrl}/${media.objectKey}`;
      };

      return {
        id: u.id,
        email: u.email,
        username: u.username,
        displayName: u.profile?.displayName ?? u.username,
        avatarUrl: buildUrl(u.profile?.avatarMedia) ?? u.profile?.avatarMediaId ?? null,
        role: u.role
      };
    }),

  updateMe: (dto: UpdateUserDto) =>
    apiClient.patch(ENDPOINTS.users.updateMe, dto).then((r) => r.data),

  updateProfile: (dto: UpdateProfileDto) =>
    apiClient.patch(ENDPOINTS.users.updateProfile, dto).then((r) => r.data),

  getSessions: () =>
    apiClient.get(ENDPOINTS.users.sessions).then((r) => r.data),

  searchUsers: (params: { q?: string } & CursorPaginationParams) =>
    apiClient.get(ENDPOINTS.users.search, { params }).then((r) => r.data),

  getUserById: (id: string) =>
    apiClient.get(ENDPOINTS.users.byId(id)).then((r) => {
      const u = r.data.data !== undefined ? r.data.data : r.data;

      const buildUrl = (media?: { bucket: string; objectKey: string }) => {
        if (!media) return null;
        const baseUrl = process.env.NEXT_PUBLIC_CDN_URL || `https://${media.bucket}.s3.ap-southeast-1.amazonaws.com`;
        return `${baseUrl}/${media.objectKey}`;
      };

      return {
        id: u.id,
        username: u.username,
        displayName: u.profile?.displayName || u.username,
        avatarUrl: buildUrl(u.profile?.avatarMedia) || u.profile?.avatarMediaId || null,
        coverUrl: buildUrl(u.profile?.coverMedia) || u.profile?.coverMediaId || null,
        bio: u.profile?.bio || "",
        followersCount: 0,
        followingCount: 0,
        location: u.profile?.currentCity || null,
        education: u.profile?.education || null,
        maritalStatus: u.profile?.maritalStatus || null,
        hometown: u.profile?.hometown || null,
        website: u.profile?.website || null,
        birthday: u.profile?.birthday || null,
        gender: u.profile?.gender || null,
        createdAt: u.createdAt,
      };
    }),

  getUserPosts: (id: string, params: CursorPaginationParams) =>
    apiClient.get(ENDPOINTS.users.posts(id), { params }).then((r) => r.data),
};

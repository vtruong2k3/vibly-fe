import { z } from "zod";

export const accountSchema = z.object({
  username: z.string().min(3).max(30),
  displayName: z.string().min(2).max(50),
  email: z.string().email(),
  bio: z.string().max(160).optional(),
  location: z.string().max(50).optional(),
});
export type AccountValues = z.infer<typeof accountSchema>;

export const privacySchema = z.object({
  profileVisibility: z.enum(["public", "friends", "private"]),
  showActivityStatus: z.boolean(),
  allowTagging: z.boolean(),
  searchVisibility: z.boolean(),
});
export type PrivacyValues = z.infer<typeof privacySchema>;

export const notificationsSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  friendRequests: z.boolean(),
  mentions: z.boolean(),
  directMessages: z.boolean(),
  marketingEmails: z.boolean(),
});
export type NotificationsValues = z.infer<typeof notificationsSchema>;

export const securitySchema = z.object({
  twoFactorEnabled: z.boolean(),
});
export type SecurityValues = z.infer<typeof securitySchema>;

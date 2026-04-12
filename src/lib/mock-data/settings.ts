import { MOCK_CURRENT_USER } from "./feed";

// ─── Settings Mock Data ───────────────────────────────────────────
// These represent the standard default values for our settings forms
// when the user hasn't explicitly set anything else, or the data loaded 
// from the server on initial render.

export const MOCK_SETTINGS_ACCOUNT = {
  username: MOCK_CURRENT_USER.username,
  displayName: MOCK_CURRENT_USER.displayName,
  email: "user@example.com", // Hidden on User profile but needed in Settings
  bio: MOCK_CURRENT_USER.bio ?? "",
  location: "San Francisco, CA",
};

export const MOCK_SETTINGS_PRIVACY = {
  profileVisibility: "public" as const,
  showActivityStatus: true,
  allowTagging: true,
  searchVisibility: true,
};

export const MOCK_SETTINGS_NOTIFICATIONS = {
  emailNotifications: true,
  pushNotifications: true,
  friendRequests: true,
  mentions: true,
  directMessages: true,
  marketingEmails: false,
};

export const MOCK_SETTINGS_SECURITY = {
  twoFactorEnabled: false,
  activeSessions: 2,
};

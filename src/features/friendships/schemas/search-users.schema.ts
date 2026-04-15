import { z } from "zod";

export const searchUsersSchema = z.object({
  q: z
    .string()
    .min(1, "Search term is required")
    .max(100, "Search term is too long"),
});

export type SearchUsersFormValues = z.infer<typeof searchUsersSchema>;

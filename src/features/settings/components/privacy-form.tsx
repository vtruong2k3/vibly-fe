"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  privacySchema,
  type PrivacyValues,
} from "@/features/settings/schemas/settings.schema";
import { useSettings, useUpdatePrivacySettings } from "@/hooks/use-settings";
import { useEffect } from "react";

export function PrivacyForm() {
  const { data: settings } = useSettings();
  const { mutate: updatePrivacy, isPending } = useUpdatePrivacySettings();

  const form = useForm<PrivacyValues>({
    resolver: zodResolver(privacySchema),
    defaultValues: { profileVisibility: "friends", showActivityStatus: true, allowTagging: true },
  });

  useEffect(() => {
    if (settings?.privacy) {
      form.reset({
        profileVisibility: settings.privacy.profileVisibility?.toLowerCase() ?? "friends",
        showActivityStatus: settings.privacy.showOnlineStatus ?? true,
        allowTagging: true,
      });
    }
  }, [settings, form]);

  const onSubmit = (data: PrivacyValues) => {
    updatePrivacy({
      profileVisibility: (data.profileVisibility?.toUpperCase() as "EVERYONE" | "FRIENDS" | "ONLY_ME") ?? "FRIENDS",
      showOnlineStatus: data.showActivityStatus,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h3 className="text-lg font-heading font-medium text-foreground">
            Privacy Settings
          </h3>
          <p className="text-sm text-muted-foreground">
            Control who can see your content and interact with you.
          </p>
        </div>
        
        <div className="h-px bg-border w-full" />

        <div className="space-y-6">
          <FormField
            control={form.control}
            name="profileVisibility"
            render={({ field }) => (
              <FormItem className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-border p-4">
                <div className="space-y-1 z-10 w-full sm:w-auto">
                  <FormLabel className="text-base">Profile Visibility</FormLabel>
                  <FormDescription>
                    Determine who can view your profile and timeline posts.
                  </FormDescription>
                </div>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-[180px] bg-card">
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="friends">Friends Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="showActivityStatus"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-1">
                  <FormLabel className="text-base">Activity Status</FormLabel>
                  <FormDescription>
                    Let your friends see when you are active on Vibly.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="allowTagging"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-1">
                  <FormLabel className="text-base">Allow Tagging</FormLabel>
                  <FormDescription>
                    Allow others to tag you in posts and media.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="rounded-xl px-8" disabled={!form.formState.isDirty || isPending}>
          {isPending ? "Saving…" : "Save privacy settings"}
        </Button>
      </form>
    </Form>
  );
}

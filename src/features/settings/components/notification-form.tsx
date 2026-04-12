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
  notificationsSchema,
  type NotificationsValues,
} from "@/features/settings/schemas/settings.schema";
import { MOCK_SETTINGS_NOTIFICATIONS } from "@/lib/mock-data/settings";

export function NotificationForm() {
  const form = useForm<NotificationsValues>({
    resolver: zodResolver(notificationsSchema),
    defaultValues: MOCK_SETTINGS_NOTIFICATIONS,
  });

  const onSubmit = (data: NotificationsValues) => {
    console.log("[NotificationForm] Submit:", data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h3 className="text-lg font-heading font-medium text-foreground">
            Notification Preferences
          </h3>
          <p className="text-sm text-muted-foreground">
            Configure how you want to be notified of activity on Vibly.
          </p>
        </div>
        
        <div className="h-px bg-border w-full" />

        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            In-App & Push
          </h4>
          
          <FormField
            control={form.control}
            name="friendRequests"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between p-1">
                <FormLabel className="font-normal text-foreground">Friend requests</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mentions"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between p-1">
                <FormLabel className="font-normal text-foreground">Mentions</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="directMessages"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between p-1">
                <FormLabel className="font-normal text-foreground">Direct messages</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="h-px bg-border w-full my-6" />

        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Email Delivery
          </h4>
          
          <FormField
            control={form.control}
            name="emailNotifications"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between p-1">
                <div>
                  <FormLabel className="font-medium text-foreground">Activity digest emails</FormLabel>
                  <FormDescription className="text-xs">Receive daily summaries.</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="marketingEmails"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between p-1">
                <div>
                  <FormLabel className="font-medium text-foreground">Marketing & Offers</FormLabel>
                  <FormDescription className="text-xs">Promotions and Vibly news.</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="rounded-xl px-8" disabled={!form.formState.isDirty}>
          Update notifications
        </Button>
      </form>
    </Form>
  );
}

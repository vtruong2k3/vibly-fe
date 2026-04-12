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
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  accountSchema,
  type AccountValues,
} from "@/features/settings/schemas/settings.schema";
import { MOCK_SETTINGS_ACCOUNT } from "@/lib/mock-data/settings";

export function AccountForm() {
  const form = useForm<AccountValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: MOCK_SETTINGS_ACCOUNT,
  });

  const onSubmit = (data: AccountValues) => {
    console.log("[AccountForm] Submit:", data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h3 className="text-lg font-heading font-medium text-foreground">
            Account Profile
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage your personal information and how others see you on Vibly.
          </p>
        </div>
        
        <div className="h-px bg-border w-full" />

        <div className="space-y-5">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input {...field} className="max-w-md" />
                </FormControl>
                <FormDescription>
                  This is your public display name. It can be changed once every 30 days.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl>
                  <Input {...field} className="max-w-md" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" {...field} className="max-w-md" />
                </FormControl>
                <FormDescription>
                  We won&apos;t share this with anyone else.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="rounded-xl px-8" disabled={!form.formState.isDirty}>
          Save changes
        </Button>
      </form>
    </Form>
  );
}

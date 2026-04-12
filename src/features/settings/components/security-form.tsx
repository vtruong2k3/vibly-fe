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
  securitySchema,
  type SecurityValues,
} from "@/features/settings/schemas/settings.schema";
import { MOCK_SETTINGS_SECURITY } from "@/lib/mock-data/settings";
import { Shield } from "lucide-react";

export function SecurityForm() {
  const form = useForm<SecurityValues>({
    resolver: zodResolver(securitySchema),
    defaultValues: MOCK_SETTINGS_SECURITY,
  });

  const onSubmit = (data: SecurityValues) => {
    console.log("[SecurityForm] Submit:", data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h3 className="text-lg font-heading font-medium text-foreground flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Security & Access
          </h3>
          <p className="text-sm text-muted-foreground">
            Keep your account secure with extra layers of protection.
          </p>
        </div>
        
        <div className="h-px bg-border w-full" />

        <div className="space-y-6">
          <FormField
            control={form.control}
            name="twoFactorEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4 bg-muted/20">
                <div className="space-y-1">
                  <FormLabel className="text-base font-semibold text-foreground">
                    Two-Factor Authentication (2FA)
                  </FormLabel>
                  <FormDescription>
                    Requires a secondary code when logging in from a new device.
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

          <div className="rounded-lg border border-border p-4">
            <h4 className="text-sm font-semibold mb-1">Active Sessions</h4>
            <p className="text-sm text-muted-foreground mb-4">
              You currently have {MOCK_SETTINGS_SECURITY.activeSessions} active sessions.
            </p>
            <Button variant="outline" type="button" className="text-destructive border-border hover:bg-destructive/10 hover:text-destructive text-xs h-8">
              Log out all other devices
            </Button>
          </div>
          
          <div className="rounded-lg border border-border p-4 border-destructive/20 bg-destructive/5">
            <h4 className="text-sm font-semibold text-destructive mb-1">Danger Zone</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Permanently delete your account and all associated data.
            </p>
            <Button variant="destructive" type="button" className="text-xs h-8">
              Delete Account
            </Button>
          </div>
        </div>

        <Button type="submit" className="rounded-xl px-8" disabled={!form.formState.isDirty}>
          Save security settings
        </Button>
      </form>
    </Form>
  );
}

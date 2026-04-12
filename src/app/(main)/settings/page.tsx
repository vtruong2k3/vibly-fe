import type { Metadata } from "next";
import { SettingsSidebar } from "@/features/settings/components/settings-sidebar";
import { AccountForm } from "@/features/settings/components/account-form";
import { PrivacyForm } from "@/features/settings/components/privacy-form";
import { NotificationForm } from "@/features/settings/components/notification-form";
import { SecurityForm } from "@/features/settings/components/security-form";

export const metadata: Metadata = {
  title: "Settings | Vibly",
  description: "Manage your account settings and preferences.",
};

type SettingsPageProps = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const resolvedParams = await searchParams;
  const tab = resolvedParams.tab || "account";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ── Page Header ── */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and set e-mail preferences.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* ── Sidebar ── */}
        <aside className="lg:w-1/4 shrink-0">
          <SettingsSidebar />
        </aside>

        {/* ── Main Panel ── */}
        <div className="flex-1 max-w-3xl min-h-[500px]">
          <div className="vibly-card p-6 sm:p-8 w-full">
            {tab === "account" && <AccountForm />}
            {tab === "privacy" && <PrivacyForm />}
            {tab === "notifications" && <NotificationForm />}
            {tab === "security" && <SecurityForm />}
          </div>
        </div>
      </div>
    </div>
  );
}

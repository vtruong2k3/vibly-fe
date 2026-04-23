import AdminSettingsContent from "@/features/admin/components/admin-settings-content";
import React from "react";


export const metadata = {
    title: "Settings - Vibly Admin",
    description: "Manage your platform configuration, security policies, and team access.",
};

export default function AdminSettingsPage() {
    return (
        <React.Suspense
            fallback={
                <div className="flex-1 flex items-center justify-center bg-slate-50 text-slate-400">
                    Loading settings...
                </div>
            }
        >
            <AdminSettingsContent />
        </React.Suspense>
    );
}

import AdminUsersContent from "@/features/admin/components/admin-users-content";
import React from "react";

export const metadata = {
    title: "User Management - Vibly Admin",
    description: "Manage Vibly users, roles, and moderation statuses.",
};

export default function AdminUsersPage() {
    return (
        <React.Suspense
            fallback={
                <div className="flex-1 flex items-center justify-center bg-slate-50 text-slate-400">
                    Loading users...
                </div>
            }
        >
            <AdminUsersContent />
        </React.Suspense>
    );
}

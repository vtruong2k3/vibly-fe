import AdminCommunitiesContent from "@/features/admin/components/admin-communities-content";
import React from "react";

export const metadata = {
    title: "Communities Management - Vibly Admin",
    description: "Manage, monitor, and create top-level groups across the network.",
};

export default function AdminCommunitiesPage() {
    return (
        <React.Suspense
            fallback={
                <div className="flex-1 flex items-center justify-center bg-slate-50 text-slate-400">
                    Loading communities...
                </div>
            }
        >
            <AdminCommunitiesContent />
        </React.Suspense>
    );
}

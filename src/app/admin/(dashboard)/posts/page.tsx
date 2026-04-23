import AdminPostsContent from "@/features/admin/components/admin-posts-content";
import React from "react";

export const metadata = {
    title: "Post Management - Vibly Admin",
    description: "Monitor and manage Vibly network content.",
};

export default function AdminPostsPage() {
    return (
        <React.Suspense
            fallback={
                <div className="flex-1 flex items-center justify-center bg-slate-50 text-slate-400">
                    Loading posts...
                </div>
            }
        >
            <AdminPostsContent />
        </React.Suspense>
    );
}

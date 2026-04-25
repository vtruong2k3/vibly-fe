import AdminKycContent from "@/features/admin/components/admin-kyc-content";
import React from "react";

export const metadata = {
    title: "KYC Verification - Vibly Admin",
    description: "Review and manage identity verification requests.",
};

export default function AdminKycPage() {
    return (
        <React.Suspense
            fallback={
                <div className="flex-1 flex items-center justify-center bg-slate-50 text-slate-400">
                    Loading KYC requests...
                </div>
            }
        >
            <AdminKycContent />
        </React.Suspense>
    );
}

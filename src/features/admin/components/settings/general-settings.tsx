"use client";

import React, { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Save, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { ADMIN_QUERY_KEYS } from "@/lib/api/admin-constants";
import { AdminSettingsService } from "@/lib/services/admin-settings.service";
import type { SystemSetting } from "@/types/admin.types";

// Map of settings key → form field
const SETTINGS_KEYS = {
    siteTitle: "site.title",
    supportEmail: "site.support_email",
    maintenanceMode: "platform.maintenance_mode",
    inviteOnly: "platform.invite_only",
    maxPostLength: "content.max_post_length",
    allowAnonymous: "content.allow_anonymous",
} as const;

type FormValues = {
    siteTitle: string;
    supportEmail: string;
    maintenanceMode: boolean;
    inviteOnly: boolean;
    maxPostLength: string;
    allowAnonymous: boolean;
};

// Parse raw settings array into typed form values
function parseSettings(settings: SystemSetting[]): Partial<FormValues> {
    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    return {
        siteTitle: map[SETTINGS_KEYS.siteTitle] ?? "",
        supportEmail: map[SETTINGS_KEYS.supportEmail] ?? "",
        maintenanceMode: map[SETTINGS_KEYS.maintenanceMode] === "true",
        inviteOnly: map[SETTINGS_KEYS.inviteOnly] === "true",
        maxPostLength: map[SETTINGS_KEYS.maxPostLength] ?? "2000",
        allowAnonymous: map[SETTINGS_KEYS.allowAnonymous] !== "false",
    };
}

// Convert form values back into settings array for PATCH
function toSettingsArray(values: FormValues) {
    return [
        { key: SETTINGS_KEYS.siteTitle, value: values.siteTitle, type: "STRING" },
        { key: SETTINGS_KEYS.supportEmail, value: values.supportEmail, type: "STRING" },
        { key: SETTINGS_KEYS.maintenanceMode, value: String(values.maintenanceMode), type: "BOOLEAN" },
        { key: SETTINGS_KEYS.inviteOnly, value: String(values.inviteOnly), type: "BOOLEAN" },
        { key: SETTINGS_KEYS.maxPostLength, value: values.maxPostLength, type: "NUMBER" },
        { key: SETTINGS_KEYS.allowAnonymous, value: String(values.allowAnonymous), type: "BOOLEAN" },
    ];
}

export function GeneralSettings() {
    const queryClient = useQueryClient();

    const { data: settings, isLoading } = useQuery({
        queryKey: ADMIN_QUERY_KEYS.settings,
        queryFn: AdminSettingsService.getSettings,
        staleTime: 60_000,
    });

    const mutation = useMutation({
        mutationFn: (values: FormValues) =>
            AdminSettingsService.updateSettings(toSettingsArray(values)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.settings }),
    });

    const { register, handleSubmit, reset, formState: { isDirty } } = useForm<FormValues>({
        defaultValues: {
            siteTitle: "",
            supportEmail: "",
            maintenanceMode: false,
            inviteOnly: false,
            maxPostLength: "2000",
            allowAnonymous: true,
        },
    });

    // Populate form once settings load
    useEffect(() => {
        if (settings) reset(parseSettings(settings) as FormValues);
    }, [settings, reset]);

    const onSubmit = (data: FormValues) => mutation.mutate(data);

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i}>
                        <div className="h-3 w-28 bg-slate-100 rounded mb-2" />
                        <div className="h-10 w-full bg-slate-100 rounded-xl" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">General</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Basic platform configuration</p>
                </div>
                <button
                    type="submit"
                    disabled={!isDirty || mutation.isPending}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {mutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                    {mutation.isPending ? "Saving..." : "Save Changes"}
                </button>
            </div>

            {/* Success / Error banners */}
            {mutation.isSuccess && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm font-semibold">
                    <CheckCircle size={15} /> Settings saved successfully.
                </div>
            )}
            {mutation.isError && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm font-semibold">
                    <AlertCircle size={15} /> Failed to save settings. Please try again.
                </div>
            )}

            <hr className="border-slate-100" />

            {/* Site Identity */}
            <section className="space-y-5">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Site Identity</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-600">Site Title</label>
                        <input
                            {...register("siteTitle")}
                            type="text"
                            placeholder="e.g. Vibly Network"
                            className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-600">Support Email</label>
                        <input
                            {...register("supportEmail")}
                            type="email"
                            placeholder="support@vibly.com"
                            className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
                        />
                    </div>
                </div>
            </section>

            <hr className="border-slate-100" />

            {/* Platform Controls */}
            <section className="space-y-5">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Platform Controls</h3>

                <div className="space-y-4">
                    <ToggleSetting
                        label="Maintenance Mode"
                        description="Temporarily disable access to the platform for all users except admins."
                        registerProps={register("maintenanceMode")}
                        danger
                    />
                    <ToggleSetting
                        label="Invite-Only Mode"
                        description="Restrict registration to invited users only."
                        registerProps={register("inviteOnly")}
                    />
                    <ToggleSetting
                        label="Allow Anonymous Browsing"
                        description="Let non-registered users view public content."
                        registerProps={register("allowAnonymous")}
                    />
                </div>
            </section>

            <hr className="border-slate-100" />

            {/* Content Rules */}
            <section className="space-y-5">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Content Rules</h3>

                <div className="space-y-1.5 max-w-xs">
                    <label className="text-sm font-semibold text-slate-600">Max Post Length (characters)</label>
                    <input
                        {...register("maxPostLength")}
                        type="number"
                        min={100}
                        max={10000}
                        step={100}
                        className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
                    />
                    <p className="text-xs text-slate-400">Recommended: 2000 characters</p>
                </div>
            </section>
        </form>
    );
}

// Reusable toggle row
function ToggleSetting({
    label,
    description,
    registerProps,
    danger,
}: {
    label: string;
    description: string;
    registerProps: ReturnType<ReturnType<typeof useForm<FormValues>>["register"]>;
    danger?: boolean;
}) {
    return (
        <label className="flex items-start justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:bg-slate-100/60 transition-colors">
            <div>
                <p className={`text-sm font-semibold ${danger ? "text-rose-700" : "text-slate-900"}`}>{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{description}</p>
            </div>
            <input
                type="checkbox"
                {...registerProps}
                className="mt-1 w-5 h-5 accent-indigo-600 shrink-0 cursor-pointer"
            />
        </label>
    );
}

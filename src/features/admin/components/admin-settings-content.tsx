"use client";

import React, { useState } from "react";
import { Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { GeneralSettings } from "./settings/general-settings";
import { ModerationKeywordsSettings } from "./settings/moderation-keywords-settings";
import { cn } from "@/lib/utils";

type SettingTab = {
    id: string;
    label: string;
};

const SETTING_TABS: SettingTab[] = [
    { id: "general", label: "General" },
    { id: "moderation", label: "Moderation Keywords" },
    { id: "security", label: "Security" },
    { id: "notifications", label: "Notifications" },
    { id: "roles", label: "Roles & Permissions" },
    { id: "api", label: "API Configuration" },
];

export default function AdminSettingsContent() {
    const [activeSettingTab, setActiveSettingTab] = useState("general");

    return (
        <div className="p-4 lg:p-8 max-w-[1200px] mx-auto min-h-[calc(100vh-80px)] font-body-base">
            <header className="space-y-2 mb-8">
                <motion.h1
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-3xl font-black text-slate-900 tracking-tight"
                >
                    Settings
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-slate-500 font-medium"
                >
                    Manage your platform configuration, security policies, and team access.
                </motion.p>
            </header>

            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Inner Sidebar Navigation */}
                <nav className="w-full md:w-56 flex md:flex-col gap-1 shrink-0 overflow-x-auto md:overflow-visible pb-2 md:pb-0 no-scrollbar">
                    {SETTING_TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSettingTab(tab.id)}
                            className={cn(
                                "text-left px-4 py-3 md:py-2.5 text-sm rounded-xl transition-all duration-200 whitespace-nowrap md:whitespace-normal",
                                activeSettingTab === tab.id
                                    ? "bg-indigo-50 text-indigo-700 font-bold"
                                    : "text-slate-500 font-semibold hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>

                {/* Settings Form Panel */}
                <div className="flex-1 w-full bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
                    <AnimatePresence mode="wait">
                        {activeSettingTab === "general" ? (
                            <motion.div
                                key="general"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <GeneralSettings />
                            </motion.div>
                        ) : activeSettingTab === "moderation" ? (
                            <motion.div
                                key="moderation"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ModerationKeywordsSettings />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="other"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col items-center justify-center py-20 text-center"
                            >
                                <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 mb-4 ring-1 ring-slate-100 shadow-sm">
                                    <Settings size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                                    {SETTING_TABS.find((t) => t.id === activeSettingTab)?.label}
                                </h3>
                                <p className="text-sm font-medium text-slate-500 mt-2 max-w-xs">
                                    This section is under construction. Please check back later.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

"use client";

import React from "react";
import { Plus, Filter, Terminal, Palette, Activity, Zap, Code, Coffee } from "lucide-react";
import { motion } from "framer-motion";
import { CommunityCard, CommunityCardProps } from "./communities/community-card";

const MOCK_COMMUNITIES: CommunityCardProps[] = [
    {
        name: "Frontend Wizards",
        category: "Technology",
        members: "45.2K",
        healthScore: 98,
        activityLevel: "Very High" as const,
        icon: Terminal,
        iconColor: "text-indigo-600",
        mods: [
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=64&h=64",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=64&h=64",
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=64&h=64",
        ],
    },
    {
        name: "Digital Artists Hub",
        category: "Art & Design",
        members: "12.8K",
        healthScore: 85,
        activityLevel: "Medium" as const,
        icon: Palette,
        iconColor: "text-indigo-500",
        mods: [
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=64&h=64",
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=64&h=64",
        ],
    },
    {
        name: "Weekend Runners",
        category: "Sports",
        members: "8.4K",
        healthScore: 92,
        activityLevel: "High" as const,
        icon: Activity,
        iconColor: "text-orange-500",
        mods: [
            "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=64&h=64",
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=64&h=64",
            "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&q=80&w=64&h=64",
            "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=64&h=64",
        ],
    },
    {
        name: "Swift Developers",
        category: "Technology",
        members: "22.1K",
        healthScore: 95,
        activityLevel: "High" as const,
        icon: Zap,
        iconColor: "text-blue-500",
        mods: [
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=64&h=64",
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=64&h=64",
        ],
    },
    {
        name: "Pythonistas",
        category: "Technology",
        members: "31.5K",
        healthScore: 88,
        activityLevel: "Medium" as const,
        icon: Code,
        iconColor: "text-emerald-600",
        mods: [
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=64&h=64",
        ],
    },
    {
        name: "Coffee Snobs",
        category: "Gaming",
        members: "15.2K",
        healthScore: 91,
        activityLevel: "Very High" as const,
        icon: Coffee,
        iconColor: "text-amber-700",
        mods: [
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=64&h=64",
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=64&h=64",
        ],
    },
];

const CATEGORIES = ["All Categories", "Technology", "Sports", "Art & Design", "Gaming"];

export default function AdminCommunitiesContent() {
    return (
        <div className="p-4 lg:p-8 max-w-[1400px] mx-auto min-h-[calc(100vh-80px)] font-body-base">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl font-black text-slate-900 tracking-tight mb-2"
                    >
                        Communities
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-base text-slate-500 font-medium"
                    >
                        Manage, monitor, and create top-level groups across the network.
                    </motion.p>
                </div>
                <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all active:scale-95"
                >
                    <Plus size={20} strokeWidth={3} />
                    Create New Community
                </motion.button>
            </header>

            {/* Filters Area */}
            <div className="bg-white border border-slate-200 rounded-3xl p-4 mb-10 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
                    {CATEGORIES.map((cat, index) => (
                        <button
                            key={cat}
                            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${index === 0
                                    ? "bg-slate-900 text-white shadow-md shadow-slate-200"
                                    : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-[320px]">
                    <Filter
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        size={18}
                    />
                    <input
                        type="text"
                        placeholder="Filter by name or tag..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-400"
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {MOCK_COMMUNITIES.map((community, index) => (
                    <motion.div
                        key={community.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <CommunityCard {...community} />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

"use client";

import React from "react";
import { Download, Plus, BarChart3, Gavel, Flag } from "lucide-react";
import { motion } from "framer-motion";

import { StatsCard } from "./posts/post-stats";
import { PostsTable } from "./posts/posts-table";

export default function AdminPostsContent() {
    return (
        <div className="p-4 lg:p-8 overflow-y-auto w-full max-w-[1400px] mx-auto min-h-[calc(100vh-80px)] font-body-base">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
                        Posts Management
                    </h2>
                    <p className="text-sm text-slate-500 font-medium">
                        Monitor and moderate network content in real-time.
                    </p>
                </motion.div>

                <div className="flex flex-wrap gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold transition-all border border-slate-200 shadow-sm active:scale-95">
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 active:scale-95">
                        <Plus className="w-4 h-4" />
                        Create Post
                    </button>
                </div>
            </div>

            {/* Stats Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatsCard
                    label="Total Posts (24h)"
                    value="12,482"
                    trend="14%"
                    icon={BarChart3}
                    iconColor="text-indigo-600"
                />
                <StatsCard
                    label="Pending Review"
                    value="341"
                    unitLabel="posts"
                    icon={Gavel}
                    iconColor="text-orange-600"
                />
                <StatsCard
                    label="Flagged Content"
                    value="89"
                    trend="2%"
                    icon={Flag}
                    iconColor="text-rose-600"
                />
            </div>

            {/* Table Container */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <PostsTable />
            </motion.div>
        </div>
    );
}

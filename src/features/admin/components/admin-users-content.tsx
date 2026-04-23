"use client";

import React, { useState } from "react";
import { Filter, UserPlus, CheckSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { UsersTable } from "./users/users-table";
import { HealthScoreGauge, TopContributors } from "./users/user-metrics";


export default function AdminUsersContent() {
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);


    const toggleUser = (id: string) => {
        setSelectedUsers((prev) =>
            prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
        );
    };

    const selectAll = (allIds: string[]) => {
        setSelectedUsers(allIds);
    };

    const clearSelection = () => {
        setSelectedUsers([]);
    };

    return (
        <div className="p-4 lg:p-8 overflow-y-auto w-full max-w-[1400px] mx-auto min-h-[calc(100vh-80px)]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <motion.h2
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-2xl font-bold text-slate-900 tracking-tight"
                >
                    User Management
                </motion.h2>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all shadow-sm active:scale-95">
                        <Filter className="w-4 h-4 text-slate-500" />
                        Filter
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-xl text-sm font-semibold text-white hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 active:scale-95">
                        <UserPlus className="w-4 h-4" />
                        Add User
                    </button>
                </div>
            </div>

            {/* Bulk Action Bar */}
            <AnimatePresence>
                {selectedUsers.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.98 }}
                        className="mb-8 p-4 bg-indigo-600 rounded-2xl flex flex-wrap items-center justify-between shadow-lg shadow-indigo-100 border border-indigo-500 gap-4"
                    >
                        <div className="flex items-center gap-4 text-white pl-2">
                            <CheckSquare className="w-5 h-5 fill-white/20" />
                            <span className="text-sm font-semibold">
                                {selectedUsers.length} users selected
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                            <button className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold text-indigo-50 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                                Message Selected
                            </button>
                            <button className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-all shadow-md shadow-rose-900/10">
                                Suspend Selected
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                {/* Table Area */}
                <div className="col-span-1 md:col-span-12 xl:col-span-9 flex flex-col gap-8">
                    <UsersTable
                        selectedUsers={selectedUsers}
                        onToggleUser={toggleUser}
                        onSelectAll={selectAll}
                        onClearSelection={clearSelection}
                    />
                </div>

                {/* Sidebar Widgets */}
                <aside className="col-span-1 md:col-span-12 xl:col-span-3 flex flex-col sm:flex-row xl:flex-col gap-8">
                    <div className="flex-1">
                        <HealthScoreGauge score={85} />
                    </div>
                    <div className="flex-1">
                        <TopContributors />
                    </div>
                </aside>
            </div>
        </div>
    );
}

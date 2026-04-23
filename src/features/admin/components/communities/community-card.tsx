"use client";

import { MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

export interface CommunityCardProps {
    name: string;
    category: string;
    members: string;
    healthScore: number;
    activityLevel: "Very High" | "High" | "Medium" | "Low";
    icon: LucideIcon;
    iconColor: string;
    mods: string[];
}

export function CommunityCard({
    name,
    category,
    members,
    healthScore,
    activityLevel,
    icon: Icon,
    iconColor,
    mods,
}: CommunityCardProps) {
    const getHealthText = (score: number) => {
        if (score >= 90)
            return {
                text: "Excellent",
                color: "text-emerald-600",
                bg: "bg-emerald-50",
            };
        if (score >= 80)
            return { text: "Good", color: "text-amber-600", bg: "bg-amber-50" };
        return { text: "Fair", color: "text-rose-600", bg: "bg-rose-50" };
    };

    const health = getHealthText(healthScore);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all relative group overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                    <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-slate-50`}
                    >
                        <Icon className={`${iconColor}`} size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 leading-tight line-clamp-1">
                            {name}
                        </h3>
                        <span className="text-sm font-medium text-slate-400">
                            {category}
                        </span>
                    </div>
                </div>
                <button className="text-slate-400 hover:text-slate-900 transition-colors p-1 active:scale-90">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50/50 rounded-xl p-4 border border-slate-100 mb-6">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Members
                    </span>
                    <span className="text-xl font-bold text-slate-900">
                        {members}
                    </span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Health Score
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-slate-900">
                            {healthScore}
                        </span>
                        <span
                            className={`text-[10px] font-bold ${health.color} ${health.bg} px-1.5 py-0.5 rounded shadow-sm`}
                        >
                            {health.text}
                        </span>
                    </div>
                </div>
                <div className="col-span-2 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Activity Level
                    </span>
                    <div className="flex items-center gap-2">
                        <div
                            className={`w-2 h-2 rounded-full ${activityLevel === "Very High" ||
                                    activityLevel === "High"
                                    ? "bg-indigo-600 animate-pulse"
                                    : "bg-slate-400"
                                }`}
                        />
                        <span
                            className={`text-sm font-semibold ${activityLevel === "Very High" ||
                                    activityLevel === "High"
                                    ? "text-indigo-600"
                                    : "text-slate-500"
                                }`}
                        >
                            {activityLevel}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between pt-2">
                <div className="flex items-center">
                    <span className="text-[10px] font-bold text-slate-400 mr-3 uppercase tracking-wider">
                        Mods
                    </span>
                    <div className="flex -space-x-2">
                        {mods.map((mod, i) => (
                            <img
                                key={i}
                                src={mod}
                                alt={`Mod ${i}`}
                                className="w-7 h-7 rounded-full border-2 border-white shadow-sm object-cover"
                            />
                        ))}
                        {mods.length > 3 && (
                            <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                +{mods.length - 3}
                            </div>
                        )}
                    </div>
                </div>
                <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-widest">
                    Manage
                </button>
            </div>
        </motion.div>
    );
}

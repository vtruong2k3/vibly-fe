import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
    label: string;
    value: string;
    trend?: string;
    unitLabel?: string;
    icon: LucideIcon;
    iconColor: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
    label,
    value,
    trend,
    unitLabel,
    icon: Icon,
    iconColor,
}) => {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-500">{label}</h3>
                <div
                    className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        iconColor.includes("indigo") && "bg-indigo-50 text-indigo-600",
                        iconColor.includes("red") && "bg-rose-50 text-rose-600",
                        iconColor.includes("emerald") && "bg-emerald-50 text-emerald-600",
                        iconColor.includes("orange") && "bg-orange-50 text-orange-600"
                    )}
                >
                    <Icon className="w-5 h-5" />
                </div>
            </div>

            <div className="flex items-end gap-3 mt-auto">
                <span className="text-4xl font-black text-slate-900 leading-none">
                    {value}
                </span>
                {trend && (
                    <span className="text-sm font-bold text-emerald-600 flex items-center gap-1 mb-1">
                        +{trend}
                    </span>
                )}
                {unitLabel && (
                    <span className="text-sm font-semibold text-slate-400 mb-1">
                        {unitLabel}
                    </span>
                )}
            </div>
        </div>
    );
};

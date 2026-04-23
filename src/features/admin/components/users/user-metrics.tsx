import React from "react";
import { Info, MoreVertical } from "lucide-react";

export const HealthScoreGauge = ({ score }: { score: number }) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                    Community Health Score
                </h3>
                <Info className="w-4 h-4 text-slate-300 cursor-help hover:text-slate-500" />
            </div>

            <div className="flex flex-col items-center py-4">
                <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="64"
                            cy="64"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-slate-100"
                        />
                        <circle
                            cx="64"
                            cy="64"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-indigo-600"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                        <span className="text-3xl font-bold text-slate-900">{score}</span>
                        <span className="text-xs font-semibold text-indigo-600">Good</span>
                    </div>
                </div>
                <p className="text-sm text-slate-500 mt-6 text-center leading-relaxed">
                    Toxicity levels down <span className="font-bold text-emerald-600">12%</span>{" "}
                    this week. Network stability is optimal.
                </p>
            </div>
        </div>
    );
};

const CONTRIBUTORS = [
    {
        name: "Alex Thornton",
        pts: "1.2k",
        avatar:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    },
    {
        name: "Jessica Lee",
        pts: "980",
        avatar:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    },
    { name: "Tom Kwon", pts: "845", initials: "TK" },
];

export const TopContributors = () => {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                    Top Contributors
                </h3>
                <MoreVertical className="w-4 h-4 text-slate-300 cursor-pointer" />
            </div>

            <div className="flex flex-col gap-5 mt-2">
                {CONTRIBUTORS.map((c, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {c.avatar ? (
                                <img
                                    src={c.avatar}
                                    alt={c.name}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">
                                    {c.initials}
                                </div>
                            )}
                            <span className="text-sm font-medium text-slate-700">{c.name}</span>
                        </div>
                        <span className="text-xs font-bold text-indigo-600">{c.pts} pts</span>
                    </div>
                ))}
            </div>

            <button className="mt-4 w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 transition-all active:scale-[0.98]">
                View Leaderboard
            </button>
        </div>
    );
};

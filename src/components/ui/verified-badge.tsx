"use client";

import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
    /** Size preset */
    size?: "sm" | "md" | "lg";
    /** Extra class names */
    className?: string;
    /** Tooltip label shown on hover */
    label?: string;
}

const sizeMap = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
};

/**
 * Blue verified tick badge — drop-in next to any username.
 * Uses an SVG checkmark to avoid any external dependency.
 */
export function VerifiedBadge({
    size = "md",
    className,
    label = "Verified account",
}: VerifiedBadgeProps) {
    return (
        <span
            role="img"
            aria-label={label}
            title={label}
            className={cn(
                "inline-flex items-center justify-center shrink-0 rounded-full",
                "bg-sky-500 text-white shadow-sm",
                sizeMap[size],
                className,
            )}
        >
            {/* SVG checkmark */}
            <svg
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-[60%] h-[60%]"
                aria-hidden="true"
            >
                <polyline points="2,6.5 5,9.5 10,3.5" />
            </svg>
        </span>
    );
}

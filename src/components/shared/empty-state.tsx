import * as React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode;
  headline: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  headline,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 lg:p-12 2xl:p-16 h-full min-h-[300px]",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted text-muted-foreground mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold font-heading text-foreground mb-2">
        {headline}
      </h3>
      <p className="text-[15px] text-muted-foreground max-w-sm mb-6">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}

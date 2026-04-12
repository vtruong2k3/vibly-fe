import { cn } from "@/lib/utils";
import React from "react";

interface ListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  active?: boolean;
  clickable?: boolean;
  action?: React.ReactNode;
}

export function ListItem({
  children,
  active,
  clickable = true,
  className,
  action,
  ...props
}: ListItemProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-2xl transition-colors mx-[-8px]",
        clickable && "cursor-pointer hover:bg-muted/50",
        active && "bg-muted/60",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {children}
      </div>
      {action && (
        <div className="shrink-0 flex items-center ml-4">
          {action}
        </div>
      )}
    </div>
  );
}

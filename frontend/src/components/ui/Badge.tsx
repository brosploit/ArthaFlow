import React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "emerald" | "cyan" | "amber" | "rose" | "indigo" | "neutral";
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "neutral",
  dot = false,
  children,
  ...props
}) => {
  const variants = {
    emerald: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    cyan: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    amber: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    rose: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    indigo: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    neutral: "bg-slate-800 text-slate-300 border-slate-700",
  };

  const dots = {
    emerald: "bg-emerald-400",
    cyan: "bg-cyan-400",
    amber: "bg-amber-400",
    rose: "bg-rose-400",
    indigo: "bg-indigo-400",
    neutral: "bg-slate-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border tracking-wide",
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", dots[variant])} />}
      {children}
    </span>
  );
};

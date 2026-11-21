import React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "emerald";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, disabled, children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.98]";

    const variants = {
      primary: "bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold shadow-sm hover:shadow-glow-emerald",
      emerald: "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30",
      secondary: "bg-surface-elevated hover:bg-surface-hover text-slate-200 border border-surface-border shadow-sm",
      outline: "bg-transparent border border-surface-border hover:border-slate-500 text-slate-300 hover:text-white",
      ghost: "bg-transparent hover:bg-surface-elevated text-slate-300 hover:text-white",
      danger: "bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-9 px-4 text-sm gap-2",
      lg: "h-11 px-5 text-base gap-2.5",
      icon: "h-9 w-9 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

/**
 * Input Component
 *
 * Styled input with label, error state, and optional icon.
 * Works as both controlled and uncontrolled.
 */

"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm",
              "placeholder:text-muted-foreground",
              "transition-colors duration-200",
              "hover:border-border-hover",
              "focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent",
              icon && "pl-10",
              error && "border-red-400 focus:ring-red-200 focus:border-red-400",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;

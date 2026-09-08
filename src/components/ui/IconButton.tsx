"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "default" | "ghost" | "danger";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantStyles: Record<Variant, string> = {
  default:
    "bg-[#f7f7fa] text-[#0e525b]/70 shadow-sm hover:bg-white hover:text-[#0e525b] hover:shadow-md active:scale-95",
  ghost:
    "bg-transparent text-[#0e525b]/50 hover:bg-[#0e525b]/5 hover:text-[#0e525b] active:scale-95",
  danger:
    "bg-transparent text-red-400 hover:bg-red-50 hover:text-red-500 active:scale-95",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = "default", className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-xl p-2 transition-all duration-150 select-none ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";

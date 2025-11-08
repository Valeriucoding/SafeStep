"use client";

import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordVisibilityToggleProps {
  className?: string;
  isVisible: boolean;
  onToggle: () => void;
}

export function PasswordVisibilityToggle({
  className,
  isVisible,
  onToggle,
}: PasswordVisibilityToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-md p-2 text-muted-foreground transition-all duration-150 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "active:scale-95 sm:hover:bg-muted/40",
        className,
      )}
      aria-label={isVisible ? "Hide password" : "Show password"}
    >
      {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
}


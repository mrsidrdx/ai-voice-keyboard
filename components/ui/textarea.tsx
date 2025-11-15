import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-[var(--radius-md)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-sm text-[hsl(var(--text))]",
          "transition-all duration-300",
          "placeholder:text-[hsl(var(--text-muted))]/50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-500))]/30 focus-visible:border-[hsl(var(--brand-500))] focus-visible:shadow-lg focus-visible:shadow-[hsl(var(--brand-500))]/10",
          "hover:border-[hsl(var(--border))]/80 hover:shadow-sm",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "backdrop-blur-sm resize-none",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };


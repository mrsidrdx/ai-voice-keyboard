import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[var(--radius-md)] text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-500))]/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-[hsl(var(--brand-500))] to-[hsl(var(--brand-400))] text-white hover:from-[hsl(var(--brand-400))] hover:to-[hsl(var(--brand-500))] shadow-md hover:shadow-lg",
        destructive:
          "bg-[hsl(var(--danger))] text-white hover:bg-[hsl(var(--danger))]/90 shadow-md hover:shadow-lg",
        outline:
          "border border-[hsl(var(--border))] bg-transparent hover:bg-[hsl(var(--muted))] text-[hsl(var(--text))]",
        secondary:
          "bg-[hsl(var(--muted))] text-[hsl(var(--text))] hover:bg-[hsl(var(--cloud))]",
        ghost: "hover:bg-[hsl(var(--muted))] text-[hsl(var(--text))]",
        link: "text-[hsl(var(--brand-500))] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-[var(--radius-md)] px-3 text-xs",
        lg: "h-12 rounded-[var(--radius-md)] px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };


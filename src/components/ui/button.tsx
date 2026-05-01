import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-55",
        variant === "primary" &&
          "bg-primary text-primary-foreground shadow-soft hover:brightness-95",
        variant === "secondary" &&
          "border border-border bg-white text-foreground hover:bg-muted",
        variant === "danger" &&
          "bg-red-600 text-white shadow-soft hover:bg-red-700",
        variant === "ghost" && "text-muted-foreground hover:bg-muted",
        className
      )}
      {...props}
    />
  );
}

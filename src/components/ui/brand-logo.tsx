import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandLogo({
  compact = false,
  className
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={compact ? "/logo-agenda-leve-icon.svg" : "/logo-agenda-leve.svg"}
      alt="Agenda Leve"
      width={compact ? 40 : 168}
      height={compact ? 40 : 48}
      priority
      className={cn("h-auto w-auto", compact ? "max-h-10" : "max-h-12", className)}
    />
  );
}

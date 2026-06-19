"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { Button } from "./button";

export function ShareLinkButton({
  url,
  label = "Compartilhar Link",
  className
}: {
  url: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Button
      type="button"
      onClick={handleCopy}
      className={className}
      variant="primary"
    >
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      {copied ? "Copiado" : label}
    </Button>
  );
}

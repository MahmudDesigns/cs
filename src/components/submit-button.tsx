"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

const VARIANTS = {
  moss: "btn-moss",
  ink: "btn-ink",
  ghost: "btn-ghost",
} as const;

export function SubmitButton({
  children,
  pendingLabel,
  variant = "moss",
  className = "",
  disabled = false,
}: {
  children: ReactNode;
  pendingLabel?: string;
  variant?: keyof typeof VARIANTS;
  className?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={`btn ${VARIANTS[variant]} ${className}`}
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {pending ? (pendingLabel ?? children) : children}
    </button>
  );
}

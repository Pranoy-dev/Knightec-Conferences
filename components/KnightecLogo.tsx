"use client";

import { cn } from "@/lib/utils";

interface KnightecLogoProps {
  className?: string;
}

/**
 * Knightec Logo Component
 * Uses the actual Knightec logo from the public folder
 */
export function KnightecLogo({ className }: KnightecLogoProps) {
  return (
    <img
      src="/knightec-logo.png"
      alt="Knightec Logo"
      className={cn("h-10 w-auto object-contain", className)}
    />
  );
}

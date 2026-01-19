"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingDisplayProps {
  value: number | null | undefined;
  showNumeric?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function RatingDisplay({
  value,
  showNumeric = false,
  size = "md",
  className,
}: RatingDisplayProps) {
  if (value === null || value === undefined) {
    return (
      <span className={cn("text-muted-foreground text-sm", className)}>
        N/A
      </span>
    );
  }

  const fullStars = Math.floor(value);
  const hasHalfStar = value % 1 >= 0.5;

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((rating) => {
        if (rating <= fullStars) {
          return (
            <Star
              key={rating}
              className={cn(
                "fill-[#FFA600] text-[#FFA600]",
                sizeClasses[size]
              )}
            />
          );
        } else if (rating === fullStars + 1 && hasHalfStar) {
          return (
            <Star
              key={rating}
              className={cn(
                "fill-[#FFA600]/50 text-[#FFA600]",
                sizeClasses[size]
              )}
            />
          );
        } else {
          return (
            <Star
              key={rating}
              className={cn(
                "fill-none text-muted-foreground",
                sizeClasses[size]
              )}
            />
          );
        }
      })}
      {showNumeric && (
        <span className="ml-1 text-sm text-muted-foreground">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}

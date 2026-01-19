"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingInputProps {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  disabled?: boolean;
  className?: string;
}

export function RatingInput({
  value,
  onChange,
  disabled = false,
  className,
}: RatingInputProps) {
  const [hoveredRating, setHoveredRating] = React.useState<number | null>(null);

  const handleClick = (rating: number) => {
    if (disabled) return;
    // If clicking the same rating, clear it
    if (value === rating) {
      onChange(null);
    } else {
      onChange(rating);
    }
  };

  const displayRating = hoveredRating ?? value ?? 0;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => handleClick(rating)}
          onMouseEnter={() => !disabled && setHoveredRating(rating)}
          onMouseLeave={() => setHoveredRating(null)}
          disabled={disabled}
          className={cn(
            "transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded",
            disabled && "cursor-not-allowed opacity-50"
          )}
          aria-label={`Rate ${rating} out of 5`}
          aria-pressed={value === rating}
        >
          <Star
            className={cn(
              "h-5 w-5 transition-colors",
              rating <= displayRating
                ? "fill-[#FFA600] text-[#FFA600]"
                : "fill-none text-muted-foreground"
            )}
          />
        </button>
      ))}
    </div>
  );
}

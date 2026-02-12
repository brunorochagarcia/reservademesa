"use client";

import { User, Accessibility, Armchair, Clapperboard } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Seat as SeatType } from "@/lib/data";

interface SeatProps {
  seat: SeatType;
  onSeatClick: (id: string) => void;
  labelPosition?: 'top' | 'bottom';
}

export function Seat({ seat, onSeatClick, labelPosition = 'top' }: SeatProps) {
  const { id, status } = seat;

  const handleClick = () => {
    if (status !== "unavailable") {
      onSeatClick(id);
    }
  };

  const Icon = () => {
    switch (id) {
      case '3E':
        return <User className="h-6 w-6" />;
      case '4A':
      case '4B':
      case '4C':
        return <Accessibility className="h-6 w-6" />;
      case '5A':
      case '5B':
      case '5C':
      case '5D':
        return <Armchair className="h-6 w-6" />;
      default:
        return <Clapperboard className="h-6 w-6" />;
    }
  };

  return (
    <div className={cn(
      "flex flex-col items-center gap-1",
      labelPosition === 'bottom' && "flex-col-reverse"
    )}>
      <span className="text-xs font-medium text-muted-foreground">{id}</span>
      <button
        type="button"
        aria-label={`Seat ${id}, Status: ${status}`}
        onClick={handleClick}
        disabled={status === 'unavailable'}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg border-2 p-1 transition-all duration-200 ease-in-out transform focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          {
            "border-accent/50 bg-transparent text-accent/80 hover:border-accent hover:bg-accent/10 hover:text-accent cursor-pointer": status === "available",
            "border-accent bg-accent text-accent-foreground cursor-pointer shadow-lg shadow-accent/30": status === "selected",
            "border-muted-foreground/20 bg-muted/50 text-muted-foreground/30 cursor-not-allowed": status === "unavailable",
          }
        )}
      >
        <Icon />
      </button>
    </div>
  );
}

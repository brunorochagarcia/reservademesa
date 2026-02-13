"use client";

import { User, Accessibility, Armchair, Clapperboard, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Seat as SeatType } from "@/lib/data";

interface SeatProps {
  seat: SeatType;
  labelPosition?: 'top' | 'bottom';
  onSeatClick: (seat: SeatType) => void;
}

export function Seat({ seat, labelPosition = 'top', onSeatClick }: SeatProps) {
  const { id, status } = seat;

  const Icon = () => {
    switch (id) {
      case '2F':
        return <Clapperboard className="h-6 w-6" />;
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
        return <Monitor className="h-6 w-6" />;
    }
  };
  
  const isClickable = status !== 'unavailable';

  return (
    <div className={cn(
      "flex flex-col items-center gap-1",
      labelPosition === 'bottom' && "flex-col-reverse"
    )}>
      <span className="text-xs font-medium text-muted-foreground">{id}</span>
      <div
        onClick={() => isClickable && onSeatClick(seat)}
        aria-label={`Seat ${id}, Status: ${status}`}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg border-2 p-1 transition-all duration-200 ease-in-out transform",
          {
            "border-accent/50 bg-transparent text-accent/80 hover:border-accent hover:bg-accent/10": status === "available",
            "border-accent bg-accent text-accent-foreground shadow-lg shadow-accent/30": status === "selected",
            "border-muted-foreground/20 bg-muted/50 text-muted-foreground/30": status === "unavailable",
            "cursor-pointer": isClickable,
            "cursor-not-allowed": !isClickable,
          }
        )}
      >
        <Icon />
      </div>
    </div>
  );
}

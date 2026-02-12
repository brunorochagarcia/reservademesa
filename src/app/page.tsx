"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { initialSeats } from "@/lib/data";
import type { Seat as SeatType } from "@/lib/data";
import { SeatLayout } from "@/components/seat-layout";
import { MinimalCalendar } from "@/components/minimal-calendar";

export default function Home() {
  const [seats] = useState<SeatType[]>(initialSeats);

  return (
    <div className="flex items-center justify-center min-h-screen w-full p-4">
      <main>
        <Card className="shadow-lg">
          <CardContent className="p-4 flex flex-col md:flex-row gap-8 items-center">
            <div className="bg-muted/30 rounded-lg">
              <MinimalCalendar />
            </div>
            <div className="bg-muted/30 rounded-lg p-2">
              <SeatLayout seats={seats} />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { initialSeats } from "@/lib/data";
import type { Seat as SeatType } from "@/lib/data";
import { SeatLayout } from "@/components/seat-layout";

export default function Home() {
  const [seats] = useState<SeatType[]>(initialSeats);
  const today = new Date();

  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-full p-4 gap-8">
      <header className="text-center">
        <h1 className="text-5xl font-bold tracking-tight text-primary">Seatly</h1>
        <p className="text-lg text-muted-foreground mt-2">{format(today, "EEEE, MMMM do")}</p>
      </header>
      <main>
        <Card className="shadow-lg">
          <CardContent className="p-4 flex justify-center">
            <div className="bg-muted/30 rounded-lg p-2">
              <SeatLayout seats={seats} />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

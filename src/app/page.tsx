"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { initialSeats } from "@/lib/data";
import type { Seat as SeatType } from "@/lib/data";
import { SeatLayout } from "@/components/seat-layout";

export default function Home() {
  const [seats] = useState<SeatType[]>(initialSeats);

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-3xl shadow-lg animate-in fade-in-50 duration-500">
        <CardContent className="p-6">
          <div className="bg-muted/30 rounded-lg p-2 sm:p-4">
            <SeatLayout seats={seats} />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

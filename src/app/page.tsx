"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { initialSeats } from "@/lib/data";
import type { Seat as SeatType } from "@/lib/data";
import { SeatLayout } from "@/components/seat-layout";
import { Calendar } from "@/components/ui/calendar";

export default function Home() {
  const [seats] = useState<SeatType[]>(initialSeats);
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen w-full gap-8 p-4 sm:p-6 md:p-8">
      <aside>
        <Card className="shadow-lg">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md"
          />
        </Card>
      </aside>
      <main className="flex-1 flex items-center justify-center w-full">
        <Card className="w-full max-w-3xl shadow-lg">
          <CardContent className="p-6">
            <div className="bg-muted/30 rounded-lg p-2 sm:p-4">
              <SeatLayout seats={seats} />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

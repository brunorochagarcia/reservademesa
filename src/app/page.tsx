"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { initialSeats } from "@/lib/data";
import type { Seat as SeatType } from "@/lib/data";
import { SeatLayout } from "@/components/seat-layout";
import { Calendar } from "@/components/ui/calendar";

export default function Home() {
  const [seats] = useState<SeatType[]>(initialSeats);
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="flex items-center justify-center min-h-screen w-full p-4">
      <main>
        <Card className="shadow-lg">
          <CardContent className="flex flex-col md:flex-row items-center gap-4 p-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              formatters={{
                formatCaption: (date) => format(date, "MMMM"),
              }}
            />
            <div className="bg-muted/30 rounded-lg p-2">
              <SeatLayout seats={seats} />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

"use client";

import { useState } from "react";
import { format, addDays, isWeekend } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { initialSeats } from "@/lib/data";
import type { Seat as SeatType } from "@/lib/data";
import { SeatLayout } from "@/components/seat-layout";
import { MinimalCalendar } from "@/components/minimal-calendar";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [seats, setSeats] = useState<SeatType[]>(initialSeats);
  const [selectedSeat, setSelectedSeat] = useState<SeatType | null>(null);
  const [reservationDate, setReservationDate] = useState<Date | undefined>();
  const { toast } = useToast();
  const today = new Date();

  const handleSeatClick = (seatToSelect: SeatType) => {
    if (seatToSelect.status === "unavailable") {
      return;
    }

    if (selectedSeat && selectedSeat.id === seatToSelect.id) {
      setSelectedSeat(null);
      setReservationDate(undefined);
      setSeats(
        seats.map((s) =>
          s.id === seatToSelect.id ? { ...s, status: "available" } : s
        )
      );
    } else {
      setSelectedSeat(seatToSelect);
      setReservationDate(undefined);
      setSeats(
        seats.map((s) => {
          if (s.id === seatToSelect.id) return { ...s, status: "selected" };
          if (s.status === "selected") return { ...s, status: "available" };
          return s;
        })
      );
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setReservationDate(date);
    }
  };

  const handleConfirmReservation = () => {
    if (!selectedSeat || !reservationDate) {
      toast({
        variant: "destructive",
        title: "Incomplete Reservation",
        description: "Please select a seat and a date.",
      });
      return;
    }

    setSeats(
      seats.map((seat) =>
        seat.id === selectedSeat.id
          ? { ...seat, status: "unavailable", reservationDate }
          : seat
      )
    );

    toast({
      title: "Reservation Confirmed!",
      description: `Seat ${selectedSeat.id} reserved for ${format(
        reservationDate,
        "PPP"
      )}.`,
    });

    setSelectedSeat(null);
    setReservationDate(undefined);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-full p-4 gap-8">
      <header className="text-center">
        <h1 className="text-5xl font-bold tracking-tight text-primary">Seatly</h1>
        <p className="text-lg text-muted-foreground mt-2">
          {format(today, "EEEE, MMMM do")}
        </p>
      </header>
      <main className="flex flex-row items-start gap-8">
        <Card className="shadow-lg">
          <CardContent className="p-4 flex justify-center">
            <div className="bg-muted/30 rounded-lg p-2">
              <SeatLayout seats={seats} onSeatClick={handleSeatClick} />
            </div>
          </CardContent>
        </Card>

        {selectedSeat && (
          <div className="w-80">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-center text-2xl">
                  Reserve Seat {selectedSeat.id}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MinimalCalendar
                  mode="single"
                  selected={reservationDate}
                  onSelect={handleDateSelect}
                  fromDate={today}
                  toDate={addDays(today, 7)}
                  disabled={isWeekend}
                />
                <Button
                  className="w-full mt-4"
                  onClick={handleConfirmReservation}
                  disabled={!reservationDate}
                >
                  Confirm Reservation
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

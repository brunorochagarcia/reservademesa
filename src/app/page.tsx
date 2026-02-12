"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { initialSeats } from "@/lib/data";
import type { Seat as SeatType } from "@/lib/data";
import { SeatLayout } from "@/components/seat-layout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";

const SEAT_PRICE = 25;

export default function Home() {
  const [seats, setSeats] = useState<SeatType[]>(initialSeats);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);

  const handleSeatClick = (id: string) => {
    setSeats(prevSeats =>
      prevSeats.map(seat => {
        if (seat.id === id) {
          if (seat.status === "available") {
            return { ...seat, status: "selected" };
          } else if (seat.status === "selected") {
            return { ...seat, status: "available" };
          }
        }
        return seat;
      })
    );
    setConfirmationMessage(null);
  };

  const selectedSeats = useMemo(() => seats.filter(s => s.status === 'selected'), [seats]);
  const totalCost = selectedSeats.length * SEAT_PRICE;

  const handleReservation = () => {
    if (selectedSeats.length === 0) return;

    setSeats(prevSeats =>
      prevSeats.map(seat =>
        seat.status === "selected" ? { ...seat, status: "unavailable" } : seat
      )
    );
    setConfirmationMessage(`You have successfully reserved ${selectedSeats.length} seat(s): ${selectedSeats.map(s => s.id).join(', ')}.`);
  };

  const Legend = () => (
    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground mt-4 border-t pt-4">
      <div className="flex items-center gap-2">
        <div className="h-5 w-5 rounded-md border-2 border-accent/50 bg-transparent"></div>
        <span>Available</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-5 w-5 rounded-md border-2 border-accent bg-accent"></div>
        <span>Selected</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-5 w-5 rounded-md border-2 border-muted-foreground/20 bg-muted/50"></div>
        <span>Unavailable</span>
      </div>
    </div>
  );

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-3xl shadow-lg animate-in fade-in-50 duration-500">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-primary font-headline tracking-tight">Seatly</CardTitle>
          <CardDescription className="text-lg">Select your seats for the trip</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 rounded-lg p-2 sm:p-4">
            <SeatLayout seats={seats} onSeatClick={handleSeatClick} />
          </div>
          
          <Legend />
          
          {confirmationMessage && (
            <Alert className="mt-6 bg-primary/10 border-primary/20 animate-in fade-in-0 zoom-in-95">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <AlertTitle className="text-primary font-semibold">Reservation Confirmed!</AlertTitle>
              <AlertDescription className="text-primary/80">
                {confirmationMessage}
              </AlertDescription>
            </Alert>
          )}

        </CardContent>
        <CardFooter className="flex-col sm:flex-row gap-4 pt-6 bg-muted/50 dark:bg-muted/20 rounded-b-lg p-6">
          <div className="flex-1 text-center sm:text-left">
            <p className="text-lg font-semibold">{selectedSeats.length} {selectedSeats.length === 1 ? 'Seat' : 'Seats'} Selected</p>
            <p className="text-2xl font-bold text-primary">Total: ${totalCost.toFixed(2)}</p>
          </div>
          <Button 
            size="lg" 
            className="w-full sm:w-auto text-lg py-7"
            onClick={handleReservation}
            disabled={selectedSeats.length === 0}
          >
            Reserve Now
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}

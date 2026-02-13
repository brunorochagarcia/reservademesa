"use client";

import { useState, useMemo } from "react";
import { format, addDays, subDays, isWeekend, isSameDay, isAfter, isBefore, startOfDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { initialSeats } from "@/lib/data";
import type { Seat as SeatType } from "@/lib/data";
import { SeatLayout } from "@/components/seat-layout";
import { MinimalCalendar } from "@/components/minimal-calendar";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface Reservation {
  seatId: string;
  date: Date;
}

export default function Home() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<SeatType | null>(null);
  const [reservationDate, setReservationDate] = useState<Date | undefined>();
  const { toast } = useToast();
  
  const today = startOfDay(new Date());
  const [viewDate, setViewDate] = useState<Date>(today);


  const handleSeatClick = (seatToSelect: SeatType) => {
    if (seatToSelect.status === "unavailable") {
      return;
    }

    if (selectedSeat && selectedSeat.id === seatToSelect.id) {
      setSelectedSeat(null);
      setReservationDate(undefined);
    } else {
      setSelectedSeat(seatToSelect);
      setReservationDate(undefined);
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

    setReservations([
      ...reservations,
      { seatId: selectedSeat.id, date: reservationDate },
    ]);

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
  
  const seatsForDisplay = useMemo(() => {
    return initialSeats.map((seat) => {
      if (seat.status === "unavailable") {
        return seat;
      }

      const isReserved = reservations.some(
        (res) => res.seatId === seat.id && isSameDay(res.date, viewDate)
      );
      if (isReserved) {
        return { ...seat, status: "unavailable" };
      }

      if (selectedSeat?.id === seat.id) {
        return { ...seat, status: "selected" };
      }

      return { ...seat, status: "available" };
    });
  }, [reservations, viewDate, selectedSeat]);

  const handlePrevDay = () => {
    if (isSameDay(viewDate, today)) return;
    setViewDate((prev) => subDays(prev, 1));
  };

  const handleNextDay = () => {
    setViewDate((prev) => addDays(prev, 1));
  };


  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-full p-4 gap-8">
      <header className="text-center">
        <h1 className="text-5xl font-bold tracking-tight text-primary">Seatly</h1>
        <div className="flex items-center justify-center gap-2 mt-2">
            <Button variant="ghost" size="icon" onClick={handlePrevDay} disabled={isSameDay(viewDate, today)}>
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" className="text-lg text-muted-foreground p-1 h-auto font-normal">
                        {format(viewDate, "EEEE, MMMM do")}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={viewDate}
                        onSelect={(date) => {
                          if (date && !isBefore(date, today)) {
                            setViewDate(date);
                          }
                        }}
                        disabled={(date) => isBefore(date, today)}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
            <Button variant="ghost" size="icon" onClick={handleNextDay}>
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
      </header>
      <main className="flex flex-row items-start gap-8">
        <Card className="shadow-lg">
          <CardContent className="p-4 flex justify-center">
            <div className="bg-muted/30 rounded-lg p-2">
              <SeatLayout seats={seatsForDisplay} onSeatClick={handleSeatClick} />
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
                  toDate={addDays(today, 8)}
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

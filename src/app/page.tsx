"use client";

import { useState, useMemo, useEffect } from "react";
import { format, addDays, subDays, isWeekend, isSameDay, isAfter, isBefore, startOfDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { initialSeats } from "@/lib/data";
import type { Seat as SeatType } from "@/lib/data";
import { SeatLayout } from "@/components/seat-layout";
import { MinimalCalendar } from "@/components/minimal-calendar";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

interface Reservation {
  seatId: string;
  date: Date;
}

export default function Home() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState<SeatType | null>(null);
  const [reservationDate, setReservationDate] = useState<Date | undefined>();
  const { toast } = useToast();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const today = useMemo(() => startOfDay(new Date()), []);

  const firstAvailableDate = useMemo(() => {
    let date = today;
    while (isWeekend(date)) {
      date = addDays(date, 1);
    }
    return date;
  }, [today]);
  
  const [viewDate, setViewDate] = useState<Date>(firstAvailableDate);

  useEffect(() => {
    const fetchReservations = async () => {
      setIsLoading(true);
      try {
        const dateStr = format(viewDate, "yyyy-MM-dd");
        const q = query(
          collection(db, "reservations"),
          where("date", "==", dateStr)
        );
        const snapshot = await getDocs(q);
        const fetched: Reservation[] = snapshot.docs.map((doc) => ({
          seatId: doc.data().seatId,
          date: viewDate,
        }));
        setReservations(fetched);
      } catch (error) {
        console.error("Failed to fetch reservations:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load reservations. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservations();
  }, [viewDate, toast]);

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

  const handleConfirmReservation = async () => {
    if (!selectedSeat || !reservationDate) {
      toast({
        variant: "destructive",
        title: "Incomplete Reservation",
        description: "Please select a seat and a date.",
      });
      return;
    }

    try {
      const dateStr = format(reservationDate, "yyyy-MM-dd");

      await addDoc(collection(db, "reservations"), {
        seatId: selectedSeat.id,
        date: dateStr,
        createdAt: serverTimestamp(),
      });

      if (isSameDay(reservationDate, viewDate)) {
        setReservations((prev) => [
          ...prev,
          { seatId: selectedSeat.id, date: reservationDate },
        ]);
      }

      toast({
        title: "Reservation Confirmed!",
        description: `Seat ${selectedSeat.id} reserved for ${format(
          reservationDate,
          "PPP"
        )}.`,
      });

      setSelectedSeat(null);
      setReservationDate(undefined);
    } catch (error) {
      console.error("Failed to save reservation:", error);
      toast({
        variant: "destructive",
        title: "Reservation Failed",
        description: "Could not save your reservation. Please try again.",
      });
    }
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
    let newDate = subDays(viewDate, 1);
    while (isWeekend(newDate)) {
      newDate = subDays(newDate, 1);
    }
    if (!isBefore(newDate, firstAvailableDate)) {
      setViewDate(newDate);
    }
  };

  const handleNextDay = () => {
    let newDate = addDays(viewDate, 1);
    while (isWeekend(newDate)) {
      newDate = addDays(newDate, 1);
    }
    setViewDate(newDate);
  };


  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-full p-4 gap-8">
      <header className="text-center">
        <h1 className="text-5xl font-bold tracking-tight text-primary">Seatly</h1>
        <div className="flex items-center justify-center gap-2 mt-2">
            <Button variant="ghost" size="icon" onClick={handlePrevDay} disabled={isSameDay(viewDate, firstAvailableDate)}>
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
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
                          if (date) {
                            setViewDate(date);
                          }
                          setIsCalendarOpen(false);
                        }}
                        disabled={(date) => isBefore(date, today) || isWeekend(date)}
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
              {isLoading ? (
                <div className="flex items-center justify-center h-64 w-64">
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              ) : (
                <SeatLayout seats={seatsForDisplay} onSeatClick={handleSeatClick} />
              )}
            </div>
          </CardContent>
        </Card>

        {selectedSeat && (
          <div className="w-80">
            <Card className="shadow-lg">
              <CardHeader className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-6 w-6"
                  onClick={() => { setSelectedSeat(null); setReservationDate(undefined); }}
                >
                  <X className="h-4 w-4" />
                </Button>
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

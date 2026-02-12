"use client";

import { useState, useMemo } from "react";
import { format, startOfToday, addDays, isWeekend } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { initialSeats } from "@/lib/data";
import type { Seat as SeatType } from "@/lib/data";
import { SeatLayout } from "@/components/seat-layout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CheckCircle2, CalendarIcon } from "lucide-react";

export default function Home() {
  const [seats, setSeats] = useState<SeatType[]>(initialSeats);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [viewingDate, setViewingDate] = useState<Date>(startOfToday());
  const [isViewerCalendarOpen, setIsViewerCalendarOpen] = useState(false);

  const selectedSeat = useMemo(() => seats.find(s => s.status === 'selected'), [seats]);
  const reservedSeat = useMemo(() => seats.find(s => s.status === 'unavailable' && s.id !== '2F'), [seats]);

  const displayedSeats = useMemo(() => {
    return seats.map(s => {
      // If it's the reserved seat, and we're looking at a different day, show it as available.
      if (s.status === 'unavailable' && s.id !== '2F' && s.reservationDate && format(s.reservationDate, 'yyyy-MM-dd') !== format(viewingDate, 'yyyy-MM-dd')) {
        return { ...s, status: 'available' };
      }
      // If a seat was shown as available for display, but now we're back on its reservation date, show it as unavailable again.
      if (s.id === reservedSeat?.id && s.status !== 'unavailable' && reservedSeat?.reservationDate && format(reservedSeat.reservationDate, 'yyyy-MM-dd') === format(viewingDate, 'yyyy-MM-dd')) {
        return { ...s, status: 'unavailable' };
      }
      return s;
    });
  }, [seats, viewingDate, reservedSeat]);


  const handleSeatClick = (id: string) => {
    if (reservedSeat) return; // Cannot change selection if a seat is already reserved

    setSeats((currentSeats) => {
      const seatToClick = currentSeats.find((s) => s.id === id);
      if (!seatToClick || (seatToClick.status === 'unavailable' && seatToClick.id !== '2F')) {
          return currentSeats;
      }

      const isAlreadySelected = seatToClick.status === 'selected';
      setSelectedDate(undefined); // Reset date on any seat click action

      if (isAlreadySelected) {
          setIsCalendarOpen(false);
          return currentSeats.map((s) =>
              s.id === id ? { ...s, status: 'available' } : s
          );
      }
      
      setIsCalendarOpen(true);

      return currentSeats.map((s) => {
          if (s.id === id) {
              return { ...s, status: 'selected' };
          }
          if (s.status === 'selected') {
              return { ...s, status: 'available' };
          }
          return s;
      });
    });
  };

  const handleReservation = () => {
    if (!selectedSeat || !selectedDate) return;

    setSeats(prevSeats =>
      prevSeats.map(seat =>
        seat.id === selectedSeat.id
          ? { ...seat, status: "unavailable", reservationDate: selectedDate }
          : seat
      )
    );
    setSelectedDate(undefined);
    setIsCalendarOpen(false);
  };

  const handleCancelReservation = () => {
    if (!reservedSeat) return;

    setSeats(prevSeats =>
      prevSeats.map(seat =>
        seat.id === reservedSeat.id
          ? { ...seat, status: "available", reservationDate: undefined }
          : seat
      )
    );
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
  
  const today = startOfToday();
  const maxDate = addDays(today, 7);
  
  const isDayDisabled = (day: Date) => {
    return day < today || day > maxDate || isWeekend(day);
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-3xl shadow-lg animate-in fade-in-50 duration-500">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-primary font-headline tracking-tight">Seatly</CardTitle>
          <CardDescription className="text-lg">Select your seat for the trip</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col items-center gap-2">
            <p className="text-muted-foreground">Viewing reservations for:</p>
            <Popover open={isViewerCalendarOpen} onOpenChange={setIsViewerCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {viewingDate ? format(viewingDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={viewingDate}
                  onSelect={(date) => {
                    if (date) setViewingDate(date);
                    setIsViewerCalendarOpen(false);
                  }}
                  disabled={isDayDisabled}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="bg-muted/30 rounded-lg p-2 sm:p-4">
            <SeatLayout seats={displayedSeats} onSeatClick={handleSeatClick} />
          </div>
          
          <Legend />
          
          {reservedSeat && reservedSeat.reservationDate && (
            <Alert className="mt-6 bg-primary/10 border-primary/20 animate-in fade-in-0 zoom-in-95">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <AlertTitle className="text-primary font-semibold">Reservation Confirmed!</AlertTitle>
              <AlertDescription className="text-primary/80">
                You have successfully reserved seat {reservedSeat.id} for {format(reservedSeat.reservationDate, "PPP")}.
              </AlertDescription>
            </Alert>
          )}

        </CardContent>
        <CardFooter className="flex-col sm:flex-row justify-between items-center gap-4 pt-6 bg-muted/50 dark:bg-muted/20 rounded-b-lg p-6">
          <div className="flex-1 text-center sm:text-left">
             {reservedSeat ? (
              <p className="text-lg font-semibold">Seat {reservedSeat.id} Reserved</p>
            ) : selectedSeat ? (
              <p className="text-lg font-semibold">Seat {selectedSeat.id} Selected</p>
            ) : (
              <p className="text-lg font-semibold">Select a seat</p>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {selectedSeat && !reservedSeat && (
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setIsCalendarOpen(false);
                    }}
                    disabled={isDayDisabled}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}

            {reservedSeat ? (
              <Button
                size="lg"
                className="w-full text-lg py-7"
                onClick={handleCancelReservation}
                variant="destructive"
              >
                Cancel Reservation
              </Button>
            ) : (
              <Button
                size="lg"
                className="w-full text-lg py-7"
                onClick={handleReservation}
                disabled={!selectedSeat || !selectedDate}
              >
                Reserve Now
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}

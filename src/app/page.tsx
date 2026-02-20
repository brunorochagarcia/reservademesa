"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { format, addDays, subDays, isWeekend, isSameDay, isBefore, startOfDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { initialSeats } from "@/lib/data";
import type { Seat as SeatType } from "@/lib/data";
import { SeatLayout } from "@/components/seat-layout";
import { MinimalCalendar } from "@/components/minimal-calendar";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, X, Bookmark, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { getReservations, createReservation, updateReservation, cancelReservation } from "@/lib/actions";

interface Reservation {
  seatId: string;
  date: Date;
}

interface MyReservation {
  id: string;
  seatId: string;
  date: string; // YYYY-MM-DD
}

const MY_RESERVATIONS_KEY = "my-reservations";

export default function Home() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [myReservations, setMyReservations] = useState<MyReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState<SeatType | null>(null);
  const [reservationDate, setReservationDate] = useState<Date | undefined>();
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [pendingOpenSeatId, setPendingOpenSeatId] = useState<string | null>(null);
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

  // Load myReservations from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(MY_RESERVATIONS_KEY);
      if (stored) {
        setMyReservations(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveMyReservations = useCallback((updated: MyReservation[]) => {
    setMyReservations(updated);
    localStorage.setItem(MY_RESERVATIONS_KEY, JSON.stringify(updated));
  }, []);

  useEffect(() => {
    const fetchReservations = async () => {
      setIsLoading(true);
      try {
        const dateStr = format(viewDate, "yyyy-MM-dd");
        const rows = await getReservations(dateStr);
        const fetched: Reservation[] = rows.map((row) => ({
          seatId: row.seatId,
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

  const seatsForDisplay = useMemo(() => {
    const viewDateStr = format(viewDate, "yyyy-MM-dd");
    return initialSeats.map((seat) => {
      if (seat.status === "unavailable") {
        return seat;
      }

      const isReserved = reservations.some(
        (res) => res.seatId === seat.id && isSameDay(res.date, viewDate)
      );

      if (isReserved) {
        const isMine = myReservations.some(
          (r) => r.seatId === seat.id && r.date === viewDateStr
        );
        return { ...seat, status: isMine ? ("my-reserved" as const) : ("unavailable" as const) };
      }

      if (selectedSeat?.id === seat.id) {
        return { ...seat, status: "selected" as const };
      }

      return { ...seat, status: "available" as const };
    });
  }, [reservations, viewDate, selectedSeat, myReservations]);

  const myReservationsForViewDate = useMemo(() => {
    const viewDateStr = format(viewDate, "yyyy-MM-dd");
    return myReservations.filter((r) => r.date === viewDateStr);
  }, [myReservations, viewDate]);

  const closePanel = () => {
    setSelectedSeat(null);
    setReservationDate(undefined);
    setIsUpdateMode(false);
  };

  const handleSeatClick = (seatToSelect: SeatType) => {
    if (seatToSelect.status === "unavailable") return;

    if (selectedSeat && selectedSeat.id === seatToSelect.id) {
      closePanel();
    } else {
      setSelectedSeat(seatToSelect);
      setReservationDate(undefined);
      setIsUpdateMode(false);
    }
  };

  // CREATE
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
      const created = await createReservation(selectedSeat.id, dateStr);

      saveMyReservations([
        ...myReservations,
        { id: created.id, seatId: selectedSeat.id, date: dateStr },
      ]);

      if (isSameDay(reservationDate, viewDate)) {
        setReservations((prev) => [
          ...prev,
          { seatId: selectedSeat.id, date: reservationDate },
        ]);
      }

      toast({
        title: "Reservation Confirmed!",
        description: `Seat ${selectedSeat.id} reserved for ${format(reservationDate, "PPP")}.`,
      });

      closePanel();
    } catch (error) {
      console.error("Failed to save reservation:", error);
      toast({
        variant: "destructive",
        title: "Reservation Failed",
        description: "Could not save your reservation. Please try again.",
      });
    }
  };

  // UPDATE
  const handleUpdateReservation = async () => {
    if (!selectedSeat || !reservationDate) return;

    const currentDateStr = format(viewDate, "yyyy-MM-dd");
    const myRes = myReservations.find(
      (r) => r.seatId === selectedSeat.id && r.date === currentDateStr
    );
    if (!myRes) return;

    const newDateStr = format(reservationDate, "yyyy-MM-dd");

    try {
      await updateReservation(myRes.id, newDateStr);

      saveMyReservations(
        myReservations.map((r) => (r.id === myRes.id ? { ...r, date: newDateStr } : r))
      );

      // Remove from current view's reservations since it moved to a different date
      setReservations((prev) =>
        prev.filter((r) => !(r.seatId === selectedSeat.id && isSameDay(r.date, viewDate)))
      );

      toast({
        title: "Reservation Updated!",
        description: `Seat ${selectedSeat.id} rescheduled to ${format(reservationDate, "PPP")}.`,
      });

      closePanel();
    } catch (error) {
      console.error("Failed to update reservation:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update your reservation. Please try again.",
      });
    }
  };

  // DELETE
  const handleCancelReservation = async () => {
    if (!selectedSeat) return;

    const dateStr = format(viewDate, "yyyy-MM-dd");
    const myRes = myReservations.find(
      (r) => r.seatId === selectedSeat.id && r.date === dateStr
    );
    if (!myRes) return;

    try {
      await cancelReservation(myRes.id);

      saveMyReservations(myReservations.filter((r) => r.id !== myRes.id));
      setReservations((prev) =>
        prev.filter((r) => !(r.seatId === selectedSeat.id && isSameDay(r.date, viewDate)))
      );

      toast({
        title: "Reservation Cancelled",
        description: `Seat ${selectedSeat.id} reservation has been cancelled.`,
      });

      closePanel();
    } catch (error) {
      console.error("Failed to cancel reservation:", error);
      toast({
        variant: "destructive",
        title: "Cancellation Failed",
        description: "Could not cancel your reservation. Please try again.",
      });
    }
  };

  // After navigating to a reservation's date, auto-open the seat panel
  useEffect(() => {
    if (!isLoading && pendingOpenSeatId) {
      const seat = seatsForDisplay.find((s) => s.id === pendingOpenSeatId);
      if (seat) {
        setSelectedSeat(seat);
        setIsUpdateMode(false);
        setReservationDate(undefined);
      }
      setPendingOpenSeatId(null);
    }
  }, [isLoading, pendingOpenSeatId, seatsForDisplay]);

  const handlePrevDay = () => {
    let newDate = subDays(viewDate, 1);
    while (isWeekend(newDate)) newDate = subDays(newDate, 1);
    if (!isBefore(newDate, firstAvailableDate)) setViewDate(newDate);
  };

  const handleNextDay = () => {
    let newDate = addDays(viewDate, 1);
    while (isWeekend(newDate)) newDate = addDays(newDate, 1);
    setViewDate(newDate);
  };

  const isCancelMode = selectedSeat?.status === "my-reserved";

  const panelTitle = isCancelMode
    ? isUpdateMode
      ? `Change Date — Seat ${selectedSeat?.id}`
      : `Seat ${selectedSeat?.id}`
    : `Reserve Seat ${selectedSeat?.id}`;

  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-full p-4 gap-8">
      <header className="text-center">
        <h1 className="text-5xl font-bold tracking-tight text-primary">Seatly</h1>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevDay}
            disabled={isSameDay(viewDate, firstAvailableDate)}
          >
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
                  if (date) setViewDate(date);
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

        {myReservations.length > 0 && (
          <div className="mt-2 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              className="text-primary border-primary/40 hover:bg-primary/10 gap-1.5 text-xs"
              onClick={() => {
                if (myReservationsForViewDate.length > 0) {
                  // Already on a date with a reservation — open the seat panel
                  const firstRes = myReservationsForViewDate[0];
                  const seat = seatsForDisplay.find((s) => s.id === firstRes.seatId);
                  if (seat) {
                    setSelectedSeat(seat);
                    setIsUpdateMode(false);
                    setReservationDate(undefined);
                  }
                } else {
                  // Navigate to the nearest upcoming reservation date
                  const todayStr = format(today, "yyyy-MM-dd");
                  const sorted = [...myReservations].sort((a, b) => a.date.localeCompare(b.date));
                  const next = sorted.find((r) => r.date >= todayStr) ?? sorted[0];
                  const [y, m, d] = next.date.split("-").map(Number);
                  setViewDate(new Date(y, m - 1, d));
                  setPendingOpenSeatId(next.seatId);
                  closePanel();
                }
              }}
            >
              <Bookmark className="h-3 w-3" />
              Your Reservation{myReservations.length > 1 ? `s (${myReservations.length})` : ""}
            </Button>
          </div>
        )}
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
                  onClick={closePanel}
                >
                  <X className="h-4 w-4" />
                </Button>
                <CardTitle className="text-center text-xl pr-6">{panelTitle}</CardTitle>
              </CardHeader>

              <CardContent>
                {/* My reservation — overview */}
                {isCancelMode && !isUpdateMode && (
                  <div className="flex flex-col gap-3 py-1">
                    <div className="rounded-md bg-muted/50 px-3 py-2 text-center">
                      <p className="text-xs text-muted-foreground mb-0.5">Reserved for</p>
                      <p className="text-sm font-medium">{format(viewDate, "PPP")}</p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => {
                        setIsUpdateMode(true);
                        setReservationDate(undefined);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                      Change Date
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full gap-2"
                      onClick={handleCancelReservation}
                    >
                      <Trash2 className="h-4 w-4" />
                      Cancel Reservation
                    </Button>
                  </div>
                )}

                {/* My reservation — change date */}
                {isCancelMode && isUpdateMode && (
                  <>
                    <MinimalCalendar
                      mode="single"
                      selected={reservationDate}
                      onSelect={(d) => d && setReservationDate(d)}
                      fromDate={today}
                      toDate={addDays(today, 8)}
                      disabled={isWeekend}
                    />
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        className="flex-1 gap-1"
                        onClick={() => {
                          setIsUpdateMode(false);
                          setReservationDate(undefined);
                        }}
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={handleUpdateReservation}
                        disabled={!reservationDate}
                      >
                        Confirm
                      </Button>
                    </div>
                  </>
                )}

                {/* New reservation */}
                {!isCancelMode && (
                  <>
                    <MinimalCalendar
                      mode="single"
                      selected={reservationDate}
                      onSelect={(d) => d && setReservationDate(d)}
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
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

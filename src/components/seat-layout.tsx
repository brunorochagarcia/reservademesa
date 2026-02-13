import type { Seat as SeatType } from "@/lib/data";
import { Seat } from "./seat";

interface SeatLayoutProps {
  seats: SeatType[];
  onSeatClick: (seat: SeatType) => void;
}

const findSeat = (id: string, seats: SeatType[]) => {
    return seats.find(seat => seat.id === id)!;
}

export function SeatLayout({ seats, onSeatClick }: SeatLayoutProps) {
  const rows = [
    ['1A', '1B', '1C', '1D', '1E', '1F'],
    ['2A', '2B', '2C', '2D', '2E', '2F'],
    ['3A', '3B', '3C', '3D', '3E', '3F'],
  ];
  const lastRow = ['4A', '4B', '4C'];
  const separateRow = ['5A', '5B', '5C', '5D'];

  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <div className="flex flex-col items-center gap-y-4">
        {rows.map((row, rowIndex) => (
          <div key={`row-group-${rowIndex}`} className="flex flex-col items-center gap-y-1.5">
            {/* Top part of the row */}
            <div className="flex gap-x-1.5">
              {row.slice(0, 3).map(seatId => (
                <Seat key={seatId} seat={findSeat(seatId, seats)} labelPosition="top" onSeatClick={onSeatClick} />
              ))}
            </div>
            {/* Bottom part of the row */}
            <div className="flex gap-x-1.5">
              {row.slice(3, 6).map(seatId => (
                <Seat key={seatId} seat={findSeat(seatId, seats)} labelPosition="bottom" onSeatClick={onSeatClick} />
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Last Row */}
      <div className="flex items-center justify-center gap-1.5 pt-3">
        {lastRow.map(seatId => (
          <Seat key={seatId} seat={findSeat(seatId, seats)} labelPosition="top" onSeatClick={onSeatClick} />
        ))}
      </div>
      
      {/* Separate Row */}
      <div className="flex items-center justify-center gap-1.5 pt-3">
        {separateRow.map(seatId => (
          <Seat key={seatId} seat={findSeat(seatId, seats)} labelPosition="top" onSeatClick={onSeatClick} />
        ))}
      </div>
    </div>
  );
}

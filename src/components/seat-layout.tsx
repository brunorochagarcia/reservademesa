import type { Seat as SeatType } from "@/lib/data";
import { Seat } from "./seat";

interface SeatLayoutProps {
  seats: SeatType[];
}

const findSeat = (id: string, seats: SeatType[]) => {
    return seats.find(seat => seat.id === id)!;
}

export function SeatLayout({ seats }: SeatLayoutProps) {
  const rows = [
    ['1A', '1B', '1C', '1D', '1E', '1F'],
    ['2A', '2B', '2C', '2D', '2E', '2F'],
    ['3A', '3B', '3C', '3D', '3E', '3F'],
  ];
  const lastRow = ['4A', '4B', '4C'];
  const separateRow = ['5A', '5B', '5C', '5D'];

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="flex flex-col items-center gap-y-8">
        {rows.map((row, rowIndex) => (
          <div key={`row-group-${rowIndex}`} className="flex flex-col items-center gap-y-1.5 sm:gap-y-2">
            {/* Top part of the row */}
            <div className="flex gap-x-1.5 sm:gap-x-2">
              {row.slice(0, 3).map(seatId => (
                <Seat key={seatId} seat={findSeat(seatId, seats)} labelPosition="top" />
              ))}
            </div>
            {/* Bottom part of the row */}
            <div className="flex gap-x-1.5 sm:gap-x-2">
              {row.slice(3, 6).map(seatId => (
                <Seat key={seatId} seat={findSeat(seatId, seats)} labelPosition="bottom" />
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Last Row */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 pt-6">
        {lastRow.map(seatId => (
          <Seat key={seatId} seat={findSeat(seatId, seats)} labelPosition="top" />
        ))}
      </div>
      
      {/* Separate Row */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 pt-6">
        {separateRow.map(seatId => (
          <Seat key={seatId} seat={findSeat(seatId, seats)} labelPosition="top" />
        ))}
      </div>
    </div>
  );
}

export type SeatStatus = 'available' | 'selected' | 'unavailable' | 'my-reserved';

export interface Seat {
  id: string;
  status: SeatStatus;
}

const seatIds = [
  '1A', '1B', '1C', '1D', '1E', '1F',
  '2A', '2B', '2C', '2D', '2E', '2F',
  '3A', '3B', '3C', '3D', '3E', '3F',
  '4A', '4B', '4C',
  '5A', '5B', '5C', '5D',
];

export const initialSeats: Seat[] = seatIds.map(id => ({
  id,
  status: id === '2F' ? 'unavailable' : 'available'
}));

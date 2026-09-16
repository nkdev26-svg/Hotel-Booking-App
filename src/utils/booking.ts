import { differenceInDays, isBefore, isSameDay, startOfDay } from 'date-fns';

export interface Room {
  code: string;
  type: string;
  pricePerNight: number;
  maxGuests: number;
}

export interface Booking {
  roomCode: string;
  checkIn: Date;
  checkOut: Date;
}

export const rooms: Room[] = [
  { code: 'R101', type: 'Deluxe Room', pricePerNight: 3500, maxGuests: 2 },
  { code: 'R102', type: 'Deluxe Room', pricePerNight: 3500, maxGuests: 2 },
  { code: 'R201', type: 'Executive Suite', pricePerNight: 5800, maxGuests: 3 },
  { code: 'R202', type: 'Executive Suite', pricePerNight: 5800, maxGuests: 3 },
  { code: 'R301', type: 'Family Room', pricePerNight: 4200, maxGuests: 4 },
];
const today = startOfDay(new Date());
export const existingBookings: Booking[] = [
  {
    roomCode: 'R101',
    checkIn: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
    checkOut: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
  },
];

export function calculateNights(checkIn: Date, checkOut: Date): number {
  return differenceInDays(startOfDay(checkOut), startOfDay(checkIn));
}

export function validateDates(checkIn: Date | null, checkOut: Date | null): { isValid: boolean; error: string | null } {
  if (!checkIn || !checkOut) {
    return { isValid: false, error: 'Please select both dates.' };
  }

  const today = startOfDay(new Date());
  const startIn = startOfDay(checkIn);
  const startOut = startOfDay(checkOut);

  if (isBefore(startIn, today)) {
    return { isValid: false, error: 'Check-in date cannot be in the past.' };
  }

  if (isBefore(startOut, startIn) || isSameDay(startIn, startOut)) {
    return { isValid: false, error: 'Check-out must be after check-in.' };
  }

  return { isValid: true, error: null };
}

export function isRoomAvailable(roomCode: string, checkIn: Date, checkOut: Date): boolean {
  const startIn = startOfDay(checkIn);
  const startOut = startOfDay(checkOut);

  for (const booking of existingBookings) {
    if (booking.roomCode !== roomCode) continue;

    const bCheckIn = startOfDay(booking.checkIn);
    const bCheckOut = startOfDay(booking.checkOut);
    if (startIn < bCheckOut && startOut > bCheckIn) {
      return false;
    }
  }

  return true;
}

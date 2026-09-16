export interface Booking {
  roomId: string;
  checkIn: string;
  checkOut: string;
}

export const ROOMS = [
  { id: 'R101', name: 'Deluxe Room', type: 'Deluxe Room', pricePerNight: 3500, maxGuests: 2, capacityDesc: '2 Max Guests' },
  { id: 'R102', name: 'Deluxe Room', type: 'Deluxe Room', pricePerNight: 3500, maxGuests: 2, capacityDesc: '2 Max Guests' },
  { id: 'R201', name: 'Executive Suite', type: 'Executive Suite', pricePerNight: 5800, maxGuests: 3, capacityDesc: '3 Max Guests' },
  { id: 'R301', name: 'Family Room', type: 'Family Room', pricePerNight: 4200, maxGuests: 4, capacityDesc: '4 Max Guests' },
];

export const EXISTING_BOOKINGS: Booking[] = [
  { roomId: 'R101', checkIn: '2026-09-20', checkOut: '2026-09-25' },
];

/**
 * Calculates the number of nights between two dates.
 * Expects dates in YYYY-MM-DD format.
 */
export function calculateNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  inDate.setHours(0, 0, 0, 0);
  outDate.setHours(0, 0, 0, 0);
  
  const diffTime = outDate.getTime() - inDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Calculates the total price for a given number of nights and price per night.
 */
export function calculateTotalPrice(nights: number, pricePerNight: number): number {
  if (nights < 0 || pricePerNight < 0) return 0;
  return nights * pricePerNight;
}

/**
 * Validates check-in and check-out dates.
 * Returns an error message string if invalid, or null if valid.
 */
export function validateBookingDates(checkIn: string, checkOut: string, today: string): string | null {
  if (!checkIn && !checkOut) return null;

  if (checkIn && checkIn < today) {
    return "Check-in date cannot be in the past.";
  }

  if (checkIn && checkOut) {
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    
    if (outDate <= inDate) {
      return "Check-out date must be after the check-in date (same-day checkout is not allowed).";
    }
  }

  return null;
}

/**
 * Checks if a room is available for the given dates by cross-referencing existing bookings.
 * Returns true if available, false if overlapping with an existing booking.
 */
export function isRoomAvailable(
  roomId: string,
  requestedCheckIn: string,
  requestedCheckOut: string,
  existingBookings: Booking[]
): boolean {
  if (!requestedCheckIn || !requestedCheckOut) return true;

  const reqIn = new Date(requestedCheckIn).getTime();
  const reqOut = new Date(requestedCheckOut).getTime();
  const hasOverlap = existingBookings.some((booking) => {
    if (booking.roomId !== roomId) return false;

    const bookIn = new Date(booking.checkIn).getTime();
    const bookOut = new Date(booking.checkOut).getTime();
    return reqIn < bookOut && reqOut > bookIn;
  });

  return !hasOverlap;
}

import { describe, it, expect } from 'vitest';
import { 
  calculateNights, 
  calculateTotalPrice, 
  validateBookingDates, 
  isRoomAvailable,
  Booking 
} from './bookingLogic';

describe('bookingLogic', () => {
  
  describe('calculateNights', () => {
    it('calculates nights correctly for standard dates', () => {
      expect(calculateNights('2026-10-01', '2026-10-05')).toBe(4);
    });

    it('calculates nights correctly across months', () => {
      expect(calculateNights('2026-10-30', '2026-11-02')).toBe(3);
    });

    it('returns 0 or negative for invalid chronological order (handled by validation in practice)', () => {
      expect(calculateNights('2026-10-05', '2026-10-01')).toBe(-4);
      expect(calculateNights('2026-10-01', '2026-10-01')).toBe(0);
    });

    it('returns 0 for empty strings', () => {
      expect(calculateNights('', '')).toBe(0);
      expect(calculateNights('2026-10-01', '')).toBe(0);
    });
  });

  describe('calculateTotalPrice', () => {
    it('calculates total price correctly', () => {
      expect(calculateTotalPrice(4, 1200)).toBe(4800);
      expect(calculateTotalPrice(1, 3500)).toBe(3500);
    });

    it('returns 0 for negative inputs', () => {
      expect(calculateTotalPrice(-2, 1200)).toBe(0);
      expect(calculateTotalPrice(2, -100)).toBe(0);
    });
  });

  describe('validateBookingDates', () => {
    const today = '2026-09-16';

    it('returns null (valid) for correct future dates', () => {
      expect(validateBookingDates('2026-10-01', '2026-10-05', today)).toBeNull();
    });

    it('returns error if check-in is in the past', () => {
      expect(validateBookingDates('2026-09-10', '2026-09-20', today)).toBe("Check-in date cannot be in the past.");
    });

    it('returns error if check-out is before check-in', () => {
      expect(validateBookingDates('2026-10-10', '2026-10-05', today)).toBe("Check-out date must be after the check-in date (same-day checkout is not allowed).");
    });

    it('returns error for same-day checkout (0 nights)', () => {
      expect(validateBookingDates('2026-10-10', '2026-10-10', today)).toBe("Check-out date must be after the check-in date (same-day checkout is not allowed).");
    });
  });

  describe('isRoomAvailable', () => {
    const existingBookings: Booking[] = [
      { roomId: 'R101', checkIn: '2026-10-10', checkOut: '2026-10-15' },
      { roomId: 'R201', checkIn: '2026-10-20', checkOut: '2026-10-25' }
    ];

    it('returns true if no bookings exist for the room', () => {
      expect(isRoomAvailable('R102', '2026-10-10', '2026-10-15', existingBookings)).toBe(true);
    });

    it('returns true if dates are completely before existing booking', () => {
      expect(isRoomAvailable('R101', '2026-10-01', '2026-10-09', existingBookings)).toBe(true);
    });

    it('returns true if dates are completely after existing booking', () => {
      expect(isRoomAvailable('R101', '2026-10-16', '2026-10-20', existingBookings)).toBe(true);
    });

    it('returns true for adjacent dates (checkout equals next checkin)', () => {
      expect(isRoomAvailable('R101', '2026-10-05', '2026-10-10', existingBookings)).toBe(true);
      expect(isRoomAvailable('R101', '2026-10-15', '2026-10-20', existingBookings)).toBe(true);
    });

    it('returns false for partial overlap (user checkout during existing booking)', () => {
      expect(isRoomAvailable('R101', '2026-10-08', '2026-10-12', existingBookings)).toBe(false);
    });

    it('returns false for partial overlap (user checkin during existing booking)', () => {
      expect(isRoomAvailable('R101', '2026-10-14', '2026-10-18', existingBookings)).toBe(false);
    });

    it('returns false if user dates completely engulf existing booking', () => {
      expect(isRoomAvailable('R101', '2026-10-05', '2026-10-20', existingBookings)).toBe(false);
    });

    it('returns false if user dates are completely inside existing booking', () => {
      expect(isRoomAvailable('R101', '2026-10-11', '2026-10-13', existingBookings)).toBe(false);
    });
  });

});

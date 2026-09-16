import { describe, it, expect } from 'vitest';
import { calculateNights, validateDates } from './booking';
import { startOfDay } from 'date-fns';

describe('Booking Logic', () => {
  describe('calculateNights', () => {
    it('should correctly calculate the number of nights', () => {
      const checkIn = new Date('2026-09-15');
      const checkOut = new Date('2026-09-18');
      expect(calculateNights(checkIn, checkOut)).toBe(3);
    });

    it('should ignore time of day', () => {
      const checkIn = new Date('2026-09-15T14:00:00');
      const checkOut = new Date('2026-09-16T10:00:00');
      expect(calculateNights(checkIn, checkOut)).toBe(1);
    });
  });

  describe('validateDates', () => {
    it('should return valid for valid dates', () => {
      const today = startOfDay(new Date());
      const checkIn = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      const checkOut = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);

      const result = validateDates(checkIn, checkOut);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should return error if check-in is in the past', () => {
      const today = startOfDay(new Date());
      const checkIn = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const checkOut = new Date(today.getTime() + 24 * 60 * 60 * 1000); 

      const result = validateDates(checkIn, checkOut);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('past');
    });

    it('should return error if check-out is before check-in', () => {
      const today = startOfDay(new Date());
      const checkIn = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000); 
      const checkOut = new Date(today.getTime() + 24 * 60 * 60 * 1000); 

      const result = validateDates(checkIn, checkOut);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('after check-in');
    });

    it('should return error if same day', () => {
      const today = startOfDay(new Date());
      const checkIn = new Date(today.getTime() + 24 * 60 * 60 * 1000); 
      const checkOut = new Date(today.getTime() + 24 * 60 * 60 * 1000); 

      const result = validateDates(checkIn, checkOut);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('after check-in');
    });
  });
});

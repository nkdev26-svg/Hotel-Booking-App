"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Guest {
  id: string;
  rm: string;
  rent: string;
  gst: string;
  name: string;
  ad: string;
  kd: string;
  sc: string;
  dt: string;
  idProof: string;
  bookingDate: string;
  bookingTime: string;
  phone?: string;
}

interface GuestContextType {
  activeGuests: Guest[];
  setActiveGuests: React.Dispatch<React.SetStateAction<Guest[]>>;
  expectedArrivals: Guest[];
  setExpectedArrivals: React.Dispatch<React.SetStateAction<Guest[]>>;
  pendingBookings: Guest[];
  setPendingBookings: React.Dispatch<React.SetStateAction<Guest[]>>;
}

const GuestContext = createContext<GuestContextType | undefined>(undefined);

export function GuestProvider({ children }: { children: ReactNode }) {
  const [activeGuests, setActiveGuests] = useState<Guest[]>([]);
  const [expectedArrivals, setExpectedArrivals] = useState<Guest[]>([]);
  const [pendingBookings, setPendingBookings] = useState<Guest[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    try {
      const storedActive = localStorage.getItem('hotel_active_guests');
      const storedExpected = localStorage.getItem('hotel_expected_arrivals');
      const storedPending = localStorage.getItem('hotel_pending_bookings');
      
      if (storedActive) {
        setActiveGuests(JSON.parse(storedActive));
      }
      if (storedExpected) {
        setExpectedArrivals(JSON.parse(storedExpected));
      }
      if (storedPending) {
        setPendingBookings(JSON.parse(storedPending));
      }
    } catch (e) {
      console.error("Failed to load guests from local storage", e);
    }
    setIsLoaded(true);
  }, []);
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('hotel_active_guests', JSON.stringify(activeGuests));
      localStorage.setItem('hotel_expected_arrivals', JSON.stringify(expectedArrivals));
      localStorage.setItem('hotel_pending_bookings', JSON.stringify(pendingBookings));
    }
  }, [activeGuests, expectedArrivals, pendingBookings, isLoaded]);
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'hotel_active_guests' && e.newValue) {
        setActiveGuests(JSON.parse(e.newValue));
      }
      if (e.key === 'hotel_expected_arrivals' && e.newValue) {
        setExpectedArrivals(JSON.parse(e.newValue));
      }
      if (e.key === 'hotel_pending_bookings' && e.newValue) {
        setPendingBookings(JSON.parse(e.newValue));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <GuestContext.Provider value={{ activeGuests, setActiveGuests, expectedArrivals, setExpectedArrivals, pendingBookings, setPendingBookings }}>
      {children}
    </GuestContext.Provider>
  );
}

export function useGuests() {
  const context = useContext(GuestContext);
  if (context === undefined) {
    throw new Error('useGuests must be used within a GuestProvider');
  }
  return context;
}

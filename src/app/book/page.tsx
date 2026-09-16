"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Users, User, Phone, CheckCircle2, AlertCircle, ArrowLeft, BedDouble, Info
} from 'lucide-react';
import { 
  calculateNights, calculateTotalPrice, validateBookingDates, isRoomAvailable, Booking as BookingLogicType, ROOMS, EXISTING_BOOKINGS 
} from '../../utils/bookingLogic';
import { useGuests, Guest } from '../../context/GuestContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CustomerBookingPage() {
  const router = useRouter();
  const { expectedArrivals, activeGuests, setPendingBookings, pendingBookings } = useGuests();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const today = new Date().toISOString().split('T')[0];
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [adults, setAdults] = useState(1);
  const [kids, setKids] = useState(0);
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [successBookingId, setSuccessBookingId] = useState('');

  const totalGuests = adults + kids;
  const selectedRoom = ROOMS.find(r => r.id === selectedRoomId);

  const allBookings = useMemo(() => {
    const parseToYMD = (d: string) => {
      if (!d || d === '-') return '';
      const parts = d.split('/');
      if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
      return d;
    };
    const mapped = [...expectedArrivals, ...activeGuests, ...pendingBookings].map(g => ({
      roomId: `R${g.rm}`,
      checkIn: parseToYMD(g.bookingDate),
      checkOut: parseToYMD(g.dt)
    }));
    return [...EXISTING_BOOKINGS, ...mapped];
  }, [expectedArrivals, activeGuests, pendingBookings]);

  const validationError = useMemo(() => validateBookingDates(checkIn, checkOut, today), [checkIn, checkOut, today]);
  
  const roomError = useMemo(() => {
    if (!selectedRoom) return null;
    if (selectedRoom.maxGuests < totalGuests) return `This room only accommodates up to ${selectedRoom.maxGuests} guests.`;
    if (checkIn && checkOut && !validationError && !isRoomAvailable(selectedRoom.id, checkIn, checkOut, allBookings)) {
      return `This room is not available for the selected dates.`;
    }
    return null;
  }, [selectedRoom, totalGuests, checkIn, checkOut, validationError, allBookings]);

  const bookingDetails = useMemo(() => {
    if (validationError || roomError || !checkIn || !checkOut || !selectedRoom) return null;
    const nights = calculateNights(checkIn, checkOut);
    if (nights <= 0) return null;
    return { nights, totalPrice: calculateTotalPrice(nights, selectedRoom.pricePerNight) };
  }, [checkIn, checkOut, selectedRoom, validationError, roomError]);

  const isFormValid = checkIn && checkOut && guestName && guestPhone && !validationError && !roomError && bookingDetails;

  const handleSelectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !bookingDetails || !selectedRoom) return;

    const newBooking: Guest = {
      id: `B-${crypto.randomUUID()}`,
      rm: selectedRoom.id.replace('R', ''),
      rent: bookingDetails.totalPrice.toFixed(2),
      gst: (bookingDetails.totalPrice * 0.18).toFixed(2),
      name: guestName,
      ad: adults.toString().padStart(2, '0'),
      kd: kids.toString().padStart(2, '0'),
      sc: '00',
      dt: checkOut.split('-').reverse().join('/'),
      idProof: 'Pending...',
      bookingDate: checkIn.split('-').reverse().join('/'),
      bookingTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      phone: guestPhone
    };

    setPendingBookings(prev => [...prev, newBooking]);
    setSuccessBookingId(newBooking.id);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-indigo-100"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Booking Submitted!</h2>
          <p className="text-slate-600 mb-6">Your room has been booked and is pending admin approval.</p>
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-8 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Booking ID</span>
              <span className="font-bold text-slate-900">{successBookingId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Guest Name</span>
              <span className="font-bold text-slate-900">{guestName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Room</span>
              <span className="font-bold text-slate-900">{selectedRoom?.name} ({selectedRoom?.id})</span>
            </div>
          </div>

          <button 
            onClick={() => {
              setIsSuccess(false);
              setStep(1);
              setSelectedRoomId(null);
              setCheckIn('');
              setCheckOut('');
              setGuestName('');
              setGuestPhone('');
            }}
            className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200"
          >
            Book Another Room
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600">
            <BedDouble size={28} />
            <h1 className="text-xl font-black tracking-tight">Raintech</h1>
          </div>
          <div className="text-sm font-medium text-slate-500">
            {step === 1 ? 'Step 1: Select Room' : 'Step 2: Guest Details'}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center max-w-2xl mx-auto mb-12">
                <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Find Your Perfect Stay</h2>
                <p className="text-lg text-slate-600">Choose from our selection of premium rooms and suites, designed for ultimate comfort and relaxation.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ROOMS.map(room => (
                  <motion.div 
                    whileHover={{ y: -5 }}
                    key={room.id} 
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 cursor-pointer flex flex-col h-full"
                    onClick={() => handleSelectRoom(room.id)}
                  >
                    <div className="h-48 bg-gradient-to-tr from-indigo-500 to-purple-500 relative">
                      <div className="absolute inset-0 bg-black/10"></div>
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-indigo-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        {room.type}
                      </div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="text-2xl font-bold">{room.name}</h3>
                        <p className="opacity-90 text-sm">{room.id}</p>
                      </div>
                    </div>
                    
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center gap-2 text-slate-600 text-sm mb-4">
                        <Users size={16} />
                        <span>Up to {room.maxGuests} Guests</span>
                      </div>
                      
                      <div className="mt-auto pt-6 border-t border-slate-100 flex items-end justify-between">
                        <div>
                          <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Per Night</p>
                          <p className="text-2xl font-black text-indigo-600">₹{room.pricePerNight}</p>
                        </div>
                        <button className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-600 transition-colors">
                          Select
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && selectedRoom && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <button 
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-indigo-600 font-medium mb-6 hover:text-indigo-800 transition-colors"
              >
                <ArrowLeft size={18} /> Back to Rooms
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-indigo-600 px-6 py-4 text-white">
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <Info size={20} /> Booking Details
                      </h2>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
                      
                      <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-2">
                          <Calendar size={18} className="text-indigo-500" /> Stay Dates
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Check-in</label>
                            <input 
                              type="date" 
                              min={today}
                              value={checkIn}
                              onChange={e => setCheckIn(e.target.value)}
                              className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all outline-none"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Check-out</label>
                            <input 
                              type="date" 
                              min={checkIn || today}
                              value={checkOut}
                              onChange={e => setCheckOut(e.target.value)}
                              className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all outline-none"
                              required
                            />
                          </div>
                        </div>
                        {validationError && (
                          <div className="mt-3 text-rose-600 text-sm flex items-center gap-1.5 bg-rose-50 p-3 rounded-lg border border-rose-100">
                            <AlertCircle size={16} /> {validationError}
                          </div>
                        )}
                        {roomError && (
                          <div className="mt-3 text-amber-700 text-sm flex items-center gap-1.5 bg-amber-50 p-3 rounded-lg border border-amber-200">
                            <AlertCircle size={16} /> {roomError}
                          </div>
                        )}
                      </div>

                      
                      <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-2">
                          <Users size={18} className="text-indigo-500" /> Guest Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                            <div className="relative">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                              <input 
                                type="text" 
                                value={guestName}
                                onChange={e => setGuestName(e.target.value)}
                                placeholder="John Doe"
                                className="w-full border-2 border-slate-200 rounded-xl pl-11 pr-4 py-3 text-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all outline-none"
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
                            <div className="relative">
                              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                              <input 
                                type="tel" 
                                value={guestPhone}
                                onChange={e => setGuestPhone(e.target.value)}
                                placeholder="+91 98765 43210"
                                className="w-full border-2 border-slate-200 rounded-xl pl-11 pr-4 py-3 text-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all outline-none"
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Adults</label>
                            <div className="flex bg-slate-100 rounded-xl border border-slate-200 p-1">
                              <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))} className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-indigo-600 font-bold text-lg">-</button>
                              <div className="flex-1 flex items-center justify-center font-bold">{adults}</div>
                              <button type="button" onClick={() => setAdults(adults + 1)} className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-indigo-600 font-bold text-lg">+</button>
                            </div>
                          </div>
                          <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Children</label>
                            <div className="flex bg-slate-100 rounded-xl border border-slate-200 p-1">
                              <button type="button" onClick={() => setKids(Math.max(0, kids - 1))} className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-indigo-600 font-bold text-lg">-</button>
                              <div className="flex-1 flex items-center justify-center font-bold">{kids}</div>
                              <button type="button" onClick={() => setKids(kids + 1)} className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-indigo-600 font-bold text-lg">+</button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t">
                        <button 
                          type="submit"
                          disabled={!isFormValid}
                          className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-lg"
                        >
                          Confirm & Book Now
                        </button>
                        {!isFormValid && (
                          <p className="text-center text-slate-500 text-sm mt-3">Please fill out all required fields to continue.</p>
                        )}
                      </div>
                    </form>
                  </div>
                </div>

                
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
                    <div className="h-32 bg-gradient-to-tr from-indigo-500 to-purple-500 relative">
                      <div className="absolute inset-0 bg-black/10"></div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="text-xl font-bold">{selectedRoom.name}</h3>
                        <p className="opacity-90 text-sm">{selectedRoom.id}</p>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h4 className="font-bold text-slate-800 mb-4 border-b pb-2">Price Details</h4>
                      
                      {bookingDetails ? (
                        <div className="space-y-4">
                          <div className="flex justify-between text-slate-600">
                            <span>₹{selectedRoom.pricePerNight} x {bookingDetails.nights} night{bookingDetails.nights > 1 ? 's' : ''}</span>
                            <span className="font-medium text-slate-900">₹{bookingDetails.totalPrice.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Taxes & Fees (18%)</span>
                            <span className="font-medium text-slate-900">₹{(bookingDetails.totalPrice * 0.18).toFixed(2)}</span>
                          </div>
                          <div className="border-t pt-4 flex justify-between items-end">
                            <div>
                              <span className="block text-sm font-semibold text-slate-500 uppercase">Total Price</span>
                            </div>
                            <span className="text-2xl font-black text-indigo-600">
                              ₹{(bookingDetails.totalPrice * 1.18).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-slate-400">
                          <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Select dates to see pricing</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

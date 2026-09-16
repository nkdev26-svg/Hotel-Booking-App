"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Calendar, Clock, Upload, Trash2, Edit3, RefreshCcw, MoreVertical, 
  Plus, FileText, CheckCircle2, XCircle, Info, BedDouble, Users, Ban, User, Phone, X, AlertCircle, Bell, Check
} from 'lucide-react';
import { 
  calculateNights, calculateTotalPrice, validateBookingDates, isRoomAvailable, Booking as BookingLogicType, ROOMS, EXISTING_BOOKINGS
} from '../utils/bookingLogic';
import Link from 'next/link';
import { useGuests, Guest } from '../context/GuestContext';
  interface BookingModalProps {
  setIsBookingModalOpen: (val: boolean) => void;
  expectedArrivals: Guest[];
  activeGuests: Guest[];
  setExpectedArrivals: React.Dispatch<React.SetStateAction<Guest[]>>;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  setSelectedBookingId: (id: string) => void;
  setDraftBooking: (guest: Guest) => void;
  setIsEditing: (val: boolean) => void;
  setIsConfirmed: (val: boolean) => void;
}

const BookingModal = ({ setIsBookingModalOpen, expectedArrivals, activeGuests, setExpectedArrivals, showToast, setSelectedBookingId, setDraftBooking, setIsEditing, setIsConfirmed }: BookingModalProps) => {
    const today = new Date().toISOString().split('T')[0];
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guestName, setGuestName] = useState('');
    const [guestPhone, setGuestPhone] = useState('');
    const [adults, setAdults] = useState(1);
    const [kids, setKids] = useState(0);
    const totalGuests = adults + kids;
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

    const validationError = useMemo(() => validateBookingDates(checkIn, checkOut, today), [checkIn, checkOut, today]);
    const filteredRooms = useMemo(() => ROOMS.filter(room => room.maxGuests >= totalGuests), [totalGuests]);

    const allBookings = useMemo(() => {
      const parseToYMD = (d: string) => {
        if (!d || d === '-') return '';
        const parts = d.split('/');
        if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
        return d;
      };
      const mapped = [...expectedArrivals, ...activeGuests].map(g => ({
        roomId: `R${g.rm}`,
        checkIn: parseToYMD(g.bookingDate),
        checkOut: parseToYMD(g.dt)
      }));
      return [...EXISTING_BOOKINGS, ...mapped];
    }, [expectedArrivals, activeGuests]);

    useEffect(() => {
      if (!selectedRoomId) return;
      const room = ROOMS.find(r => r.id === selectedRoomId);
      if (room && room.maxGuests < totalGuests) {
        setSelectedRoomId(null);
      }
      if (checkIn && checkOut && !validationError && !isRoomAvailable(selectedRoomId, checkIn, checkOut, allBookings)) {
        setSelectedRoomId(null);
      }
    }, [checkIn, checkOut, totalGuests, validationError, selectedRoomId, allBookings]);

    const bookingDetails = useMemo(() => {
      if (validationError || !checkIn || !checkOut || !selectedRoomId) return null;
      const nights = calculateNights(checkIn, checkOut);
      const room = ROOMS.find(r => r.id === selectedRoomId);
      if (!room || nights <= 0) return null;
      return { nights, room, totalPrice: calculateTotalPrice(nights, room.pricePerNight) };
    }, [checkIn, checkOut, selectedRoomId, validationError]);

    const isFormValid = checkIn && checkOut && selectedRoomId && guestName && !validationError;

    const handleConfirmBooking = () => {
      if (!isFormValid || !bookingDetails) return;
      
      const newBooking: Guest = {
        id: `B-${crypto.randomUUID()}`,
        rm: bookingDetails.room.id.replace('R', ''),
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

      setExpectedArrivals(prev => [...prev, newBooking]);
      setIsBookingModalOpen(false);
      showToast(`Booking ${newBooking.id} created successfully!`, 'success');
      setSelectedBookingId(newBooking.id);
      setDraftBooking({ ...newBooking });
      setIsEditing(false);
      setIsConfirmed(false);
    };

    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-50 w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          
          <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white shrink-0">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Plus size={20} className="text-[#d4b872]"/> New Guest Booking
            </h2>
            <button onClick={() => setIsBookingModalOpen(false)} className="hover:bg-white/20 p-1 rounded transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              
              <div className="lg:col-span-2 space-y-4">
                
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 font-semibold text-sm">Guest Details</div>
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold mb-1">Full Name</label>
                      <input type="text" value={guestName} onChange={e => setGuestName(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-[#1e3a5f]" placeholder="Enter name"/>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold mb-1">Phone Number</label>
                      <input type="tel" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-[#1e3a5f]" placeholder="Enter phone number"/>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold mb-1">Adults</label>
                      <input type="number" min="1" value={adults} onChange={e => setAdults(parseInt(e.target.value)||1)} className="w-full border border-slate-300 rounded px-3 py-2 text-sm"/>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Kids</label>
                      <input type="number" min="0" value={kids} onChange={e => setKids(parseInt(e.target.value)||0)} className="w-full border border-slate-300 rounded px-3 py-2 text-sm"/>
                    </div>
                  </div>
                </div>

                
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 font-semibold text-sm">Stay Dates</div>
                  <div className="p-4 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Check-in</label>
                      <input type="date" min={today} value={checkIn} onChange={e => setCheckIn(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 text-sm"/>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Check-out</label>
                      <input type="date" min={checkIn||today} value={checkOut} onChange={e => setCheckOut(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 text-sm"/>
                    </div>
                  </div>
                </div>

                
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 font-semibold text-sm">Select Room</div>
                  <div className="p-4 bg-white">
                    {filteredRooms.length === 0 ? (
                      <div className="text-center py-4 text-slate-500 text-sm">No rooms fit {totalGuests} guests.</div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {filteredRooms.map((room) => {
                          const isAvailable = (!checkIn || !checkOut || validationError) ? true : isRoomAvailable(room.id, checkIn, checkOut, allBookings);
                          return (
                            <div 
                              key={room.id}
                              onClick={() => { if(isAvailable) setSelectedRoomId(room.id) }}
                              className={`p-3 rounded border-2 transition-all ${!isAvailable ? 'bg-slate-100 opacity-50 cursor-not-allowed' : selectedRoomId === room.id ? 'border-[#1e3a5f] bg-white shadow' : 'border-slate-200 bg-white cursor-pointer hover:border-[#1e3a5f]/40'}`}
                            >
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-sm bg-indigo-100 px-1.5 rounded">{room.id}</span>
                                <span className="font-bold text-sm text-[#1e3a5f]">₹{room.pricePerNight}</span>
                              </div>
                              <div className="text-sm font-semibold">{room.name}</div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden h-fit">
                <div className="bg-indigo-600 px-4 py-3 text-white font-bold">Booking Summary</div>
                <div className="p-4 space-y-4">
                  {validationError && (
                     <div className="bg-rose-50 text-rose-700 text-xs p-2 rounded flex gap-1"><AlertCircle size={14}/> {validationError}</div>
                  )}
                  {bookingDetails ? (
                    <>
                      <div className="text-sm space-y-2 bg-slate-50 p-3 rounded border">
                        <div className="flex justify-between"><span>Nights</span><b>{bookingDetails.nights}</b></div>
                        <div className="flex justify-between"><span>Room</span><b>{bookingDetails.room.name}</b></div>
                        <div className="flex justify-between"><span>Rate</span><b>₹{bookingDetails.room.pricePerNight}</b></div>
                      </div>
                      <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                        <span>Total:</span><span className="text-[#1e3a5f]">₹{bookingDetails.totalPrice.toLocaleString()}</span>
                      </div>
                      <button 
                        disabled={!isFormValid}
                        onClick={handleConfirmBooking}
                        className="w-full bg-indigo-600 text-white py-2 rounded font-bold hover:bg-indigo-700 disabled:opacity-50"
                      >
                        Confirm Booking
                      </button>
                    </>
                  ) : (
                    <div className="text-center text-sm text-slate-500 py-4">Select dates and room.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };
export default function GuestCheckIn() {
  const { activeGuests, setActiveGuests, expectedArrivals, setExpectedArrivals, pendingBookings, setPendingBookings } = useGuests();
  
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  const [draftBooking, setDraftBooking] = useState<Guest | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  const [globalSearch, setGlobalSearch] = useState('');
  
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);

  const uniqueGuests = useMemo(() => {
    const map = new Map<string, Guest>();
    [...expectedArrivals, ...activeGuests].forEach(g => map.set(g.id, g));
    return Array.from(map.values());
  }, [expectedArrivals, activeGuests]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprovePending = (guest: Guest) => {
    setPendingBookings(prev => prev.filter(g => g.id !== guest.id));
    setExpectedArrivals(prev => [...prev, guest]);
    showToast(`Approved booking for ${guest.name}`, 'success');
  };

  const handleRejectPending = (guest: Guest) => {
    setPendingBookings(prev => prev.filter(g => g.id !== guest.id));
    showToast(`Rejected booking for ${guest.name}`, 'error');
  };

  const handleSelectBooking = (id: string) => {
    setSelectedBookingId(id);
    const booking = expectedArrivals.find(b => b.id === id) || activeGuests.find(b => b.id === id);
    if (booking) {
      setDraftBooking({ ...booking });
      setIsEditing(false);
      setIsConfirmed(false);
    } else {
      setDraftBooking(null);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsConfirmed(false);
    showToast('Editing mode enabled.', 'info');
  };

  const handleUpdate = () => {
    if (draftBooking) {
      setExpectedArrivals(prev => prev.map(g => g.id === draftBooking.id ? draftBooking : g));
      setActiveGuests(prev => prev.map(g => g.id === draftBooking.id ? draftBooking : g));
    }
    setIsEditing(false);
    showToast('Guest details updated successfully!', 'success');
  };

  const handleDelete = () => {
    if (draftBooking) {
      setExpectedArrivals(prev => prev.filter(g => g.id !== draftBooking.id));
      setActiveGuests(prev => prev.filter(g => g.id !== draftBooking.id));
    }
    setIsEditing(false);
    setDraftBooking(null);
    setSelectedBookingId('');
    showToast('Guest record completely deleted.', 'error');
  };

  const handleConfirm = () => {
    if (!draftBooking) return;
    setIsEditing(false);
    setIsConfirmed(true);
    showToast('Details confirmed! Ready to check-in.', 'success');
  };

  const handleCompleteCheckIn = () => {
    if (!draftBooking || !isConfirmed) {
      showToast('Please confirm guest details first.', 'error');
      return;
    }
    setActiveGuests(prev => [...prev, draftBooking]);
    setExpectedArrivals(prev => prev.filter(b => b.id !== draftBooking.id));
    setSelectedBookingId('');
    setDraftBooking(null);
    setIsConfirmed(false);
    showToast('Check-in complete!', 'success');
  };

  const roomCharge = draftBooking ? parseFloat(draftBooking.rent) : 0;
  const tax = draftBooking ? parseFloat(draftBooking.gst) : 0;
  const totalAmount = roomCharge ? roomCharge + tax : 0;

  const isAlreadyCheckedIn = draftBooking ? activeGuests.some(g => g.id === draftBooking.id) : false;



  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 relative overflow-hidden">
      
      {isBookingModalOpen && <BookingModal setIsBookingModalOpen={setIsBookingModalOpen} expectedArrivals={expectedArrivals} activeGuests={activeGuests} setExpectedArrivals={setExpectedArrivals} showToast={showToast} setSelectedBookingId={setSelectedBookingId} setDraftBooking={setDraftBooking} setIsEditing={setIsEditing} setIsConfirmed={setIsConfirmed} />}

      {/* Notifications Modal */}
      <AnimatePresence>
        {isNotificationOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-end pt-20 pr-4">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-lg shadow-2xl border border-slate-200 w-[400px] overflow-hidden"
            >
              <div className="bg-indigo-600 px-4 py-3 flex justify-between items-center text-white">
                <h3 className="font-bold">Pending Approvals</h3>
                <button onClick={() => setIsNotificationOpen(false)} className="hover:bg-white/20 p-1 rounded"><X size={16}/></button>
              </div>
              <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4 bg-slate-50">
                {pendingBookings.length === 0 ? (
                  <div className="text-center text-slate-500 py-6">No pending bookings.</div>
                ) : (
                  pendingBookings.map(guest => (
                    <div key={guest.id} className="bg-white p-3 rounded border border-slate-200 shadow-sm text-sm space-y-2">
                      <div className="flex justify-between font-bold">
                        <span>{guest.name}</span>
                        <span className="text-indigo-600">₹{guest.rent}</span>
                      </div>
                      <div className="text-slate-600">
                        Room: <span className="font-semibold">{guest.rm}</span> | Dates: {guest.bookingDate} - {guest.dt}
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                        <button onClick={() => handleRejectPending(guest)} className="text-rose-500 hover:bg-rose-50 px-3 py-1.5 rounded flex items-center gap-1 font-medium transition-colors">
                          <Ban size={14}/> Reject
                        </button>
                        <button onClick={() => handleApprovePending(guest)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded flex items-center gap-1 font-medium transition-colors">
                          <Check size={14}/> Approve
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 text-sm font-medium border
              ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                toast.type === 'error' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                'bg-blue-50 text-blue-700 border-blue-200'
              }
            `}
          >
            {toast.type === 'success' && <CheckCircle2 size={18} />}
            {toast.type === 'error' && <XCircle size={18} />}
            {toast.type === 'info' && <Info size={18} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      
      <header className="flex flex-wrap items-center justify-between gap-6 mb-6">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Guest Check-in</h1>
          <div className="relative w-full max-w-[400px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search Booking ID / Guest Name / Phone" 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>
        </div>
        <div className="flex gap-2">
            <button 
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium px-3 py-2 rounded-md transition-colors relative"
            >
              <Bell size={20} />
              {pendingBookings.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {pendingBookings.length}
                </span>
              )}
            </button>
            <Link 
              href="/book"
              target="_blank"
              className="bg-indigo-100 hover:bg-indigo-200 transition-colors text-indigo-700 font-medium px-4 py-2 rounded-md flex items-center gap-2"
            >
              <User size={18} /> Guest Booking Page
            </Link>
            <Link 
              href="/dashboard" 
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium px-4 py-2 rounded-md transition-colors flex items-center gap-2"
            >
              Dashboard
            </Link>
            <Link 
              href="/checkout" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-md transition-colors flex items-center gap-2"
            >
              Go to Check-out &rarr;
            </Link>
        </div>
      </header>

      
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        
        
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden w-full lg:w-[320px] flex-shrink-0">
          <div className="bg-indigo-600 text-white px-4 py-2 font-semibold">
            1. Select Booking & Guest
          </div>
          <div className="p-4 space-y-4">
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search Booking ID / Guest Name / Phone" 
                className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Select Customer</label>
              <div className="flex gap-2">
                <select 
                  value={selectedBookingId}
                  onChange={(e) => handleSelectBooking(e.target.value)}
                  className="flex-1 border border-slate-300 rounded-md px-2 py-1.5 text-sm focus:outline-none"
                >
                  <option value="">Select Customer Name</option>
                  {uniqueGuests
                    .filter(g => !globalSearch || g.name.toLowerCase().includes(globalSearch.toLowerCase()) || g.id.toLowerCase().includes(globalSearch.toLowerCase()) || (g.phone && g.phone.includes(globalSearch)))
                    .map(guest => (
                    <option key={guest.id} value={guest.id}>
                      {guest.name} {activeGuests.some(a => a.id === guest.id) ? '(Checked In)' : ''}
                    </option>
                  ))}
                </select>
                <button 
                  onClick={() => setIsBookingModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 transition-colors text-white px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 whitespace-nowrap"
                >
                  <Plus size={16} /> Add Guest
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-700">Booking Date</label>
                <div className="text-sm">{draftBooking?.bookingDate || '-'}</div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-700">Booking Time</label>
                <div className="text-sm flex items-center gap-1">
                  {draftBooking?.bookingTime || '-'} {draftBooking && <Clock size={14} className="text-slate-500" />}
                </div>
              </div>
            </div>
            
          </div>
        </div>

        
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex-1 transition-all">
          <div className="bg-indigo-600 text-white px-4 py-2 font-semibold flex items-center justify-between">
            <span>2. Review & Update Details</span>
            {draftBooking && <span className="text-[#d4b872] text-sm">ID: {draftBooking.id}</span>}
          </div>
          <div className="p-4 space-y-4">
            
            
            <div className="flex flex-wrap lg:flex-nowrap gap-3 items-end w-full">
              <div className="w-[100px] shrink-0">
                <label className="block text-xs font-semibold mb-1">Room No.</label>
                <div className="bg-indigo-100 text-indigo-700 font-bold px-3 py-1.5 rounded flex items-center gap-2 border border-[#bfa25f] h-[34px] relative">
                    <span className="text-lg leading-none absolute left-2">🛏️</span> 
                    <input 
                      type="text" 
                      value={draftBooking?.rm || ''}
                      onChange={(e) => setDraftBooking(prev => prev ? {...prev, rm: e.target.value} : { id: `W${Math.floor(Math.random() * 10000)}`, rm: e.target.value, rent: '', gst: '', name: '', ad: '01', kd: '00', sc: '00', dt: '', idProof: '', bookingDate: '-', bookingTime: '-' })}
                      className="w-full bg-transparent pl-6 font-bold focus:outline-none placeholder-black/50"
                      placeholder="---"
                    />
                </div>
              </div>
              <div className="w-[100px] shrink-0">
                <label className="block text-xs font-semibold mb-1">Rent</label>
                <input 
                  type="text" 
                  value={draftBooking?.rent || ''}
                  onChange={(e) => setDraftBooking(prev => prev ? {...prev, rent: e.target.value} : { id: `W${Math.floor(Math.random() * 10000)}`, rm: '', rent: e.target.value, gst: '', name: '', ad: '01', kd: '00', sc: '00', dt: '', idProof: '', bookingDate: '-', bookingTime: '-' })}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm h-[34px] transition-colors focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white" 
                />
              </div>
              <div className="w-[90px] shrink-0 flex items-center gap-1">
                <div className="flex-1">
                  <label className="block text-xs font-semibold mb-1">GST</label>
                  <input 
                    type="text" 
                    value={draftBooking?.gst || ''}
                    onChange={(e) => setDraftBooking(prev => prev ? {...prev, gst: e.target.value} : { id: `W${Math.floor(Math.random() * 10000)}`, rm: '', rent: '', gst: e.target.value, name: '', ad: '01', kd: '00', sc: '00', dt: '', idProof: '', bookingDate: '-', bookingTime: '-' })}
                    className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm h-[34px] transition-colors focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white" 
                  />
                </div>
                <span className="text-sm mt-5">%</span>
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs font-semibold mb-1">Guest Name</label>
                <input 
                  type="text" 
                  value={draftBooking?.name || ''}
                  onChange={(e) => setDraftBooking(prev => prev ? {...prev, name: e.target.value} : { id: `W${Math.floor(Math.random() * 10000)}`, rm: '', rent: '', gst: '', name: e.target.value, ad: '01', kd: '00', sc: '00', dt: '', idProof: '', bookingDate: '-', bookingTime: '-' })}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm h-[34px] transition-colors focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white" 
                />
              </div>
              <div className="w-[80px] shrink-0">
                <label className="block text-xs font-semibold mb-1">No-of Adults</label>
                <input 
                  type="text" 
                  value={draftBooking?.ad || ''}
                  onChange={(e) => setDraftBooking(prev => prev ? {...prev, ad: e.target.value} : { id: `W${Math.floor(Math.random() * 10000)}`, rm: '', rent: '', gst: '', name: '', ad: e.target.value, kd: '00', sc: '00', dt: '', idProof: '', bookingDate: '-', bookingTime: '-' })}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm h-[34px] transition-colors focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white" 
                />
              </div>
              <div className="w-[80px] shrink-0">
                <label className="block text-xs font-semibold mb-1">No-of Kids</label>
                <input 
                  type="text" 
                  value={draftBooking?.kd || ''}
                  onChange={(e) => setDraftBooking(prev => prev ? {...prev, kd: e.target.value} : { id: `W${Math.floor(Math.random() * 10000)}`, rm: '', rent: '', gst: '', name: '', ad: '01', kd: e.target.value, sc: '00', dt: '', idProof: '', bookingDate: '-', bookingTime: '-' })}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm h-[34px] transition-colors focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white" 
                />
              </div>
            </div>

            
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-6">
              
              
              <div className="space-y-4">
                
                <div className="flex flex-wrap lg:flex-nowrap gap-3 items-end">
                    <div className="w-[140px] shrink-0">
                    <label className="block text-xs font-semibold mb-1">Checkout Date</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        value={draftBooking?.dt.split('/').reverse().join('-') || ''} 
                        onChange={(e) => {
                          const newDate = e.target.value.split('-').reverse().join('/');
                          setDraftBooking(prev => prev ? {...prev, dt: newDate} : { id: `W${Math.floor(Math.random() * 10000)}`, rm: '', rent: '', gst: '', name: '', ad: '01', kd: '00', sc: '00', dt: newDate, idProof: '', bookingDate: '-', bookingTime: '-' });
                        }}
                        className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm h-[34px] transition-colors focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white" 
                      />
                    </div>
                  </div>
                  <div className="w-[160px] shrink-0">
                    <label className="block text-xs font-semibold mb-1">Update ID Proof</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={draftBooking?.idProof || ''}
                        onChange={(e) => setDraftBooking(prev => prev ? {...prev, idProof: e.target.value} : { id: `W${Math.floor(Math.random() * 10000)}`, rm: '', rent: '', gst: '', name: '', ad: '01', kd: '00', sc: '00', dt: '', idProof: e.target.value, bookingDate: '-', bookingTime: '-' })}
                        className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm h-[34px] transition-colors focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white truncate" 
                      />
                      <FileText className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-[150px]">
                    <label className="block text-xs font-semibold mb-1">Update No. of Adults/Kids</label>
                    <input 
                      type="text" 
                      placeholder="e.g., 2 Adults, 1 Kid"
                      onChange={(e) => {
                        const text = e.target.value;
                        const adMatch = text.match(/(\d+)\s*adult/i);
                        const kdMatch = text.match(/(\d+)\s*kid/i);
                        setDraftBooking(prev => {
                          const base = prev || { id: `W${Math.floor(Math.random() * 10000)}`, rm: '', rent: '', gst: '', name: '', ad: '01', kd: '00', sc: '00', dt: '', idProof: '', bookingDate: '-', bookingTime: '-' };
                          return {
                            ...base,
                            ad: adMatch ? adMatch[1].padStart(2, '0') : base.ad,
                            kd: kdMatch ? kdMatch[1].padStart(2, '0') : base.kd
                          };
                        });
                      }}
                      className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm h-[34px] transition-colors focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white" 
                    />
                  </div>
                </div>

                
                <div className="flex flex-wrap lg:flex-nowrap gap-3 items-end">
                  <div className="w-[140px] shrink-0 relative">
                      <label className="block text-xs font-semibold mb-1 opacity-0">Hidden</label>
                      <button 
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.onchange = (e: Event) => {
                            const target = e.target as HTMLInputElement;
                            if (target.files && target.files.length > 0) {
                              const fileName = target.files[0].name;
                              setDraftBooking(prev => prev ? {...prev, idProof: fileName} : { id: `W${Math.floor(Math.random() * 10000)}`, rm: '', rent: '', gst: '', name: '', ad: '01', kd: '00', sc: '00', dt: '', idProof: fileName, bookingDate: '-', bookingTime: '-' });
                              showToast(`Uploaded: ${fileName}`, 'success');
                            }
                          };
                          input.click();
                        }}
                        className="border border-slate-300 border-dashed rounded px-4 py-1 text-sm flex items-center gap-2 bg-slate-50 w-full justify-center h-[34px] hover:bg-slate-100 transition-colors text-slate-600"
                      >
                        <Upload size={16} /> Upload
                      </button>
                      <FileText size={20} className="absolute -right-7 top-6 text-slate-400 hidden lg:block" />
                  </div>
                  <div className="w-[100px] shrink-0 ml-0 lg:ml-8">
                    <label className="block text-xs font-semibold mb-1">Guest Count</label>
                    <select 
                      onChange={(e) => {
                        const count = parseInt(e.target.value);
                        setDraftBooking(prev => {
                          const base = prev || { id: `W${Math.floor(Math.random() * 10000)}`, rm: '', rent: '', gst: '', name: '', ad: '01', kd: '00', sc: '00', dt: '', idProof: '', bookingDate: '-', bookingTime: '-' };
                          return {...base, ad: count.toString().padStart(2, '0'), kd: '00'};
                        });
                      }}
                      value={(parseInt(draftBooking?.ad || '0') + parseInt(draftBooking?.kd || '0')).toString()}
                      className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm bg-white h-[34px]"
                    >
                      <option value="0">00</option>
                      <option value="1">01</option>
                      <option value="2">02</option>
                      <option value="3">03</option>
                      <option value="4">04</option>
                      <option value="5">05</option>
                    </select>
                  </div>
                  <div className="flex-1 min-w-[150px]">
                    <label className="block text-xs font-semibold mb-1">Update Guest Name</label>
                    <input 
                      type="text" 
                      value={draftBooking?.name || ''}
                      onChange={(e) => setDraftBooking(prev => prev ? {...prev, name: e.target.value} : { id: `W${Math.floor(Math.random() * 10000)}`, rm: '', rent: '', gst: '', name: e.target.value, ad: '01', kd: '00', sc: '00', dt: '', idProof: '', bookingDate: '-', bookingTime: '-' })}
                      className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm h-[34px] transition-colors focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white" 
                    />
                  </div>
                </div>
              </div>

              
              <div className="border border-slate-200 bg-slate-50 rounded-md p-4 h-fit">
                <h4 className="font-semibold text-sm mb-3 text-slate-700">Additional Charges</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Room Charge</span>
                    <span className="font-medium text-slate-900">2 beds</span>
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200">
                    <span className="text-slate-600 font-medium">Tax</span>
                    <span className="font-bold text-slate-900">₹{(totalAmount).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
              <button 
                onClick={handleDelete}
                className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 transition-colors focus:ring-2 focus:ring-rose-200"
              >
                <Trash2 size={14} className="text-rose-600" /> Delete
              </button>
              <button 
                onClick={handleEdit}
                className={`bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 transition-colors ${isEditing ? 'ring-2 ring-indigo-200 bg-slate-100' : ''}`}
              >
                <Edit3 size={14} className="text-indigo-600" /> Edit
              </button>
              <button 
                onClick={handleUpdate}
                disabled={!isEditing}
                className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCcw size={14} className="text-emerald-600" /> Update
              </button>
              <button 
                onClick={handleConfirm}
                disabled={isConfirmed || !draftBooking || isAlreadyCheckedIn}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${isConfirmed || isAlreadyCheckedIn ? 'bg-emerald-600 text-white cursor-default' : 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-2 focus:ring-indigo-600/30'} disabled:opacity-50`}
              >
                {(isConfirmed || isAlreadyCheckedIn) && <CheckCircle2 size={14} />} 
                {isAlreadyCheckedIn ? 'Already Checked-in' : (isConfirmed ? 'Confirmed' : 'Confirm Guest Details')}
              </button>
            </div>
            
          </div>
        </div>

      </div>

      
      <div className="flex flex-col lg:flex-row gap-4">
        
        
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex-1 overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-100 text-xs font-bold text-slate-700 uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Room No.</th>
                <th className="px-4 py-3">Rent (₹)</th>
                <th className="px-4 py-3">GST</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">No:Of Adults</th>
                <th className="px-4 py-3">No:Of Kids</th>
                <th className="px-4 py-3">Senior Citizen</th>
                <th className="px-4 py-3">Checkout Date</th>
                <th className="px-4 py-3">ID Proof</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {activeGuests.map((row, index) => (
                <tr key={`${row.id}-${index}`} className="hover:bg-slate-50 text-slate-800 transition-colors">
                  <td className="px-4 py-2.5 font-medium">{row.rm}</td>
                  <td className="px-4 py-2.5">₹{row.rent}</td>
                  <td className="px-4 py-2.5">₹{row.gst}</td>
                  <td className="px-4 py-2.5 font-medium">{row.name}</td>
                  <td className="px-4 py-2.5">{row.ad}</td>
                  <td className="px-4 py-2.5">{row.kd}</td>
                  <td className="px-4 py-2.5">{row.sc}</td>
                  <td className="px-4 py-2.5">{row.dt}</td>
                  <td className="px-4 py-2.5 flex items-center gap-1">
                    {row.idProof} <FileText size={14} className="text-slate-500" />
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <button className="text-slate-500 hover:bg-slate-200 p-1 rounded-full">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden w-full lg:w-[300px] flex-shrink-0 transition-all">
          <div className="bg-indigo-600 text-white px-4 py-2 font-semibold">
            3. Finalize Check-in & Payment
          </div>
          <div className="p-4 space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Room Charge</span>
                <span className="font-semibold">₹{roomCharge.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Tax</span>
                <span className="font-semibold">₹{tax.toFixed(2)}</span>
              </div>
            </div>

            <div className="py-4 border-y border-slate-200 border-dashed">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Amount:</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm font-bold text-slate-700">
              <span>Total Paid:</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>

            <button 
              onClick={handleCompleteCheckIn}
              disabled={!isConfirmed || isAlreadyCheckedIn}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-md shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
               Complete Check-in
            </button>
            
            <div className="grid grid-cols-3 gap-2">
              <button className="bg-white hover:bg-slate-50 border border-slate-200 py-1.5 text-xs font-medium rounded transition-colors">
                Get Data
              </button>
              <button className="bg-white hover:bg-slate-50 border border-slate-200 py-1.5 text-xs font-medium rounded flex items-center justify-center gap-1 transition-colors">
                <Edit3 size={12}/> M-Pay
              </button>
              <button className="bg-white hover:bg-slate-50 border border-slate-200 py-1.5 text-xs font-medium rounded flex items-center justify-center gap-1 transition-colors">
                <FileText size={12}/> Print
              </button>
            </div>
            
            <button className="w-full bg-white hover:bg-slate-50 border border-slate-200 py-2 text-sm font-medium rounded-md transition-colors">
              Print Registration Card
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button className="bg-white hover:bg-slate-50 border border-slate-200 py-2 text-sm font-medium rounded-md transition-colors">
                Download Folio
              </button>
              <button 
                onClick={handleCompleteCheckIn}
                disabled={!isConfirmed || isAlreadyCheckedIn}
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 text-sm font-medium rounded-md shadow-sm transition-colors text-center leading-tight disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Complete<br/>Check-in
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

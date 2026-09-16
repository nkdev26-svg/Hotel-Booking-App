"use client";

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus,
  RefreshCcw,
  Printer,
  CheckCircle2,
  XCircle,
  Info,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useGuests } from '../../context/GuestContext';
import { calculateNights } from '../../utils/bookingLogic';

const HOTEL_SERVICES = [
  { name: 'Water Bottle', price: 20 },
  { name: 'Tea', price: 50 },
  { name: 'Coffee', price: 60 },
  { name: 'Biscuit', price: 30 },
  { name: 'Breakfast', price: 200 },
  { name: 'Room Service', price: 500 },
  { name: 'Mini-bar', price: 150 },
  { name: 'Laundry', price: 250 },
  { name: 'Spa Service', price: 1000 },
];

export default function GuestCheckOut() {
  const { activeGuests, setActiveGuests } = useGuests();
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  
  const [searchedGuestId, setSearchedGuestId] = useState('');
  const [selectedGuestIds, setSelectedGuestIds] = useState<string[]>([]);
  const [guestCharges, setGuestCharges] = useState<Record<string, {desc: string, amount: number, date: string}[]>>({});
  const [chargeInputs, setChargeInputs] = useState<Record<string, string>>({});
  const [customButtons, setCustomButtons] = useState<{name: string, price: number}[]>([]);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  const uniqueActiveGuests = useMemo(() => {
    const map = new Map<string, typeof activeGuests[0]>();
    activeGuests.forEach(g => map.set(g.id, g));
    return Array.from(map.values());
  }, [activeGuests]);

  const searchedGuest = uniqueActiveGuests.find(g => g.id === searchedGuestId);
  const selectedGuests = uniqueActiveGuests.filter(g => selectedGuestIds.includes(g.id));
  const { totalRent, totalGst, totalExtras, dynamicTotal } = useMemo(() => {
    let r = 0, g = 0, e = 0;
    selectedGuests.forEach(guest => {
      r += parseFloat(guest.rent || '0');
      g += parseFloat(guest.gst || '0');
      
      const charges = guestCharges[guest.id] || [];
      e += charges.reduce((sum, c) => sum + c.amount, 0);
    });
    return { totalRent: r, totalGst: g, totalExtras: e, dynamicTotal: r + g + e };
  }, [selectedGuests, guestCharges]);

  const handleAddCharge = (guestId: string, desc: string, amount: number) => {
    if (!desc || isNaN(amount) || amount <= 0) return;
    const date = new Date().toLocaleDateString('en-GB');
    setGuestCharges(prev => ({
      ...prev,
      [guestId]: [...(prev[guestId] || []), {desc, amount, date}]
    }));
  };

  const handleRemoveCharge = (guestId: string, index: number) => {
    setGuestCharges(prev => ({
      ...prev,
      [guestId]: prev[guestId].filter((_, i) => i !== index)
    }));
  };

  const handleSelectForCheckout = (id: string, isChecked: boolean) => {
    if (isChecked) {
      if (!selectedGuestIds.includes(id)) setSelectedGuestIds(prev => [...prev, id]);
    } else {
      setSelectedGuestIds(prev => prev.filter(gid => gid !== id));
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchedGuestId(val);
    if (val && !selectedGuestIds.includes(val)) {
      setSelectedGuestIds(prev => [...prev, val]);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const processPayment = () => {
    if (selectedGuestIds.length > 0) {
      setActiveGuests(prev => prev.filter(g => !selectedGuestIds.includes(g.id)));
      setSelectedGuestIds([]);
      setSearchedGuestId('');
      showToast('Payment processed. Guests checked out!', 'success');
    } else {
      showToast('Please select at least one guest to checkout.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 relative overflow-hidden">
      
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Guest Check-out</h1>
          <div className="relative w-full max-w-[400px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search Booking ID / Guest Name" 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400 text-sm"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Link 
            href="/dashboard" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-md transition-colors"
          >
            Dashboard
          </Link>
          <Link 
            href="/" 
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium px-4 py-2 rounded-md transition-colors flex items-center gap-2"
          >
            &larr; Go to Check-in
          </Link>
        </div>
      </header>

      
      <div className="flex flex-col lg:flex-row gap-4">
        
        
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden w-full lg:w-[320px] flex-shrink-0 flex flex-col">
          <div className="bg-indigo-600 text-white px-4 py-2 font-semibold">
            1. Identify Departing Guest
          </div>
          <div className="p-4 flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block text-xs font-semibold mb-1">Find Guest</label>
                <select 
                  value={searchedGuestId}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm bg-white"
                >
                  <option value="">Search Guest</option>
                  {uniqueActiveGuests.map(g => (
                    <option key={g.id} value={g.id}>{g.name} - Room {g.rm}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-semibold mb-1">Identify by Room</label>
                <input type="text" value={searchedGuest ? searchedGuest.rm : ""} placeholder="---" readOnly className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm bg-slate-50" />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select 
                value={searchedGuestId}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="flex-1 border border-slate-300 rounded px-2 py-1.5 text-sm bg-white"
              >
                <option value="">Select Guest from List</option>
                {uniqueActiveGuests.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors">
                Find Room/Guest
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded p-3 grid grid-cols-2 gap-4 mt-2 h-[68px]">
              {searchedGuest ? (
                <>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Guest Name</label>
                    <div className="font-semibold text-slate-800 truncate">{searchedGuest.name}</div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Room No.</label>
                    <div className="bg-indigo-100 text-indigo-700 font-bold px-2 py-1 rounded inline-flex items-center gap-1 border border-[#bfa25f] shadow-sm">
                      <span className="text-sm">🛏️</span> {searchedGuest.rm}
                    </div>
                  </div>
                </>
              ) : (
                <div className="col-span-2 text-xs text-slate-400 flex items-center justify-center">
                  Select a guest to view details
                </div>
              )}
            </div>

            <div className="border border-slate-200 rounded overflow-hidden mt-2">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="px-2 py-2 font-semibold">Room</th>
                    <th className="px-2 py-2 font-semibold">Stay Dates</th>
                    <th className="px-2 py-2 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {activeGuests.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-2 py-4 text-center text-slate-400">No active guests found.</td>
                    </tr>
                  ) : (
                    activeGuests.map((guest, index) => {
                      const checkInDate = guest.bookingDate !== '-' ? guest.bookingDate : guest.dt;
                      return (
                        <tr key={`${guest.id}-${index}`} className={searchedGuestId === guest.id ? 'bg-indigo-50' : ''}>
                          <td className="px-2 py-2 font-medium text-indigo-700">{guest.rm}</td>
                          <td className="px-2 py-2 text-[11px] text-indigo-700">{checkInDate}-{guest.dt}</td>
                          <td className="px-2 py-2">
                            <label className="flex items-center gap-1 text-[11px] cursor-pointer text-indigo-700 font-semibold">
                              <input 
                                type="checkbox" 
                                className="rounded border-indigo-500 text-indigo-600 focus:ring-indigo-500" 
                                checked={selectedGuestIds.includes(guest.id)}
                                onChange={(e) => handleSelectForCheckout(guest.id, e.target.checked)}
                              /> Select for Check-out
                            </label>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <button className="w-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 py-2 rounded text-sm font-medium flex items-center justify-center gap-2 mt-2 transition-colors">
              <Search size={14} /> Add/Change Selected Rooms
            </button>
          </div>
        </div>

        
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col min-h-[750px]">
          <div className="bg-indigo-600 text-white px-4 py-2 font-semibold flex-shrink-0">
            2. Review & Finalize Bill
          </div>
          <div className="p-5 flex-1 flex flex-col">
            
            <div className="flex-1 space-y-8 overflow-y-auto">
              {selectedGuests.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-400">
                  No guest selected for checkout.
                </div>
              ) : (
                selectedGuests.map(guest => {
                  const r = parseFloat(guest.rent || '0');
                  const g = parseFloat(guest.gst || '0');
                  const charges = guestCharges[guest.id] || [];
                  const e = charges.reduce((sum, c) => sum + c.amount, 0);
                  const t = r + g + e;
                  const nights = calculateNights(guest.bookingDate !== '-' ? guest.bookingDate.split('/').reverse().join('-') : guest.dt.split('/').reverse().join('-'), guest.dt.split('/').reverse().join('-')) || 1;

                  return (
                    <div key={guest.id}>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
                        <div>
                          <h2 className="text-xl font-bold text-slate-900">[Room {guest.rm}] - {guest.name}</h2>
                          <p className="text-sm text-slate-600">(Nights: {nights}, Rate: ₹{(r / nights).toFixed(2)}, Total: ₹{r.toFixed(2)})</p>
                        </div>
                        <div className="flex gap-2 sm:mt-1">
                          <button className="bg-white border border-slate-200 text-slate-800 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 hover:bg-slate-100 transition-colors">
                            <Printer size={12} /> Print Draft Invoice
                          </button>
                          <button className="bg-[#364968] text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1 hover:bg-[#253247] transition-colors">
                            <RefreshCcw size={12} /> Adjust Charges
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className="text-sm font-semibold text-slate-700 w-full sm:w-auto">Additional Charges (Add Items)</span>
                        <div className="relative flex-1 min-w-[200px]">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                          <input 
                            type="text" 
                            placeholder="Search service (e.g. Water) or type custom" 
                            value={chargeInputs[guest.id] || ''}
                            onChange={(e) => {
                              setChargeInputs(prev => ({...prev, [guest.id]: e.target.value}));
                              setShowDropdown(guest.id);
                            }}
                            onFocus={() => setShowDropdown(guest.id)}
                            onBlur={() => setTimeout(() => setShowDropdown(null), 200)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && chargeInputs[guest.id]?.trim()) {
                                const desc = chargeInputs[guest.id].trim();
                                const matchedService = HOTEL_SERVICES.find(s => s.name.toLowerCase() === desc.toLowerCase());
                                const price = matchedService ? matchedService.price : 100;

                                setCustomButtons(prev => {
                                  if (!prev.find(b => b.name.toLowerCase() === desc.toLowerCase())) {
                                    return [...prev, {name: desc, price}];
                                  }
                                  return prev;
                                });
                                setChargeInputs(prev => ({...prev, [guest.id]: ''}));
                                setShowDropdown(null);
                              }
                            }}
                            className="w-full pl-7 pr-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-400" 
                          />
                          {showDropdown === guest.id && (
                            <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                              {HOTEL_SERVICES
                                .filter(s => s.name.toLowerCase().includes((chargeInputs[guest.id] || '').toLowerCase()))
                                .map((service, i) => (
                                  <div 
                                    key={i}
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      handleAddCharge(guest.id, service.name, service.price);
                                      setChargeInputs(prev => ({...prev, [guest.id]: ''}));
                                      setShowDropdown(null);
                                    }}
                                    className="px-3 py-2 text-xs hover:bg-slate-50 cursor-pointer flex justify-between items-center border-b border-slate-100 last:border-0"
                                  >
                                    <span className="font-medium text-slate-700">{service.name}</span>
                                    <span className="text-indigo-600 font-semibold">₹{service.price}</span>
                                  </div>
                                ))}
                                {HOTEL_SERVICES.filter(s => s.name.toLowerCase().includes((chargeInputs[guest.id] || '').toLowerCase())).length === 0 && (
                                  <div className="px-3 py-2 text-xs text-slate-400 italic">Press Enter to add custom item</div>
                                )}
                            </div>
                          )}
                        </div>
                        <button 
                          onClick={() => {
                            const desc = chargeInputs[guest.id]?.trim();
                            if (desc) {
                              const matchedService = HOTEL_SERVICES.find(s => s.name.toLowerCase() === desc.toLowerCase());
                              const price = matchedService ? matchedService.price : 100;
                              setCustomButtons(prev => {
                                if (!prev.find(b => b.name.toLowerCase() === desc.toLowerCase())) {
                                  return [...prev, {name: desc, price}];
                                }
                                return prev;
                              });
                              setChargeInputs(prev => ({...prev, [guest.id]: ''}));
                            }
                          }}
                          className="bg-indigo-600 text-white p-1 rounded hover:bg-indigo-700 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                        <button onClick={() => handleAddCharge(guest.id, 'Mini-bar', 150)} className="bg-white px-3 py-1 text-xs font-medium rounded border border-slate-200 hover:bg-slate-100 transition-colors">Mini-bar</button>
                        <button onClick={() => handleAddCharge(guest.id, 'Laundry', 250)} className="bg-white px-3 py-1 text-xs font-medium rounded border border-slate-200 hover:bg-slate-100 transition-colors">Laundry</button>
                        {customButtons.map((btn, i) => (
                          <button key={i} onClick={() => handleAddCharge(guest.id, btn.name, btn.price)} className="bg-white px-3 py-1 text-xs font-medium rounded border border-slate-200 hover:bg-slate-100 transition-colors">
                            {btn.name}
                          </button>
                        ))}
                      </div>

                      <div className="border border-slate-200 rounded overflow-hidden">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-slate-100 border-b border-slate-200 text-slate-700">
                            <tr>
                              <th className="px-3 py-2 font-semibold">Room Charges & External Bills</th>
                              <th className="px-3 py-2 font-semibold">Date</th>
                              <th className="px-3 py-2 font-semibold text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            <tr>
                              <td className="px-3 py-2">Room Rent</td>
                              <td className="px-3 py-2">{guest.dt}</td>
                              <td className="px-3 py-2 text-right">₹{r.toFixed(2)}</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2">GST (18%)</td>
                              <td className="px-3 py-2">{guest.dt}</td>
                              <td className="px-3 py-2 text-right text-slate-500">₹{g.toFixed(2)}</td>
                            </tr>
                            {charges.map((charge, idx) => (
                              <tr key={idx}>
                                <td className="px-3 py-2 text-indigo-600 font-medium flex items-center gap-2">
                                  {charge.desc}
                                  <button onClick={() => handleRemoveCharge(guest.id, idx)} className="text-rose-500 hover:bg-rose-50 p-0.5 rounded"><X size={12}/></button>
                                </td>
                                <td className="px-3 py-2 text-slate-500">{charge.date}</td>
                                <td className="px-3 py-2 text-right text-indigo-600 font-medium">₹{charge.amount.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex justify-between items-center mt-3 mb-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="font-bold text-lg text-slate-800">Room {guest.rm} Total</span>
                        <span className="font-bold text-xl text-slate-900">₹{t.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-t border-slate-200 pt-4 mt-auto">
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-sm">
                <div>
                  <h3 className="font-bold text-slate-800">Final Bill Total</h3>
                  <p className="text-sm text-slate-500">Includes all rooms, GST, and extras</p>
                </div>
                <div className="text-3xl font-black text-[#1e3a5f]">
                  ₹{dynamicTotal.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>

        
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden w-full lg:w-[320px] flex-shrink-0 flex flex-col min-h-[750px]">
          <div className="bg-indigo-600 text-white px-4 py-2 font-semibold">
            3. Payment & Check-out
          </div>
          <div className="p-4 flex flex-col h-full gap-5">
            
            <div className="grid grid-cols-[1fr_auto] gap-x-2 gap-y-1 text-sm font-medium">
              <div className="text-slate-800">Total Amount Due</div>
              <div className="font-bold text-lg">₹{dynamicTotal.toFixed(2)}</div>
              <div className="text-slate-500">(Selected Rooms)</div>
              <div className="font-bold">₹0.00</div>
            </div>

            <hr className="border-slate-200 border-dashed" />

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-800">Payment Method</label>
                <select className="w-full border border-slate-300 bg-slate-50 rounded px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-400">
                  <option>Credit Card</option>
                  <option>Cash</option>
                  <option>M-Pay</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-slate-800">Payment Amount</label>
                <input type="text" value={`₹${dynamicTotal.toFixed(2)}`} readOnly className="w-full border border-slate-300 bg-white rounded px-2 py-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-slate-400" />
              </div>
            </div>

            <div className="space-y-3 mt-2">
              <button 
                onClick={processPayment}
                disabled={selectedGuests.length === 0}
                className="w-full bg-[#273a55] hover:bg-[#1a283b] text-white rounded p-3 text-center text-sm transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#273a55]/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="font-medium mb-1">Process Payment & Check-out</div>
                <div className="text-xs text-slate-300 font-light">Complete Check-out for</div>
                <div className="text-xs text-slate-300 font-light">Selected Guest(s)</div>
              </button>
            </div>

            <div className="space-y-2 mt-auto">
              <hr className="border-slate-200 border-dashed mb-4" />
              <button className="w-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50" disabled={selectedGuests.length === 0}>
                Print Final Invoice
              </button>
              <button className="w-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50" disabled={selectedGuests.length === 0}>
                Email Final Invoice
              </button>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}

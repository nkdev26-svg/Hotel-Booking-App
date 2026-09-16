"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  ClipboardCheck, 
  LogOut, 
  Calendar, 
  Droplet, 
  Utensils, 
  MessageCircle, 
  BedDouble, 
  Users, 
  Layers, 
  BarChart3, 
  Settings, 
  Users2,
  Bell,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
const generateRooms = (start: number, count: number, specialStatuses: Record<number, string> = {}) => {
  return Array.from({ length: count }, (_, i) => {
    const num = start + i;
    return {
      num,
      status: specialStatuses[num] || 'available'
    };
  });
};

const floor1_left_row1 = generateRooms(101, 16);
const floor1_left_row2 = generateRooms(101, 10, {102: 'occupied', 103: 'occupied', 104: 'dirty', 105: 'dirty', 106: 'maintenance', 107: 'maintenance'});
const floor1_right_row1 = generateRooms(101, 6);
const floor1_right_row2 = generateRooms(101, 6, {102: 'occupied', 103: 'occupied', 104: 'dirty', 105: 'dirty', 106: 'maintenance'});

const floor2_left_row1 = generateRooms(201, 16, {205: 'maintenance', 210: 'blocked'});
const floor2_left_row2 = generateRooms(201, 10, {202: 'occupied', 205: 'maintenance', 207: 'blocked', 208: 'blocked'});
const floor2_right_row1 = generateRooms(201, 6, {205: 'maintenance', 210: 'blocked'});
const floor2_right_row2 = generateRooms(101, 6, {106: 'blocked'});

const STATUS_COLORS = {
  available: 'bg-[#a3c9a8] text-slate-800',
  occupied: 'bg-[#5c7cfa] text-white',
  dirty: 'bg-[#e03131] text-white',
  maintenance: 'bg-[#f08c00] text-white',
  blocked: 'bg-[#ced4da] text-slate-800',
};

const RoomBlock = ({ room }: { room: {num: number, status: string} }) => (
  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-md flex items-center justify-center text-xs font-bold cursor-pointer transition-transform hover:scale-105 shadow-sm ${(STATUS_COLORS as any)[room.status]}`}>
    {room.num}
  </div>
);

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 lg:p-6 overflow-x-hidden">
      
      
      <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white/50 p-2 rounded-xl border border-white/60 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-slate-900 rounded-lg text-white flex items-center justify-center font-bold text-lg">DO</div>
          <div className="flex flex-col">
            <span className="font-bold text-sm leading-tight">Raintech</span>
            <span className="text-[10px] text-slate-500 font-semibold tracking-wider">HOTEL</span>
          </div>
        </div>

        <div className="flex-1 max-w-2xl relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search guests, rooms, reservations, staff..." 
            className="w-full bg-white border-none rounded-full pl-10 pr-16 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#364968]/20 transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
            <span>Ctrl</span>
            <span>K</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 bg-white px-4 py-2 rounded-full text-sm font-semibold text-slate-600 shadow-sm border border-slate-100">
            <Calendar size={16} /> Thu, Jul 23, 2026 | 9:30 AM
          </div>
          <button className="bg-[#364968] hover:bg-[#253247] text-white px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm transition-colors">
            $ Quick Actions
          </button>
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm relative cursor-pointer border border-slate-200">
            <Bell size={18} className="text-slate-600"/>
            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-300 overflow-hidden cursor-pointer border-2 border-white shadow-sm">
            <img src="https://i.pravatar.cc/100?img=11" alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      <h1 className="text-2xl font-bold text-slate-900 mb-6">Main Dashboard</h1>

      
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
        
        
        <div className="xl:col-span-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 lg:gap-4">
          
          <Link href="/" className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center gap-3 shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <ClipboardCheck size={22} />
            </div>
            <span className="text-xs font-bold text-center">Guest Check-in</span>
          </Link>

          <Link href="/checkout" className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center gap-3 shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <LogOut size={22} />
            </div>
            <span className="text-xs font-bold text-center">Guest Check-Out</span>
          </Link>

          <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center gap-3 shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Calendar size={22} />
            </div>
            <span className="text-xs font-bold text-center">Reservations</span>
          </div>

          <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center gap-3 shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center">
              <Droplet size={22} />
            </div>
            <span className="text-xs font-bold text-center">Housekeeping</span>
          </div>

          <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center gap-3 shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
              <Utensils size={22} />
            </div>
            <span className="text-xs font-bold text-center">Restaurant</span>
          </div>

          <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center gap-3 shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
              <MessageCircle size={22} />
            </div>
            <span className="text-xs font-bold text-center">WhatsApp</span>
          </div>

          <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center gap-3 shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
              <BedDouble size={22} />
            </div>
            <span className="text-xs font-bold text-center">Rooms</span>
          </div>

          <div className="bg-[#e9efff] rounded-2xl p-4 flex flex-col items-center justify-center gap-3 shadow-sm border border-blue-200 hover:shadow-md transition-shadow cursor-pointer relative">
            <div className="absolute top-2 right-2 bg-yellow-200 text-yellow-800 text-[9px] font-bold px-2 py-0.5 rounded-full">2 tasks</div>
            <div className="w-12 h-12 rounded-full bg-blue-200/50 text-blue-700 flex items-center justify-center">
              <Users size={22} />
            </div>
            <span className="text-xs font-bold text-center">Staff</span>
          </div>

          <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center gap-3 shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center">
              <Layers size={22} />
            </div>
            <span className="text-xs font-bold text-center">Floors</span>
          </div>

          <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center gap-3 shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
              <BarChart3 size={22} />
            </div>
            <span className="text-xs font-bold text-center">Reports</span>
          </div>

          <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center gap-3 shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
              <Settings size={22} />
            </div>
            <span className="text-xs font-bold text-center">Settings</span>
          </div>

          <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center gap-3 shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
              <Users2 size={22} />
            </div>
            <span className="text-xs font-bold text-center text-slate-600">New: Group Booking</span>
          </div>

        </div>

        
        <div className="xl:col-span-1 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-base font-bold text-slate-800 mb-4">Operational Overview</h2>
          <div className="grid grid-cols-2 gap-3 h-[calc(100%-2rem)]">
            
            <div className="bg-[#e9efff] rounded-xl p-3 flex flex-col justify-between border border-blue-100">
              <span className="text-xs font-semibold text-slate-600">Occupancy</span>
              <div className="flex items-end justify-between">
                <div className="w-4 h-6 bg-blue-600 rounded-t-full rounded-b-sm self-end"></div>
                <span className="text-2xl font-black text-slate-800">4%</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 flex flex-col justify-between border border-slate-100">
              <span className="text-xs font-semibold text-slate-600">Pending Check-ins</span>
              <span className="text-2xl font-black text-slate-800 self-end mt-2">0</span>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 flex flex-col justify-between border border-slate-100">
              <span className="text-xs font-semibold text-slate-600">Pending Departures</span>
              <span className="text-2xl font-black text-slate-800 self-end mt-2">0</span>
            </div>

            <div className="bg-[#dcfce7] rounded-xl p-3 flex flex-col justify-between border border-green-200">
              <span className="text-xs font-semibold text-slate-600">Revenue Today</span>
              <span className="text-2xl font-black text-slate-800 self-end mt-2">₹0</span>
            </div>

          </div>
        </div>
      </div>

      
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6 overflow-x-auto">
        <div className="min-w-[900px]">
          <h2 className="text-base font-bold text-slate-800">Room Status - Interactive Floor View</h2>
          <p className="text-sm text-slate-500 mb-6">50 rooms across your property</p>

          <div className="flex justify-between items-stretch gap-6">
            
            
            <div className="flex-1 space-y-6">
              
              
              <div className="flex items-center gap-4">
                <div className="-rotate-90 text-sm font-bold text-slate-400 w-6 shrink-0 tracking-wider">Floor 1</div>
                <div className="flex-1 flex gap-6 bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex gap-1.5">{floor1_left_row1.map(r => <RoomBlock key={`f1_lr1_${r.num}`} room={r} />)}</div>
                    <div className="flex gap-1.5">{floor1_left_row2.map(r => <RoomBlock key={`f1_lr2_${r.num}`} room={r} />)}</div>
                  </div>
                  <div className="flex flex-col gap-1.5 border-l border-slate-200 pl-6">
                    <div className="flex gap-1.5">{floor1_right_row1.map(r => <RoomBlock key={`f1_rr1_${r.num}`} room={r} />)}</div>
                    <div className="flex gap-1.5">{floor1_right_row2.map(r => <RoomBlock key={`f1_rr2_${r.num}`} room={r} />)}</div>
                  </div>
                </div>
              </div>

              
              <div className="flex items-center gap-4">
                <div className="-rotate-90 text-sm font-bold text-slate-400 w-6 shrink-0 tracking-wider">Floor 2</div>
                <div className="flex-1 flex gap-6 bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex gap-1.5">{floor2_left_row1.map(r => <RoomBlock key={`f2_lr1_${r.num}`} room={r} />)}</div>
                    <div className="flex gap-1.5">{floor2_left_row2.map(r => <RoomBlock key={`f2_lr2_${r.num}`} room={r} />)}</div>
                  </div>
                  <div className="flex flex-col gap-1.5 border-l border-slate-200 pl-6">
                    <div className="flex gap-1.5">{floor2_right_row1.map(r => <RoomBlock key={`f2_rr1_${r.num}`} room={r} />)}</div>
                    <div className="flex gap-1.5">{floor2_right_row2.map(r => <RoomBlock key={`f2_rr2_${r.num}`} room={r} />)}</div>
                  </div>
                </div>
              </div>

            </div>

            
            <div className="w-48 flex flex-col items-center justify-center border-l border-slate-200 pl-6 shrink-0">
              <div className="relative w-32 h-32 flex items-center justify-center">
                
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(#a3c9a8 0%, #a3c9a8 4%, #e2e8f0 4%, #e2e8f0 100%)`
                  }}
                ></div>
                <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                  <span className="text-2xl font-black text-slate-800 leading-none">200</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase text-center leading-tight mt-1">Rooms<br/>Total</span>
                </div>
              </div>
              <span className="text-sm font-bold mt-4 text-slate-700">4% Occupied</span>
            </div>

          </div>

          
          <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold text-slate-600 pl-10">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-[#a3c9a8]"></div> Available</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-[#5c7cfa]"></div> Occupied</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-[#e03131]"></div> Dirty</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-[#f08c00]"></div> Maintenance</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-[#ced4da]"></div> Blocked</div>
            <span className="ml-auto text-slate-400 font-normal">Clicking a room tile opens its quick-edit menu</span>
          </div>

        </div>
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-4">
            <BedDouble size={18} className="text-slate-500"/> Going to Vacate Rooms
          </h2>
          
          <div className="flex flex-wrap gap-4">
            
            <div className="flex bg-slate-50 border border-slate-100 rounded-xl overflow-hidden shadow-sm flex-1 min-w-[280px]">
              <img src="https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=150&q=80" alt="Room" className="w-24 object-cover" />
              <div className="p-3 flex flex-col justify-center">
                <span className="font-bold text-slate-800">Room 101</span>
                <span className="text-xs font-semibold text-slate-600 mt-1">Departing - Guest</span>
                <span className="text-xs text-slate-500">Check-Out Scheduled</span>
              </div>
            </div>
            
            
            <div className="flex bg-slate-50 border border-slate-100 rounded-xl overflow-hidden shadow-sm flex-1 min-w-[280px]">
              <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=150&q=80" alt="Room" className="w-24 object-cover" />
              <div className="p-3 flex flex-col justify-center">
                <span className="font-bold text-slate-800">Room 102</span>
                <span className="text-xs font-semibold text-slate-600 mt-1">Departing - Guest</span>
                <span className="text-xs text-slate-500">Checkout: 11:00 AM</span>
              </div>
            </div>

            
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col shadow-sm flex-1 min-w-[200px]">
              <div className="flex justify-between items-center mb-2 text-slate-500">
                <LogOut size={16} />
                <span className="text-xs font-bold bg-slate-200 px-2 py-0.5 rounded-full">0%</span>
              </div>
              <span className="font-bold text-slate-800 text-sm">Departing</span>
              <div className="flex items-center gap-1.5 text-xs text-orange-600 mt-2 font-medium bg-orange-50 p-1.5 rounded">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div> Room 101 cleaning overdue...
              </div>
            </div>
          </div>
        </div>

        
        <div className="lg:col-span-1 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-base font-bold text-slate-800 mb-4">Quick Room Status Changer & Actions</h2>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Room #</label>
                <div className="relative">
                  <select className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm font-semibold appearance-none focus:outline-none focus:border-slate-300">
                    <option>—</option>
                    <option>101</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-end">
                <input type="text" placeholder="Enter number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-300" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button className="flex-1 bg-[#f4ece3] hover:bg-[#ebdccc] text-[#8a6b4e] font-bold py-2.5 rounded-lg text-xs transition-colors border border-[#e8dacb]">
                Set all Dirty to Cleaning
              </button>
              <button className="flex-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 border border-emerald-200">
                <CheckCircle2 size={14} /> Cleaning done, ready to serve
              </button>
            </div>

            <button className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2.5 rounded-lg text-xs transition-colors mt-2">
              View All Maintenance
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

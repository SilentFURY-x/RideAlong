"use client";

import { Ride } from "@/types";
import { Calendar, Clock, User, ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns"; // Helper for clean dates

interface RideCardProps {
  ride: Ride;
  isJoinable: boolean; // We will pass "false" if the user already has a ride
}

export default function RideCard({ ride, isJoinable }: RideCardProps) {
  // Format date nicely (e.g., "Feb 12")
  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "MMM d");
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col md:flex-row">
      
      {/* Left Stripe (Teal Gradient) - Visual Indicator of Route */}
      <div className="md:w-64 bg-gradient-to-br from-[#2C5364] to-[#203A43] p-5 flex flex-col justify-center text-white shrink-0 relative overflow-hidden">
        {/* Decorative Circle */}
        <div className="absolute -top-6 -left-6 w-20 h-20 bg-white/10 rounded-full blur-xl" />
        
        <div className="relative z-10 flex flex-col gap-4">
            <div className="flex gap-3">
                <div className="flex flex-col items-center mt-1">
                    <div className="w-2.5 h-2.5 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                    <div className="w-0.5 h-8 bg-white/20 my-1" />
                    <div className="w-2.5 h-2.5 bg-red-400 rounded-full shadow-[0_0_8px_rgba(248,113,113,0.5)]" />
                </div>
                <div className="flex flex-col justify-between h-14">
                    <div>
                        <p className="text-[10px] text-slate-300 uppercase tracking-wider font-medium">From</p>
                        <p className="text-sm font-bold leading-tight line-clamp-1" title={ride.source}>
                            {ride.source}
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-300 uppercase tracking-wider font-medium">To</p>
                        <p className="text-sm font-bold leading-tight line-clamp-1" title={ride.destination}>
                            {ride.destination}
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 p-5 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Info Grid */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-8 w-full">
            
            {/* Date */}
            <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-500">
                    <Calendar className="w-4 h-4" />
                </div>
                <div>
                    <p className="text-xs text-slate-400 font-medium">Date</p>
                    <p className="text-sm font-semibold text-slate-700">{formatDate(ride.date)}</p>
                </div>
            </div>

            {/* Time */}
            <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-500">
                    <Clock className="w-4 h-4" />
                </div>
                <div>
                    <p className="text-xs text-slate-400 font-medium">Time</p>
                    <p className="text-sm font-semibold text-slate-700">{ride.time}</p>
                </div>
            </div>

            {/* Seats */}
            <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-500">
                    <User className="w-4 h-4" />
                </div>
                <div>
                    <p className="text-xs text-slate-400 font-medium">Seats</p>
                    <p className="text-sm font-semibold text-slate-700">
                        {ride.seats - ride.passengers.length} <span className="text-slate-400 font-normal">left</span>
                    </p>
                </div>
            </div>

            {/* Host Name (Optional 4th col or separate) */}
            <div className="col-span-2 sm:col-span-1 flex items-center gap-2 mt-1">
                 <div className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-500 font-medium truncate max-w-[120px]">
                    Host: {ride.hostName.split(" ")[0]}
                 </div>
            </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 w-full md:w-auto shrink-0">
            <Link 
                href={`/rides/${ride.id}`}
                className="w-full md:w-32 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-[#0F4C75] transition-colors text-center"
            >
                View Details
            </Link>
            
            {/* Conditional Button: Disable if user already has a ride */}
            {isJoinable ? (
                <Link
                    href={`/rides/${ride.id}`} 
                    className="w-full md:w-32 px-4 py-2 text-sm font-medium text-white bg-[#0F4C75] rounded-lg hover:bg-[#0F4C75]/90 transition-colors shadow-sm flex items-center justify-center gap-1"
                >
                    Join Ride
                </Link>
            ) : (
                <button
                    disabled
                    className="w-full md:w-32 px-4 py-2 text-sm font-medium text-slate-400 bg-slate-100 rounded-lg cursor-not-allowed text-center"
                    title="You already have an active ride"
                >
                    Unavailable
                </button>
            )}
        </div>
      </div>
    </div>
  );
}
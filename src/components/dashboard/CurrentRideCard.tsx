"use client";

import { Ride } from "@/types";
import { MapPin, Calendar, Clock, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

interface CurrentRideCardProps {
  ride: Ride;
  onCancel: () => void; // We will hook this up later
}

export default function CurrentRideCard({ ride, onCancel }: CurrentRideCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header with Teal Gradient */}
      <div className="bg-gradient-to-r from-[#2C5364] to-[#203A43] p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <span className="inline-block px-2 py-1 bg-white/20 rounded text-xs font-medium mb-3 backdrop-blur-sm">
              Hosting
            </span>
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <p className="font-semibold text-lg">{ride.source}</p>
                </div>
                <div className="ml-1 w-0.5 h-4 bg-white/20 my-1" />
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <p className="font-semibold text-lg">{ride.destination}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-right">
             {/* Pending Requests Badge logic can go here later */}
             <div className="px-3 py-1 bg-white/10 rounded-full text-xs backdrop-blur-sm">
                Active Ride
             </div>
          </div>
        </div>
      </div>

      {/* Details Row */}
      <div className="p-6 flex flex-wrap gap-6 items-center justify-between">
        <div className="flex gap-6">
            <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium">{ride.date}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium">{ride.time}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium">
                    {ride.passengers.length} / {ride.seats} Passengers
                </span>
            </div>
        </div>

        <div className="flex gap-3">
             <button 
                onClick={onCancel}
                className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
             >
                Cancel Ride
             </button>
             <Link
                href={`/rides/${ride.id}`}
                className="px-4 py-2 text-sm bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-medium transition-all flex items-center gap-2"
             >
                Manage Ride
                <ArrowRight className="w-4 h-4" />
             </Link>
        </div>
      </div>
    </div>
  );
}
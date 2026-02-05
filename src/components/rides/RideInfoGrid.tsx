import { Ride } from "@/types";
import { Calendar, Clock, Users } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function RideInfoGrid({ ride }: { ride: Ride }) {
  const formatDate = (dateStr: string) => {
    try { return format(parseISO(dateStr), "MMM d, yyyy"); } catch { return dateStr; }
  };

  return (
    <div className="space-y-6">
      {/* Green Gradient Route Header */}
      <div className="bg-gradient-to-r from-[#2C5364] to-[#203A43] rounded-2xl p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* Route Visualizer */}
            <div className="flex flex-col items-center h-16 justify-center">
              <div className="w-3 h-3 bg-green-400 rounded-full shadow-[0_0_10px_rgba(74,222,128,0.6)]" />
              <div className="w-0.5 h-full bg-white/20 my-1" />
              <div className="w-3 h-3 bg-red-400 rounded-full shadow-[0_0_10px_rgba(248,113,113,0.6)]" />
            </div>
            
            <div className="flex flex-col h-20 justify-between py-1">
              <div>
                <p className="text-xs text-slate-300 uppercase tracking-wider font-medium">From</p>
                <h2 className="text-xl md:text-2xl font-bold">{ride.source}</h2>
              </div>
              <div>
                <p className="text-xs text-slate-300 uppercase tracking-wider font-medium">To</p>
                <h2 className="text-xl md:text-2xl font-bold">{ride.destination}</h2>
              </div>
            </div>
          </div>
          
          {/* Seats Badge */}
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20 self-start md:self-center">
             <span className="font-bold text-lg">{ride.seats - ride.passengers.length}</span> 
             <span className="text-sm text-slate-200 ml-1">seats left</span>
          </div>
        </div>
      </div>

      {/* Info Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-[#0F4C75] rounded-lg">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Date</p>
            <p className="font-bold text-slate-900">{formatDate(ride.date)}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-[#0F4C75] rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Time</p>
            <p className="font-bold text-slate-900">{ride.time}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-[#0F4C75] rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Available Seats</p>
            <p className="font-bold text-slate-900">{ride.passengers.length} / {ride.seats}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
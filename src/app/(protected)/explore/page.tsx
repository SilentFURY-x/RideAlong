"use client";

import { useAuth } from "@/context/AuthContext";
import RideCard from "@/components/rides/RideCard";
import { Ride } from "@/types";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { Search, FilterX, User, Info } from "lucide-react";
import Link from "next/link";

export default function ExplorePage() {
  const { user } = useAuth();
  
  // Data State
  const [allRides, setAllRides] = useState<Ride[]>([]);
  const [hasActiveRide, setHasActiveRide] = useState(false); // <--- Updated State Name
  const [loading, setLoading] = useState(true);

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    if (!user) return;

    // Listen to ALL active rides
    const q = query(collection(db, "rides"), where("status", "==", "active"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rides: Ride[] = [];
      let isBusy = false; // Flag to track if user is Host OR Passenger
      const today = new Date().toISOString().split('T')[0];

      snapshot.forEach((doc) => {
        const data = doc.data() as Ride;
        const ride = { ...data, id: doc.id };
        
        // 1. Check if ride is expired (Don't show past rides)
        if (ride.date < today) return; 

        // 2. Check if I am involved in this ride
        if (ride.hostId === user.uid || ride.passengers.includes(user.uid)) {
            isBusy = true;
        }

        rides.push(ride);
      });

      // Sort: Soonest dates first
      rides.sort((a, b) => new Date(a.date + "T" + a.time).getTime() - new Date(b.date + "T" + b.time).getTime());

      setAllRides(rides);
      setHasActiveRide(isBusy);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Filter Logic
  const filteredRides = allRides.filter((ride) => {
    // 1. Don't show the ride I'm already in (Cleaner UI)
    if (ride.hostId === user?.uid || ride.passengers.includes(user?.uid || "")) return false;

    // 2. Search Filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
        ride.source.toLowerCase().includes(searchLower) || 
        ride.destination.toLowerCase().includes(searchLower);

    // 3. Date Filter
    const matchesDate = dateFilter ? ride.date === dateFilter : true;

    return matchesSearch && matchesDate;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Explore Rides</h1>
        <p className="text-slate-500">Find a ride that matches your destination</p>
      </div>

      {/* "Already In Ride" Alert */}
      {hasActiveRide && (
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Info className="w-5 h-5 text-[#0F4C75]" />
                </div>
                <div>
                    <p className="text-sm font-bold text-[#0F4C75]">You have an active ride</p>
                    <p className="text-xs text-blue-600/80">You cannot join other rides while you are part of one.</p>
                </div>
            </div>
            <Link href="/dashboard" className="text-sm font-semibold text-[#0F4C75] hover:underline">
                View My Ride
            </Link>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-2">
        <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input 
                type="text" 
                placeholder="Search location..." 
                className="w-full pl-10 pr-4 py-2.5 outline-none text-slate-700 placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
        <div className="hidden md:block w-px bg-slate-200 my-1" />
        <div className="relative md:w-48">
             <input 
                type="date" 
                className="w-full pl-4 pr-4 py-2.5 outline-none text-slate-700"
                value={dateFilter}
                min={new Date().toISOString().split('T')[0]} // Disable past dates in picker
                onChange={(e) => setDateFilter(e.target.value)}
             />
        </div>
        {(searchQuery || dateFilter) && (
            <button 
                onClick={() => { setSearchQuery(""); setDateFilter(""); }}
                className="px-3 py-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
                <FilterX className="w-5 h-5" />
            </button>
        )}
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {loading ? (
            [1, 2, 3].map((i) => <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-xl" />)
        ) : filteredRides.length > 0 ? (
            filteredRides.map((ride) => (
                <RideCard 
                    key={ride.id} 
                    ride={ride} 
                    isJoinable={!hasActiveRide} // Disable join if I am busy
                />
            ))
        ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                <Search className="w-8 h-8 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900">No rides found</h3>
                <p className="text-slate-500 text-sm">Try adjusting your filters.</p>
                <button onClick={() => { setSearchQuery(""); setDateFilter(""); }} className="mt-4 text-[#0F4C75] font-semibold text-sm hover:underline">Clear filters</button>
            </div>
        )}
      </div>
    </div>
  );
}
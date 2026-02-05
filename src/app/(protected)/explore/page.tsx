"use client";

import { useAuth } from "@/context/AuthContext";
import RideCard from "@/components/rides/RideCard";
import { Ride } from "@/types";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { Search, Calendar, FilterX, User } from "lucide-react";
import Link from "next/link";

export default function ExplorePage() {
  const { user } = useAuth();
  
  // Data State
  const [allRides, setAllRides] = useState<Ride[]>([]);
  const [myHostedRideId, setMyHostedRideId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    if (!user) return;

    // 1. Listen to ALL active rides
    // Note: In a real app, you might want to paginate this. For college scale, fetching all active rides is fine.
    const q = query(collection(db, "rides"), where("status", "==", "active"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rides: Ride[] = [];
      let hostedId = null;

      snapshot.forEach((doc) => {
        const data = doc.data() as Ride;
        const ride = { ...data, id: doc.id };
        
        // Check if I am the host
        if (ride.hostId === user.uid) {
            hostedId = ride.id;
        }

        rides.push(ride);
      });

      // Sort: Soonest dates first
      rides.sort((a, b) => new Date(a.date + "T" + a.time).getTime() - new Date(b.date + "T" + b.time).getTime());

      setAllRides(rides);
      setMyHostedRideId(hostedId);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Filter Logic
  const filteredRides = allRides.filter((ride) => {
    // 1. Don't show my own rides in the "Available" list (optional, but cleaner)
    if (ride.hostId === user?.uid) return false;

    // 2. Search Filter (Source or Destination)
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Explore Rides</h1>
        <p className="text-slate-500">Find a ride that matches your destination</p>
      </div>

      {/* Your Hosted Ride Alert (If applicable) */}
      {myHostedRideId && (
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-[#0F4C75]" />
                </div>
                <div>
                    <p className="text-sm font-bold text-[#0F4C75]">You are hosting a ride</p>
                    <p className="text-xs text-blue-600/80">You cannot join other rides while hosting.</p>
                </div>
            </div>
            <Link href="/dashboard" className="text-sm font-semibold text-[#0F4C75] hover:underline">
                Manage Ride
            </Link>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-2">
        {/* Search Input */}
        <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input 
                type="text" 
                placeholder="Search by location (e.g., VIT Main Gate, Airport)..." 
                className="w-full pl-10 pr-4 py-2.5 outline-none text-slate-700 placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
        
        {/* Divider */}
        <div className="hidden md:block w-px bg-slate-200 my-1" />

        {/* Date Input */}
        <div className="relative md:w-48">
             <input 
                type="date" 
                className="w-full pl-4 pr-4 py-2.5 outline-none text-slate-700"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
             />
        </div>

        {/* Clear Filters */}
        {(searchQuery || dateFilter) && (
            <button 
                onClick={() => { setSearchQuery(""); setDateFilter(""); }}
                className="px-3 py-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Clear Filters"
            >
                <FilterX className="w-5 h-5" />
            </button>
        )}
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {loading ? (
            // Skeleton Loader
            [1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-xl" />
            ))
        ) : filteredRides.length > 0 ? (
            filteredRides.map((ride) => (
                <RideCard 
                    key={ride.id} 
                    ride={ride} 
                    isJoinable={!myHostedRideId} // Disable join if I am a host
                />
            ))
        ) : (
            // Empty State
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">No rides found</h3>
                <p className="text-slate-500 text-sm">
                    Try adjusting your filters or check back later.
                </p>
                <button 
                    onClick={() => { setSearchQuery(""); setDateFilter(""); }}
                    className="mt-4 text-[#0F4C75] font-semibold text-sm hover:underline"
                >
                    Clear all filters
                </button>
            </div>
        )}
      </div>
    </div>
  );
}
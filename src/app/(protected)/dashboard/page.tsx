"use client";

import { useAuth } from "@/context/AuthContext";
import { Plus, Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import CreateRideModal from "@/components/dashboard/CreateRideModal";
import CurrentRideCard from "@/components/dashboard/CurrentRideCard";
import { Ride } from "@/types";
import { collection, query, where, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

export default function DashboardPage() {
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // State for the Active Ride
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [loadingRide, setLoadingRide] = useState(true);

  // 1. Listen for Active Rides
  useEffect(() => {
    if (!user) return;

    // Query: Find rides where I am the host AND status is 'active'
    const q = query(
      collection(db, "rides"),
      where("hostId", "==", user.uid),
      where("status", "==", "active")
    );

    // Real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const rideDoc = snapshot.docs[0];
        setActiveRide({ id: rideDoc.id, ...rideDoc.data() } as Ride);
      } else {
        setActiveRide(null);
      }
      setLoadingRide(false);
    });

    return () => unsubscribe();
  }, [user]);

  // 2. Handle Cancel Ride
  const handleCancelRide = async () => {
    if (!activeRide?.id) return;
    
    const confirm = window.confirm("Are you sure you want to cancel this ride?");
    if (confirm) {
      try {
        await deleteDoc(doc(db, "rides", activeRide.id));
        toast.success("Ride cancelled successfully");
        // Snapshot will automatically update the UI to null
      } catch (error) {
        toast.error("Error cancelling ride");
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-2 mt-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome, {user?.displayName?.split(" ")[0]}!
        </h1>
        <p className="text-slate-500">
          {activeRide 
            ? "Manage your current trip or explore others."
            : "Find a ride or create one to get started."}
        </p>
      </div>

      {/* Dynamic Content Area */}
      {loadingRide ? (
        <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
        </div>
      ) : activeRide ? (
        /* OPTION A: Show Current Ride if it exists */
        <div className="max-w-4xl mx-auto mt-8 space-y-6">
            <CurrentRideCard ride={activeRide} onCancel={handleCancelRide} />
            
            {/* Still show Explore button below */}
            <div className="flex justify-center">
                <Link
                  href="/explore"
                  className="text-slate-500 hover:text-[#0F4C75] font-medium text-sm flex items-center gap-2 transition-colors"
                >
                  <Search className="w-4 h-4" />
                  Look for other rides instead
                </Link>
            </div>
        </div>
      ) : (
        /* OPTION B: Show Action Buttons if NO ride exists */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-12">
            <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-[#0F4C75]/30 transition-all duration-300 text-left group"
            >
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-[#0F4C75]/10 group-hover:scale-110 transition-all duration-300">
                <Plus className="w-8 h-8 text-slate-600 group-hover:text-[#0F4C75]" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
                Create a Ride
            </h3>
            <p className="text-slate-500 leading-relaxed text-sm">
                Offer a ride to fellow students. Set your route, time, and seats.
            </p>
            </button>

            <Link
            href="/explore"
            className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-[#0F4C75]/30 transition-all duration-300 text-left group"
            >
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-[#0F4C75]/10 group-hover:scale-110 transition-all duration-300">
                <Search className="w-8 h-8 text-slate-600 group-hover:text-[#0F4C75]" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
                Explore Rides
            </h3>
            <p className="text-slate-500 leading-relaxed text-sm">
                Browse available rides. Find a match for your destination.
            </p>
            </Link>
        </div>
      )}

      <CreateRideModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onRideCreated={() => {}} // No need to manually refresh, listener handles it!
      />
    </div>
  );
}
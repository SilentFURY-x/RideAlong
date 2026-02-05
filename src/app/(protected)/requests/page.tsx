"use client";

import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { JoinRequest } from "@/types";
import { Loader2, Send, CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";

export default function RequestsPage() {
  const { user } = useAuth();
  const [myRequests, setMyRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Fetch requests where userId == ME
    const q = query(collection(db, "requests"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reqs: JoinRequest[] = [];
      snapshot.forEach((doc) => reqs.push({ id: doc.id, ...doc.data() } as JoinRequest));
      // Sort by newest
      reqs.sort((a, b) => b.timestamp - a.timestamp);
      setMyRequests(reqs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) return <div className="flex justify-center pt-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Requests</h1>
        <p className="text-slate-500">Track the status of your join requests</p>
      </div>

      {myRequests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No requests sent yet</h3>
            <p className="text-slate-500 text-sm mb-6">Found a ride you like? Request to join!</p>
            <Link href="/explore" className="px-6 py-2 bg-[#0F4C75] text-white rounded-lg font-medium hover:bg-[#0F4C75]/90">
                Explore Rides
            </Link>
        </div>
      ) : (
        <div className="grid gap-4">
            {myRequests.map((req) => (
                <div key={req.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-400 font-semibold uppercase mb-1">Status</p>
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                            req.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                        }`}>
                            {req.status === 'accepted' && <CheckCircle className="w-4 h-4" />}
                            {req.status === 'rejected' && <XCircle className="w-4 h-4" />}
                            {req.status === 'pending' && <Clock className="w-4 h-4" />}
                            {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                        </div>
                    </div>
                    
                    <div className="text-right">
                         <p className="text-sm text-slate-500">Ride ID: {req.rideId.slice(0, 6)}...</p>
                         <Link href={`/rides/${req.rideId}`} className="text-[#0F4C75] text-sm font-semibold hover:underline">
                            View Ride
                         </Link>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
}
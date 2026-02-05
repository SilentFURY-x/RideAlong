"use client";

import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { useEffect, useState } from "react";
import { JoinRequest } from "@/types";
import { Loader2, Send, Inbox, CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import RequestAction from "@/components/rides/RequestAction";

export default function RequestsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [sentRequests, setSentRequests] = useState<JoinRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<JoinRequest[]>([]);

  useEffect(() => {
    if (!user) return;

    // 1. Query: Requests I SENT (Outbox)
    const qSent = query(collection(db, "requests"), where("userId", "==", user.uid));
    
    // 2. Query: Requests I RECEIVED (Inbox)
    // Note: This relies on the 'hostId' field we just added in Step 1
    const qReceived = query(collection(db, "requests"), where("hostId", "==", user.uid));

    const unsubSent = onSnapshot(qSent, (snapshot) => {
      const reqs: JoinRequest[] = [];
      snapshot.forEach((doc) => reqs.push({ id: doc.id, ...doc.data() } as JoinRequest));
      reqs.sort((a, b) => b.timestamp - a.timestamp);
      setSentRequests(reqs);
    });

    const unsubReceived = onSnapshot(qReceived, (snapshot) => {
      const reqs: JoinRequest[] = [];
      snapshot.forEach((doc) => reqs.push({ id: doc.id, ...doc.data() } as JoinRequest));
      reqs.sort((a, b) => b.timestamp - a.timestamp);
      setReceivedRequests(reqs);
      setLoading(false);
    });

    return () => {
        unsubSent();
        unsubReceived();
    };
  }, [user]);

  // --- ACTIONS (For Received Requests) ---
  const handleAccept = async (req: JoinRequest) => {
    try {
      await updateDoc(doc(db, "requests", req.id), { status: "accepted" });
      await updateDoc(doc(db, "rides", req.rideId), {
        passengers: arrayUnion(req.userId)
      });
      toast.success(`Accepted ${req.userName}`);
    } catch (error) {
      toast.error("Error accepting request");
    }
  };

  const handleReject = async (req: JoinRequest) => {
    try {
      await updateDoc(doc(db, "requests", req.id), { status: "rejected" });
      toast.success("Request rejected");
    } catch (error) {
      toast.error("Error rejecting request");
    }
  };

  if (loading) return <div className="flex justify-center pt-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Requests</h1>
        <p className="text-slate-500">Manage your incoming and outgoing ride requests</p>
      </div>

      {/* TABS */}
      <div className="flex p-1 bg-slate-100 rounded-xl w-full max-w-md">
        <button
            onClick={() => setActiveTab("received")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === "received" ? "bg-white text-[#0F4C75] shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
        >
            <Inbox className="w-4 h-4" />
            Received ({receivedRequests.filter(r => r.status === 'pending').length})
        </button>
        <button
            onClick={() => setActiveTab("sent")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === "sent" ? "bg-white text-[#0F4C75] shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
        >
            <Send className="w-4 h-4" />
            Sent ({sentRequests.length})
        </button>
      </div>

      {/* --- RECEIVED TAB (INBOX) --- */}
      {activeTab === "received" && (
        <div className="space-y-4">
            {receivedRequests.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                    <p className="text-slate-400">No incoming requests yet.</p>
                </div>
            ) : (
                receivedRequests.map(req => (
                    // We reuse the RequestAction component here!
                    // If it's already handled, we show a simplified status view
                    req.status === 'pending' ? (
                        <div key={req.id} className="relative">
                            <div className="absolute top-0 right-0 bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-xl z-10">
                                PENDING ACTION
                            </div>
                            <RequestAction 
                                request={req} 
                                onAccept={handleAccept} 
                                onReject={handleReject} 
                            />
                        </div>
                    ) : (
                        <div key={req.id} className="bg-white p-4 rounded-xl border border-slate-200 opacity-75 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500">
                                    {req.userName.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-700">{req.userName}</p>
                                    <p className="text-xs text-slate-400">Request Processed</p>
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                req.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                                {req.status}
                            </span>
                        </div>
                    )
                ))
            )}
        </div>
      )}

      {/* --- SENT TAB (OUTBOX) --- */}
      {activeTab === "sent" && (
        <div className="space-y-4">
            {sentRequests.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                    <p className="text-slate-400">You haven't sent any requests.</p>
                    <Link href="/explore" className="text-[#0F4C75] text-sm font-semibold hover:underline mt-2 inline-block">
                        Find a ride
                    </Link>
                </div>
            ) : (
                sentRequests.map((req) => (
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
                             <Link href={`/rides/${req.rideId}`} className="text-[#0F4C75] text-sm font-semibold hover:underline">
                                View Ride Details
                             </Link>
                        </div>
                    </div>
                ))
            )}
        </div>
      )}
    </div>
  );
}
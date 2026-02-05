"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { 
  doc, onSnapshot, collection, query, where, 
  addDoc, updateDoc, arrayUnion, arrayRemove, deleteDoc, getDocs 
} from "firebase/firestore";
import { Ride, JoinRequest } from "@/types";
import { Loader2, ArrowLeft, Phone, Mail, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

// Components
import RideInfoGrid from "@/components/rides/RideInfoGrid";
import PassengerList from "@/components/rides/PassengerList";
import RequestAction from "@/components/rides/RequestAction";

export default function RideDetailsPage() {
  const { id } = useParams() as { id: string }; // Get ID from URL
  const { user } = useAuth();
  const router = useRouter();

  // State
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [myRequest, setMyRequest] = useState<JoinRequest | null>(null);

  // 1. Fetch Ride Data (Real-time)
  useEffect(() => {
    if (!id) return;
    const unsubscribe = onSnapshot(doc(db, "rides", id), (doc) => {
      if (doc.exists()) {
        setRide({ id: doc.id, ...doc.data() } as Ride);
      } else {
        router.push("/explore"); // Redirect if deleted
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id, router]);

  // 2. Fetch Requests (If Host) OR Check My Request (If Guest)
  useEffect(() => {
    if (!user || !ride) return;

    if (user.uid === ride.hostId) {
      // I am HOST: Listen to ALL incoming requests
      const q = query(collection(db, "requests"), where("rideId", "==", ride.id));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const reqs: JoinRequest[] = [];
        snapshot.forEach((doc) => reqs.push({ id: doc.id, ...doc.data() } as JoinRequest));
        setRequests(reqs.filter(r => r.status === "pending")); // Only show pending
      });
      return () => unsubscribe();
    } else {
      // I am GUEST: Check if I already sent a request
      const q = query(
        collection(db, "requests"), 
        where("rideId", "==", ride.id),
        where("userId", "==", user.uid)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
            setMyRequest({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as JoinRequest);
        } else {
            setMyRequest(null);
        }
      });
      return () => unsubscribe();
    }
  }, [user, ride]);

  // --- ACTIONS ---

  // Guest: Send Request
  const handleJoinRequest = async () => {
    if (!user || !ride) return;
    if (ride.passengers.length >= ride.seats) {
        toast.error("Ride is full!");
        return;
    }
    
    try {
      await addDoc(collection(db, "requests"), {
        rideId: ride.id,
        userId: user.uid,
        userName: user.displayName,
        userEmail: user.email,
        status: "pending",
        timestamp: Date.now()
      });
      toast.success("Request sent successfully!");
    } catch (error) {
      toast.error("Failed to send request.");
    }
  };

  // Host: Accept Request
  const handleAccept = async (req: JoinRequest) => {
    if (!ride) return;
    if (ride.passengers.length >= ride.seats) {
        toast.error("No seats left!");
        return;
    }

    try {
      // 1. Update Request Status
      await updateDoc(doc(db, "requests", req.id), { status: "accepted" });
      
      // 2. Add User to Ride Passengers
      await updateDoc(doc(db, "rides", ride.id!), {
        passengers: arrayUnion(req.userId)
      });
      
      toast.success(`Accepted ${req.userName}`);
    } catch (error) {
      toast.error("Error accepting request");
    }
  };

  // Host: Reject Request
  const handleReject = async (req: JoinRequest) => {
    try {
      await updateDoc(doc(db, "requests", req.id), { status: "rejected" });
      toast.success("Request rejected");
    } catch (error) {
      toast.error("Error rejecting request");
    }
  };

  // Host: Remove Passenger
  const handleRemovePassenger = async (passengerId: string) => {
    if(!ride) return;
    if(!confirm("Remove this passenger?")) return;

    try {
        await updateDoc(doc(db, "rides", ride.id!), {
            passengers: arrayRemove(passengerId)
        });
        toast.success("Passenger removed");
        // Optional: Find their request and set it back to rejected or deleted so they can't re-join instantly
    } catch (error) {
        toast.error("Error removing passenger");
    }
  };

  if (loading) return <div className="flex justify-center pt-20"><Loader2 className="animate-spin" /></div>;
  if (!ride || !user) return null;

  const isHost = user.uid === ride.hostId;
  const isPassenger = ride.passengers.includes(user.uid);
  const seatsLeft = ride.seats - ride.passengers.length;

  return (
    <div className="space-y-8 pb-20">
      {/* Back Button */}
      <Link href="/explore" className="inline-flex items-center text-slate-500 hover:text-[#0F4C75] transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to All Rides
      </Link>

      {/* 1. Header Info Grid */}
      <RideInfoGrid ride={ride} />

      {/* 2. Host Info Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <div className="w-2 h-2 bg-[#0F4C75] rounded-full" />
            Host Details
        </h3>
        <div className="flex items-center justify-between flex-wrap gap-4 bg-slate-50 p-4 rounded-xl">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#0F4C75] shadow-sm">
                    <UserIcon className="w-6 h-6" />
                </div>
                <div>
                    <p className="font-bold text-slate-900">{ride.hostName}</p>
                    <p className="text-sm text-slate-500">{ride.hostEmail}</p>
                </div>
            </div>
            
            {/* Contact Info (Only visible if you are Host or Passenger) */}
            {(isHost || isPassenger) ? (
                 <div className="flex items-center gap-4 text-slate-600">
                    <a href={`tel:${ride.contact}`} className="flex items-center gap-2 hover:text-[#0F4C75]">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm font-medium">{ride.contact}</span>
                    </a>
                    <a href={`mailto:${ride.hostEmail}`} className="flex items-center gap-2 hover:text-[#0F4C75]">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm font-medium">Email Host</span>
                    </a>
                 </div>
            ) : (
                <div className="text-xs text-slate-400 italic">
                    Contact details visible after joining.
                </div>
            )}
        </div>
      </div>

      {/* 3. Passengers List */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <div className="w-2 h-2 bg-[#0F4C75] rounded-full" />
            Current Passengers ({ride.passengers.length})
        </h3>
        <PassengerList 
            passengers={ride.passengers} 
            isHost={isHost} 
            onRemove={handleRemovePassenger} 
        />
      </div>

      {/* 4. Requests List (HOST ONLY) */}
      {isHost && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    Join Requests ({requests.length})
                </h3>
            </div>
            
            {requests.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No pending requests.</p>
            ) : (
                <div className="space-y-3">
                    {requests.map(req => (
                        <RequestAction 
                            key={req.id} 
                            request={req} 
                            onAccept={handleAccept} 
                            onReject={handleReject} 
                        />
                    ))}
                </div>
            )}
        </div>
      )}

      {/* 5. Join Button (GUEST ONLY) */}
      {!isHost && !isPassenger && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] md:relative md:bg-transparent md:border-none md:shadow-none md:p-0">
            {myRequest ? (
                <div className={`w-full p-4 rounded-xl text-center font-semibold ${
                    myRequest.status === 'pending' ? 'bg-yellow-50 text-yellow-700' : 
                    myRequest.status === 'rejected' ? 'bg-red-50 text-red-700' : ''
                }`}>
                    {myRequest.status === 'pending' && "Request Sent - Waiting for Host"}
                    {myRequest.status === 'rejected' && "Your request was declined."}
                </div>
            ) : seatsLeft > 0 ? (
                <button 
                    onClick={handleJoinRequest}
                    className="w-full py-4 bg-[#0F4C75] text-white rounded-xl font-bold text-lg hover:bg-[#0F4C75]/90 transition-all shadow-lg active:scale-[0.98]"
                >
                    Request to Join Ride
                </button>
            ) : (
                <button disabled className="w-full py-4 bg-slate-100 text-slate-400 rounded-xl font-bold text-lg cursor-not-allowed">
                    Ride Full
                </button>
            )}
        </div>
      )}
    </div>
  );
}
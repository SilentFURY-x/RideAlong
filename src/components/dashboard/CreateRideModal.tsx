"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Calendar, Clock, Phone, Users, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner"; // Beautiful alerts

interface CreateRideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRideCreated: () => void; // Callback to refresh dashboard
}

export default function CreateRideModal({ isOpen, onClose, onRideCreated }: CreateRideModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    source: "",
    destination: "",
    date: "",
    time: "",
    contact: "",
    seats: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      // 1. Create the Ride Object
      const newRide = {
        hostId: user.uid,
        hostName: user.displayName || "Anonymous",
        hostEmail: user.email || "",
        source: formData.source,
        destination: formData.destination,
        date: formData.date,
        time: formData.time,
        seats: Number(formData.seats),
        contact: formData.contact,
        passengers: [], // Empty initially
        status: "active",
        createdAt: Date.now(),
      };

      // 2. Save to Firestore "rides" collection
      await addDoc(collection(db, "rides"), newRide);

      // 3. Success!
      toast.success("Ride Created Successfully!");
      onRideCreated(); // Refresh parent
      onClose(); // Close modal
      
      // Reset form
      setFormData({ source: "", destination: "", date: "", time: "", contact: "", seats: 1 });
    } catch (error) {
      console.error("Error creating ride:", error);
      toast.error("Failed to create ride. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden pointer-events-auto">
              
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Create a Ride</h2>
                  <p className="text-sm text-slate-500">Share your journey with fellow students</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                
                {/* Source */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Starting Point</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                      required
                      type="text"
                      placeholder="e.g., VIT Main Gate"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C75] focus:bg-white transition-all"
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    />
                  </div>
                </div>

                {/* Destination */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Destination</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                      required
                      type="text"
                      placeholder="e.g., Chennai Airport"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C75] focus:bg-white transition-all"
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    />
                  </div>
                </div>

                {/* Date & Time Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                      <input
                        required
                        type="date"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C75] focus:bg-white transition-all text-slate-600"
                        value={formData.date}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                      <input
                        required
                        type="time"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C75] focus:bg-white transition-all text-slate-600"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Contact & Seats Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                      <input
                        required
                        type="tel"
                        placeholder="+91 98765..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C75] focus:bg-white transition-all"
                        value={formData.contact}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Seats</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                      <input
                        required
                        type="number"
                        min="1"
                        max="6"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C75] focus:bg-white transition-all"
                        value={formData.seats}
                        onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-3 text-white bg-[#0F4C75] hover:bg-[#0F4C75]/90 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Ride"}
                  </button>
                </div>
              </form>
              
              {/* Note */}
              <div className="px-6 py-3 bg-blue-50/50 border-t border-blue-100">
                <p className="text-xs text-blue-600/80 text-center">
                  Note: You cannot join other rides while hosting one.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
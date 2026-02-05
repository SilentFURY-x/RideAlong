export interface Ride {
  id?: string; // Optional because Firestore creates it for us
  hostId: string;
  hostName: string;
  hostEmail: string;
  source: string;
  destination: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  seats: number;
  contact: string;
  passengers: string[]; // Array of User IDs who joined
  status: "active" | "completed" | "cancelled";
  createdAt: number;
}

export interface JoinRequest {
  id: string;
  rideId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhoto?: string;
  status: "pending" | "accepted" | "rejected";
  timestamp: number;
}
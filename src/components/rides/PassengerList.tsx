import { User as UserIcon, Trash2 } from "lucide-react";

interface Passenger {
  id: string;
  name: string; // In a real app, you'd fetch full profiles. We'll store basic info for now.
}

interface PassengerListProps {
  passengers: string[]; // List of User IDs
  isHost: boolean;
  onRemove: (userId: string) => void;
}

export default function PassengerList({ passengers, isHost, onRemove }: PassengerListProps) {
  if (passengers.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
        <p className="text-slate-500 text-sm">No passengers have joined yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {passengers.map((passengerId, index) => (
        <div key={passengerId} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-slate-400" />
            </div>
            <div>
                {/* In a real app, we would fetch the name from the ID. For now, we show a placeholder or ID */}
                <p className="font-medium text-slate-900">Passenger {index + 1}</p>
                <p className="text-xs text-slate-400">ID: {passengerId.slice(0, 8)}...</p>
            </div>
          </div>
          
          {isHost && (
            <button 
                onClick={() => onRemove(passengerId)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
                <Trash2 className="w-3 h-3" />
                Remove
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
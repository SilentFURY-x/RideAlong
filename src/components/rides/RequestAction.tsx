import { JoinRequest } from "@/types";
import { Check, X } from "lucide-react";

interface RequestActionProps {
  request: JoinRequest;
  onAccept: (req: JoinRequest) => void;
  onReject: (req: JoinRequest) => void;
}

export default function RequestAction({ request, onAccept, onReject }: RequestActionProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-200 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-[#0F4C75] font-bold">
            {request.userName.charAt(0)}
        </div>
        <div>
            <p className="font-bold text-slate-900">{request.userName}</p>
            <p className="text-xs text-slate-500">{request.userEmail}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button 
            onClick={() => onAccept(request)}
            className="flex items-center gap-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-all shadow-sm active:scale-95"
        >
            <Check className="w-4 h-4" />
            Accept
        </button>
        <button 
            onClick={() => onReject(request)}
            className="flex items-center gap-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-all shadow-sm active:scale-95"
        >
            <X className="w-4 h-4" />
            Reject
        </button>
      </div>
    </div>
  );
}
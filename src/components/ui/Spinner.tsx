import { User } from "lucide-react";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: "sm" | "md" | "lg";
}

export default function Avatar({ src, alt, size = "md" }: AvatarProps) {
  // Size classes map
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shrink-0`}
    >
      {src ? (
        <img
          src={src}
          alt={alt || "User"}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer" // <--- THIS IS THE MAGIC FIX
          onError={(e) => {
            // Fallback if image fails to load
            e.currentTarget.style.display = "none";
            e.currentTarget.parentElement?.classList.add("fallback-active");
          }}
        />
      ) : (
        <User className="w-1/2 h-1/2 text-slate-400" />
      )}
      
      {/* Fallback Icon (Hidden by default, shown if image fails/missing) */}
      <div className="hidden fallback-active:flex w-full h-full items-center justify-center bg-slate-100 absolute inset-0">
          <User className="w-1/2 h-1/2 text-slate-400" />
      </div>
    </div>
  );
}
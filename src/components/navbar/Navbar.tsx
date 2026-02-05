"use client";

import { useAuth } from "@/context/AuthContext";
import { Car, LayoutDashboard, Search, Send, LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Explore", href: "/explore", icon: Search },
    { name: "Requests", href: "/requests", icon: Send },
  ];

  return (
    // FIX: Enhanced glassmorphism classes
    <div className="sticky top-4 z-50 mx-4 md:mx-auto max-w-7xl">
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 overflow-hidden supports-[backdrop-filter]:bg-white/50">
        <div className="px-4 sm:px-6 lg:px-8">
          
          {/* Top Row: Logo & User Profile */}
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#0F4C75] rounded-lg flex items-center justify-center shadow-md">
                <Car className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-[#0F4C75] tracking-tight">RideAlong</span>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 text-right">
                <div className="hidden sm:block">
                  <p className="text-sm font-bold text-slate-800 leading-none">
                    {user?.displayName || "Student"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    {user?.email}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                  {user?.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="User" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <UserIcon className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>
              <button 
                onClick={logout}
                className="p-2 hover:bg-red-50 rounded-full text-slate-400 hover:text-red-500 transition-all duration-200"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Bottom Row: Navigation Pills */}
          <div className="flex items-center gap-2 pb-4 overflow-x-auto">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-300",
                    isActive
                      ? "bg-[#0F4C75] text-white shadow-md transform scale-105"
                      : "bg-slate-100/50 text-slate-600 hover:bg-slate-100 hover:text-[#0F4C75]"
                  )}
                >
                  <item.icon className={cn("w-4 h-4", isActive && "animate-pulse")} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
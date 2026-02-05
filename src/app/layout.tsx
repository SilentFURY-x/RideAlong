import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import CustomCursor from "@/components/ui/CustomCursor";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RideAlong",
  description: "VIT Student Carpool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {/* Background is fixed at z-index -1 */}
          <AnimatedBackground />
          
          {/* Cursor is fixed at z-index 9999 */}
          <CustomCursor />
          
          {/* Main App Content */}
          <div className="relative z-0">
            {children}
          </div>
          
          <Toaster position="bottom-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
"use client";

import { ReactNode, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * DashboardLayout Component
 * 
 * Group Project Documentation:
 * Refactored static dark theme styles (`bg-black`, `text-white`) to semantic theme-aware Tailwind classes:
 * - `bg-background` matches the active background (light grey for light mode / pure black for dark mode).
 * - `text-text-primary` maps to the high-contrast main typography color.
 * Added mobile responsiveness by managing sidebar state.
 */
const DashboardLayout = ({
  children,
}: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on mobile when navigating to a new route
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-background text-text-primary overflow-hidden">

      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">

        {/* Navbar */}
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Page Content */}
        <main className="p-4 md:p-6 w-full max-w-full">
          {children}
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;
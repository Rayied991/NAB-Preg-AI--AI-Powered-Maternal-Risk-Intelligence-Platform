import { ReactNode } from "react";

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
 */
const DashboardLayout = ({
  children,
}: DashboardLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-background text-text-primary">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* Navbar */}
        <Navbar />

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;
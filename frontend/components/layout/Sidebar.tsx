"use client";

import {
  BarChart3,
  Bell,
  ClipboardClock,
  Hospital,
  LayoutDashboard,
  Upload,
  Users
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";


const menuItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Patients",
    href: "/patients",
    icon: Users,
  },
  {
    name: "Upload Reports",
    href: "/upload",
    icon: Upload,
  },
  {
    name: "Alerts",
    href: "/alerts",
    icon: Bell,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    name: "Prediction History",
    href: "/history",
    icon: ClipboardClock,
  },
  {
  name: "Clinical Assistant",
  href: "/assistant",
  icon: Hospital 
  }
];

export default function Sidebar() {
    const pathname = usePathname();
  return (
    <aside className="w-64 min-h-screen bg-zinc-950 border-r border-zinc-800 p-6">

      {/* Logo */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-white">
          NAB Preg AI
        </h1>

        <p className="text-sm text-zinc-400 mt-1">
          Maternal Risk Platform
        </p>
      </div>

      {/* Navigation */}
      <nav className="space-y-3">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
             className={`
                flex items-center gap-3
                p-3 rounded-xl
                transition-all
                ${
                    pathname === item.href
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                }
                `}
            >
              <Icon size={20} />

              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
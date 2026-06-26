"use client";

/**
 * Sidebar Component
 * 
 * Group Project Documentation:
 * Converted hardcoded color schemes to support dynamic theme properties:
 * - Aside panel swapped from `bg-zinc-950` to `bg-panel` and `border-zinc-800` to `border-border-custom`.
 * - Sidebar branding text mapped to `text-text-primary` and subtitle to `text-text-muted`.
 * - Navigation links now transition dynamically:
 *   - Active links: `bg-item-active text-text-primary`
 *   - Inactive links: `text-text-secondary hover:bg-item-hover hover:text-text-primary`
 * Added mobile responsiveness: acts as a fixed drawer on screens < 768px.
 */

import {
  BarChart3,
  Bell,
  ClipboardClock,
  GitGraph,
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
  },
  {
    name:"Knowledge Graph",
    href:"/graph",
    icon: GitGraph 
  }
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
    const pathname = usePathname();
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300" 
          onClick={onClose} 
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 min-h-screen bg-panel border-r border-border-custom p-6 transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary transition-colors duration-300">
              NAB Preg AI
            </h1>
            <p className="text-sm text-text-muted mt-1 transition-colors duration-300">
              Maternal Risk Platform
            </p>
          </div>
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
                  duration-300
                  ${
                      pathname === item.href
                      ? "bg-item-active text-text-primary font-semibold shadow-sm"
                      : "text-text-secondary hover:bg-item-hover hover:text-text-primary"
                  }
                  `}
              >
                <Icon size={20} className="transition-colors duration-300" />

                <span className="transition-colors duration-300">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
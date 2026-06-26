"use client";

/**
 * Navbar Component
 * 
 * Group Project Documentation:
 * 1. Connected useTheme hook to access the active theme and toggle context.
 * 2. Added a theme switcher button (Sun/Moon icons) with nice hover styles next to the Bell notification button.
 * 3. Updated styles:
 *    - Main header swapped from zinc-950 to theme-aware `bg-panel` (white in light mode, zinc-950 in dark mode)
 *    - Search input wrapper adapted to `bg-input-bg` with a subtle `border-border-custom` for high light mode contrast.
 *    - Icon and text labels mapped to `text-text-primary`, `text-text-secondary`, and `text-text-muted`.
 * 4. Added responsive hamburger menu for mobile devices.
 */

import { Sun, Moon, Menu } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="w-full h-20 border-b border-border-custom bg-panel px-4 md:px-6 flex items-center justify-between md:justify-end transition-colors duration-300">

      {/* Mobile Menu Button */}
      <button 
        onClick={onMenuClick}
        className="md:hidden p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-item-hover transition-colors"
        aria-label="Open sidebar"
      >
        <Menu size={24} />
      </button>

      {/* Right Section */}
      <div className="flex items-center gap-5">

        {/* Light/Dark Mode Switcher Button */}
        <button
          onClick={toggleTheme}
          className="
            p-2.5 rounded-xl bg-input-bg hover:bg-item-hover border border-border-custom 
            text-text-secondary hover:text-text-primary transition-all duration-300
            flex items-center justify-center cursor-pointer shadow-sm active:scale-95
          "
          aria-label="Toggle light or dark theme"
        >
          {theme === "light" ? (
            <Moon size={18} className="animate-pulse" />
          ) : (
            <Sun size={18} className="text-yellow-400 animate-spin-slow" />
          )}
        </button>

      </div>
    </header>
  );
}
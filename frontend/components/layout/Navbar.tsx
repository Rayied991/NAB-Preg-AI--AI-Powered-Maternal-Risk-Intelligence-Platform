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
 */

import { Bell, Search, UserCircle2, Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="w-full h-20 border-b border-border-custom bg-panel px-6 flex items-center justify-between transition-colors duration-300">

      {/* Search */}
      <div className="flex items-center gap-3 bg-input-bg border border-border-custom px-4 py-2 rounded-xl w-80 transition-colors duration-300">
        <Search size={18} className="text-text-muted transition-colors duration-300" />

        <input
          type="text"
          placeholder="Search patients..."
          className="
            bg-transparent
            outline-none
            text-sm
            text-text-primary
            placeholder:text-text-muted
            w-full
            transition-colors
            duration-300
          "
        />
      </div>

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

        <button className="relative p-1 hover:bg-item-hover rounded-lg transition-colors duration-300">
          <Bell className="text-text-secondary hover:text-text-primary transition-colors duration-300" />

          <span className="
            absolute top-1 right-1
            w-2 h-2 bg-red-500 rounded-full
          " />
        </button>

        <UserCircle2
          size={34}
          className="text-text-secondary hover:text-text-primary cursor-pointer transition-colors duration-300"
        />
      </div>
    </header>
  );
}
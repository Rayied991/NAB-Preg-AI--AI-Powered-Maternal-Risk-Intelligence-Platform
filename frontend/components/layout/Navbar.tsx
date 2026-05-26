"use client";

import { Bell, Search, UserCircle2 } from "lucide-react";

export default function Navbar() {
  return (
    <header className="w-full h-20 border-b border-zinc-800 bg-zinc-950 px-6 flex items-center justify-between">

      {/* Search */}
      <div className="flex items-center gap-3 bg-zinc-900 px-4 py-2 rounded-xl w-80">
        <Search size={18} className="text-zinc-400" />

        <input
          type="text"
          placeholder="Search patients..."
          className="
            bg-transparent
            outline-none
            text-sm
            text-white
            w-full
          "
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-5">

        <button className="relative">
          <Bell className="text-zinc-300" />

          <span className="
            absolute -top-1 -right-1
            w-2 h-2 bg-red-500 rounded-full
          " />
        </button>

        <UserCircle2
          size={34}
          className="text-zinc-300"
        />
      </div>
    </header>
  );
}
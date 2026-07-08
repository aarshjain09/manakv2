import {
  Bell,
  Search,
  UserCircle2
} from "lucide-react";

export default function Header() {
  return (
    <header className="fixed top-0 left-72 right-0 h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-40">

      {/* Left */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Dashboard
        </h1>

        <p className="text-sm text-slate-500">
          Welcome back, Admin
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-5">

        {/* Search */}

        <div className="hidden lg:flex items-center bg-slate-100 rounded-xl px-4 h-11 w-80">

          <Search
            size={18}
            className="text-slate-500"
          />

          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none ml-3 w-full text-sm"
          />

        </div>

        {/* Notification */}

        <button className="relative w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 transition flex items-center justify-center">

          <Bell
            size={20}
            className="text-slate-700"
          />

          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500"></span>

        </button>

        {/* Profile */}

        <div className="flex items-center gap-3">

          <UserCircle2
            size={40}
            className="text-primary"
          />

          <div className="hidden md:block">

            <h3 className="font-semibold text-slate-800">
              Admin
            </h3>

            <p className="text-xs text-slate-500">
              Administrator
            </p>

          </div>

        </div>

      </div>

    </header>
  );
}
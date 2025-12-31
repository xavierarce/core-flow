"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Command, Settings, LayoutDashboard } from "lucide-react";
import { AppButton } from "./AppButton"; // 👈 Changed Import

export const Navbar = () => {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* LEFT: Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white shadow-lg shadow-slate-900/20 group-hover:scale-105 transition-transform duration-200">
            <Command size={16} strokeWidth={3} />
          </div>
          <span className="font-bold tracking-tight text-lg text-slate-900">
            CoreFlow
          </span>
        </Link>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-2">
          {/* Dashboard Link (Only visible if not on dashboard) */}
          {pathname !== "/" && (
            <Link href="/">
              <AppButton
                variant="ghost"
                size="sm"
                className="text-slate-500 hover:text-slate-900"
              >
                <LayoutDashboard size={16} className="mr-2" />
                Dashboard
              </AppButton>
            </Link>
          )}

          {/* Settings Link */}
          <Link href="/settings">
            <AppButton
              variant="ghost"
              size="icon"
              className={
                isActive("/settings")
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-400 hover:text-slate-900"
              }
            >
              <Settings size={20} strokeWidth={2} />
            </AppButton>
          </Link>

          {/* Divider */}
          <div className="h-4 w-px bg-slate-200 mx-2" />

          {/* User Profile (Placeholder for Auth) */}
          <AppButton
            variant="ghost"
            className="gap-2 pl-2 pr-4 rounded-full hover:bg-slate-100 group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shadow-sm ring-2 ring-white">
              XA
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-slate-700 leading-none">
                Xavier
              </p>
              <p className="text-[10px] text-slate-400 leading-none mt-1 group-hover:text-emerald-600">
                Pro Plan
              </p>
            </div>
          </AppButton>
        </div>
      </div>
    </nav>
  );
};

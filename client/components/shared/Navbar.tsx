"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Command,
  Settings,
  LayoutDashboard,
  CreditCard,
  Landmark,
  Wallet,
} from "lucide-react";
import { AppButton } from "./AppButton";
import { UserButton, useUser } from "@clerk/nextjs"; // 👈 Import hook

export const Navbar = () => {
  const pathname = usePathname();
  const { user, isLoaded } = useUser(); // 👈 Get real user data

  const isActive = (path: string) => pathname === path;

  // 🗺️ Your Sitemap
  const navLinks = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Transactions", href: "/transactions", icon: CreditCard },
    { name: "Wealth", href: "/assets", icon: Landmark },
    { name: "Accounts", href: "/accounts", icon: Wallet },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* LEFT: Brand & Main Nav */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white shadow-lg shadow-slate-900/20 group-hover:scale-105 transition-transform duration-200">
              <Command size={16} strokeWidth={3} />
            </div>
            <span className="font-bold tracking-tight text-lg text-slate-900 hidden md:block">
              XAC Capital
            </span>
          </Link>

          {/* 🧭 Main Navigation (Hidden on mobile, visible on desktop) */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href}>
                  <AppButton
                    variant="ghost"
                    size="sm"
                    className={`
                      gap-2 transition-all duration-200
                      ${
                        isActive(link.href)
                          ? "bg-slate-100 text-slate-900 font-medium"
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                      }
                    `}
                  >
                    <Icon size={16} />
                    {link.name}
                  </AppButton>
                </Link>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-2">
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
          <div className="h-6 w-px bg-slate-200 mx-2" />

          {/* 👤 User Profile (Clean & Correct) */}
          <div className="flex items-center gap-3 pl-2">
            {/* Text Info (Hidden on mobile) */}
            {isLoaded && user && (
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-700 leading-none">
                  {user.fullName || user.firstName || "User"}
                </p>
                <p className="text-[10px] text-slate-400 leading-none mt-1 group-hover:text-emerald-600">
                  {/* Fallback to 'Free' if no metadata set yet */}
                  {(user.publicMetadata.plan as string) || "Free Plan"}
                </p>
              </div>
            )}

            <UserButton
              appearance={{
                elements: {
                  avatarBox:
                    "w-9 h-9 border-2 border-slate-100 hover:border-slate-300 transition-colors",
                },
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Command, Settings, LayoutDashboard, CreditCard, Landmark, Wallet } from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import { AppButton } from "./AppButton";
import { ThemeToggle } from "./ThemeToggle";

const NAV_LINKS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Transactions", href: "/transactions", icon: CreditCard },
  { name: "Wealth", href: "/assets", icon: Landmark },
  { name: "Accounts", href: "/accounts", icon: Wallet },
];

export const Navbar = () => {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* LEFT: Brand + Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-emerald-900/30 group-hover:scale-105 transition-transform duration-200">
              <Command size={16} strokeWidth={3} />
            </div>
            <span className="font-bold tracking-tight text-lg text-foreground hidden md:block">
              XAC Capital
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ name, href, icon: Icon }) => (
              <Link key={href} href={href}>
                <AppButton
                  variant="ghost"
                  size="sm"
                  className={`gap-2 transition-all duration-200 ${
                    isActive(href)
                      ? "bg-accent text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <Icon size={16} />
                  {name}
                </AppButton>
              </Link>
            ))}
          </div>
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-1">
          <ThemeToggle />

          <Link href="/settings">
            <AppButton
              variant="ghost"
              size="icon"
              className={
                isActive("/settings")
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }
            >
              <Settings size={20} strokeWidth={2} />
            </AppButton>
          </Link>

          <div className="h-6 w-px bg-border mx-2" />

          <div className="flex items-center gap-3 pl-1">
            {isLoaded && user && (
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-foreground leading-none">
                  {user.fullName || user.firstName || "User"}
                </p>
                <p className="text-[10px] text-muted-foreground leading-none mt-1">
                  {(user.publicMetadata.plan as string) || "Free Plan"}
                </p>
              </div>
            )}
            <UserButton
              appearance={{
                elements: {
                  avatarBox:
                    "w-9 h-9 border-2 border-border hover:border-emerald-500 transition-colors",
                },
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

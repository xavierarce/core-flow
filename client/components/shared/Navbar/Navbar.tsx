"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Command, Settings, Menu } from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AppButton } from "../AppButton/AppButton";
import { ThemeToggle } from "../ThemeToggle";
import { NAV_LINKS } from "./Navbar.utils";

/**
 * @component Navbar
 * Sticky top navigation bar with brand, primary nav links, settings, and user avatar.
 * Includes a mobile drawer for small screens.
 */
export const Navbar = () => {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* LEFT: Brand + Desktop Nav */}
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

          <Link href="/settings" className="hidden md:block">
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

          <div className="hidden md:block h-6 w-px bg-border mx-2" />

          <div className="hidden md:flex items-center gap-3 pl-1">
            {isLoaded && user && (
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-foreground leading-none">
                  {user.fullName ?? user.firstName ?? "User"}
                </p>
                <p className="text-[10px] text-muted-foreground leading-none mt-1">
                  {(user.publicMetadata.plan as string) ?? "Free Plan"}
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

          {/* Mobile: hamburger + avatar */}
          <div className="flex items-center gap-2 md:hidden">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 border-2 border-border",
                },
              }}
            />
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <AppButton
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Open menu"
                >
                  <Menu size={20} />
                </AppButton>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 bg-background border-border p-0">
                <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
                  <SheetTitle className="flex items-center gap-2 text-foreground">
                    <div className="w-7 h-7 bg-emerald-600 rounded-md flex items-center justify-center text-white">
                      <Command size={14} strokeWidth={3} />
                    </div>
                    XAC Capital
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-1 px-3 py-4">
                  {NAV_LINKS.map(({ name, href, icon: Icon }) => (
                    <Link key={href} href={href} onClick={() => setMobileOpen(false)}>
                      <AppButton
                        variant="ghost"
                        size="sm"
                        className={`w-full justify-start gap-3 text-sm ${
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

                  <div className="my-2 h-px bg-border" />

                  <Link href="/settings" onClick={() => setMobileOpen(false)}>
                    <AppButton
                      variant="ghost"
                      size="sm"
                      className={`w-full justify-start gap-3 text-sm ${
                        isActive("/settings")
                          ? "bg-accent text-foreground font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      <Settings size={16} />
                      Settings
                    </AppButton>
                  </Link>
                </div>

                {isLoaded && user && (
                  <div className="absolute bottom-6 left-0 right-0 px-6">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                      <UserButton
                        appearance={{
                          elements: { avatarBox: "w-8 h-8 border border-border" },
                        }}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">
                          {user.fullName ?? user.firstName ?? "User"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {(user.publicMetadata.plan as string) ?? "Free Plan"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

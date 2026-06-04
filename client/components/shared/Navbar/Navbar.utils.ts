import { LayoutDashboard, CreditCard, Landmark, Wallet } from "lucide-react";

/**
 * @function NAV_LINKS
 * Primary navigation links with their display name, href, and icon.
 */
export const NAV_LINKS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Transactions", href: "/transactions", icon: CreditCard },
  { name: "Wealth", href: "/assets", icon: Landmark },
  { name: "Accounts", href: "/accounts", icon: Wallet },
];

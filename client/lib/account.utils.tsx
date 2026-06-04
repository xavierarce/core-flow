import { Wallet, Building2, TrendingUp, Bitcoin, Home, PiggyBank } from "lucide-react";

const ICON_MAP: Record<string, React.ReactNode> = {
  INVESTMENT: <TrendingUp className="text-purple-500" />,
  TRADING: <TrendingUp className="text-indigo-500" />,
  SAVINGS: <Building2 className="text-blue-500" />,
  CRYPTO: <Bitcoin className="text-amber-500" />,
  REAL_ESTATE: <Home className="text-rose-500" />,
  CASH: <PiggyBank className="text-emerald-500" />,
};

export const getAccountIcon = (type: string): React.ReactNode =>
  ICON_MAP[type] ?? <Wallet className="text-emerald-500" />;

export const formatBalance = (balance: number | string, currency: string): string => {
  const symbol = currency === "USD" ? "$" : "€";
  return `${symbol}${Number(balance).toLocaleString()}`;
};

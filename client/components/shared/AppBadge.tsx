import { Badge } from "@/components/ui/badge";

interface AppBadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
}

export const AppBadge = ({
  children,
  variant = "secondary",
  className,
}: AppBadgeProps) => (
  <Badge
    variant={variant}
    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${className}`}
  >
    {children}
  </Badge>
);

import { Badge } from "@/components/ui/badge";
import type { AppBadgeProps } from "./AppBadge.types";

/**
 * @component AppBadge
 * Styled badge wrapper with consistent sizing and shape.
 * @param children - Badge content.
 * @param variant - Visual variant of the badge.
 * @param className - Additional class names.
 */
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

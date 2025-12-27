// client/components/shared/AppCard.tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils"; // Standard Shadcn utility

interface AppCardProps {
  title: string;
  subtitle?: string;
  extraHeader?: React.ReactNode;
  children: React.ReactNode;
  className?: string; // For the container
  headerClassName?: string; // Optional: if you want to tweak header specifically
}

export const AppCard = ({
  title,
  subtitle,
  extraHeader,
  children,
  className,
  headerClassName,
}: AppCardProps) => (
  <Card className={cn("overflow-hidden shadow-sm", className)}>
    <CardHeader
      className={cn(
        "flex flex-row items-start justify-between space-y-0",
        headerClassName
      )}
    >
      <div className="space-y-1">
        <CardTitle className="text-xl font-bold text-slate-800">
          {title}
        </CardTitle>
        {subtitle && (
          <CardDescription className="w-fit text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded uppercase tracking-tight">
            {subtitle}
          </CardDescription>
        )}
      </div>
      {extraHeader}
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

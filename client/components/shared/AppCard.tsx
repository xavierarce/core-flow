import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AppCardProps {
  title: string;
  subtitle?: string;
  extraHeader?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export const AppCard = ({
  title,
  subtitle,
  extraHeader,
  action,
  children,
  className,
  headerClassName,
}: AppCardProps) => (
  <Card className={cn("overflow-hidden shadow-sm border-border", className)}>
    <CardHeader
      className={cn(
        "flex flex-row items-start justify-between space-y-0 pb-2",
        headerClassName
      )}
    >
      <div className="space-y-1">
        <CardTitle className="text-xl font-bold text-foreground">
          {title}
        </CardTitle>
        {subtitle && (
          <CardDescription className="w-fit text-[10px] text-muted-foreground font-bold bg-muted px-2 py-0.5 rounded uppercase tracking-tight">
            {subtitle}
          </CardDescription>
        )}
      </div>
      <div className="flex items-center gap-3">
        {extraHeader}
        {action && <div>{action}</div>}
      </div>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

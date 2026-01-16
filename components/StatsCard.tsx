"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn("group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden border-l-4 border-l-primary/50", className)}>
      {/* Subtle geometric accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl group-hover:bg-primary/10 transition-colors duration-300" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="text-3xl font-bold tracking-tight mb-1">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground font-medium">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

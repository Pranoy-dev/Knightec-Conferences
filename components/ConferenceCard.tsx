"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Conference, Person } from "@/types";
import { formatCurrency, formatDateRange } from "@/lib/format";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConferenceCardProps {
  conference: Conference;
  person?: Person | null;
}

// Knightec-inspired status colors: Tech blue, sustainability green, professional palette
const statusColors: Record<string, string> = {
  Interested: "bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary dark:border-primary/30",
  Planned: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/50",
  Booked: "bg-accent/15 text-accent border-accent/25 dark:bg-accent/25 dark:text-accent dark:border-accent/35",
  Attended: "bg-muted text-muted-foreground border-border dark:bg-muted dark:text-muted-foreground",
};

export function ConferenceCard({ conference, person }: ConferenceCardProps) {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.01] border-l-4 border-l-primary geometric-accent relative overflow-hidden">
      {/* Subtle geometric accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-primary/10 transition-colors duration-300" />
      
      <CardHeader className="relative">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg font-semibold leading-tight tracking-tight">{conference.name}</CardTitle>
          {conference.status && (
            <Badge
              variant="outline"
              className={cn("shrink-0 border font-medium px-2.5 py-0.5", statusColors[conference.status])}
            >
              {conference.status}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 relative">
        <div className="space-y-2.5 text-sm">
          <div className="flex items-center gap-2.5">
            <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Location</span>
            <span className="font-medium">{conference.location}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Category</span>
            <Badge variant="outline" className="font-medium">{conference.category}</Badge>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Price</span>
            <span className="font-semibold text-foreground">{formatCurrency(conference.price)}</span>
          </div>

          {person && (
            <div className="flex items-center gap-2.5">
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Assigned to</span>
              <span className="font-medium">{person.name}</span>
            </div>
          )}

          {(conference.start_date || conference.end_date) && (
            <div className="flex items-center gap-2.5">
              <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Date</span>
              <span className="font-medium">{formatDateRange(conference.start_date, conference.end_date)}</span>
            </div>
          )}

          {conference.event_link && (
            <div className="flex items-center gap-2.5">
              <a
                href={conference.event_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 font-medium transition-colors flex items-center gap-1.5 group/link"
              >
                Event Link
                <ExternalLink className="h-3.5 w-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          )}

          {conference.notes && (
            <div className="pt-3 border-t border-border/50">
              <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">{conference.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

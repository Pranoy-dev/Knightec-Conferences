"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Conference, Person, Office } from "@/types";
import { MapPin, Tag, User, ExternalLink } from "lucide-react";

interface ConferenceCardProps {
  conference: Conference;
  person?: Person | null;
  office?: Office | null;
  onClick?: () => void;
}

export function ConferenceCard({ conference, person, office, onClick }: ConferenceCardProps) {
  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-200 border hover:border-primary/50 cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-lg font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
            {conference.name}
          </h3>
        </div>
        {office && (
          <Badge variant="default" className="w-fit">
            {office.name}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="space-y-2.5">
          {/* Location */}
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">Location</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(conference.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-sm font-medium text-primary hover:underline inline-block"
              >
                {conference.location}
              </a>
            </div>
          </div>

          {/* Category */}
          <div className="flex items-start gap-2">
            <Tag className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">Category</p>
              <Badge variant="outline" className="mt-1">
                {conference.category}
              </Badge>
            </div>
          </div>

          {/* Assigned To */}
          {person && (
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">Assigned To</p>
                <p className="text-sm font-medium text-foreground mt-1">{person.name}</p>
              </div>
            </div>
          )}

          {/* Event Link */}
          {conference.event_link && (
            <div className="flex items-start gap-2">
              <ExternalLink className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">Event Link</p>
                <a
                  href={conference.event_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-sm font-medium text-primary hover:underline inline-block truncate max-w-full"
                  title={conference.event_link}
                >
                  {conference.event_link.length > 40 
                    ? `${conference.event_link.substring(0, 40)}...` 
                    : conference.event_link}
                </a>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
